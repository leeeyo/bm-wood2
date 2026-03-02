"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Plus, Search, X } from "lucide-react";

import { ICategory } from "@/types/models.types";
import { getCategories } from "@/lib/api/categories";
import { CategoryTable } from "@/components/cms/categories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<ICategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getCategories();
      if (result.success && result.data) {
        setCategories(result.data);
        setFilteredCategories(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Handle search filtering
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredCategories(categories);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const filtered = categories.filter(
      (category) =>
        category.name.toLowerCase().includes(query) ||
        category.slug.toLowerCase().includes(query) ||
        (category.description?.toLowerCase() ?? "").includes(query)
    );
    setFilteredCategories(filtered);
  }, [searchQuery, categories]);

  // Handle search
  const handleSearch = () => {
    // Search is already handled by the useEffect above
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery("");
  };

  // Handle reorder update - use new order from server (or from drag)
  const handleReorder = (newCategories: ICategory[]) => {
    setCategories(newCategories);
    if (!searchQuery.trim()) {
      setFilteredCategories(newCategories);
    } else {
      // Re-filter when search is active
      const query = searchQuery.toLowerCase().trim();
      setFilteredCategories(
        newCategories.filter(
          (cat) =>
            cat.name.toLowerCase().includes(query) ||
            cat.slug.toLowerCase().includes(query) ||
            (cat.description?.toLowerCase() ?? "").includes(query)
        )
      );
    }
  };

  return (
    <div className="flex flex-col gap-4 sm:gap-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Catégories</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Gérez les catégories de vos produits
          </p>
        </div>
        <Button asChild className="w-full sm:w-auto h-11 sm:h-10">
          <Link href="/cms/categories/new">
            <Plus className="size-4 mr-2" />
            Nouvelle catégorie
          </Link>
        </Button>
      </div>

      {/* Search and Table */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Search */}
            <div className="flex gap-2 flex-1 max-w-md">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher une catégorie..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-9"
                />
              </div>
              {searchQuery && (
                <Button variant="ghost" size="icon" onClick={clearSearch}>
                  <X className="size-4" />
                </Button>
              )}
            </div>

            {/* Info */}
            <p className="text-xs sm:text-sm text-muted-foreground">
              Glissez-déposez pour réorganiser
            </p>
          </div>
        </CardHeader>

        <CardContent>
          {/* Results count */}
          <div className="text-sm text-muted-foreground mb-4">
            {filteredCategories.length} catégorie{filteredCategories.length !== 1 ? "s" : ""} trouvée{filteredCategories.length !== 1 ? "s" : ""}
            {searchQuery && ` pour "${searchQuery}"`}
          </div>

          {/* Table */}
          <CategoryTable
            categories={filteredCategories}
            isLoading={isLoading}
            onDelete={fetchCategories}
            onReorder={handleReorder}
          />
        </CardContent>
      </Card>
    </div>
  );
}
