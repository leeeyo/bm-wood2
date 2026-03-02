import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, ArrowUpRight } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { getCategoryBySlug, getProducts } from "@/lib/data"
import { CategoryProductList } from "@/components/catalogue/category-client"
import type { ICategory } from "@/types/models.types"
import { notFound } from "next/navigation"

interface CategoryPageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{
    page?: string
    search?: string
    sortBy?: string
    sortOrder?: string
  }>
}

function parseFilters(searchParams: {
  page?: string
  search?: string
  sortBy?: string
  sortOrder?: string
}): { page: number; filters: Omit<ProductFilterValues, "categoryId"> } {
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
      categoryId: "",
    },
  }
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { slug } = await params
  const search = await searchParams
  const { page, filters } = parseFilters(search)

  const category = await getCategoryBySlug(slug)

  if (!category) {
    notFound()
  }

  const categoryId = (category as ICategory)._id.toString()
  const productsResult = await getProducts({
    page,
    limit: 12,
    categoryId,
    search: filters.search || undefined,
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder,
  })

  const categoryProducts = productsResult.data
  const pagination = productsResult.pagination

  const filterWithCategory: ProductFilterValues = {
    ...filters,
    categoryId,
  }

  return (
    <main className="min-h-screen">
      <header className="fixed top-0 left-0 right-0 z-50 bg-primary py-4">
        <nav className="container mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="transition-all duration-300">
            <Image
              src="/bmwood-header.png"
              alt="BM Wood"
              width={100}
              height={50}
              className="w-auto h-10"
            />
          </Link>

          <Link
            href="/catalogue"
            className="inline-flex items-center gap-2 text-sm text-white hover:text-orange-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour au catalogue
          </Link>
        </nav>
      </header>

      <section className="pt-32 pb-16 md:pt-40 md:pb-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-6 md:px-12">
          <div className="max-w-3xl mx-auto text-center">
            <Link
              href="/catalogue"
              className="inline-flex items-center gap-2 text-primary-foreground/60 text-sm tracking-[0.3em] uppercase mb-6 hover:text-primary-foreground/80 transition-colors"
            >
              Catalogue
            </Link>
            <h1
              className="text-3xl md:text-4xl lg:text-5xl font-medium leading-[1.1] tracking-tight mb-6"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {(category as ICategory).name}
            </h1>
            {(category as ICategory).description && (
              <p className="text-primary-foreground/70 text-lg leading-relaxed max-w-2xl mx-auto">
                {(category as ICategory).description}
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 pb-24 md:pb-24">
        <div className="container mx-auto px-6 md:px-12">
          <CategoryProductList
            key={`${filterWithCategory.search}-${filterWithCategory.sortBy}-${filterWithCategory.sortOrder}`}
            category={category as ICategory}
            initialProducts={categoryProducts}
            initialPagination={pagination}
            initialFilters={filterWithCategory}
          />
        </div>
      </section>

      <section className="py-12 pb-20 md:pb-12 bg-muted/30 border-t">
        <div className="container mx-auto px-6 md:px-12">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-muted-foreground mb-4">
              Vous avez trouvé ce que vous cherchez ?
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
