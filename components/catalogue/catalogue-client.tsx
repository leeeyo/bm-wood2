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

interface CatalogueFiltersProps {
  initialFilters: ProductFilterValues
  categories: ICategory[]
  productCount: number
  showCategoryFilter: boolean
}

export function CatalogueFilters({
  initialFilters,
  categories,
  productCount,
  showCategoryFilter,
}: CatalogueFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const onFiltersChange = useCallback(
    (filters: ProductFilterValues) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set("page", "1")
      if (filters.search.trim()) params.set("search", filters.search.trim())
      else params.delete("search")
      if (filters.categoryId) params.set("categoryId", filters.categoryId)
      else params.delete("categoryId")
      params.set("sortBy", filters.sortBy)
      params.set("sortOrder", filters.sortOrder)
      router.push(`/catalogue?${params.toString()}`)
    },
    [router, searchParams]
  )

  return (
    <ProductFilters
      filters={initialFilters}
      onFiltersChange={onFiltersChange}
      categories={categories}
      showCategoryFilter={showCategoryFilter}
      productCount={productCount}
      viewMode="grid"
      onViewModeChange={() => {}}
    />
  )
}

interface CatalogueProductListProps {
  initialProducts: IProduct[]
  initialPagination: PaginatedResult<IProduct>["pagination"]
  initialFilters: ProductFilterValues
}

export function CatalogueProductList({
  initialProducts,
  initialPagination,
  initialFilters,
}: CatalogueProductListProps) {
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<IProduct[]>(initialProducts)
  const [pagination, setPagination] = useState(initialPagination)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  const loadMore = useCallback(async () => {
    if (!pagination.hasNext || isLoadingMore) return
    setIsLoadingMore(true)
    try {
      const params = new URLSearchParams({
        isActive: "true",
        page: String(pagination.page + 1),
        limit: "12",
        sortBy: initialFilters.sortBy,
        sortOrder: initialFilters.sortOrder,
      })
      if (initialFilters.search.trim())
        params.set("search", initialFilters.search.trim())
      if (initialFilters.categoryId)
        params.set("categoryId", initialFilters.categoryId)

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
  }, [pagination, initialFilters, isLoadingMore])

  return (
    <ProductList
      products={products}
      viewMode="grid"
      loadMore={loadMore}
      hasNext={pagination.hasNext}
      isLoadingMore={isLoadingMore}
    />
  )
}
