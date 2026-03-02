import { fetchWithAuth } from "./auth";
import type { ApiResponse, PaginatedResponse } from "@/types/api.types";
import { DevisStatus, type IDevis, type IUserPublic } from "@/types/models.types";
import type { DevisQueryInput, UpdateDevisInput, UpdateDevisStatusInput } from "@/lib/validations/devis.schema";

const getBaseUrl = () =>
  typeof window !== "undefined" ? "" : process.env.NEXT_PUBLIC_APP_URL ?? "";

// ============ Devis API ============

export interface DevisListParams extends Partial<DevisQueryInput> {
  search?: string;
}

export async function getDevisList(
  params?: DevisListParams
): Promise<PaginatedResponse<IDevis>> {
  try {
    const searchParams = new URLSearchParams();

    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.limit) searchParams.set("limit", String(params.limit));
    if (params?.sortBy) searchParams.set("sortBy", params.sortBy);
    if (params?.sortOrder) searchParams.set("sortOrder", params.sortOrder);
    if (params?.status) searchParams.set("status", params.status);
    if (params?.assignedTo) searchParams.set("assignedTo", params.assignedTo);
    if (params?.dateFrom) searchParams.set("dateFrom", params.dateFrom);
    if (params?.dateTo) searchParams.set("dateTo", params.dateTo);
    if (params?.search) searchParams.set("search", params.search);

    const queryString = searchParams.toString();
    const url = `${getBaseUrl()}/api/devis${queryString ? `?${queryString}` : ""}`;

    const res = await fetchWithAuth(url);
    return (await res.json()) as PaginatedResponse<IDevis>;
  } catch (error) {
    console.error("Get devis list error:", error);
    return {
      success: false,
      error: "Failed to fetch devis list",
      pagination: { page: 1, limit: 20, total: 0, totalPages: 0, hasNext: false, hasPrev: false },
    };
  }
}

export async function getDevis(id: string): Promise<ApiResponse<IDevis>> {
  try {
    const res = await fetchWithAuth(`${getBaseUrl()}/api/devis/${id}`);
    return (await res.json()) as ApiResponse<IDevis>;
  } catch (error) {
    console.error("Get devis error:", error);
    return {
      success: false,
      error: "Failed to fetch devis",
    };
  }
}

export async function updateDevis(
  id: string,
  data: UpdateDevisInput
): Promise<ApiResponse<IDevis>> {
  try {
    const res = await fetchWithAuth(`${getBaseUrl()}/api/devis/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    return (await res.json()) as ApiResponse<IDevis>;
  } catch (error) {
    console.error("Update devis error:", error);
    return {
      success: false,
      error: "Failed to update devis",
    };
  }
}

export async function updateDevisStatus(
  id: string,
  data: UpdateDevisStatusInput
): Promise<ApiResponse<IDevis>> {
  try {
    const res = await fetchWithAuth(`${getBaseUrl()}/api/devis/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    return (await res.json()) as ApiResponse<IDevis>;
  } catch (error) {
    console.error("Update devis status error:", error);
    return {
      success: false,
      error: "Failed to update devis status",
    };
  }
}

export async function deleteDevis(id: string): Promise<ApiResponse<null>> {
  try {
    const res = await fetchWithAuth(`${getBaseUrl()}/api/devis/${id}`, {
      method: "DELETE",
    });
    return (await res.json()) as ApiResponse<null>;
  } catch (error) {
    console.error("Delete devis error:", error);
    return {
      success: false,
      error: "Failed to delete devis",
    };
  }
}

export async function downloadDevisPDF(id: string): Promise<Blob | null> {
  try {
    const res = await fetchWithAuth(`${getBaseUrl()}/api/devis/${id}/pdf`);
    
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "Failed to download PDF");
    }
    
    return await res.blob();
  } catch (error) {
    console.error("Download devis PDF error:", error);
    return null;
  }
}

// Helper function to trigger PDF download
export async function triggerDevisPDFDownload(id: string, reference: string): Promise<boolean> {
  try {
    const blob = await downloadDevisPDF(id);
    
    if (!blob) {
      return false;
    }
    
    // Create download link
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `devis-${reference}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error("Trigger PDF download error:", error);
    return false;
  }
}

// Send devis PDF by email to the client
export async function sendDevisPdfByEmail(
  id: string
): Promise<ApiResponse<{ sentTo: string }>> {
  try {
    const res = await fetchWithAuth(`${getBaseUrl()}/api/devis/${id}/send-pdf`, {
      method: "POST",
    });
    return (await res.json()) as ApiResponse<{ sentTo: string }>;
  } catch (error) {
    console.error("Send devis PDF by email error:", error);
    return {
      success: false,
      error: "Erreur lors de l'envoi de l'email.",
    };
  }
}

// ============ Users API (for assignment dropdown) ============

export async function getUsers(): Promise<PaginatedResponse<IUserPublic>> {
  try {
    const res = await fetchWithAuth(`${getBaseUrl()}/api/users?limit=100&isActive=true`);
    return (await res.json()) as PaginatedResponse<IUserPublic>;
  } catch (error) {
    console.error("Get users error:", error);
    return {
      success: false,
      error: "Failed to fetch users",
      pagination: { page: 1, limit: 100, total: 0, totalPages: 0, hasNext: false, hasPrev: false },
    };
  }
}

// ============ Status Helpers ============

export const DEVIS_STATUS_CONFIG: Record<DevisStatus, { label: string; color: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  [DevisStatus.PENDING]: { label: "En attente", color: "bg-yellow-500", variant: "secondary" },
  [DevisStatus.REVIEWED]: { label: "Examiné", color: "bg-blue-500", variant: "outline" },
  [DevisStatus.APPROVED]: { label: "Approuvé", color: "bg-green-500", variant: "default" },
  [DevisStatus.REJECTED]: { label: "Rejeté", color: "bg-red-500", variant: "destructive" },
  [DevisStatus.IN_PROGRESS]: { label: "En cours", color: "bg-purple-500", variant: "default" },
  [DevisStatus.COMPLETED]: { label: "Terminé", color: "bg-emerald-500", variant: "default" },
};

export function getStatusLabel(status: DevisStatus): string {
  return DEVIS_STATUS_CONFIG[status]?.label ?? status;
}

export function getStatusVariant(status: DevisStatus): "default" | "secondary" | "destructive" | "outline" {
  return DEVIS_STATUS_CONFIG[status]?.variant ?? "outline";
}

// Valid status transitions
export const VALID_STATUS_TRANSITIONS: Record<DevisStatus, DevisStatus[]> = {
  [DevisStatus.PENDING]: [DevisStatus.REVIEWED],
  [DevisStatus.REVIEWED]: [DevisStatus.APPROVED, DevisStatus.REJECTED],
  [DevisStatus.APPROVED]: [DevisStatus.IN_PROGRESS],
  [DevisStatus.REJECTED]: [],
  [DevisStatus.IN_PROGRESS]: [DevisStatus.COMPLETED],
  [DevisStatus.COMPLETED]: [],
};

export function getNextStatuses(currentStatus: DevisStatus): DevisStatus[] {
  return VALID_STATUS_TRANSITIONS[currentStatus] ?? [];
}
