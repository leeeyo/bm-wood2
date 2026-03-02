"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCcw, Home } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function CMSError({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("CMS Error:", error);
  }, [error]);

  // Determine if it's a known error type
  const isNetworkError =
    error.message.includes("fetch") ||
    error.message.includes("network") ||
    error.message.includes("Failed to load");

  const isAuthError =
    error.message.includes("unauthorized") ||
    error.message.includes("401") ||
    error.message.includes("authentication");

  const getErrorTitle = () => {
    if (isNetworkError) return "Erreur de connexion";
    if (isAuthError) return "Erreur d'authentification";
    return "Une erreur est survenue";
  };

  const getErrorDescription = () => {
    if (isNetworkError) {
      return "Impossible de se connecter au serveur. Vérifiez votre connexion internet et réessayez.";
    }
    if (isAuthError) {
      return "Votre session a peut-être expiré. Veuillez vous reconnecter.";
    }
    return "Quelque chose s'est mal passé. Nous travaillons à résoudre le problème.";
  };

  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 rounded-full bg-destructive/10 p-4">
            <AlertCircle className="size-8 text-destructive" />
          </div>
          <CardTitle className="text-xl">{getErrorTitle()}</CardTitle>
          <CardDescription className="text-base">
            {getErrorDescription()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Error details (only in development) */}
          {process.env.NODE_ENV === "development" && (
            <div className="rounded-lg bg-muted p-4 font-mono text-sm">
              <p className="font-semibold text-destructive mb-2">
                Détails de l&apos;erreur:
              </p>
              <p className="text-muted-foreground wrap-break-word">
                {error.message}
              </p>
              {error.digest && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Digest: {error.digest}
                </p>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button onClick={reset} className="w-full sm:w-auto">
            <RefreshCcw className="size-4 mr-2" />
            Réessayer
          </Button>
          <Button variant="outline" asChild className="w-full sm:w-auto">
            <Link href="/dashboard">
              <Home className="size-4 mr-2" />
              Retour au tableau de bord
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
