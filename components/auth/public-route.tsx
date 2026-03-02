"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/contexts/auth-context";
import { Skeleton } from "@/components/ui/skeleton";

export interface PublicRouteProps {
  children: React.ReactNode;
  redirectIfAuthenticated?: boolean;
  redirectTo?: string;
}

export function PublicRoute({
  children,
  redirectIfAuthenticated = true,
  redirectTo = "/dashboard",
}: PublicRouteProps) {
  const router = useRouter();
  const { isAuthenticated, isInitializing } = useAuth();

  useEffect(() => {
    if (isInitializing) return;
    if (redirectIfAuthenticated && isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isInitializing, isAuthenticated, redirectIfAuthenticated, redirectTo, router]);

  if (isInitializing && redirectIfAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6">
        <Skeleton className="h-12 w-48" />
        <Skeleton className="h-96 w-full max-w-md" />
      </div>
    );
  }

  if (redirectIfAuthenticated && isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
