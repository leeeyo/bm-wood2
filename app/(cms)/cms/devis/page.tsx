"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, Filter, X, Calendar, User } from "lucide-react";
import { format } from "date-fns";

import { IDevis, DevisStatus, IUserPublic } from "@/types/models.types";
import { getDevisList, getUsers, getStatusLabel, DEVIS_STATUS_CONFIG } from "@/lib/api/devis";
import { DevisTable } from "@/components/cms/devis";
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
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Filters {
  search: string;
  status: string;
  assignedTo: string;
  dateFrom: string;
  dateTo: string;
}

const ITEMS_PER_PAGE = 10;

export default function DevisListPage() {
  const [devisList, setDevisList] = useState<IDevis[]>([]);
  const [users, setUsers] = useState<IUserPublic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
    hasNext: false,
    hasPrev: false,
  });
  const [filters, setFilters] = useState<Filters>({
    search: "",
    status: "",
    assignedTo: "",
    dateFrom: "",
    dateTo: "",
  });
  const [searchInput, setSearchInput] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Fetch devis list
  const fetchDevis = useCallback(async (page = 1) => {
    setIsLoading(true);
    try {
      const params: Parameters<typeof getDevisList>[0] = {
        page,
        limit: ITEMS_PER_PAGE,
        sortBy: "createdAt",
        sortOrder: "desc",
      };

      if (filters.search) params.search = filters.search;
      if (filters.status) params.status = filters.status as DevisStatus;
      if (filters.assignedTo) params.assignedTo = filters.assignedTo;
      if (filters.dateFrom) params.dateFrom = new Date(filters.dateFrom).toISOString();
      if (filters.dateTo) params.dateTo = new Date(filters.dateTo).toISOString();

      const result = await getDevisList(params);
      if (result.success) {
        setDevisList(result.data ?? []);
        setPagination({
          page: result.pagination.page,
          totalPages: result.pagination.totalPages,
          total: result.pagination.total,
          hasNext: result.pagination.hasNext,
          hasPrev: result.pagination.hasPrev,
        });
      }
    } catch (error) {
      console.error("Failed to fetch devis:", error);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  // Fetch users for filter
  const fetchUsers = useCallback(async () => {
    setIsLoadingUsers(true);
    try {
      const result = await getUsers();
      if (result.success && result.data) {
        setUsers(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setIsLoadingUsers(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    fetchDevis(1);
  }, [fetchDevis]);

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
      status: "",
      assignedTo: "",
      dateFrom: "",
      dateTo: "",
    });
    setSearchInput("");
  };

  // Check if any filters are active
  const activeFilterCount = [
    filters.search,
    filters.status,
    filters.assignedTo,
    filters.dateFrom,
    filters.dateTo,
  ].filter(Boolean).length;

  // Generate pagination items
  const generatePaginationItems = () => {
    const items = [];
    const { page, totalPages } = pagination;
    const delta = 2;
    const range: number[] = [];

    for (
      let i = Math.max(2, page - delta);
      i <= Math.min(totalPages - 1, page + delta);
      i++
    ) {
      range.push(i);
    }

    if (page - delta > 2) {
      range.unshift(-1); // Ellipsis
    }
    if (page + delta < totalPages - 1) {
      range.push(-1); // Ellipsis
    }

    range.unshift(1);
    if (totalPages > 1) range.push(totalPages);

    return range;
  };

  // Status options for filter
  const statusOptions: DevisStatus[] = [
    DevisStatus.PENDING,
    DevisStatus.REVIEWED,
    DevisStatus.APPROVED,
    DevisStatus.REJECTED,
    DevisStatus.IN_PROGRESS,
    DevisStatus.COMPLETED,
  ];

  return (
    <div className="flex flex-col gap-4 sm:gap-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Devis</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Gérez les demandes de devis de vos clients
          </p>
        </div>
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
                  placeholder="Rechercher par email ou nom du client..."
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

            {/* Filter toggle */}
            <div className="flex items-center gap-2">
              <Button
                variant={showFilters ? "secondary" : "outline"}
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="size-4 mr-2" />
                Filtres
                {activeFilterCount > 0 && (
                  <Badge variant="default" className="ml-2">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
              {activeFilterCount > 0 && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="size-4 mr-1" />
                  Effacer
                </Button>
              )}
            </div>
          </div>

          {/* Filter options */}
          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t mt-4">
              {/* Status filter */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Statut</Label>
                <Select
                  value={filters.status}
                  onValueChange={(value) =>
                    handleFilterChange("status", value === "all" ? "" : value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les statuts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    {statusOptions.map((status) => (
                      <SelectItem key={status} value={status}>
                        <div className="flex items-center gap-2">
                          <div
                            className={`size-2 rounded-full ${DEVIS_STATUS_CONFIG[status].color}`}
                          />
                          {getStatusLabel(status)}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Assigned to filter */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Assigné à</Label>
                <Select
                  value={filters.assignedTo}
                  onValueChange={(value) =>
                    handleFilterChange("assignedTo", value === "all" ? "" : value)
                  }
                  disabled={isLoadingUsers}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={isLoadingUsers ? "Chargement..." : "Tous les utilisateurs"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les utilisateurs</SelectItem>
                    {users.map((user) => (
                      <SelectItem key={user._id} value={user._id}>
                        <div className="flex items-center gap-2">
                          <User className="size-3 text-muted-foreground" />
                          {user.firstName} {user.lastName}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date from filter */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Date de début</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              {/* Date to filter */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Date de fin</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => handleFilterChange("dateTo", e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </div>
          )}
        </CardHeader>

        <CardContent>
          {/* Results count */}
          <div className="text-sm text-muted-foreground mb-4">
            {pagination.total} devis trouvé{pagination.total !== 1 ? "s" : ""}
          </div>

          {/* Table */}
          <DevisTable
            devisList={devisList}
            isLoading={isLoading}
            onDelete={() => fetchDevis(pagination.page)}
          />

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-6">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() =>
                        pagination.hasPrev && fetchDevis(pagination.page - 1)
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
                          onClick={() => fetchDevis(pageNum)}
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
                        pagination.hasNext && fetchDevis(pagination.page + 1)
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
    </div>
  );
}
