"use client";

import { SafeImage } from "@/components/ui/safe-image";
import Link from "next/link";
import { MoreHorizontal, Pencil, Trash2, Eye, Star, Package } from "lucide-react";
import { toast } from "sonner";

import { IProduct, ICategory } from "@/types/models.types";
import { deleteProduct } from "@/lib/api/products";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  EmptyState,
  DeleteConfirmationDialog,
  useConfirmationDialog,
} from "@/components/cms";
import { MobileDataCard, ScrollableTableWrapper } from "@/components/cms/responsive-table";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

interface ProductTableProps {
  products: IProduct[];
  isLoading?: boolean;
  onDelete?: () => void;
}

// Helper to get category from populated product
function getCategoryName(product: IProduct): string {
  const category = product.categoryId as unknown as ICategory | undefined;
  return category?.name ?? "Non catégorisé";
}

export function ProductTable({ products, isLoading, onDelete }: ProductTableProps) {
  const isMobile = useIsMobile();
  const {
    isOpen: deleteDialogOpen,
    isLoading: isDeleting,
    itemToConfirm: productToDelete,
    openDialog: handleDeleteClick,
    setIsOpen: setDeleteDialogOpen,
    confirm: confirmDelete,
  } = useConfirmationDialog<IProduct>();

  const handleDeleteConfirm = async () => {
    await confirmDelete(async (product) => {
      const result = await deleteProduct(product._id.toString());
      if (result.success) {
        toast.success("Produit supprimé", {
          description: `Le produit "${product.name}" a été supprimé avec succès.`,
        });
        onDelete?.();
      } else {
        toast.error("Erreur", {
          description: result.error ?? "Une erreur est survenue lors de la suppression.",
        });
        throw new Error(result.error);
      }
    });
  };

  if (isLoading) {
    return <ProductTableSkeleton isMobile={isMobile} />;
  }

  if (products.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title="Aucun produit trouvé"
        description="Commencez par créer votre premier produit."
        action={{
          label: "Créer un produit",
          href: "/cms/products/new",
        }}
      />
    );
  }

  // Mobile card view
  if (isMobile) {
    return (
      <>
        <div className="space-y-3">
          {products.map((product) => (
            <MobileDataCard
              key={product._id.toString()}
              title={product.name}
              subtitle={product.slug}
              image={
                <div className="relative size-14 rounded-md overflow-hidden bg-muted">
                  {product.images && product.images.length > 0 ? (
                    <SafeImage
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center size-full text-muted-foreground text-xs">
                      N/A
                    </div>
                  )}
                </div>
              }
              status={
                <div className="flex items-center gap-1">
                  {product.isFeatured && (
                    <Star className="size-4 text-yellow-500 fill-yellow-500" />
                  )}
                  <Badge variant={product.isActive ? "default" : "secondary"} className="text-xs">
                    {product.isActive ? "Actif" : "Inactif"}
                  </Badge>
                </div>
              }
              data={[
                {
                  label: "Catégorie",
                  value: <Badge variant="outline" className="text-xs">{getCategoryName(product)}</Badge>,
                },
              ]}
              actions={
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild className="h-9 px-3">
                    <Link href={`/cms/products/${product._id.toString()}`}>
                      <Pencil className="size-4 mr-1.5" />
                      Modifier
                    </Link>
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/products/${product.slug}`} target="_blank">
                          <Eye className="size-4 mr-2" />
                          Voir
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => handleDeleteClick(product)}
                      >
                        <Trash2 className="size-4 mr-2" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              }
            />
          ))}
        </div>

        <DeleteConfirmationDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          itemName={productToDelete?.name ?? ""}
          itemType="produit"
          isLoading={isDeleting}
          onConfirm={handleDeleteConfirm}
        />
      </>
    );
  }

  // Desktop table view
  return (
    <>
      <ScrollableTableWrapper>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Image</TableHead>
              <TableHead>Nom</TableHead>
              <TableHead className="hidden sm:table-cell">Catégorie</TableHead>
              <TableHead className="text-center">Statut</TableHead>
              <TableHead className="text-center hidden sm:table-cell">Mis en avant</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product._id.toString()}>
                <TableCell>
                  <div className="relative size-12 rounded-md overflow-hidden bg-muted">
                    {product.images && product.images.length > 0 ? (
                      <SafeImage
                        src={product.images[0]}
                        alt={product.name}
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
                    <span className="font-medium">{product.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {product.slug}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <Badge variant="outline">{getCategoryName(product)}</Badge>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant={product.isActive ? "default" : "secondary"}>
                    {product.isActive ? "Actif" : "Inactif"}
                  </Badge>
                </TableCell>
                <TableCell className="text-center hidden sm:table-cell">
                  {product.isFeatured && (
                    <Star className="size-4 text-yellow-500 fill-yellow-500 mx-auto" />
                  )}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon-sm" className="h-9 w-9">
                        <MoreHorizontal className="size-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/cms/products/${product._id.toString()}`}>
                          <Pencil className="size-4 mr-2" />
                          Modifier
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/products/${product.slug}`} target="_blank">
                          <Eye className="size-4 mr-2" />
                          Voir
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => handleDeleteClick(product)}
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

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        itemName={productToDelete?.name ?? ""}
        itemType="produit"
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}

function ProductTableSkeleton({ isMobile }: { isMobile?: boolean }) {
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
              <div className="mt-3 pt-3 border-t">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-5 w-24" />
                </div>
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
          <TableHead>Nom</TableHead>
          <TableHead className="hidden sm:table-cell">Catégorie</TableHead>
          <TableHead className="text-center">Statut</TableHead>
          <TableHead className="text-center hidden sm:table-cell">Mis en avant</TableHead>
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
            <TableCell className="hidden sm:table-cell">
              <Skeleton className="h-5 w-20" />
            </TableCell>
            <TableCell className="text-center">
              <Skeleton className="h-5 w-16 mx-auto" />
            </TableCell>
            <TableCell className="text-center hidden sm:table-cell">
              <Skeleton className="size-4 mx-auto" />
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
