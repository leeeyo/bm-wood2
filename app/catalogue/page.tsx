"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, ArrowUpRight, Loader2 } from "lucide-react"
import { Footer } from "@/components/footer"
import { ICategory, IProduct } from "@/types/models.types"
import { PaginatedResponse } from "@/types/api.types"
import {
  ProductFilters,
  ProductFilterValues,
  DEFAULT_FILTER_VALUES,
} from "@/components/catalogue/product-filters"
import { ProductList } from "@/components/catalogue/product-list"

export default function CataloguePage() {
  const [categories, setCategories] = useState<ICategory[]>([])
  const [products, setProducts] = useState<IProduct[]>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)
  const [isLoadingProducts, setIsLoadingProducts] = useState(true)
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

  // Fetch categories
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("/api/categories")
        const data = await res.json()

        if (data.success && data.data) {
          const activeCategories = data.data.filter(
            (cat: ICategory) => cat.isActive
          )
          setCategories(activeCategories)
        } else {
          setError("Impossible de charger les catégories")
        }
      } catch (err) {
        console.error("Error fetching categories:", err)
        setError("Une erreur est survenue lors du chargement")
      } finally {
        setIsLoadingCategories(false)
      }
    }

    fetchCategories()
  }, [])

  // Fetch products (all categories, with filters)
  const fetchProducts = useCallback(
    async (page: number = 1) => {
      try {
        if (page === 1) {
          setIsLoadingProducts(true)
        } else {
          setIsLoadingMore(true)
        }

        const params = new URLSearchParams({
          isActive: "true",
          page: page.toString(),
          limit: "12",
          sortBy: filters.sortBy,
          sortOrder: filters.sortOrder,
        })
        if (filters.search.trim()) {
          params.set("search", filters.search.trim())
        }
        if (filters.categoryId) {
          params.set("categoryId", filters.categoryId)
        }

        const res = await fetch(`/api/products?${params}`)
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
          setProducts([])
        }
      } catch (err) {
        console.error("Error fetching products:", err)
        if (page === 1) {
          setProducts([])
        }
      } finally {
        setIsLoadingProducts(false)
        setIsLoadingMore(false)
      }
    },
    [filters]
  )

  useEffect(() => {
    fetchProducts(1)
  }, [fetchProducts])

  const loadMore = useCallback(() => {
    if (!pagination.hasNext || isLoadingMore) return
    fetchProducts(pagination.page + 1)
  }, [pagination, isLoadingMore, fetchProducts])

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
            href="/"
            className="inline-flex items-center gap-2 text-sm text-white hover:text-orange-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour au site
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-6 md:px-12">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-primary-foreground/60 text-sm tracking-[0.3em] uppercase mb-6">
              Notre catalogue
            </p>
            <h1
              className="text-3xl md:text-4xl lg:text-5xl font-medium leading-[1.1] tracking-tight mb-6"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Nos Réalisations
            </h1>
            <p className="text-primary-foreground/70 text-lg leading-relaxed max-w-2xl mx-auto">
              Découvrez notre sélection de menuiseries sur mesure. Chaque
              catégorie représente notre savoir-faire artisanal.
            </p>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-6 md:px-12">
          {isLoadingCategories ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Chargement des catégories...</p>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-destructive mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="text-sm text-primary hover:underline"
              >
                Réessayer
              </button>
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground">
                Aucune catégorie disponible pour le moment.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {categories.map((category) => (
                <Link
                  key={category._id.toString()}
                  href={`/catalogue/${category.slug}`}
                  className="group"
                >
                  <article className="cursor-pointer">
                    <div className="relative overflow-hidden aspect-4/3 mb-4 bg-muted">
                      {category.image ? (
                        <Image
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
                        <h3 className="text-xl font-medium mb-2 group-hover:underline underline-offset-4">
                          {category.name}
                        </h3>
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

      {/* All Products Section */}
      <section className="py-16 md:py-24 pb-24 md:pb-24 bg-muted/20">
        <div className="container mx-auto px-6 md:px-12">
          <h2
            className="text-2xl md:text-3xl font-medium mb-8"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Tous les produits
          </h2>

          <ProductFilters
            filters={filters}
            onFiltersChange={setFilters}
            categories={categories}
            showCategoryFilter={true}
            productCount={pagination.total}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />

          {isLoadingProducts ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Chargement des produits...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground">
                Aucun produit ne correspond à vos critères.
              </p>
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
