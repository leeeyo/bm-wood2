"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowUpRight, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { IBlogPost } from "@/types/models.types";
import { PaginatedResponse } from "@/types/api.types";

export default function BlogPage() {
  const [blogs, setBlogs] = useState<IBlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
    hasNext: false,
  });

  const fetchBlogs = useCallback(async (page: number = 1) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        isPublished: "true",
        page: page.toString(),
        limit: "12",
        sortBy: "publishedAt",
        sortOrder: "desc",
      });
      const res = await fetch(`/api/blogs?${params}`);
      const data: PaginatedResponse<IBlogPost> = await res.json();

      if (data.success && data.data) {
        setBlogs(data.data);
        setPagination({
          page: data.pagination!.page,
          totalPages: data.pagination!.totalPages,
          total: data.pagination!.total,
          hasNext: data.pagination!.hasNext,
        });
      }
    } catch (err) {
      console.error("Error fetching blogs:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBlogs(1);
  }, [fetchBlogs]);

  return (
    <main className="min-h-screen">
      <Header />

      <section className="pt-32 pb-16 md:pt-40 md:pb-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-6 md:px-12">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-primary-foreground/60 text-sm tracking-[0.3em] uppercase mb-6">
              Notre blog
            </p>
            <h1
              className="text-3xl md:text-4xl lg:text-5xl font-medium leading-[1.1] tracking-tight mb-6"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Actualités & Inspirations
            </h1>
            <p className="text-primary-foreground/70 text-lg leading-relaxed max-w-2xl mx-auto">
              Découvrez nos derniers articles sur la menuiserie, l&apos;agencement
              et nos réalisations.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container mx-auto px-6 md:px-12">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Chargement des articles...</p>
            </div>
          ) : blogs.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground">
                Aucun article disponible pour le moment.
              </p>
              <Link
                href="/"
                className="inline-block mt-4 text-sm text-primary hover:underline"
              >
                Retour à l&apos;accueil
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {blogs.map((blog) => (
                <Link
                  key={blog._id.toString()}
                  href={`/blog/${blog.slug}`}
                  className="group"
                >
                  <article className="cursor-pointer h-full flex flex-col">
                    <div className="relative overflow-hidden aspect-4/3 mb-4 bg-muted rounded-lg">
                      {blog.coverImage ? (
                        <Image
                          src={blog.coverImage}
                          alt={blog.title}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-secondary">
                          <span className="text-4xl font-medium text-muted-foreground/30">
                            {blog.title.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                    </div>

                    <div className="flex-1 flex flex-col">
                      {blog.publishedAt && (
                        <time
                          className="text-sm text-muted-foreground mb-2"
                          dateTime={new Date(blog.publishedAt).toISOString()}
                        >
                          {format(new Date(blog.publishedAt), "dd MMMM yyyy", {
                            locale: fr,
                          })}
                        </time>
                      )}
                      <h3 className="text-xl font-medium mb-2 group-hover:underline underline-offset-4">
                        {blog.title}
                      </h3>
                      {blog.excerpt && (
                        <p className="text-muted-foreground text-sm line-clamp-2 flex-1">
                          {blog.excerpt}
                        </p>
                      )}
                      <span className="inline-flex items-center gap-2 mt-4 text-sm text-primary font-medium">
                        Lire la suite
                        <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </span>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          )}

          {!isLoading && pagination.totalPages > 1 && (
            <div className="mt-12 flex justify-center gap-2">
              {pagination.page > 1 && (
                <button
                  onClick={() => fetchBlogs(pagination.page - 1)}
                  className="px-4 py-2 text-sm border rounded-md hover:bg-muted"
                >
                  Précédent
                </button>
              )}
              <span className="px-4 py-2 text-sm text-muted-foreground">
                Page {pagination.page} / {pagination.totalPages}
              </span>
              {pagination.hasNext && (
                <button
                  onClick={() => fetchBlogs(pagination.page + 1)}
                  className="px-4 py-2 text-sm border rounded-md hover:bg-muted"
                >
                  Suivant
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      <section className="py-12 pb-20 md:pb-12 bg-muted/30 border-t">
        <div className="container mx-auto px-6 md:px-12">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-muted-foreground mb-4">
              Vous avez un projet en tête ?
            </p>
            <Link
              href="/demander-un-devis"
              className="inline-flex items-center gap-2 text-sm px-6 py-3 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Demander un devis gratuit
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
