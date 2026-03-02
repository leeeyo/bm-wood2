"use client"

import { useState, useEffect, useCallback, use } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, ArrowUpRight, Loader2 } from "lucide-react"
import { Footer } from "@/components/footer"
import {
  ProductFilters,
  ProductFilterValues,
  DEFAULT_FILTER_VALUES,
} from "@/components/catalogue/product-filters"
import { ProductList } from "@/components/catalogue/product-list"
import { ICategory, IProduct } from "@/types/models.types"
import { PaginatedResponse } from "@/types/api.types"

interface CategoryPageProps {
  params: Promise<{ slug: string }>
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = use(params)
  const [category, setCategory] = useState<ICategory | null>(null)
  const [products, setProducts] = useState<IProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
    hasNext: false,
  })
  const [filters, setFilters] = useState<ProductFilterValues>(DEFAULT_FILTER_VALUES)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  // Fetch category by slug
  useEffect(() => {
    async function fetchCategory() {
      try {
        const res = await fetch("/api/categories")
        const data = await res.json()

        if (data.success && data.data) {
          const foundCategory = data.data.find(
            (cat: ICategory) => cat.slug === slug && cat.isActive
          )
          if (foundCategory) {
            setCategory(foundCategory)
          } else {
            setError("Catégorie non trouvée")
          }
        } else {
          setError("Impossible de charger la catégorie")
        }
      } catch (err) {
        console.error("Error fetching category:", err)
        setError("Une erreur est survenue")
      }
    }

    fetchCategory()
  }, [slug])

  // Fetch products when category is loaded (with filters)
  const fetchProducts = useCallback(
    async (page: number = 1) => {
      if (!category) return

      try {
        if (page === 1) {
          setIsLoading(true)
        } else {
          setIsLoadingMore(true)
        }

        const searchParams = new URLSearchParams({
          categoryId: category._id.toString(),
          isActive: "true",
          page: page.toString(),
          limit: "12",
          sortBy: filters.sortBy,
          sortOrder: filters.sortOrder,
        })
        if (filters.search.trim()) {
          searchParams.set("search", filters.search.trim())
        }

        const res = await fetch(`/api/products?${searchParams}`)
        const data: PaginatedResponse<IProduct> = await res.json()

        if (data.success && data.data) {
          if (page === 1) {
            setProducts(data.data)
          } else {
            setProducts((prev) => [...prev, ...data.data!])
          }
          setPagination({
            page: data.pagination.page,
            totalPages: data.pagination.totalPages,
            total: data.pagination.total,
            hasNext: data.pagination.hasNext,
          })
        } else if (page === 1) {
          setError("Impossible de charger les produits")
        }
      } catch (err) {
        console.error("Error fetching products:", err)
        if (page === 1) {
          setError("Une erreur est survenue")
        }
      } finally {
        setIsLoading(false)
        setIsLoadingMore(false)
      }
    },
    [category, filters]
  )

  useEffect(() => {
    fetchProducts(1)
  }, [fetchProducts])

  const loadMore = useCallback(() => {
    if (!category || !pagination.hasNext || isLoadingMore) return
    fetchProducts(pagination.page + 1)
  }, [category, pagination, isLoadingMore, fetchProducts])

  return (
    <main className="min-h-screen">
      {/* Header */}
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

      {/* Hero Section */}
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
              {isLoading ? "Chargement..." : category?.name || "Catégorie"}
            </h1>
            {category?.description && (
              <p className="text-primary-foreground/70 text-lg leading-relaxed max-w-2xl mx-auto">
                {category.description}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-16 md:py-24 pb-24 md:pb-24">
        <div className="container mx-auto px-6 md:px-12">
          {!isLoading && !error && (
            <ProductFilters
              filters={filters}
              onFiltersChange={setFilters}
              showCategoryFilter={false}
              productCount={pagination.total}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />
          )}

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Chargement des produits...</p>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-destructive mb-4">{error}</p>
              <Link
                href="/catalogue"
                className="text-sm text-primary hover:underline"
              >
                Retour au catalogue
              </Link>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground mb-4">
                Aucun produit disponible dans cette catégorie.
              </p>
              <Link
                href="/catalogue"
                className="text-sm text-primary hover:underline"
              >
                Voir les autres catégories
              </Link>
            </div>
          ) : (
            <ProductList
              products={products}
              viewMode={viewMode}
              loadMore={loadMore}
              hasNext={pagination.hasNext}
              isLoadingMore={isLoadingMore}
            />
          )}
        </div>
      </section>

      {/* CTA Section - extra pb on mobile for FAB */}
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
