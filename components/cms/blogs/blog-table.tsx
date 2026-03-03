"use client";

import { useState } from "react";
import { SafeImage } from "@/components/ui/safe-image";
import Link from "next/link";
import { MoreHorizontal, Pencil, Trash2, Eye, Newspaper } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

import { IBlogPost } from "@/types/models.types";
import { deleteBlog } from "@/lib/api/blogs";
import { useIsMobile } from "@/hooks/use-mobile";
import { EmptyState, DeleteConfirmationDialog } from "@/components/cms";
import { ScrollableTableWrapper } from "@/components/cms/responsive-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";

interface BlogTableProps {
  blogs: IBlogPost[];
  isLoading?: boolean;
  onDelete?: () => void;
}

export function BlogTable({ blogs, isLoading, onDelete }: BlogTableProps) {
  const isMobile = useIsMobile();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState<IBlogPost | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (blog: IBlogPost) => {
    setBlogToDelete(blog);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!blogToDelete) return;

    setIsDeleting(true);
    try {
      const result = await deleteBlog(blogToDelete._id.toString());
      if (result.success) {
        toast.success("Article supprimé", {
          description: `L'article "${blogToDelete.title}" a été supprimé avec succès.`,
        });
        onDelete?.();
      } else {
        toast.error("Erreur", {
          description: result.error ?? "Une erreur est survenue lors de la suppression.",
        });
      }
    } catch (error) {
      toast.error("Erreur", {
        description: "Une erreur est survenue lors de la suppression.",
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setBlogToDelete(null);
    }
  };

  if (isLoading) {
    return <BlogTableSkeleton isMobile={isMobile} />;
  }

  if (blogs.length === 0) {
    return (
      <EmptyState
        icon={Newspaper}
        title="Aucun article trouvé"
        description="Commencez par créer votre premier article de blog."
        action={{
          label: "Créer un article",
          href: "/cms/blogs/new",
        }}
      />
    );
  }

  if (isMobile) {
    return (
      <>
        <div className="space-y-3">
          {blogs.map((blog) => (
            <MobileBlogCard
              key={blog._id.toString()}
              blog={blog}
              onDeleteClick={handleDeleteClick}
            />
          ))}
        </div>

        <DeleteConfirmationDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          itemName={blogToDelete?.title ?? ""}
          itemType="article"
          isLoading={isDeleting}
          onConfirm={handleDeleteConfirm}
        />
      </>
    );
  }

  return (
    <>
      <ScrollableTableWrapper>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Image</TableHead>
              <TableHead>Titre</TableHead>
              <TableHead className="hidden md:table-cell">Slug</TableHead>
              <TableHead className="text-center">Statut</TableHead>
              <TableHead className="hidden lg:table-cell">Publié le</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {blogs.map((blog) => (
              <TableRow key={blog._id.toString()}>
                <TableCell>
                  <div className="relative size-12 rounded-md overflow-hidden bg-muted">
                    {blog.coverImage ? (
                      <SafeImage
                        src={blog.coverImage}
                        alt={blog.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center size-full text-muted-foreground text-xs">
                        N/A
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{blog.title}</span>
                    {blog.excerpt && (
                      <span className="text-xs text-muted-foreground truncate max-w-[200px] block">
                        {blog.excerpt}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                  {blog.slug}
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant={blog.isPublished ? "default" : "secondary"}>
                    {blog.isPublished ? "Publié" : "Brouillon"}
                  </Badge>
                </TableCell>
                <TableCell className="hidden lg:table-cell text-center text-sm text-muted-foreground">
                  {blog.publishedAt
                    ? format(new Date(blog.publishedAt), "dd MMM yyyy", { locale: fr })
                    : "-"}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon-sm">
                        <MoreHorizontal className="size-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/cms/blogs/${blog._id.toString()}`}>
                          <Pencil className="size-4 mr-2" />
                          Modifier
                        </Link>
                      </DropdownMenuItem>
                      {blog.isPublished && (
                        <DropdownMenuItem asChild>
                          <Link href={`/blog/${blog.slug}`} target="_blank">
                            <Eye className="size-4 mr-2" />
                            Voir
                          </Link>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => handleDeleteClick(blog)}
                      >
                        <Trash2 className="size-4 mr-2" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollableTableWrapper>

      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        itemName={blogToDelete?.title ?? ""}
        itemType="article"
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}

interface MobileBlogCardProps {
  blog: IBlogPost;
  onDeleteClick: (blog: IBlogPost) => void;
}

function MobileBlogCard({ blog, onDeleteClick }: MobileBlogCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="relative size-14 rounded-md overflow-hidden bg-muted shrink-0">
            {blog.coverImage ? (
              <SafeImage
                src={blog.coverImage}
                alt={blog.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex items-center justify-center size-full text-muted-foreground text-xs">
                N/A
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="font-medium truncate">{blog.title}</div>
            <div className="text-sm text-muted-foreground truncate">{blog.slug}</div>
            <Badge
              variant={blog.isPublished ? "default" : "secondary"}
              className="mt-2 text-xs"
            >
              {blog.isPublished ? "Publié" : "Brouillon"}
            </Badge>
          </div>
        </div>

        {blog.publishedAt && (
          <div className="mt-2 text-sm text-muted-foreground">
            Publié le {format(new Date(blog.publishedAt), "dd MMM yyyy", { locale: fr })}
          </div>
        )}

        <div className="mt-3 pt-3 border-t flex justify-end gap-2">
          <Button variant="outline" size="sm" asChild className="h-9 px-3">
            <Link href={`/cms/blogs/${blog._id.toString()}`}>
              <Pencil className="size-4 mr-1.5" />
              Modifier
            </Link>
          </Button>
          {blog.isPublished && (
            <Button variant="outline" size="sm" asChild className="h-9 px-3">
              <Link href={`/blog/${blog.slug}`} target="_blank">
                <Eye className="size-4 mr-1.5" />
                Voir
              </Link>
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => onDeleteClick(blog)}
              >
                <Trash2 className="size-4 mr-2" />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}

function BlogTableSkeleton({ isMobile }: { isMobile?: boolean }) {
  if (isMobile) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Skeleton className="size-14 rounded-md shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-5 w-14" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[80px]">Image</TableHead>
          <TableHead>Titre</TableHead>
          <TableHead className="hidden md:table-cell">Slug</TableHead>
          <TableHead className="text-center">Statut</TableHead>
          <TableHead className="hidden lg:table-cell">Publié le</TableHead>
          <TableHead className="w-[100px]">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: 5 }).map((_, i) => (
          <TableRow key={i}>
            <TableCell>
              <Skeleton className="size-12 rounded-md" />
            </TableCell>
            <TableCell>
              <div className="flex flex-col gap-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </TableCell>
            <TableCell className="hidden md:table-cell">
              <Skeleton className="h-4 w-24" />
            </TableCell>
            <TableCell className="text-center">
              <Skeleton className="h-5 w-16 mx-auto" />
            </TableCell>
            <TableCell className="hidden lg:table-cell text-center">
              <Skeleton className="h-4 w-20 mx-auto" />
            </TableCell>
            <TableCell>
              <Skeleton className="size-8" />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
