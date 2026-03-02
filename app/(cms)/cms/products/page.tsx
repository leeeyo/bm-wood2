"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Plus, Filter, X } from "lucide-react";

import { IProduct, ICategory } from "@/types/models.types";
import { getProducts, getCategories } from "@/lib/api/products";
import { ProductTable } from "@/components/cms/products/product-table";
import { SearchInput, CMSPagination, type PaginationState } from "@/components/cms";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Filters {
  search: string;
  categoryId: string;
  isFeatured: string;
  isActive: string;
}

const ITEMS_PER_PAGE = 10;

export default function ProductsPage() {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    totalPages: 1,
    total: 0,
    hasNext: false,
    hasPrev: false,
  });
  const [filters, setFilters] = useState<Filters>({
    search: "",
    categoryId: "",
    isFeatured: "",
    isActive: "",
  });
  const [showFilters, setShowFilters] = useState(false);

  // Fetch products
  const fetchProducts = useCallback(async (page = 1) => {
    setIsLoading(true);
    try {
      const params: Parameters<typeof getProducts>[0] = {
        page,
        limit: ITEMS_PER_PAGE,
        sortBy: "createdAt",
        sortOrder: "desc",
      };

      if (filters.search) params.search = filters.search;
      if (filters.categoryId) params.categoryId = filters.categoryId;
      if (filters.isFeatured) params.isFeatured = filters.isFeatured === "true";
      if (filters.isActive) params.isActive = filters.isActive === "true";

      const result = await getProducts(params);
      if (result.success) {
        setProducts(result.data ?? []);
        setPagination({
          page: result.pagination.page,
          totalPages: result.pagination.totalPages,
          total: result.pagination.total,
          hasNext: result.pagination.hasNext,
          hasPrev: result.pagination.hasPrev,
        });
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  // Fetch categories for filter
  const fetchCategories = useCallback(async () => {
    try {
      const result = await getCategories();
      if (result.success && result.data) {
        setCategories(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchProducts(1);
  }, [fetchProducts]);

  // Handle search (debounced from SearchInput)
  const handleSearch = useCallback((value: string) => {
    setFilters((prev) => ({ ...prev, search: value }));
  }, []);

  // Handle filter change
  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Handle page change
  const handlePageChange = useCallback((page: number) => {
    fetchProducts(page);
  }, [fetchProducts]);

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      search: "",
      categoryId: "",
      isFeatured: "",
      isActive: "",
    });
  };

  // Check if any filters are active
  const hasActiveFilters =
    filters.search || filters.categoryId || filters.isFeatured || filters.isActive;

  return (
    <div className="flex flex-col gap-4 sm:gap-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Produits</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Gérez votre catalogue de produits
          </p>
        </div>
        <Button asChild className="w-full sm:w-auto h-11 sm:h-10">
          <Link href="/cms/products/new">
            <Plus className="size-4 mr-2" />
            Nouveau produit
          </Link>
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Search */}
            <SearchInput
              placeholder="Rechercher un produit..."
              value={filters.search}
              onSearch={handleSearch}
              className="flex-1 max-w-md"
              isLoading={isLoading}
            />

            {/* Filter toggle */}
            <div className="flex items-center gap-2">
              <Button
                variant={showFilters ? "secondary" : "outline"}
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="size-4 mr-2" />
                Filtres
                {hasActiveFilters && (
                  <Badge variant="default" className="ml-2">
                    {
                      [
                        filters.search,
                        filters.categoryId,
                        filters.isFeatured,
                        filters.isActive,
                      ].filter(Boolean).length
                    }
                  </Badge>
                )}
              </Button>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="size-4 mr-1" />
                  Effacer
                </Button>
              )}
            </div>
          </div>

          {/* Filter options */}
          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t mt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Catégorie</label>
                <Select
                  value={filters.categoryId}
                  onValueChange={(value) =>
                    handleFilterChange("categoryId", value === "all" ? "" : value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Toutes les catégories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les catégories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem
                        key={category._id.toString()}
                        value={category._id.toString()}
                      >
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Mis en avant</label>
                <Select
                  value={filters.isFeatured}
                  onValueChange={(value) =>
                    handleFilterChange("isFeatured", value === "all" ? "" : value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tous" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous</SelectItem>
                    <SelectItem value="true">Mis en avant</SelectItem>
                    <SelectItem value="false">Non mis en avant</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Statut</label>
                <Select
                  value={filters.isActive}
                  onValueChange={(value) =>
                    handleFilterChange("isActive", value === "all" ? "" : value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tous" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous</SelectItem>
                    <SelectItem value="true">Actif</SelectItem>
                    <SelectItem value="false">Inactif</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardHeader>

        <CardContent>
          {/* Table */}
          <ProductTable
            products={products}
            isLoading={isLoading}
            onDelete={() => fetchProducts(pagination.page)}
          />

          {/* Pagination */}
          <CMSPagination
            pagination={pagination}
            onPageChange={handlePageChange}
            totalLabel="produit"
            className="mt-6"
          />
        </CardContent>
      </Card>
    </div>
  );
}
