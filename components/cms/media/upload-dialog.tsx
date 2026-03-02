"use client";

import { useState, useRef, useCallback } from "react";
import {
  Upload,
  X,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

import {
  uploadMedia,
  formatFileSize,
  isAllowedFileType,
  getAcceptedFileTypes,
} from "@/lib/api/media";
import { IMedia } from "@/types/models.types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface UploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadComplete?: (media: IMedia[]) => void;
}

interface FileUploadState {
  file: File;
  progress: number;
  status: "pending" | "uploading" | "success" | "error";
  result?: IMedia;
  error?: string;
}

export function UploadDialog({
  open,
  onOpenChange,
  onUploadComplete,
}: UploadDialogProps) {
  const [uploads, setUploads] = useState<FileUploadState[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (!isAllowedFileType(file.type)) {
      return `Type de fichier non supporté: ${file.type}. Types acceptés: JPG, PNG, WebP, GIF, PDF`;
    }

    const maxSize = file.type.startsWith("image/")
      ? 10 * 1024 * 1024
      : 25 * 1024 * 1024; // 10MB for images, 25MB for documents

    if (file.size > maxSize) {
      const maxSizeMB = maxSize / (1024 * 1024);
      return `Le fichier est trop volumineux. Taille maximale: ${maxSizeMB}MB`;
    }

    return null;
  };

  const addFiles = useCallback((files: FileList | File[]) => {
    const newUploads: FileUploadState[] = [];

    for (const file of Array.from(files)) {
      const error = validateFile(file);
      if (error) {
        toast.error(`${file.name}`, { description: error });
        continue;
      }

      // Check if file is already added
      const exists = uploads.some((u) => u.file.name === file.name && u.file.size === file.size);
      if (exists) {
        toast.warning(`${file.name}`, {
          description: "Ce fichier est déjà dans la file d'attente.",
        });
        continue;
      }

      newUploads.push({
        file,
        progress: 0,
        status: "pending",
      });
    }

    if (newUploads.length > 0) {
      setUploads((prev) => [...prev, ...newUploads]);
    }
  }, [uploads]);

  const removeFile = (index: number) => {
    setUploads((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files) {
      addFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(e.target.files);
    }
    // Reset input value to allow selecting the same file again
    e.target.value = "";
  };

  const startUpload = async () => {
    const pendingUploads = uploads.filter((u) => u.status === "pending");
    if (pendingUploads.length === 0) return;

    setIsUploading(true);
    const successfulUploads: IMedia[] = [];

    for (let i = 0; i < uploads.length; i++) {
      if (uploads[i].status !== "pending") continue;

      // Update status to uploading
      setUploads((prev) =>
        prev.map((u, idx) =>
          idx === i ? { ...u, status: "uploading" as const } : u
        )
      );

      const result = await uploadMedia(uploads[i].file, (progress) => {
        setUploads((prev) =>
          prev.map((u, idx) => (idx === i ? { ...u, progress } : u))
        );
      });

      if (result.success && result.data) {
        setUploads((prev) =>
          prev.map((u, idx) =>
            idx === i
              ? { ...u, status: "success" as const, progress: 100, result: result.data }
              : u
          )
        );
        successfulUploads.push(result.data);
      } else {
        setUploads((prev) =>
          prev.map((u, idx) =>
            idx === i
              ? { ...u, status: "error" as const, error: result.error }
              : u
          )
        );
      }
    }

    setIsUploading(false);

    if (successfulUploads.length > 0) {
      toast.success(
        `${successfulUploads.length} fichier${
          successfulUploads.length > 1 ? "s" : ""
        } téléversé${successfulUploads.length > 1 ? "s" : ""}`
      );
      onUploadComplete?.(successfulUploads);
    }
  };

  const handleClose = () => {
    if (isUploading) {
      toast.warning("Téléversement en cours", {
        description: "Veuillez attendre la fin du téléversement.",
      });
      return;
    }
    setUploads([]);
    onOpenChange(false);
  };

  const pendingCount = uploads.filter((u) => u.status === "pending").length;
  const successCount = uploads.filter((u) => u.status === "success").length;
  const hasUploads = uploads.length > 0;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Téléverser des fichiers</DialogTitle>
          <DialogDescription>
            Glissez-déposez vos fichiers ou cliquez pour sélectionner. Types
            acceptés: JPG, PNG, WebP, GIF, PDF
          </DialogDescription>
        </DialogHeader>

        {/* Drop zone */}
        <div
          className={cn(
            "relative border-2 border-dashed rounded-lg p-8 transition-colors",
            isDragging
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-primary/50"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={getAcceptedFileTypes()}
            onChange={handleFileSelect}
            className="hidden"
          />

          <div className="flex flex-col items-center justify-center text-center cursor-pointer">
            <div className="rounded-full bg-muted p-4 mb-4">
              <Upload className="size-8 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">
              Glissez-déposez vos fichiers ici
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              ou cliquez pour parcourir
            </p>
          </div>
        </div>

        {/* File list */}
        {hasUploads && (
          <div className="space-y-3 max-h-[250px] overflow-y-auto">
            {uploads.map((upload, index) => (
              <UploadItem
                key={`${upload.file.name}-${index}`}
                upload={upload}
                onRemove={() => removeFile(index)}
                disabled={isUploading}
              />
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          <div className="text-sm text-muted-foreground">
            {hasUploads && (
              <>
                {pendingCount > 0 && (
                  <span>
                    {pendingCount} fichier{pendingCount > 1 ? "s" : ""} en
                    attente
                  </span>
                )}
                {successCount > 0 && (
                  <span className="text-green-600">
                    {pendingCount > 0 && " • "}
                    {successCount} terminé{successCount > 1 ? "s" : ""}
                  </span>
                )}
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleClose} disabled={isUploading}>
              {successCount > 0 && pendingCount === 0 ? "Fermer" : "Annuler"}
            </Button>
            {pendingCount > 0 && (
              <Button onClick={startUpload} disabled={isUploading}>
                {isUploading ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    Téléversement...
                  </>
                ) : (
                  <>
                    <Upload className="size-4 mr-2" />
                    Téléverser ({pendingCount})
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ============ Upload Item Component ============

interface UploadItemProps {
  upload: FileUploadState;
  onRemove: () => void;
  disabled: boolean;
}

function UploadItem({ upload, onRemove, disabled }: UploadItemProps) {
  const isImageFile = upload.file.type.startsWith("image/");

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
      {/* Icon */}
      <div className="shrink-0 size-10 rounded-md bg-muted flex items-center justify-center">
        {isImageFile ? (
          <ImageIcon className="size-5 text-muted-foreground" />
        ) : (
          <FileText className="size-5 text-muted-foreground" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium truncate">{upload.file.name}</p>
          {upload.status === "success" && (
            <CheckCircle2 className="size-4 text-green-600 shrink-0" />
          )}
          {upload.status === "error" && (
            <XCircle className="size-4 text-destructive shrink-0" />
          )}
        </div>

        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-muted-foreground">
            {formatFileSize(upload.file.size)}
          </span>

          {upload.status === "uploading" && (
            <div className="flex-1 max-w-[150px]">
              <Progress value={upload.progress} className="h-1.5" />
            </div>
          )}

          {upload.status === "error" && (
            <span className="text-xs text-destructive truncate">
              {upload.error}
            </span>
          )}
        </div>
      </div>

      {/* Remove button */}
      {(upload.status === "pending" || upload.status === "error") && (
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onRemove}
          disabled={disabled}
          className="shrink-0"
        >
          <X className="size-4" />
        </Button>
      )}
    </div>
  );
}
