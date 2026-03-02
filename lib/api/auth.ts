import type { ApiResponse } from "@/types/api.types";
import type {
  AuthTokens,
  LoginResponse,
  RefreshResponse,
  RegisterInput,
} from "@/types/auth.types";
import type { IUserPublic } from "@/types/models.types";

const AUTH_KEYS = {
  ACCESS_TOKEN: "accessToken",
} as const;

const getBaseUrl = () =>
  typeof window !== "undefined" ? "" : process.env.NEXT_PUBLIC_APP_URL ?? "";

// ============ Token Helpers ============

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(AUTH_KEYS.ACCESS_TOKEN);
}

export function setAccessToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(AUTH_KEYS.ACCESS_TOKEN, token);
}

export function removeAccessToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(AUTH_KEYS.ACCESS_TOKEN);
}

export function createAuthHeaders(): HeadersInit {
  const token = getAccessToken();
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

// ============ Refresh Lock ============

let refreshPromise: Promise<string> | null = null;

export async function refreshToken(): Promise<AuthTokens> {
  if (refreshPromise) {
    const newAccess = await refreshPromise;
    return { accessToken: newAccess, refreshToken: "" };
  }

  refreshPromise = (async () => {
    const res = await fetch(`${getBaseUrl()}/api/auth/refresh`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });
    const data: ApiResponse<RefreshResponse> = await res.json();

    if (!res.ok || !data.success || !data.data?.accessToken) {
      removeAccessToken();
      refreshPromise = null;
      throw new Error(data.error ?? data.message ?? "Session expired. Please login again.");
    }

    setAccessToken(data.data.accessToken);
    return data.data.accessToken;
  })();

  try {
    const accessToken = await refreshPromise;
    return { accessToken, refreshToken: "" };
  } finally {
    refreshPromise = null;
  }
}

// ============ Auth API ============

export async function login(
  email: string,
  password: string
): Promise<ApiResponse<LoginResponse>> {
  try {
    const res = await fetch(`${getBaseUrl()}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data: ApiResponse<LoginResponse> = await res.json();

    if (!res.ok) return data;
    if (data.success && data.data?.tokens?.accessToken) {
      setAccessToken(data.data.tokens.accessToken);
    }
    return data;
  } catch (err) {
    return {
      success: false,
      error: "Connection error. Please check your internet.",
    };
  }
}

export async function register(
  data: RegisterInput
): Promise<ApiResponse<LoginResponse>> {
  try {
    const res = await fetch(`${getBaseUrl()}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result: ApiResponse<LoginResponse> = await res.json();

    if (!res.ok) return result;
    if (result.success && result.data?.tokens?.accessToken) {
      setAccessToken(result.data.tokens.accessToken);
    }
    return result;
  } catch (err) {
    return {
      success: false,
      error: "Connection error. Please check your internet.",
    };
  }
}

export async function logout(): Promise<ApiResponse<unknown>> {
  try {
    const token = getAccessToken();
    await fetch(`${getBaseUrl()}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
      headers: createAuthHeaders(),
    });
    removeAccessToken();
    return { success: true };
  } catch {
    removeAccessToken();
    return { success: true };
  }
}

export async function forgotPassword(
  email: string
): Promise<ApiResponse<unknown>> {
  try {
    const res = await fetch(`${getBaseUrl()}/api/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    return (await res.json()) as ApiResponse<unknown>;
  } catch (err) {
    return {
      success: false,
      error: "Connection error. Please check your internet.",
    };
  }
}

export async function resetPassword(
  token: string,
  password: string
): Promise<ApiResponse<unknown>> {
  try {
    const res = await fetch(`${getBaseUrl()}/api/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    return (await res.json()) as ApiResponse<unknown>;
  } catch (err) {
    return {
      success: false,
      error: "Connection error. Please check your internet.",
    };
  }
}

export async function getCurrentUser(): Promise<ApiResponse<IUserPublic>> {
  try {
    const res = await fetch(`${getBaseUrl()}/api/auth/me`, {
      method: "GET",
      credentials: "include",
      headers: createAuthHeaders(),
    });
    const data = (await res.json()) as ApiResponse<IUserPublic>;
    if (res.status === 401) {
      return { success: false, error: "Session expired. Please login again." };
    }
    return data;
  } catch (err) {
    return {
      success: false,
      error: "Connection error. Please check your internet.",
    };
  }
}

// ============ Fetch with Auth (Interceptor) ============

export async function fetchWithAuth(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const headers = new Headers(options.headers ?? {});
  if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  const token = getAccessToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  let res = await fetch(url, { ...options, credentials: "include", headers });

  if (res.status === 401) {
    try {
      await refreshToken();
      const newToken = getAccessToken();
      if (newToken) {
        headers.set("Authorization", `Bearer ${newToken}`);
        res = await fetch(url, { ...options, credentials: "include", headers });
      }
    } catch {
      removeAccessToken();
      throw new Error("Session expired. Please login again.");
    }
  }

  return res;
}
