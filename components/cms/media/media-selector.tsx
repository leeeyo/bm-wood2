"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ImagePlus, X, Upload, FileText, Check } from "lucide-react";

import { IMedia, MediaType } from "@/types/models.types";
import { getMediaList, formatFileSize } from "@/lib/api/media";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { UploadDialog } from "./upload-dialog";

interface MediaSelectorProps {
  value?: string | string[];
  onChange: (value: string | string[] | undefined) => void;
  multiple?: boolean;
  type?: MediaType;
  maxItems?: number;
  placeholder?: string;
  className?: string;
}

/**
 * Reusable media selector component for forms
 * Can be used for single or multiple media selection
 */
export function MediaSelector({
  value,
  onChange,
  multiple = false,
  type,
  maxItems = 10,
  placeholder = "Sélectionner un média",
  className,
}: MediaSelectorProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  // Convert value to array for consistent handling
  const selectedUrls = Array.isArray(value)
    ? value
    : value
      ? [value]
      : [];

  const handleSelect = (selectedItems: string[]) => {
    if (multiple) {
      onChange(selectedItems.length > 0 ? selectedItems : undefined);
    } else {
      onChange(selectedItems[0]);
    }
    setDialogOpen(false);
  };

  const handleRemove = (url: string) => {
    if (multiple) {
      const newValue = selectedUrls.filter((u) => u !== url);
      onChange(newValue.length > 0 ? newValue : undefined);
    } else {
      onChange(undefined);
    }
  };

  const handleUploadComplete = (uploaded: IMedia[]) => {
    const newUrls = uploaded.map((m) => m.url);
    if (multiple) {
      const combined = [...selectedUrls, ...newUrls].slice(0, maxItems);
      onChange(combined.length > 0 ? combined : undefined);
    } else {
      onChange(newUrls[0]);
    }
    setUploadDialogOpen(false);
    setDialogOpen(false);
  };

  const canAddMore = !multiple || selectedUrls.length < maxItems;

  return (
    <div className={cn("space-y-3", className)}>
      {/* Selected items preview */}
      {selectedUrls.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedUrls.map((url, index) => (
            <SelectedMediaItem
              key={`${url}-${index}`}
              url={url}
              onRemove={() => handleRemove(url)}
            />
          ))}
        </div>
      )}

      {/* Add button */}
      {canAddMore && (
        <Button
          type="button"
          variant="outline"
          className="w-full h-auto py-4"
          onClick={() => setDialogOpen(true)}
        >
          <ImagePlus className="size-5 mr-2" />
          {selectedUrls.length > 0
            ? multiple
              ? "Ajouter plus de médias"
              : "Changer le média"
            : placeholder}
        </Button>
      )}

      {/* Selection dialog */}
      <MediaSelectorDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        type={type}
        multiple={multiple}
        maxItems={maxItems}
        selectedUrls={selectedUrls}
        onSelect={handleSelect}
        onUploadClick={() => setUploadDialogOpen(true)}
      />

      {/* Upload dialog */}
      <UploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        onUploadComplete={handleUploadComplete}
      />
    </div>
  );
}

// ============ Selected Media Item ============

interface SelectedMediaItemProps {
  url: string;
  onRemove: () => void;
}

function SelectedMediaItem({ url, onRemove }: SelectedMediaItemProps) {
  const isImage = /\.(jpg|jpeg|png|webp|gif)$/i.test(url);

  return (
    <div className="relative group size-20 rounded-md border overflow-hidden bg-muted">
      {isImage ? (
        <Image src={url} alt="" fill className="object-cover" />
      ) : (
        <div className="flex items-center justify-center size-full">
          <FileText className="size-8 text-muted-foreground" />
        </div>
      )}

      <button
        type="button"
        onClick={onRemove}
        className="absolute top-1 right-1 size-5 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
      >
        <X className="size-3" />
      </button>
    </div>
  );
}

// ============ Media Selector Dialog ============

interface MediaSelectorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type?: MediaType;
  multiple: boolean;
  maxItems: number;
  selectedUrls: string[];
  onSelect: (urls: string[]) => void;
  onUploadClick: () => void;
}

