"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Search, Filter, X, Image as ImageIcon } from "lucide-react";

import { IMedia, MediaType } from "@/types/models.types";
import { getMediaList } from "@/lib/api/media";
import { MediaGrid, ViewToggle, ViewMode, UploadDialog } from "@/components/cms/media";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Filters {
  search: string;
  type: MediaType | "";
}

const ITEMS_PER_PAGE = 24;

export default function MediaPage() {
  const [media, setMedia] = useState<IMedia[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
    hasNext: false,
    hasPrev: false,
  });
  const [filters, setFilters] = useState<Filters>({
    search: "",
    type: "",
  });
  const [searchInput, setSearchInput] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Fetch media
  const fetchMedia = useCallback(async (page = 1) => {
    setIsLoading(true);
    try {
      const params: Parameters<typeof getMediaList>[0] = {
        page,
        limit: ITEMS_PER_PAGE,
      };

      if (filters.search) params.search = filters.search;
      if (filters.type) params.type = filters.type;

      const result = await getMediaList(params);
      if (result.success) {
        setMedia(result.data ?? []);
        setPagination({
          page: result.pagination.page,
          totalPages: result.pagination.totalPages,
          total: result.pagination.total,
          hasNext: result.pagination.hasNext,
          hasPrev: result.pagination.hasPrev,
        });
      }
    } catch (error) {
      console.error("Failed to fetch media:", error);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  // Initial fetch
  useEffect(() => {
    fetchMedia(1);
  }, [fetchMedia]);

  // Handle search
  const handleSearch = () => {
    setFilters((prev) => ({ ...prev, search: searchInput }));
  };

  // Handle filter change
  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      search: "",
      type: "",
    });
    setSearchInput("");
  };

  // Handle upload complete
  const handleUploadComplete = () => {
    setUploadDialogOpen(false);
    fetchMedia(1);
  };

  // Check if any filters are active
  const hasActiveFilters = filters.search || filters.type;

  // Generate pagination items
  const generatePaginationItems = () => {
    const items: number[] = [];
    const { page, totalPages } = pagination;
    const delta = 2;

    for (
      let i = Math.max(2, page - delta);
      i <= Math.min(totalPages - 1, page + delta);
      i++
    ) {
      items.push(i);
    }

    // Add ellipsis indicators as -1
    if (page - delta > 2) {
      items.unshift(-1);
    }
    if (page + delta < totalPages - 1) {
      items.push(-1);
    }

    items.unshift(1);
    if (totalPages > 1) items.push(totalPages);

    return items;
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Médiathèque</h1>
          <p className="text-muted-foreground">
            Gérez vos fichiers images et documents
          </p>
        </div>
        <Button onClick={() => setUploadDialogOpen(true)}>
          <Plus className="size-4 mr-2" />
          Téléverser
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Search */}
            <div className="flex gap-2 flex-1 max-w-md">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un fichier..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-9"
                />
              </div>
              <Button variant="outline" onClick={handleSearch}>
                Rechercher
              </Button>
            </div>

            {/* View toggle and filter toggle */}
            <div className="flex items-center gap-2">
              <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
              
              <Button
                variant={showFilters ? "secondary" : "outline"}
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="size-4 mr-2" />
                Filtres
                {hasActiveFilters && (
                  <Badge variant="default" className="ml-2">
                    {[filters.search, filters.type].filter(Boolean).length}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t mt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Type de fichier</label>
                <Select
                  value={filters.type || "all"}
                  onValueChange={(value) =>
                    handleFilterChange("type", value === "all" ? "" : value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les types</SelectItem>
                    <SelectItem value={MediaType.IMAGE}>Images</SelectItem>
                    <SelectItem value={MediaType.DOCUMENT}>Documents</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardHeader>

        <CardContent>
          {/* Results count */}
          <div className="text-sm text-muted-foreground mb-4">
            {pagination.total} fichier{pagination.total !== 1 ? "s" : ""} trouvé
            {pagination.total !== 1 ? "s" : ""}
          </div>

          {/* Media grid/list */}
          <MediaGrid
            media={media}
            isLoading={isLoading}
            viewMode={viewMode}
            onDelete={() => fetchMedia(pagination.page)}
          />

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-6">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() =>
                        pagination.hasPrev && fetchMedia(pagination.page - 1)
                      }
                      className={
                        !pagination.hasPrev
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>

                  {generatePaginationItems().map((pageNum, index) =>
                    pageNum === -1 ? (
                      <PaginationItem key={`ellipsis-${index}`}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    ) : (
                      <PaginationItem key={pageNum}>
                        <PaginationLink
                          onClick={() => fetchMedia(pageNum)}
                          isActive={pageNum === pagination.page}
                          className="cursor-pointer"
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  )}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        pagination.hasNext && fetchMedia(pagination.page + 1)
                      }
                      className={
                        !pagination.hasNext
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload Dialog */}
      <UploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        onUploadComplete={handleUploadComplete}
      />
    </div>
  );
}
