"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useCallback, useState } from "react"
import {
  ProductFilters,
  ProductFilterValues,
} from "@/components/catalogue/product-filters"
import { ProductList } from "@/components/catalogue/product-list"
import type { ICategory, IProduct } from "@/types/models.types"
import type { PaginatedResult } from "@/lib/data"
import type { PaginatedResponse } from "@/types/api.types"

interface CategoryProductListProps {
  category: ICategory
  initialProducts: IProduct[]
  initialPagination: PaginatedResult<IProduct>["pagination"]
  initialFilters: ProductFilterValues
}

export function CategoryProductList({
  category,
  initialProducts,
  initialPagination,
  initialFilters,
}: CategoryProductListProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<IProduct[]>(initialProducts)
  const [pagination, setPagination] = useState(initialPagination)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  const onFiltersChange = useCallback(
    (filters: ProductFilterValues) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set("page", "1")
      if (filters.search.trim()) params.set("search", filters.search.trim())
      else params.delete("search")
      params.set("sortBy", filters.sortBy)
      params.set("sortOrder", filters.sortOrder)
      router.push(`/catalogue/${category.slug}?${params.toString()}`)
    },
    [router, searchParams, category.slug]
  )

  const loadMore = useCallback(async () => {
    if (!pagination.hasNext || isLoadingMore) return
    setIsLoadingMore(true)
    try {
      const params = new URLSearchParams({
        isActive: "true",
        page: String(pagination.page + 1),
        limit: "12",
        categoryId: category._id.toString(),
        sortBy: initialFilters.sortBy,
        sortOrder: initialFilters.sortOrder,
      })
      if (initialFilters.search.trim())
        params.set("search", initialFilters.search.trim())

      const res = await fetch(`/api/products?${params}`)
      const data: PaginatedResponse<IProduct> = await res.json()

      if (data.success && data.data) {
        setProducts((prev) => [...prev, ...data.data!])
        setPagination({
          page: data.pagination.page,
          totalPages: data.pagination.totalPages,
          total: data.pagination.total,
          hasNext: data.pagination.hasNext,
          hasPrev: data.pagination.hasPrev,
        })
      }
    } finally {
      setIsLoadingMore(false)
    }
  }, [pagination, initialFilters, category._id, isLoadingMore])

  return (
    <>
      <ProductFilters
        filters={initialFilters}
        onFiltersChange={onFiltersChange}
        showCategoryFilter={false}
        productCount={pagination.total}
        viewMode="grid"
        onViewModeChange={() => {}}
      />

      {products.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-muted-foreground mb-4">
            Aucun produit disponible dans cette catégorie.
          </p>
          <a href="/catalogue" className="text-sm text-primary hover:underline">
            Voir les autres catégories
          </a>
        </div>
      ) : (
        <ProductList
          products={products}
          viewMode="grid"
          loadMore={loadMore}
          hasNext={pagination.hasNext}
          isLoadingMore={isLoadingMore}
        />
      )}
    </>
  )
}
