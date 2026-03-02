import { fetchWithAuth } from "./auth";
import type { ApiResponse, PaginatedResponse } from "@/types/api.types";
import type { IBlogPost } from "@/types/models.types";
import type {
  CreateBlogPostInput,
  UpdateBlogPostInput,
  BlogQueryInput,
} from "@/lib/validations/blog.schema";

const getBaseUrl = () =>
  typeof window !== "undefined" ? "" : process.env.NEXT_PUBLIC_APP_URL ?? "";

// ============ Blogs API ============

export async function getBlogs(
  params?: Partial<BlogQueryInput>
): Promise<PaginatedResponse<IBlogPost>> {
  try {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.limit) searchParams.set("limit", String(params.limit));
    if (params?.sortBy) searchParams.set("sortBy", params.sortBy);
    if (params?.sortOrder) searchParams.set("sortOrder", params.sortOrder);
    if (typeof params?.isPublished === "boolean")
      searchParams.set("isPublished", String(params.isPublished));

    const queryString = searchParams.toString();
    const url = `${getBaseUrl()}/api/blogs${queryString ? `?${queryString}` : ""}`;

    const res = await fetchWithAuth(url);
    return (await res.json()) as PaginatedResponse<IBlogPost>;
  } catch (error) {
    console.error("Get blogs error:", error);
    return {
      success: false,
      error: "Failed to fetch blogs",
      pagination: { page: 1, limit: 12, total: 0, totalPages: 0, hasNext: false, hasPrev: false },
    };
  }
}

export async function getBlog(id: string): Promise<ApiResponse<IBlogPost>> {
  try {
    const res = await fetchWithAuth(`${getBaseUrl()}/api/blogs/${id}`);
    return (await res.json()) as ApiResponse<IBlogPost>;
  } catch (error) {
    console.error("Get blog error:", error);
    return {
      success: false,
      error: "Failed to fetch blog",
    };
  }
}

export async function getBlogBySlug(slug: string): Promise<ApiResponse<IBlogPost>> {
  try {
    const res = await fetch(`${getBaseUrl()}/api/blogs/slug/${encodeURIComponent(slug)}`);
    return (await res.json()) as ApiResponse<IBlogPost>;
  } catch (error) {
    console.error("Get blog by slug error:", error);
    return {
      success: false,
      error: "Failed to fetch blog",
    };
  }
}

export async function createBlog(
  data: CreateBlogPostInput
): Promise<ApiResponse<IBlogPost>> {
  try {
    const res = await fetchWithAuth(`${getBaseUrl()}/api/blogs`, {
      method: "POST",
      body: JSON.stringify(data),
    });
    return (await res.json()) as ApiResponse<IBlogPost>;
  } catch (error) {
    console.error("Create blog error:", error);
    return {
      success: false,
      error: "Failed to create blog",
    };
  }
}

export async function updateBlog(
  id: string,
  data: UpdateBlogPostInput
): Promise<ApiResponse<IBlogPost>> {
  try {
    const res = await fetchWithAuth(`${getBaseUrl()}/api/blogs/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    return (await res.json()) as ApiResponse<IBlogPost>;
  } catch (error) {
    console.error("Update blog error:", error);
    return {
      success: false,
      error: "Failed to update blog",
    };
  }
}

export async function deleteBlog(id: string): Promise<ApiResponse<null>> {
  try {
    const res = await fetchWithAuth(`${getBaseUrl()}/api/blogs/${id}`, {
      method: "DELETE",
    });
    return (await res.json()) as ApiResponse<null>;
  } catch (error) {
    console.error("Delete blog error:", error);
    return {
      success: false,
      error: "Failed to delete blog",
    };
  }
}
