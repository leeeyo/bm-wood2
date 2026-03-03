"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Plus, Search, X, Filter } from "lucide-react";

import { IUserPublic, UserRole } from "@/types/models.types";
import { getUsers, GetUsersParams } from "@/lib/api/users";
import { UserTable } from "@/components/cms/users";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
} from "@/components/ui/pagination";

// Role filter options
const roleOptions = [
  { value: "all", label: "Tous les rôles" },
  { value: UserRole.ADMIN, label: "Administrateur" },
  { value: UserRole.USER, label: "Utilisateur" },
];

// Status filter options
const statusOptions = [
  { value: "all", label: "Tous les statuts" },
  { value: "active", label: "Actifs" },
  { value: "inactive", label: "Inactifs" },
];

function UsersPageContent() {
  const [users, setUsers] = useState<IUserPublic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });

  // Fetch users
  const fetchUsers = useCallback(async (params: GetUsersParams = {}) => {
    setIsLoading(true);
    try {
      const result = await getUsers({
        page: params.page ?? pagination.page,
        limit: pagination.limit,
        role: params.role,
        isActive: params.isActive,
        search: params.search,
        sortBy: "createdAt",
        sortOrder: "desc",
      });

      if (result.success && result.data) {
        setUsers(result.data);
        setPagination(result.pagination);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.limit]);

  // Build query params from filters
  const buildQueryParams = useCallback((): GetUsersParams => {
    const params: GetUsersParams = {};
    
    if (roleFilter && roleFilter !== "all") {
      params.role = roleFilter as UserRole;
    }
    
    if (statusFilter === "active") {
      params.isActive = true;
    } else if (statusFilter === "inactive") {
      params.isActive = false;
    }
    
    if (searchQuery.trim()) {
      params.search = searchQuery.trim();
    }
    
    return params;
  }, [roleFilter, statusFilter, searchQuery]);

  // Initial fetch
  useEffect(() => {
    fetchUsers(buildQueryParams());
  }, []);

  // Handle search
  const handleSearch = () => {
    const params = buildQueryParams();
    params.page = 1;
    fetchUsers(params);
  };

  // Handle filter changes
  const handleFilterChange = (type: "role" | "status", value: string) => {
    if (type === "role") {
      setRoleFilter(value);
    } else {
      setStatusFilter(value);
    }
    
    // Fetch with new filters after state update
    setTimeout(() => {
      const params: GetUsersParams = { page: 1 };
      
      const newRole = type === "role" ? value : roleFilter;
      const newStatus = type === "status" ? value : statusFilter;
      
      if (newRole && newRole !== "all") {
        params.role = newRole as UserRole;
      }
      
      if (newStatus === "active") {
        params.isActive = true;
      } else if (newStatus === "inactive") {
        params.isActive = false;
      }
      
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }
      
      fetchUsers(params);
    }, 0);
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery("");
    const params = buildQueryParams();
    delete params.search;
    params.page = 1;
    fetchUsers(params);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setRoleFilter("all");
    setStatusFilter("all");
    fetchUsers({ page: 1 });
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    const params = buildQueryParams();
    params.page = page;
    fetchUsers(params);
  };

  // Refresh data
  const handleRefresh = () => {
    fetchUsers(buildQueryParams());
  };

  const hasActiveFilters = roleFilter !== "all" || statusFilter !== "all" || searchQuery.trim();

  return (
    <div className="flex flex-col gap-4 sm:gap-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Utilisateurs</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Gérez les utilisateurs de votre application
          </p>
        </div>
        <Button asChild className="w-full sm:w-auto h-11 sm:h-10">
          <Link href="/cms/users/new">
            <Plus className="size-4 mr-2" />
            Nouvel utilisateur
          </Link>
        </Button>
      </div>

      {/* Filters and Table */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4">
            {/* Search and Filters Row */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              {/* Search */}
              <div className="flex gap-2 flex-1 max-w-md">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher par email ou nom..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="pl-9"
                  />
                </div>
                <Button variant="secondary" onClick={handleSearch}>
                  Rechercher
                </Button>
                {searchQuery && (
                  <Button variant="ghost" size="icon" onClick={clearSearch}>
                    <X className="size-4" />
                  </Button>
                )}
              </div>

              {/* Filters */}
              <div className="flex gap-2 items-center">
                <Filter className="size-4 text-muted-foreground" />
                <Select
                  value={roleFilter}
                  onValueChange={(value) => handleFilterChange("role", value)}
                >
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    {roleOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={statusFilter}
                  onValueChange={(value) => handleFilterChange("status", value)}
                >
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Réinitialiser
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Results count */}
          <div className="text-sm text-muted-foreground mb-4">
            {pagination.total} utilisateur{pagination.total !== 1 ? "s" : ""} trouvé{pagination.total !== 1 ? "s" : ""}
            {hasActiveFilters && " (filtré)"}
          </div>

          {/* Table */}
          <UserTable
            users={users}
            isLoading={isLoading}
            onRefresh={handleRefresh}
          />

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-4 flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (pagination.hasPrev) {
                          handlePageChange(pagination.page - 1);
                        }
                      }}
                      className={!pagination.hasPrev ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>

                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                    .filter((page) => {
                      // Show first page, last page, current page, and pages around current
                      return (
                        page === 1 ||
                        page === pagination.totalPages ||
                        Math.abs(page - pagination.page) <= 1
                      );
                    })
                    .map((page, index, array) => {
                      // Add ellipsis if there's a gap
                      const showEllipsisBefore = index > 0 && page - array[index - 1] > 1;
                      return (
                        <PaginationItem key={page}>
                          {showEllipsisBefore && (
                            <span className="px-2 text-muted-foreground">...</span>
                          )}
                          <PaginationLink
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              handlePageChange(page);
                            }}
                            isActive={page === pagination.page}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}

                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (pagination.hasNext) {
                          handlePageChange(pagination.page + 1);
                        }
                      }}
                      className={!pagination.hasNext ? "pointer-events-none opacity-50" : "cursor-pointer"}
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

export default function UsersPage() {
  return (
    <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
      <UsersPageContent />
    </ProtectedRoute>
  );
}
