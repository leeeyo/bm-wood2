"use client";

import { useEffect, useCallback, useState } from "react";
import { AlertTriangle, Trash2, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

export interface ConfirmationDialogProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Callback when the dialog open state changes */
  onOpenChange: (open: boolean) => void;
  /** Dialog title */
  title: string;
  /** Dialog description */
  description: string | React.ReactNode;
  /** Confirm button label */
  confirmLabel?: string;
  /** Cancel button label */
  cancelLabel?: string;
  /** Confirm button variant */
  variant?: "default" | "destructive";
  /** Whether the confirm action is loading */
  isLoading?: boolean;
  /** Callback when confirmed */
  onConfirm: () => void | Promise<void>;
  /** Optional warning message to show */
  warning?: string | React.ReactNode;
  /** Icon to show in the dialog */
  icon?: LucideIcon;
}

export function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirmer",
  cancelLabel = "Annuler",
  variant = "default",
  isLoading = false,
  onConfirm,
  warning,
  icon: Icon,
}: ConfirmationDialogProps) {
  // Handle Escape key to close dialog
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoading) {
        e.preventDefault();
        onOpenChange(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, isLoading, onOpenChange]);

  const handleConfirm = useCallback(async () => {
    await onConfirm();
  }, [onConfirm]);

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-lg mx-auto">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-base sm:text-lg">
            {Icon && <Icon className="size-5 shrink-0" />}
            <span className="break-words">{title}</span>
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3 text-sm">
              {typeof description === "string" ? <p>{description}</p> : description}
              {warning && (
                <div
                  className={cn(
                    "flex items-start gap-2 p-3 rounded-md",
                    variant === "destructive"
                      ? "bg-destructive/10 text-destructive"
                      : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                  )}
                >
                  <AlertTriangle className="size-5 shrink-0 mt-0.5" />
                  <span className="text-sm">
                    {typeof warning === "string" ? warning : warning}
                  </span>
                </div>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col-reverse sm:flex-row gap-2 sm:gap-0">
          <AlertDialogCancel disabled={isLoading} className="w-full sm:w-auto h-11 sm:h-10">
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading}
            className={cn(
              "w-full sm:w-auto h-11 sm:h-10",
              variant === "destructive" &&
                "bg-destructive text-destructive-foreground hover:bg-destructive/90"
            )}
          >
            {isLoading ? "Chargement..." : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/**
 * Preset confirmation dialogs for common scenarios
 */
export interface DeleteConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemName: string;
  itemType?: string;
  isLoading?: boolean;
  onConfirm: () => void | Promise<void>;
  warning?: string | React.ReactNode;
}

export function DeleteConfirmationDialog({
  open,
  onOpenChange,
  itemName,
  itemType = "élément",
  isLoading = false,
  onConfirm,
  warning,
}: DeleteConfirmationDialogProps) {
  return (
    <ConfirmationDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Supprimer ${itemType === "élément" ? "l'" : "le "}${itemType}`}
      description={
        <>
          Êtes-vous sûr de vouloir supprimer <strong>&quot;{itemName}&quot;</strong> ?
          Cette action est irréversible.
        </>
      }
      confirmLabel="Supprimer"
      variant="destructive"
      isLoading={isLoading}
      onConfirm={onConfirm}
      warning={warning}
      icon={Trash2}
    />
  );
}

/**
 * Hook to manage confirmation dialog state
 */
export function useConfirmationDialog<T = unknown>() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [itemToConfirm, setItemToConfirm] = useState<T | null>(null);

  const openDialog = useCallback((item: T) => {
    setItemToConfirm(item);
    setIsOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    if (!isLoading) {
      setIsOpen(false);
      setItemToConfirm(null);
    }
  }, [isLoading]);

  const confirm = useCallback(async (action: (item: T) => Promise<void> | void) => {
    if (!itemToConfirm) return;

    setIsLoading(true);
    try {
      await action(itemToConfirm);
      setIsOpen(false);
      setItemToConfirm(null);
    } finally {
      setIsLoading(false);
    }
  }, [itemToConfirm]);

  return {
    isOpen,
    isLoading,
    itemToConfirm,
    openDialog,
    closeDialog,
    setIsOpen,
    confirm,
  };
}
