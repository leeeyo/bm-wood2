"use client"

import { useState, useEffect } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
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
import {
  DEFAULT_FILTER_VALUES,
  type ProductFilterValues,
} from "./product-filters"

interface ProductFilterSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  filters: ProductFilterValues
  onApply: (filters: ProductFilterValues) => void
  categories?: ICategory[]
  showCategoryFilter?: boolean
}

export function ProductFilterSheet({
  open,
  onOpenChange,
  filters,
  onApply,
  categories = [],
  showCategoryFilter = false,
}: ProductFilterSheetProps) {
  const [localFilters, setLocalFilters] = useState<ProductFilterValues>(filters)

  useEffect(() => {
    if (open) {
      setLocalFilters(filters)
    }
  }, [open, filters])

  const handleApply = () => {
    onApply(localFilters)
    onOpenChange(false)
  }

  const handleReset = () => {
    setLocalFilters(DEFAULT_FILTER_VALUES)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="h-[80vh] max-h-[600px] rounded-t-2xl"
      >
        <SheetHeader>
          <SheetTitle>Filtres</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-6 py-6 overflow-y-auto">
          <div className="space-y-2">
            <Label htmlFor="filter-search">Rechercher</Label>
            <Input
              id="filter-search"
              placeholder="Nom ou description..."
              value={localFilters.search}
              onChange={(e) =>
                setLocalFilters((prev) => ({ ...prev, search: e.target.value }))
              }
            />
          </div>

          {showCategoryFilter && categories.length > 0 && (
            <div className="space-y-2">
              <Label>Catégorie</Label>
              <Select
                value={localFilters.categoryId || "all"}
                onValueChange={(v) =>
                  setLocalFilters((prev) => ({
                    ...prev,
                    categoryId: v === "all" ? "" : v,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Toutes les catégories" />
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

          <div className="space-y-2">
            <Label>Trier par</Label>
            <Select
              value={localFilters.sortBy}
              onValueChange={(v: ProductFilterValues["sortBy"]) =>
                setLocalFilters((prev) => ({ ...prev, sortBy: v }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Nom</SelectItem>
                <SelectItem value="createdAt">Date de création</SelectItem>
                <SelectItem value="updatedAt">Date de modification</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Ordre</Label>
            <Select
              value={localFilters.sortOrder}
              onValueChange={(v: ProductFilterValues["sortOrder"]) =>
                setLocalFilters((prev) => ({ ...prev, sortOrder: v }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">Croissant</SelectItem>
                <SelectItem value="desc">Décroissant</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <SheetFooter className="flex-row gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleReset}>
            Réinitialiser
          </Button>
          <Button onClick={handleApply}>Appliquer</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
