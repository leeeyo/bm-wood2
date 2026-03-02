"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { IProduct, ICategory } from "@/types/models.types";
import { getProduct, getCategories } from "@/lib/api/products";
import { ProductForm } from "@/components/cms/products/product-form";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function ProductEditPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<IProduct | null>(null);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isNewProduct = params.id === "new";
  const productId = params.id as string;

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch categories first
        const categoriesResult = await getCategories();
        if (categoriesResult.success && categoriesResult.data) {
          setCategories(categoriesResult.data);
        } else {
          setError("Impossible de charger les catégories");
          return;
        }

        // If editing, fetch the product
        if (!isNewProduct) {
          const productResult = await getProduct(productId);
          if (productResult.success && productResult.data) {
            setProduct(productResult.data);
          } else {
            setError(productResult.error ?? "Produit non trouvé");
            return;
          }
        }
      } catch (err) {
        setError("Une erreur est survenue lors du chargement");
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [productId, isNewProduct]);

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
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-4 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="aspect-square" />
                  ))}
                </div>
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

  if (!isNewProduct && !product) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-12">
        <div className="text-center space-y-2">
          <h2 className="text-lg font-medium">Produit non trouvé</h2>
          <p className="text-muted-foreground">
            Le produit demandé n&apos;existe pas ou a été supprimé.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/cms/products">
            <ArrowLeft className="size-4 mr-2" />
            Retour aux produits
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
          <Link href="/cms/products">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {isNewProduct ? "Nouveau produit" : "Modifier le produit"}
          </h1>
          <p className="text-muted-foreground">
            {isNewProduct
              ? "Créez un nouveau produit pour votre catalogue"
              : `Modification de "${product?.name}"`}
          </p>
        </div>
      </div>

      {/* Form */}
      <ProductForm
        product={product ?? undefined}
        categories={categories}
      />
    </div>
  );
}
