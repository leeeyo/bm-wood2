import { fetchWithAuth } from "./auth";
import type { ApiResponse, PaginatedResponse } from "@/types/api.types";
import type { IUserPublic, UserRole } from "@/types/models.types";
import type { CreateUserInput, UpdateUserInput } from "@/lib/validations/user.schema";

const getBaseUrl = () =>
  typeof window !== "undefined" ? "" : process.env.NEXT_PUBLIC_APP_URL ?? "";

// ============ Query Parameters ============

export interface GetUsersParams {
  page?: number;
  limit?: number;
  sortBy?: "email" | "firstName" | "lastName" | "createdAt";
  sortOrder?: "asc" | "desc";
  role?: UserRole;
  isActive?: boolean;
  search?: string;
}

// ============ Users API ============

export async function getUsers(
  params: GetUsersParams = {}
): Promise<PaginatedResponse<IUserPublic>> {
  try {
    const searchParams = new URLSearchParams();
    
    if (params.page) searchParams.set("page", params.page.toString());
    if (params.limit) searchParams.set("limit", params.limit.toString());
    if (params.sortBy) searchParams.set("sortBy", params.sortBy);
    if (params.sortOrder) searchParams.set("sortOrder", params.sortOrder);
    if (params.role) searchParams.set("role", params.role);
    if (typeof params.isActive === "boolean") {
      searchParams.set("isActive", params.isActive.toString());
    }
    if (params.search) searchParams.set("search", params.search);

    const queryString = searchParams.toString();
    const url = `${getBaseUrl()}/api/users${queryString ? `?${queryString}` : ""}`;
    
    const res = await fetchWithAuth(url);
    return (await res.json()) as PaginatedResponse<IUserPublic>;
  } catch (error) {
    console.error("Get users error:", error);
    return {
      success: false,
      error: "Failed to fetch users",
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      },
    };
  }
}

export async function getUser(id: string): Promise<ApiResponse<IUserPublic>> {
  try {
    const res = await fetchWithAuth(`${getBaseUrl()}/api/users/${id}`);
    return (await res.json()) as ApiResponse<IUserPublic>;
  } catch (error) {
    console.error("Get user error:", error);
    return {
      success: false,
      error: "Failed to fetch user",
    };
  }
}

export async function createUser(
  data: CreateUserInput
): Promise<ApiResponse<IUserPublic>> {
  try {
    const res = await fetchWithAuth(`${getBaseUrl()}/api/users`, {
      method: "POST",
      body: JSON.stringify(data),
    });
    return (await res.json()) as ApiResponse<IUserPublic>;
  } catch (error) {
    console.error("Create user error:", error);
    return {
      success: false,
      error: "Failed to create user",
    };
  }
}

export async function updateUser(
  id: string,
  data: UpdateUserInput
): Promise<ApiResponse<IUserPublic>> {
  try {
    const res = await fetchWithAuth(`${getBaseUrl()}/api/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    return (await res.json()) as ApiResponse<IUserPublic>;
  } catch (error) {
    console.error("Update user error:", error);
    return {
      success: false,
      error: "Failed to update user",
    };
  }
}

export async function deleteUser(id: string): Promise<ApiResponse<null>> {
  try {
    const res = await fetchWithAuth(`${getBaseUrl()}/api/users/${id}`, {
      method: "DELETE",
    });
    return (await res.json()) as ApiResponse<null>;
  } catch (error) {
    console.error("Delete user error:", error);
    return {
      success: false,
      error: "Failed to delete user",
    };
  }
}

export async function toggleUserStatus(
  id: string,
  isActive: boolean
): Promise<ApiResponse<IUserPublic>> {
  try {
    const res = await fetchWithAuth(`${getBaseUrl()}/api/users/${id}`, {
      method: "PUT",
      body: JSON.stringify({ isActive }),
    });
    return (await res.json()) as ApiResponse<IUserPublic>;
  } catch (error) {
    console.error("Toggle user status error:", error);
    return {
      success: false,
      error: "Failed to update user status",
    };
  }
}
