"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import * as authApi from "@/lib/api/auth";
import { getRedirectAfterLogin } from "@/lib/auth/redirect";
import type { AuthContextType, RegisterInput } from "@/types/auth.types";
import type { IUserPublic } from "@/types/models.types";
import { UserRole } from "@/types/models.types";

// ============ Context ============

const AuthContext = createContext<AuthContextType | null>(null);

// ============ Provider ============

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<IUserPublic | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  const isAuthenticated = !!user;

  const refreshUserData = useCallback(async () => {
    const res = await authApi.getCurrentUser();
    if (res.success && res.data) {
      setUser(res.data);
      return;
    }
    if (res.error?.toLowerCase().includes("session expired")) {
      try {
        await authApi.refreshToken();
        const retry = await authApi.getCurrentUser();
        if (retry.success && retry.data) {
          setUser(retry.data);
          return;
        }
      } catch {
        setUser(null);
        authApi.removeAccessToken();
        router.push("/login");
        toast.error("Session expired. Please login again.");
      }
      return;
    }
    setUser(null);
  }, [router]);

  useEffect(() => {
    let cancelled = false;
    const token = authApi.getAccessToken();
    if (!token) {
      setIsInitializing(false);
      return;
    }
    authApi.getCurrentUser().then((res) => {
      if (cancelled) return;
      if (res.success && res.data) {
        setUser(res.data);
      } else if (res.error?.toLowerCase().includes("session expired")) {
        authApi
          .refreshToken()
          .then(() => authApi.getCurrentUser())
          .then((retry) => {
            if (cancelled) return;
            if (retry.success && retry.data) setUser(retry.data);
            else setUser(null);
          })
          .catch(() => {
            if (cancelled) return;
            setUser(null);
            authApi.removeAccessToken();
          })
          .finally(() => {
            if (!cancelled) setIsInitializing(false);
          });
        return;
      } else {
        setUser(null);
      }
      setIsInitializing(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true);
      try {
        const res = await authApi.login(email, password);
        if (!res.success) {
          toast.error(res.error ?? res.message ?? "An unexpected error occurred. Please try again.");
          return;
        }
        if (res.data?.user) {
          setUser(res.data.user);
          toast.success("Connexion réussie");
          const redirectUrl = getRedirectAfterLogin();
          router.push(redirectUrl && redirectUrl !== "/login" ? redirectUrl : "/dashboard");
        } else {
          toast.error("An unexpected error occurred. Please try again.");
        }
      } catch (err) {
        toast.error("Connection error. Please check your internet.");
      } finally {
        setIsLoading(false);
      }
    },
    [router]
  );

  const register = useCallback(
    async (data: RegisterInput) => {
      setIsLoading(true);
      try {
        const res = await authApi.register(data);
        if (!res.success) {
          toast.error(res.error ?? res.message ?? "An unexpected error occurred. Please try again.");
          return;
        }
        if (res.data?.user) {
          setUser(res.data.user);
          toast.success("Compte créé avec succès");
          const redirectUrl = getRedirectAfterLogin();
          router.push(redirectUrl && redirectUrl !== "/login" ? redirectUrl : "/dashboard");
        } else {
          toast.error("An unexpected error occurred. Please try again.");
        }
      } catch (err) {
        toast.error("Connection error. Please check your internet.");
      } finally {
        setIsLoading(false);
      }
    },
    [router]
  );

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authApi.logout();
      setUser(null);
      toast.success("Déconnexion réussie");
      router.push("/login");
    } catch {
      setUser(null);
      authApi.removeAccessToken();
      router.push("/login");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const forgotPassword = useCallback(async (email: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await authApi.forgotPassword(email);
      if (!res.success) {
        toast.error(res.error ?? res.message ?? "An unexpected error occurred. Please try again.");
        return false;
      }
      toast.success("Si un compte existe, vous recevrez un email de réinitialisation");
      return true;
    } catch (err) {
      toast.error("Connection error. Please check your internet.");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetPassword = useCallback(
    async (token: string, password: string): Promise<boolean> => {
      setIsLoading(true);
      try {
        const res = await authApi.resetPassword(token, password);
        if (!res.success) {
          toast.error(res.error ?? res.message ?? "An unexpected error occurred. Please try again.");
          return false;
        }
        toast.success("Mot de passe réinitialisé avec succès");
        router.push("/login");
        return true;
      } catch (err) {
        toast.error("Connection error. Please check your internet.");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [router]
  );

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      isAuthenticated,
      isLoading,
      isInitializing,
      login,
      register,
      logout,
      forgotPassword,
      resetPassword,
      refreshUserData,
    }),
    [
      user,
      isAuthenticated,
      isLoading,
      isInitializing,
      login,
      register,
      logout,
      forgotPassword,
      resetPassword,
      refreshUserData,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ============ Hooks ============

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}

export function useRequireAuth(): AuthContextType {
  const auth = useAuth();
  if (!auth.isAuthenticated && !auth.isInitializing) {
    throw new Error("useRequireAuth: User is not authenticated");
  }
  return auth;
}

export function useRequireRole(roles: UserRole[]): AuthContextType {
  const auth = useRequireAuth();
  if (auth.user && !roles.includes(auth.user.role)) {
    throw new Error("useRequireRole: User does not have required role");
  }
  return auth;
}
