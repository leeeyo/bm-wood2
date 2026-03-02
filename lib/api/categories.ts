import { fetchWithAuth } from "./auth";
import type { ApiResponse } from "@/types/api.types";
import type { ICategory } from "@/types/models.types";
import type { CreateCategoryInput, UpdateCategoryInput } from "@/lib/validations/category.schema";

const getBaseUrl = () =>
  typeof window !== "undefined" ? "" : process.env.NEXT_PUBLIC_APP_URL ?? "";

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

export async function getCategory(id: string): Promise<ApiResponse<ICategory>> {
  try {
    const res = await fetchWithAuth(`${getBaseUrl()}/api/categories/${id}`);
    return (await res.json()) as ApiResponse<ICategory>;
  } catch (error) {
    console.error("Get category error:", error);
    return {
      success: false,
      error: "Failed to fetch category",
    };
  }
}

export async function createCategory(
  data: CreateCategoryInput
): Promise<ApiResponse<ICategory>> {
  try {
    const res = await fetchWithAuth(`${getBaseUrl()}/api/categories`, {
      method: "POST",
      body: JSON.stringify(data),
    });
    return (await res.json()) as ApiResponse<ICategory>;
  } catch (error) {
    console.error("Create category error:", error);
    return {
      success: false,
      error: "Failed to create category",
    };
  }
}

export async function updateCategory(
  id: string,
  data: UpdateCategoryInput
): Promise<ApiResponse<ICategory>> {
  try {
    const res = await fetchWithAuth(`${getBaseUrl()}/api/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    return (await res.json()) as ApiResponse<ICategory>;
  } catch (error) {
    console.error("Update category error:", error);
    return {
      success: false,
      error: "Failed to update category",
    };
  }
}

export async function deleteCategory(id: string): Promise<ApiResponse<null>> {
  try {
    const res = await fetchWithAuth(`${getBaseUrl()}/api/categories/${id}`, {
      method: "DELETE",
    });
    return (await res.json()) as ApiResponse<null>;
  } catch (error) {
    console.error("Delete category error:", error);
    return {
      success: false,
      error: "Failed to delete category",
    };
  }
}

export interface ReorderCategoriesInput {
  categories: Array<{
    id: string;
    order: number;
  }>;
}

export async function reorderCategories(
  data: ReorderCategoriesInput
): Promise<ApiResponse<ICategory[]>> {
  try {
    // We'll update each category's order individually
    // This is a batch operation that updates the order field
    const updatePromises = data.categories.map((item) =>
      fetchWithAuth(`${getBaseUrl()}/api/categories/${item.id}`, {
        method: "PUT",
        body: JSON.stringify({ order: item.order }),
      })
    );

    await Promise.all(updatePromises);

    // Fetch the updated categories list
    return await getCategories();
  } catch (error) {
    console.error("Reorder categories error:", error);
    return {
      success: false,
      error: "Failed to reorder categories",
    };
  }
}

// Get count of products in a category (for delete warning)
export async function getCategoryProductCount(categoryId: string): Promise<ApiResponse<{ count: number }>> {
  try {
    // Fetch products filtered by category and get the count
    const res = await fetchWithAuth(
      `${getBaseUrl()}/api/products?categoryId=${categoryId}&limit=1`
    );
    const data = await res.json();
    
    if (data.success && data.pagination) {
      return {
        success: true,
        data: { count: data.pagination.total },
      };
    }
    
    return {
      success: true,
      data: { count: 0 },
    };
  } catch (error) {
    console.error("Get category product count error:", error);
    return {
      success: false,
      error: "Failed to get product count",
    };
  }
}
