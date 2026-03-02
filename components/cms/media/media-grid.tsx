"use client";

import { useState } from "react";
import Image from "next/image";
import {
  FileText,
  MoreHorizontal,
  Trash2,
  Eye,
  Copy,
  Download,
  Check,
  Grid,
  List,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

import { IMedia } from "@/types/models.types";
import { deleteMedia, formatFileSize, isImage } from "@/lib/api/media";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export type ViewMode = "grid" | "list";

interface MediaGridProps {
  media: IMedia[];
  isLoading?: boolean;
  viewMode?: ViewMode;
  onDelete?: () => void;
  onSelect?: (media: IMedia) => void;
  selectable?: boolean;
  selectedIds?: string[];
}

export function MediaGrid({
  media,
  isLoading,
  viewMode = "grid",
  onDelete,
  onSelect,
  selectable = false,
  selectedIds = [],
}: MediaGridProps) {
  const [previewMedia, setPreviewMedia] = useState<IMedia | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [mediaToDelete, setMediaToDelete] = useState<IMedia | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleDeleteClick = (item: IMedia) => {
    setMediaToDelete(item);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!mediaToDelete) return;

    setIsDeleting(true);
    try {
      const result = await deleteMedia(mediaToDelete._id.toString());
      if (result.success) {
        toast.success("Fichier supprimé", {
          description: `Le fichier "${mediaToDelete.originalName}" a été supprimé.`,
        });
        onDelete?.();
      } else {
        toast.error("Erreur", {
          description: result.error ?? "Une erreur est survenue.",
        });
      }
    } catch {
      toast.error("Erreur", {
        description: "Une erreur est survenue lors de la suppression.",
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setMediaToDelete(null);
    }
  };

  const handleCopyUrl = async (item: IMedia) => {
    try {
      const url = `${window.location.origin}${item.url}`;
      await navigator.clipboard.writeText(url);
      setCopiedId(item._id.toString());
      toast.success("URL copiée", {
        description: "L'URL du fichier a été copiée dans le presse-papiers.",
      });
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error("Erreur", {
        description: "Impossible de copier l'URL.",
      });
    }
  };

  const handleDownload = (item: IMedia) => {
    const link = document.createElement("a");
    link.href = item.url;
    link.download = item.originalName;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleItemClick = (item: IMedia) => {
    if (selectable && onSelect) {
      onSelect(item);
    } else {
      setPreviewMedia(item);
    }
  };

  if (isLoading) {
    return viewMode === "grid" ? <GridSkeleton /> : <ListSkeleton />;
  }

  if (media.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-muted p-4 mb-4">
          <ImageIcon className="size-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium">Aucun média trouvé</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Commencez par téléverser vos premiers fichiers.
        </p>
      </div>
    );
  }

  return (
    <>
      {viewMode === "grid" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {media.map((item) => (
            <MediaGridItem
              key={item._id.toString()}
              item={item}
              isSelected={selectedIds.includes(item._id.toString())}
              selectable={selectable}
              copiedId={copiedId}
              onClick={() => handleItemClick(item)}
              onCopyUrl={() => handleCopyUrl(item)}
              onDownload={() => handleDownload(item)}
              onDelete={() => handleDeleteClick(item)}
              onPreview={() => setPreviewMedia(item)}
            />
          ))}
        </div>
      ) : (
        <MediaListView
          media={media}
          selectedIds={selectedIds}
          selectable={selectable}
          copiedId={copiedId}
          onItemClick={handleItemClick}
          onCopyUrl={handleCopyUrl}
          onDownload={handleDownload}
          onDelete={handleDeleteClick}
          onPreview={setPreviewMedia}
        />
      )}

      {/* Preview Dialog */}
      <Dialog open={!!previewMedia} onOpenChange={() => setPreviewMedia(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="truncate">
              {previewMedia?.originalName}
            </DialogTitle>
            <DialogDescription>
              {previewMedia && (
                <span className="flex items-center gap-2">
                  <Badge variant="outline">{previewMedia.type}</Badge>
                  <span>{formatFileSize(previewMedia.size)}</span>
                  <span>•</span>
                  <span>
                    {format(new Date(previewMedia.createdAt), "d MMM yyyy", {
                      locale: fr,
                    })}
                  </span>
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center min-h-[300px] max-h-[60vh] bg-muted rounded-md overflow-hidden">
            {previewMedia && isImage(previewMedia) ? (
              <Image
                src={previewMedia.url}
                alt={previewMedia.originalName}
                width={800}
                height={600}
                className="max-w-full max-h-[60vh] object-contain"
              />
            ) : previewMedia?.mimeType === "application/pdf" ? (
              <iframe
                src={previewMedia.url}
                className="w-full h-[60vh]"
                title={previewMedia.originalName}
              />
            ) : (
              <div className="flex flex-col items-center gap-2 p-8">
                <FileText className="size-16 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Aperçu non disponible
                </p>
              </div>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => previewMedia && handleCopyUrl(previewMedia)}
            >
              <Copy className="size-4 mr-2" />
              Copier l&apos;URL
            </Button>
            <Button
              variant="outline"
              onClick={() => previewMedia && handleDownload(previewMedia)}
            >
              <Download className="size-4 mr-2" />
              Télécharger
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer le fichier</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer &quot;{mediaToDelete?.originalName}
              &quot; ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? "Suppression..." : "Supprimer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ============ Grid Item Component ============

interface MediaGridItemProps {
  item: IMedia;
  isSelected: boolean;
  selectable: boolean;
  copiedId: string | null;
  onClick: () => void;
  onCopyUrl: () => void;
  onDownload: () => void;
  onDelete: () => void;
  onPreview: () => void;
}

function MediaGridItem({
  item,
  isSelected,
  selectable,
  copiedId,
  onClick,
  onCopyUrl,
  onDownload,
  onDelete,
  onPreview,
}: MediaGridItemProps) {
  return (
    <div
      className={cn(
        "group relative aspect-square rounded-lg border bg-muted/50 overflow-hidden transition-all hover:border-primary/50",
        selectable && "cursor-pointer",
        isSelected && "ring-2 ring-primary border-primary"
      )}
      onClick={onClick}
    >
      {/* Thumbnail */}
      {isImage(item) ? (
        <Image
          src={item.url}
          alt={item.originalName}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <FileText className="size-12 text-muted-foreground" />
        </div>
      )}

      {/* Selection indicator */}
      {selectable && isSelected && (
        <div className="absolute top-2 left-2 size-6 rounded-full bg-primary flex items-center justify-center">
          <Check className="size-4 text-primary-foreground" />
        </div>
      )}

      {/* Overlay with info */}
      <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 via-black/40 to-transparent p-2 pt-8 opacity-0 group-hover:opacity-100 transition-opacity">
        <p className="text-xs text-white truncate font-medium">
          {item.originalName}
        </p>
        <p className="text-xs text-white/70">{formatFileSize(item.size)}</p>
      </div>

      {/* Actions menu */}
      {!selectable && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="secondary" size="icon-sm" className="size-7">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onPreview();
                }}
              >
                <Eye className="size-4 mr-2" />
                Aperçu
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onCopyUrl();
                }}
              >
                {copiedId === item._id.toString() ? (
                  <Check className="size-4 mr-2" />
                ) : (
                  <Copy className="size-4 mr-2" />
                )}
                Copier l&apos;URL
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onDownload();
                }}
              >
                <Download className="size-4 mr-2" />
                Télécharger
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
              >
                <Trash2 className="size-4 mr-2" />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
}

// ============ List View Component ============

interface MediaListViewProps {
  media: IMedia[];
  selectedIds: string[];
  selectable: boolean;
  copiedId: string | null;
  onItemClick: (item: IMedia) => void;
  onCopyUrl: (item: IMedia) => void;
  onDownload: (item: IMedia) => void;
  onDelete: (item: IMedia) => void;
  onPreview: (item: IMedia) => void;
}

function MediaListView({
  media,
  selectedIds,
  selectable,
  copiedId,
  onItemClick,
  onCopyUrl,
  onDownload,
  onDelete,
  onPreview,
}: MediaListViewProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[60px]">Aperçu</TableHead>
          <TableHead>Nom</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Taille</TableHead>
          <TableHead>Date</TableHead>
          <TableHead className="w-[100px]">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {media.map((item) => (
          <TableRow
            key={item._id.toString()}
            className={cn(
              selectable && "cursor-pointer hover:bg-muted/50",
              selectedIds.includes(item._id.toString()) && "bg-muted"
            )}
            onClick={() => selectable && onItemClick(item)}
          >
            <TableCell>
              <div className="relative size-10 rounded-md overflow-hidden bg-muted">
                {isImage(item) ? (
                  <Image
                    src={item.url}
                    alt={item.originalName}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center size-full">
                    <FileText className="size-5 text-muted-foreground" />
                  </div>
                )}
              </div>
            </TableCell>
            <TableCell>
              <div className="flex flex-col">
                <span className="font-medium truncate max-w-[200px]">
                  {item.originalName}
                </span>
                <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                  {item.filename}
                </span>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant="outline">{item.type}</Badge>
            </TableCell>
            <TableCell className="text-muted-foreground">
              {formatFileSize(item.size)}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {format(new Date(item.createdAt), "d MMM yyyy", { locale: fr })}
            </TableCell>
            <TableCell>
              {!selectable && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon-sm">
                      <MoreHorizontal className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onPreview(item)}>
                      <Eye className="size-4 mr-2" />
                      Aperçu
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onCopyUrl(item)}>
                      {copiedId === item._id.toString() ? (
                        <Check className="size-4 mr-2" />
                      ) : (
                        <Copy className="size-4 mr-2" />
                      )}
                      Copier l&apos;URL
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDownload(item)}>
                      <Download className="size-4 mr-2" />
                      Télécharger
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => onDelete(item)}
                    >
                      <Trash2 className="size-4 mr-2" />
                      Supprimer
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

// ============ View Toggle Component ============

interface ViewToggleProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export function ViewToggle({ viewMode, onViewModeChange }: ViewToggleProps) {
  return (
    <div className="flex items-center border rounded-md">
      <Button
        variant={viewMode === "grid" ? "secondary" : "ghost"}
        size="sm"
        className="rounded-r-none"
        onClick={() => onViewModeChange("grid")}
      >
        <Grid className="size-4" />
      </Button>
      <Button
        variant={viewMode === "list" ? "secondary" : "ghost"}
        size="sm"
        className="rounded-l-none"
        onClick={() => onViewModeChange("list")}
      >
        <List className="size-4" />
      </Button>
    </div>
  );
}

// ============ Skeletons ============

function GridSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {Array.from({ length: 12 }).map((_, i) => (
        <Skeleton key={i} className="aspect-square rounded-lg" />
      ))}
    </div>
  );
}

function ListSkeleton() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[60px]">Aperçu</TableHead>
          <TableHead>Nom</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Taille</TableHead>
          <TableHead>Date</TableHead>
          <TableHead className="w-[100px]">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: 5 }).map((_, i) => (
          <TableRow key={i}>
            <TableCell>
              <Skeleton className="size-10 rounded-md" />
            </TableCell>
            <TableCell>
              <div className="flex flex-col gap-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </TableCell>
            <TableCell>
              <Skeleton className="h-5 w-16" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-16" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-20" />
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
