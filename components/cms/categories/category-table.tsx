"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
  GripVertical,
  FolderTree,
} from "lucide-react";
import { toast } from "sonner";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  TouchSensor,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { ICategory } from "@/types/models.types";
import { deleteCategory, getCategoryProductCount, reorderCategories } from "@/lib/api/categories";
import { useIsMobile } from "@/hooks/use-mobile";
import { EmptyState, DeleteConfirmationDialog } from "@/components/cms";
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
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";

interface CategoryTableProps {
  categories: ICategory[];
  isLoading?: boolean;
  onDelete?: () => void;
  onReorder?: (categories: ICategory[]) => void;
}

interface SortableRowProps {
  category: ICategory;
  index: number;
  onDeleteClick: (category: ICategory) => void;
}

function SortableRow({ category, index, onDeleteClick }: SortableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category._id.toString() });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1 : 0,
    animationDelay: `${index * 60}ms`,
  };

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      className="animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-both"
    >
      <TableCell>
        <button
          className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-4 text-muted-foreground" />
        </button>
      </TableCell>
      <TableCell>
        <div className="relative size-12 rounded-md overflow-hidden bg-muted">
          {category.image ? (
            <Image
              src={category.image}
              alt={category.name}
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
          <span className="font-medium">{category.name}</span>
          <span className="text-xs text-muted-foreground">{category.slug}</span>
        </div>
      </TableCell>
      <TableCell className="max-w-[200px] hidden md:table-cell">
        <span className="text-sm text-muted-foreground truncate block">
          {category.description || "-"}
        </span>
      </TableCell>
      <TableCell className="text-center">
        <Badge variant="outline">{category.order}</Badge>
      </TableCell>
      <TableCell className="text-center">
        <Badge variant={category.isActive ? "default" : "secondary"}>
          {category.isActive ? "Actif" : "Inactif"}
        </Badge>
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
              <Link href={`/cms/categories/${category._id.toString()}`}>
                <Pencil className="size-4 mr-2" />
                Modifier
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/catalogue/${category.slug}`} target="_blank">
                <Eye className="size-4 mr-2" />
                Voir
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => onDeleteClick(category)}
            >
              <Trash2 className="size-4 mr-2" />
              Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}

export function CategoryTable({
  categories: initialCategories,
  isLoading,
  onDelete,
  onReorder,
}: CategoryTableProps) {
  const isMobile = useIsMobile();
  const [categories, setCategories] = useState(initialCategories);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<ICategory | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [productCount, setProductCount] = useState<number>(0);
  const [isLoadingCount, setIsLoadingCount] = useState(false);

  // Sync local state when props change (e.g. after fetch or search filter)
  useEffect(() => {
    setCategories(initialCategories);
  }, [initialCategories]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;

      if (over && active.id !== over.id) {
        const oldIndex = categories.findIndex(
          (cat) => cat._id.toString() === active.id
        );
        const newIndex = categories.findIndex(
          (cat) => cat._id.toString() === over.id
        );

        const newCategories = arrayMove(categories, oldIndex, newIndex);
        
        // Update local state immediately for responsiveness
        setCategories(newCategories);

        // Prepare reorder data with new order values
        const reorderData = newCategories.map((cat, index) => ({
          id: cat._id.toString(),
          order: index,
        }));

        try {
          const result = await reorderCategories({ categories: reorderData });
          if (result.success && result.data) {
            toast.success("Ordre mis à jour", {
              description: "L'ordre des catégories a été mis à jour.",
            });
            onReorder?.(result.data);
          } else if (result.success) {
            onReorder?.(newCategories);
          } else {
            // Revert on error
            setCategories(initialCategories);
            toast.error("Erreur", {
              description: result.error ?? "Une erreur est survenue.",
            });
          }
        } catch (error) {
          // Revert on error
          setCategories(initialCategories);
          toast.error("Erreur", {
            description: "Une erreur est survenue lors de la mise à jour.",
          });
        }
      }
    },
    [categories, initialCategories, onReorder]
  );

  const handleDeleteClick = async (category: ICategory) => {
    setCategoryToDelete(category);
    setIsLoadingCount(true);
    setDeleteDialogOpen(true);

    // Check if category has products
    try {
      const result = await getCategoryProductCount(category._id.toString());
      if (result.success && result.data) {
        setProductCount(result.data.count);
      } else {
        setProductCount(0);
      }
    } catch (error) {
      setProductCount(0);
    } finally {
      setIsLoadingCount(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return;

    setIsDeleting(true);
    try {
      const result = await deleteCategory(categoryToDelete._id.toString());
      if (result.success) {
        toast.success("Catégorie supprimée", {
          description: `La catégorie "${categoryToDelete.name}" a été supprimée avec succès.`,
        });
        // Remove from local state
        setCategories(categories.filter((c) => c._id !== categoryToDelete._id));
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
      setCategoryToDelete(null);
      setProductCount(0);
    }
  };

  if (isLoading) {
    return <CategoryTableSkeleton isMobile={isMobile} />;
  }

  if (categories.length === 0) {
    return (
      <EmptyState
        icon={FolderTree}
        title="Aucune catégorie trouvée"
        description="Commencez par créer votre première catégorie."
        action={{
          label: "Créer une catégorie",
          href: "/cms/categories/new",
        }}
      />
    );
  }

  // Mobile card view
  if (isMobile) {
    return (
      <>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={categories.map((c) => c._id.toString())}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {categories.map((category, index) => (
                <MobileCategoryCard
                  key={category._id.toString()}
                  category={category}
                  index={index}
                  onDeleteClick={handleDeleteClick}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        <DeleteConfirmationDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          itemName={categoryToDelete?.name ?? ""}
          itemType="catégorie"
          isLoading={isDeleting || isLoadingCount}
          onConfirm={handleDeleteConfirm}
          warning={
            isLoadingCount ? (
              <span className="flex items-center gap-2">
                <Skeleton className="h-4 w-4" />
                Vérification des produits...
              </span>
            ) : productCount > 0 ? (
              <>
                <strong>Attention :</strong> Cette catégorie contient{" "}
                <strong>{productCount}</strong> produit{productCount > 1 ? "s" : ""}.
                La suppression de cette catégorie pourrait affecter ces produits.
              </>
            ) : undefined
          }
        />
      </>
    );
  }

  // Desktop table view
  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <ScrollableTableWrapper>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]"></TableHead>
                <TableHead className="w-[80px]">Image</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead className="hidden md:table-cell">Description</TableHead>
                <TableHead className="text-center w-[80px]">Ordre</TableHead>
                <TableHead className="text-center">Statut</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <SortableContext
                items={categories.map((c) => c._id.toString())}
                strategy={verticalListSortingStrategy}
              >
                {categories.map((category, index) => (
                  <SortableRow
                    key={category._id.toString()}
                    category={category}
                    index={index}
                    onDeleteClick={handleDeleteClick}
                  />
                ))}
              </SortableContext>
            </TableBody>
          </Table>
        </ScrollableTableWrapper>
      </DndContext>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        itemName={categoryToDelete?.name ?? ""}
        itemType="catégorie"
        isLoading={isDeleting || isLoadingCount}
        onConfirm={handleDeleteConfirm}
        warning={
          isLoadingCount ? (
            <span className="flex items-center gap-2">
              <Skeleton className="h-4 w-4" />
              Vérification des produits...
            </span>
          ) : productCount > 0 ? (
            <>
              <strong>Attention :</strong> Cette catégorie contient{" "}
              <strong>{productCount}</strong> produit{productCount > 1 ? "s" : ""}.
              La suppression de cette catégorie pourrait affecter ces produits.
            </>
          ) : undefined
        }
      />
    </>
  );
}

interface MobileCategoryCardProps {
  category: ICategory;
  index: number;
  onDeleteClick: (category: ICategory) => void;
}

function MobileCategoryCard({ category, index, onDeleteClick }: MobileCategoryCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category._id.toString() });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1 : 0,
    animationDelay: `${index * 60}ms`,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className="overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-both"
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Drag handle */}
          <button
            className="cursor-grab active:cursor-grabbing p-2 -ml-2 hover:bg-muted rounded touch-manipulation"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="size-5 text-muted-foreground" />
          </button>

          {/* Image */}
          <div className="relative size-14 rounded-md overflow-hidden bg-muted shrink-0">
            {category.image ? (
              <Image
                src={category.image}
                alt={category.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex items-center justify-center size-full text-muted-foreground text-xs">
                N/A
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="font-medium truncate">{category.name}</div>
            <div className="text-sm text-muted-foreground truncate">{category.slug}</div>
          </div>

          {/* Status */}
          <Badge variant={category.isActive ? "default" : "secondary"} className="text-xs shrink-0">
            {category.isActive ? "Actif" : "Inactif"}
          </Badge>
        </div>

        {/* Description and Order */}
        <div className="mt-3 pt-3 border-t space-y-2 text-sm">
          {category.description && (
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Description</span>
              <span className="text-right truncate max-w-[60%]">{category.description}</span>
            </div>
          )}
          <div className="flex justify-between items-center gap-4">
            <span className="text-muted-foreground">Ordre</span>
            <Badge variant="outline">{category.order}</Badge>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-3 pt-3 border-t flex justify-end gap-2">
          <Button variant="outline" size="sm" asChild className="h-9 px-3">
            <Link href={`/cms/categories/${category._id.toString()}`}>
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
                <Link href={`/catalogue/${category.slug}`} target="_blank">
                  <Eye className="size-4 mr-2" />
                  Voir
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => onDeleteClick(category)}
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

function CategoryTableSkeleton({ isMobile }: { isMobile?: boolean }) {
  if (isMobile) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Skeleton className="size-8" />
                <Skeleton className="size-14 rounded-md shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-5 w-14" />
              </div>
              <div className="mt-3 pt-3 border-t space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-5 w-8" />
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
          <TableHead className="w-[50px]"></TableHead>
          <TableHead className="w-[80px]">Image</TableHead>
          <TableHead>Nom</TableHead>
          <TableHead className="hidden md:table-cell">Description</TableHead>
          <TableHead className="text-center w-[80px]">Ordre</TableHead>
          <TableHead className="text-center">Statut</TableHead>
          <TableHead className="w-[100px]">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: 5 }).map((_, i) => (
          <TableRow key={i}>
            <TableCell>
              <Skeleton className="size-6" />
            </TableCell>
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
              <Skeleton className="h-4 w-40" />
            </TableCell>
            <TableCell className="text-center">
              <Skeleton className="h-5 w-8 mx-auto" />
            </TableCell>
            <TableCell className="text-center">
              <Skeleton className="h-5 w-16 mx-auto" />
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
