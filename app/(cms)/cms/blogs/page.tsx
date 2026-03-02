"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Plus, Search, X } from "lucide-react";

import { IBlogPost } from "@/types/models.types";
import { getBlogs } from "@/lib/api/blogs";
import { BlogTable } from "@/components/cms/blogs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<IBlogPost[]>([]);
  const [filteredBlogs, setFilteredBlogs] = useState<IBlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchBlogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getBlogs({ limit: 100 });
      if (result.success && result.data) {
        setBlogs(result.data);
        setFilteredBlogs(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch blogs:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredBlogs(blogs);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const filtered = blogs.filter(
      (blog) =>
        blog.title.toLowerCase().includes(query) ||
        blog.slug.toLowerCase().includes(query) ||
        (blog.excerpt?.toLowerCase() ?? "").includes(query)
    );
    setFilteredBlogs(filtered);
  }, [searchQuery, blogs]);

  const clearSearch = () => {
    setSearchQuery("");
  };

  return (
    <div className="flex flex-col gap-4 sm:gap-6 p-4 sm:p-6">
      <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Blog</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Gérez les articles de votre blog
          </p>
        </div>
        <Button asChild className="w-full sm:w-auto h-11 sm:h-10">
          <Link href="/cms/blogs/new">
            <Plus className="size-4 mr-2" />
            Nouvel article
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-2 flex-1 max-w-md">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un article..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
                  className="pl-9"
                />
              </div>
              {searchQuery && (
                <Button variant="ghost" size="icon" onClick={clearSearch}>
                  <X className="size-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="text-sm text-muted-foreground mb-4">
            {filteredBlogs.length} article{filteredBlogs.length !== 1 ? "s" : ""} trouvé
            {filteredBlogs.length !== 1 ? "s" : ""}
            {searchQuery && ` pour "${searchQuery}"`}
          </div>

          <BlogTable
            blogs={filteredBlogs}
            isLoading={isLoading}
            onDelete={fetchBlogs}
          />
        </CardContent>
      </Card>
    </div>
  );
}
