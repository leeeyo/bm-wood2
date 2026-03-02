"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { IUserPublic, UserRole } from "@/types/models.types";
import { getUser } from "@/lib/api/users";
import { UserForm } from "@/components/cms/users";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

function UserEditPageContent() {
  const params = useParams();
  const router = useRouter();
  const [user, setUser] = useState<IUserPublic | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isNewUser = params.id === "new";
  const userId = params.id as string;

  useEffect(() => {
    async function fetchData() {
      // If creating new user, skip fetch
      if (isNewUser) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const userResult = await getUser(userId);
        if (userResult.success && userResult.data) {
          setUser(userResult.data);
        } else {
          setError(userResult.error ?? "Utilisateur non trouvé");
        }
      } catch (err) {
        setError("Une erreur est survenue lors du chargement");
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [userId, isNewUser]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 space-y-4">
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-12">
        <div className="text-center space-y-2">
          <h2 className="text-lg font-medium">Erreur</h2>
          <p className="text-muted-foreground">{error}</p>
        </div>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="size-4 mr-2" />
          Retour
        </Button>
      </div>
    );
  }

  if (!isNewUser && !user) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-12">
        <div className="text-center space-y-2">
          <h2 className="text-lg font-medium">Utilisateur non trouvé</h2>
          <p className="text-muted-foreground">
            L&apos;utilisateur demandé n&apos;existe pas ou a été supprimé.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/cms/users">
            <ArrowLeft className="size-4 mr-2" />
            Retour aux utilisateurs
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/cms/users">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {isNewUser ? "Nouvel utilisateur" : "Modifier l'utilisateur"}
          </h1>
          <p className="text-muted-foreground">
            {isNewUser
              ? "Créez un nouveau compte utilisateur"
              : `Modification de "${user?.firstName} ${user?.lastName}"`}
          </p>
        </div>
      </div>

      {/* Form */}
      <UserForm user={user ?? undefined} />
    </div>
  );
}

export default function UserEditPage() {
  return (
    <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
      <UserEditPageContent />
    </ProtectedRoute>
  );
}
