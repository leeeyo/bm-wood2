"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { IBlogPost } from "@/types/models.types";
import { getBlog } from "@/lib/api/blogs";
import { BlogForm } from "@/components/cms/blogs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function BlogEditPage() {
  const params = useParams();
  const router = useRouter();
  const [blog, setBlog] = useState<IBlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isNewBlog = params.id === "new";
  const blogId = params.id as string;

  useEffect(() => {
    async function fetchData() {
      if (isNewBlog) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const result = await getBlog(blogId);
        if (result.success && result.data) {
          setBlog(result.data);
        } else {
          setError(result.error ?? "Article non trouvé");
        }
      } catch (err) {
        setError("Une erreur est survenue lors du chargement");
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [blogId, isNewBlog]);

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
                <Skeleton className="h-[400px] w-full" />
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

  if (!isNewBlog && !blog) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-12">
        <div className="text-center space-y-2">
          <h2 className="text-lg font-medium">Article non trouvé</h2>
          <p className="text-muted-foreground">
            L&apos;article demandé n&apos;existe pas ou a été supprimé.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/cms/blogs">
            <ArrowLeft className="size-4 mr-2" />
            Retour au blog
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/cms/blogs">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {isNewBlog ? "Nouvel article" : "Modifier l'article"}
          </h1>
          <p className="text-muted-foreground">
            {isNewBlog
              ? "Créez un nouvel article de blog"
              : `Modification de "${blog?.title}"`}
          </p>
        </div>
      </div>

      <BlogForm blog={blog ?? undefined} />
    </div>
  );
}