function MediaSelectorDialog({
  open,
  onOpenChange,
  type: filterType,
  multiple,
  maxItems,
  selectedUrls,
  onSelect,
  onUploadClick,
}: MediaSelectorDialogProps) {
  const [media, setMedia] = useState<IMedia[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [type, setType] = useState<MediaType | "all">(filterType ?? "all");
  const [localSelected, setLocalSelected] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  // Initialize local selection with current selection
  useEffect(() => {
    if (open) {
      setLocalSelected([...selectedUrls]);
      setPage(1);
    }
  }, [open, selectedUrls]);

  // Fetch media
  const fetchMedia = useCallback(async (pageNum: number, append: boolean = false) => {
    if (!open) return;
    
    setIsLoading(true);
    try {
      const result = await getMediaList({
        page: pageNum,
        limit: 20,
        type: type === "all" ? undefined : type,
        search: search || undefined,
      });

      if (result.success) {
        const newMedia = result.data ?? [];
        setMedia((prev) => append ? [...prev, ...newMedia] : newMedia);
        setHasMore(result.pagination.hasNext);
      }
    } catch (error) {
      console.error("Failed to fetch media:", error);
    } finally {
      setIsLoading(false);
    }
  }, [open, type, search]);

  // Fetch on filter change
  useEffect(() => {
    if (open) {
      setPage(1);
      fetchMedia(1, false);
    }
  }, [open, type, search, fetchMedia]);

  const handleToggleSelect = (item: IMedia) => {
    const url = item.url;
    
    if (multiple) {
      if (localSelected.includes(url)) {
        setLocalSelected((prev) => prev.filter((u) => u !== url));
      } else if (localSelected.length < maxItems) {
        setLocalSelected((prev) => [...prev, url]);
      }
    } else {
      setLocalSelected([url]);
    }
  };

  const handleConfirm = () => {
    onSelect(localSelected);
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchMedia(nextPage, true);
  };

  const isImage = (item: IMedia) => item.type === "image";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Sélectionner des médias</DialogTitle>
          <DialogDescription>
            Choisissez parmi vos fichiers ou téléversez de nouveaux médias.
          </DialogDescription>
        </DialogHeader>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              placeholder="Rechercher par nom..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          {!filterType && (
            <Select
              value={type}
              onValueChange={(v) => setType(v as MediaType | "all")}
            >
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="image">Images</SelectItem>
                <SelectItem value="document">Documents</SelectItem>
              </SelectContent>
            </Select>
          )}

          <Button variant="outline" onClick={onUploadClick}>
            <Upload className="size-4 mr-2" />
            Téléverser
          </Button>
        </div>

        {/* Media grid */}
        <div className="flex-1 overflow-y-auto min-h-[300px]">
          {isLoading && media.length === 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 p-1">
              {Array.from({ length: 10 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-md" />
              ))}
            </div>
          ) : media.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-8">
              <FileText className="size-12 text-muted-foreground mb-2" />
              <p className="text-muted-foreground">Aucun média trouvé</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 p-1">
                {media.map((item) => {
                  const isSelected = localSelected.includes(item.url);
                  
                  return (
                    <button
                      key={item._id.toString()}
                      type="button"
                      onClick={() => handleToggleSelect(item)}
                      className={cn(
                        "relative aspect-square rounded-md border-2 overflow-hidden bg-muted transition-all hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary",
                        isSelected
                          ? "border-primary ring-2 ring-primary"
                          : "border-transparent"
                      )}
                    >
                      {isImage(item) ? (
                        <Image
                          src={item.url}
                          alt={item.originalName}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 33vw, 20vw"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center size-full p-2">
                          <FileText className="size-8 text-muted-foreground" />
                          <span className="text-[10px] text-muted-foreground mt-1 truncate max-w-full">
                            {item.originalName}
                          </span>
                        </div>
                      )}

                      {isSelected && (
                        <div className="absolute top-1 right-1 size-5 rounded-full bg-primary flex items-center justify-center">
                          <Check className="size-3 text-primary-foreground" />
                        </div>
                      )}

                      <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/70 to-transparent p-1.5 pt-4">
                        <p className="text-[10px] text-white truncate">
                          {formatFileSize(item.size)}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Load more button */}
              {hasMore && (
                <div className="flex justify-center py-4">
                  <Button
                    variant="outline"
                    onClick={handleLoadMore}
                    disabled={isLoading}
                  >
                    {isLoading ? "Chargement..." : "Charger plus"}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="border-t pt-4">
          <div className="flex items-center justify-between w-full">
            <p className="text-sm text-muted-foreground">
              {localSelected.length} sélectionné
              {localSelected.length > 1 ? "s" : ""}
              {multiple && ` / ${maxItems} max`}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Annuler
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={localSelected.length === 0}
              >
                Confirmer
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============ Simple Image Input ============

interface ImageInputProps {
  value?: string;
  onChange: (value: string | undefined) => void;
  className?: string;
}

/**
 * Simplified single image selector for forms
 */
export function ImageInput({ value, onChange, className }: ImageInputProps) {
  return (
    <MediaSelector
      value={value}
      onChange={(v) => onChange(v as string | undefined)}
      multiple={false}
      type={MediaType.IMAGE}
      placeholder="Sélectionner une image"
      className={className}
    />
  );
}

// ============ Image Gallery Input ============

interface ImageGalleryInputProps {
  value?: string[];
  onChange: (value: string[] | undefined) => void;
  maxItems?: number;
  className?: string;
}

/**
 * Multi-image selector for product galleries
 */
export function ImageGalleryInput({
  value,
  onChange,
  maxItems = 10,
  className,
}: ImageGalleryInputProps) {
  return (
    <MediaSelector
      value={value}
      onChange={(v) => onChange(v as string[] | undefined)}
      multiple={true}
      type={MediaType.IMAGE}
      maxItems={maxItems}
      placeholder="Ajouter des images"
      className={className}
    />
  );
}
