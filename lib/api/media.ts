import { fetchWithAuth, getAccessToken, refreshToken, removeAccessToken } from "./auth";
import type { ApiResponse, PaginatedResponse } from "@/types/api.types";
import type { IMedia, MediaType } from "@/types/models.types";

const getBaseUrl = () =>
  typeof window !== "undefined" ? "" : process.env.NEXT_PUBLIC_APP_URL ?? "";

// ============ Query Types ============

export interface MediaQueryParams {
  page?: number;
  limit?: number;
  type?: MediaType;
  search?: string;
}

// ============ Media API ============

/**
 * Get list of media files with pagination and filters
 */
export async function getMediaList(
  params?: MediaQueryParams
): Promise<PaginatedResponse<IMedia>> {
  try {
    const searchParams = new URLSearchParams();

    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.limit) searchParams.set("limit", String(params.limit));
    if (params?.type) searchParams.set("type", params.type);
    if (params?.search) searchParams.set("search", params.search);

    const queryString = searchParams.toString();
    const url = `${getBaseUrl()}/api/uploads${queryString ? `?${queryString}` : ""}`;

    const res = await fetchWithAuth(url);
    return (await res.json()) as PaginatedResponse<IMedia>;
  } catch (error) {
    console.error("Get media list error:", error);
    return {
      success: false,
      error: "Failed to fetch media",
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

/**
 * Get single media item by ID
 */
export async function getMedia(id: string): Promise<ApiResponse<IMedia>> {
  try {
    const res = await fetchWithAuth(`${getBaseUrl()}/api/uploads/${id}`);
    return (await res.json()) as ApiResponse<IMedia>;
  } catch (error) {
    console.error("Get media error:", error);
    return {
      success: false,
      error: "Failed to fetch media",
    };
  }
}

/**
 * Upload a media file with progress tracking
 */
export async function uploadMedia(
  file: File,
  onProgress?: (progress: number) => void
): Promise<ApiResponse<IMedia>> {
  try {
    const formData = new FormData();
    formData.append("file", file);

    // Use XMLHttpRequest for progress tracking
    return new Promise((resolve) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = Math.round((event.loaded / event.total) * 100);
          onProgress(progress);
        }
      });

      xhr.addEventListener("load", async () => {
        try {
          const response = JSON.parse(xhr.responseText) as ApiResponse<IMedia>;
          
          // Handle token refresh on 401
          if (xhr.status === 401) {
            try {
              await refreshToken();
              // Retry the upload
              const retryResult = await uploadMediaSimple(file);
              resolve(retryResult);
              return;
            } catch {
              removeAccessToken();
              resolve({
                success: false,
                error: "Session expired. Please login again.",
              });
              return;
            }
          }

          resolve(response);
        } catch {
          resolve({
            success: false,
            error: "Failed to parse upload response",
          });
        }
      });

      xhr.addEventListener("error", () => {
        resolve({
          success: false,
          error: "Upload failed. Please try again.",
        });
      });

      xhr.addEventListener("abort", () => {
        resolve({
          success: false,
          error: "Upload cancelled",
        });
      });

      xhr.open("POST", `${getBaseUrl()}/api/uploads`);

      const token = getAccessToken();
      if (token) {
        xhr.setRequestHeader("Authorization", `Bearer ${token}`);
      }

      xhr.withCredentials = true;
      xhr.send(formData);
    });
  } catch (error) {
    console.error("Upload media error:", error);
    return {
      success: false,
      error: "Failed to upload file",
    };
  }
}

/**
 * Simple upload without progress tracking (used for retry)
 */
async function uploadMediaSimple(file: File): Promise<ApiResponse<IMedia>> {
  const formData = new FormData();
  formData.append("file", file);

  const token = getAccessToken();
  const headers: HeadersInit = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${getBaseUrl()}/api/uploads`, {
    method: "POST",
    body: formData,
    credentials: "include",
    headers,
  });

  return (await res.json()) as ApiResponse<IMedia>;
}

/**
 * Upload multiple files
 */
export async function uploadMultipleMedia(
  files: File[],
  onFileProgress?: (index: number, progress: number) => void,
  onFileComplete?: (index: number, result: ApiResponse<IMedia>) => void
): Promise<ApiResponse<IMedia>[]> {
  const results: ApiResponse<IMedia>[] = [];

  for (let i = 0; i < files.length; i++) {
    const result = await uploadMedia(files[i], (progress) => {
      onFileProgress?.(i, progress);
    });
    results.push(result);
    onFileComplete?.(i, result);
  }

  return results;
}

/**
 * Delete a media file
 */
export async function deleteMedia(id: string): Promise<ApiResponse<null>> {
  try {
    const res = await fetchWithAuth(`${getBaseUrl()}/api/uploads/${id}`, {
      method: "DELETE",
    });
    return (await res.json()) as ApiResponse<null>;
  } catch (error) {
    console.error("Delete media error:", error);
    return {
      success: false,
      error: "Failed to delete media",
    };
  }
}

// ============ Utility Functions ============

/**
 * Format file size to human readable string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  return filename.split(".").pop()?.toLowerCase() ?? "";
}

/**
 * Check if file type is allowed
 */
export function isAllowedFileType(mimeType: string): boolean {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "application/pdf",
  ];
  return allowedTypes.includes(mimeType);
}

/**
 * Get accepted file types for input
 */
export function getAcceptedFileTypes(): string {
  return "image/jpeg,image/png,image/webp,image/gif,application/pdf";
}

/**
 * Check if media is an image
 */
export function isImage(media: IMedia): boolean {
  return media.type === "image";
}

/**
 * Check if media is a document
 */
export function isDocument(media: IMedia): boolean {
  return media.type === "document";
}
