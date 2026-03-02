"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { ICategory } from "@/types/models.types";
import { getCategory } from "@/lib/api/categories";
import { CategoryForm } from "@/components/cms/categories";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function CategoryEditPage() {
  const params = useParams();
  const router = useRouter();
  const [category, setCategory] = useState<ICategory | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isNewCategory = params.id === "new";
  const categoryId = params.id as string;

  useEffect(() => {
    async function fetchData() {
      // If creating new category, skip fetch
      if (isNewCategory) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const categoryResult = await getCategory(categoryId);
        if (categoryResult.success && categoryResult.data) {
          setCategory(categoryResult.data);
        } else {
          setError(categoryResult.error ?? "Catégorie non trouvée");
        }
      } catch (err) {
        setError("Une erreur est survenue lors du chargement");
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [categoryId, isNewCategory]);

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
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <Skeleton className="h-40 w-40" />
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <Skeleton className="h-10 w-full" />
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

  if (!isNewCategory && !category) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-12">
        <div className="text-center space-y-2">
          <h2 className="text-lg font-medium">Catégorie non trouvée</h2>
          <p className="text-muted-foreground">
            La catégorie demandée n&apos;existe pas ou a été supprimée.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/cms/categories">
            <ArrowLeft className="size-4 mr-2" />
            Retour aux catégories
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
          <Link href="/cms/categories">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {isNewCategory ? "Nouvelle catégorie" : "Modifier la catégorie"}
          </h1>
          <p className="text-muted-foreground">
            {isNewCategory
              ? "Créez une nouvelle catégorie pour vos produits"
              : `Modification de "${category?.name}"`}
          </p>
        </div>
      </div>

      {/* Form */}
      <CategoryForm category={category ?? undefined} />
    </div>
  );
}
