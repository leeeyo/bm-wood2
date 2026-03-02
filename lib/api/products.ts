import { fetchWithAuth } from "./auth";
import type { ApiResponse, PaginatedResponse } from "@/types/api.types";
import type { IProduct, ICategory, IMedia } from "@/types/models.types";
import type { ProductQueryInput, CreateProductInput, UpdateProductInput } from "@/lib/validations/product.schema";

const getBaseUrl = () =>
  typeof window !== "undefined" ? "" : process.env.NEXT_PUBLIC_APP_URL ?? "";

// ============ Products API ============

export async function getProducts(
  params?: Partial<ProductQueryInput>
): Promise<PaginatedResponse<IProduct>> {
  try {
    const searchParams = new URLSearchParams();
    
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.limit) searchParams.set("limit", String(params.limit));
    if (params?.sortBy) searchParams.set("sortBy", params.sortBy);
    if (params?.sortOrder) searchParams.set("sortOrder", params.sortOrder);
    if (params?.categoryId) searchParams.set("categoryId", params.categoryId);
    if (typeof params?.isFeatured === "boolean") searchParams.set("isFeatured", String(params.isFeatured));
    if (typeof params?.isActive === "boolean") searchParams.set("isActive", String(params.isActive));
    if (params?.search) searchParams.set("search", params.search);

    const queryString = searchParams.toString();
    const url = `${getBaseUrl()}/api/products${queryString ? `?${queryString}` : ""}`;
    
    const res = await fetchWithAuth(url);
    return (await res.json()) as PaginatedResponse<IProduct>;
  } catch (error) {
    console.error("Get products error:", error);
    return {
      success: false,
      error: "Failed to fetch products",
      pagination: { page: 1, limit: 20, total: 0, totalPages: 0, hasNext: false, hasPrev: false },
    };
  }
}

export async function getProduct(id: string): Promise<ApiResponse<IProduct>> {
  try {
    const res = await fetchWithAuth(`${getBaseUrl()}/api/products/${id}`);
    return (await res.json()) as ApiResponse<IProduct>;
  } catch (error) {
    console.error("Get product error:", error);
    return {
      success: false,
      error: "Failed to fetch product",
    };
  }
}

export async function createProduct(
  data: CreateProductInput
): Promise<ApiResponse<IProduct>> {
  try {
    const res = await fetchWithAuth(`${getBaseUrl()}/api/products`, {
      method: "POST",
      body: JSON.stringify(data),
    });
    return (await res.json()) as ApiResponse<IProduct>;
  } catch (error) {
    console.error("Create product error:", error);
    return {
      success: false,
      error: "Failed to create product",
    };
  }
}

export async function updateProduct(
  id: string,
  data: UpdateProductInput
): Promise<ApiResponse<IProduct>> {
  try {
    const res = await fetchWithAuth(`${getBaseUrl()}/api/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    return (await res.json()) as ApiResponse<IProduct>;
  } catch (error) {
    console.error("Update product error:", error);
    return {
      success: false,
      error: "Failed to update product",
    };
  }
}

export async function deleteProduct(id: string): Promise<ApiResponse<null>> {
  try {
    const res = await fetchWithAuth(`${getBaseUrl()}/api/products/${id}`, {
      method: "DELETE",
    });
    return (await res.json()) as ApiResponse<null>;
  } catch (error) {
    console.error("Delete product error:", error);
    return {
      success: false,
      error: "Failed to delete product",
    };
  }
}

// ============ Categories API ============

export async function getCategories(): Promise<ApiResponse<ICategory[]>> {
  try {
    const res = await fetchWithAuth(`${getBaseUrl()}/api/categories`);
    return (await res.json()) as ApiResponse<ICategory[]>;
  } catch (error) {
    console.error("Get categories error:", error);
    return {
      success: false,
      error: "Failed to fetch categories",
    };
  }
}

// ============ Uploads API ============

export async function uploadFile(file: File): Promise<ApiResponse<IMedia>> {
  try {
    const formData = new FormData();
    formData.append("file", file);

    // Use fetch directly for FormData to avoid Content-Type issues
    // fetchWithAuth sets Content-Type: application/json by default
    const { getAccessToken, refreshToken, removeAccessToken } = await import("./auth");
    
    const makeRequest = async (token: string | null): Promise<Response> => {
      const headers: HeadersInit = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;
      
      return fetch(`${getBaseUrl()}/api/uploads`, {
        method: "POST",
        body: formData,
        credentials: "include",
        headers,
      });
    };

    let token = getAccessToken();
    let res = await makeRequest(token);

    // Handle token refresh
    if (res.status === 401) {
      try {
        await refreshToken();
        token = getAccessToken();
        res = await makeRequest(token);
      } catch {
        removeAccessToken();
        throw new Error("Session expired. Please login again.");
      }
    }

    return (await res.json()) as ApiResponse<IMedia>;
  } catch (error) {
    console.error("Upload file error:", error);
    return {
      success: false,
      error: "Failed to upload file",
    };
  }
}

export async function deleteUpload(id: string): Promise<ApiResponse<null>> {
  try {
    const res = await fetchWithAuth(`${getBaseUrl()}/api/uploads/${id}`, {
      method: "DELETE",
    });
    return (await res.json()) as ApiResponse<null>;
  } catch (error) {
    console.error("Delete upload error:", error);
    return {
      success: false,
      error: "Failed to delete upload",
    };
  }
}
