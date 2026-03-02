"use client"

import { useState } from "react"
import { Search, Grid, List } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { ICategory } from "@/types/models.types"
import { Button } from "@/components/ui/button"
import { FilterFloatingButton } from "./filter-floating-button"
import { ProductFilterSheet } from "./product-filter-sheet"

export interface ProductFilterValues {
  search: string
  sortBy: "name" | "createdAt" | "updatedAt"
  sortOrder: "asc" | "desc"
  categoryId: string
}

export const DEFAULT_FILTER_VALUES: ProductFilterValues = {
  search: "",
  sortBy: "createdAt",
  sortOrder: "desc",
  categoryId: "",
}

function countActiveFilters(filters: ProductFilterValues, showCategory: boolean): number {
  let count = 0
  if (filters.search.trim()) count++
  if (filters.sortBy !== "createdAt" || filters.sortOrder !== "desc") count++
  if (showCategory && filters.categoryId) count++
  return count
}

interface ProductFiltersProps {
  filters: ProductFilterValues
  onFiltersChange: (filters: ProductFilterValues) => void
  categories?: ICategory[]
  showCategoryFilter?: boolean
  productCount?: number
  viewMode?: "grid" | "list"
  onViewModeChange?: (mode: "grid" | "list") => void
}

export function ProductFilters({
  filters,
  onFiltersChange,
  categories = [],
  showCategoryFilter = false,
  productCount,
  viewMode,
  onViewModeChange,
}: ProductFiltersProps) {
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false)

  const activeFilterCount = countActiveFilters(filters, showCategoryFilter)

  const handleApplyFromSheet = (newFilters: ProductFilterValues) => {
    onFiltersChange(newFilters)
  }

  return (
    <>
      {/* Desktop filter bar - hidden on mobile */}
      <div className="hidden md:flex flex-col gap-4 mb-8">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[200px] max-w-sm space-y-2">
            <Label htmlFor="desktop-search" className="sr-only">
              Rechercher
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="desktop-search"
                placeholder="Rechercher..."
                value={filters.search}
                onChange={(e) =>
                  onFiltersChange({ ...filters, search: e.target.value })
                }
                className="pl-9"
              />
            </div>
          </div>

          {showCategoryFilter && categories.length > 0 && (
            <div className="w-[200px] space-y-2">
              <Label htmlFor="desktop-category" className="sr-only">
                Catégorie
              </Label>
              <Select
                value={filters.categoryId || "all"}
                onValueChange={(v) =>
                  onFiltersChange({
                    ...filters,
                    categoryId: v === "all" ? "" : v,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Catégorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les catégories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem
                      key={cat._id.toString()}
                      value={cat._id.toString()}
                    >
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="w-[180px] space-y-2">
            <Label htmlFor="desktop-sort" className="sr-only">
              Trier par
            </Label>
            <Select
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onValueChange={(v) => {
                const [sortBy, sortOrder] = v.split("-") as [
                  ProductFilterValues["sortBy"],
                  ProductFilterValues["sortOrder"]
                ]
                onFiltersChange({ ...filters, sortBy, sortOrder })
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Trier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name-asc">Nom (A-Z)</SelectItem>
                <SelectItem value="name-desc">Nom (Z-A)</SelectItem>
                <SelectItem value="createdAt-desc">Plus récents</SelectItem>
                <SelectItem value="createdAt-asc">Plus anciens</SelectItem>
                <SelectItem value="updatedAt-desc">Modifiés récemment</SelectItem>
                <SelectItem value="updatedAt-asc">Modifiés anciennement</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {viewMode && onViewModeChange && (
            <div className="flex items-center gap-2 ml-auto">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="icon"
                onClick={() => onViewModeChange("grid")}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="icon"
                onClick={() => onViewModeChange("list")}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        {productCount !== undefined && (
          <p className="text-muted-foreground text-sm">
            {productCount} produit{productCount !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      {/* Mobile toolbar: product count + view toggle (visible when we have products) */}
      {viewMode && onViewModeChange && (
        <div className="flex md:hidden items-center justify-between mb-6">
          {productCount !== undefined && (
            <p className="text-muted-foreground text-sm">
              {productCount} produit{productCount !== 1 ? "s" : ""}
            </p>
          )}
          <div className="flex items-center gap-2 ml-auto">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="icon"
              onClick={() => onViewModeChange("grid")}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="icon"
              onClick={() => onViewModeChange("list")}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Mobile: floating button + sheet */}
      <FilterFloatingButton
        onClick={() => setMobileSheetOpen(true)}
        activeFilterCount={activeFilterCount}
      />
      <ProductFilterSheet
        open={mobileSheetOpen}
        onOpenChange={setMobileSheetOpen}
        filters={filters}
        onApply={handleApplyFromSheet}
        categories={categories}
        showCategoryFilter={showCategoryFilter}
      />
    </>
  )
}
