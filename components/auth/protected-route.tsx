"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/contexts/auth-context";
import { REDIRECT_AFTER_LOGIN_KEY } from "@/lib/auth/redirect";
import { Skeleton } from "@/components/ui/skeleton";
import type { UserRole } from "@/types/models.types";

export interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  allowedRoles,
  redirectTo = "/login",
}: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isInitializing } = useAuth();

  useEffect(() => {
    if (isInitializing) return;

    if (!isAuthenticated || !user) {
      if (typeof window !== "undefined") {
        try {
          sessionStorage.setItem(REDIRECT_AFTER_LOGIN_KEY, pathname ?? window.location.pathname);
        } catch {
          // ignore
        }
      }
      router.push(redirectTo);
      return;
    }

    if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      router.push(redirectTo);
    }
  }, [isInitializing, isAuthenticated, user, allowedRoles, redirectTo, router, pathname]);

  if (isInitializing) {
    return (
      <div className="min-h-screen flex flex-col gap-4 p-6">
        <Skeleton className="h-12 w-48" />
        <Skeleton className="h-64 flex-1" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <h1 className="text-2xl font-semibold text-destructive">403 Forbidden</h1>
        <p className="mt-2 text-muted-foreground">You don&apos;t have permission to access this resource.</p>
      </div>
    );
  }

  return <>{children}</>;
}
