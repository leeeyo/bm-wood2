import Link from "next/link"
import { SafeImage } from "@/components/ui/safe-image"
import { ArrowUpRight } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { getCategories, getProducts } from "@/lib/data"
import {
  RealisationsFilters,
  RealisationsProductList,
} from "@/components/realisations/realisations-client"
import type { ICategory, IProduct } from "@/types/models.types"
import type { ProductFilterValues } from "@/components/catalogue/product-filters"

interface RealisationsPageProps {
  searchParams: Promise<{
    page?: string
    categoryId?: string
    search?: string
    sortBy?: string
    sortOrder?: string
  }>
}

function parseFilters(searchParams: {
  page?: string
  categoryId?: string
  search?: string
  sortBy?: string
  sortOrder?: string
}): { page: number; filters: ProductFilterValues } {
  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10) || 1)
  const sortBy = (["name", "createdAt", "updatedAt"].includes(
    searchParams.sortBy ?? ""
  )
    ? searchParams.sortBy
    : "createdAt") as ProductFilterValues["sortBy"]
  const sortOrder = (["asc", "desc"].includes(searchParams.sortOrder ?? "")
    ? searchParams.sortOrder
    : "desc") as ProductFilterValues["sortOrder"]

  return {
    page,
    filters: {
      search: searchParams.search ?? "",
      sortBy,
      sortOrder,
      categoryId: searchParams.categoryId ?? "",
    },
  }
}

export default async function RealisationsPage({
  searchParams,
}: RealisationsPageProps) {
  const params = await searchParams
  const { page, filters } = parseFilters(params)

  const [categories, productsResult] = await Promise.all([
    getCategories(),
    getProducts({
      page,
      limit: 12,
      categoryId: filters.categoryId || undefined,
      search: filters.search || undefined,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
    }),
  ])

  const products = productsResult.data
  const pagination = productsResult.pagination

  return (
    <main className="min-h-screen">
      <Header />

      <section className="pt-32 pb-16 md:pt-40 md:pb-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-6 md:px-12">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-primary-foreground/60 text-sm tracking-[0.3em] uppercase mb-6">
              Nos réalisations
            </p>
            <h1
              className="text-3xl md:text-4xl lg:text-5xl font-medium leading-[1.1] tracking-tight mb-6"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Galerie de projets
            </h1>
            <p className="text-primary-foreground/70 text-lg leading-relaxed max-w-2xl mx-auto">
              Découvrez nos réalisations par type de projet. Cuisines, dressings,
              portes, habillage mural et plus.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container mx-auto px-6 md:px-12">
          {categories.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground">
                Aucune catégorie disponible pour le moment.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {categories.map((category: ICategory) => (
                <Link
                  key={category._id.toString()}
                  href={`/catalogue/${category.slug}`}
                  className="group"
                >
                  <article className="cursor-pointer">
                    <div className="relative overflow-hidden aspect-4/3 mb-4 bg-muted">
                      {category.image ? (
                        <SafeImage
                          src={category.image}
                          alt={category.name}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-secondary">
                          <span className="text-4xl font-medium text-muted-foreground/30">
                            {category.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                    </div>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h2 className="text-xl font-medium mb-2 group-hover:underline underline-offset-4">
                          {category.name}
                        </h2>
                        {category.description && (
                          <p className="text-muted-foreground text-sm line-clamp-2">
                            {category.description}
                          </p>
                        )}
                      </div>
                      <ArrowUpRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors shrink-0 mt-1" />
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-16 md:py-24 pb-24 md:pb-24 bg-muted/20">
        <div className="container mx-auto px-6 md:px-12">
          <h2
            className="text-2xl md:text-3xl font-medium mb-8"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Tous les projets
          </h2>

          <RealisationsFilters
            initialFilters={filters}
            categories={categories}
            productCount={pagination.total}
          />

          {products.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground">
                Aucun projet ne correspond à vos critères.
              </p>
            </div>
          ) : (
            <RealisationsProductList
              key={`${filters.categoryId}-${filters.search}-${filters.sortBy}-${filters.sortOrder}`}
              initialProducts={products}
              initialPagination={pagination}
              initialFilters={filters}
            />
          )}
        </div>
      </section>

      <section className="py-12 pb-20 md:pb-12 bg-muted/30 border-t">
        <div className="container mx-auto px-6 md:px-12">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-muted-foreground mb-4">
              Vous avez un projet en tête ?
            </p>
            <Link
              href="/demander-un-devis"
              className="inline-flex items-center gap-2 text-sm px-6 py-3 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Demander un devis gratuit
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
