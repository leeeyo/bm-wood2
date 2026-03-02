"use client";

import { useState } from "react";
import Link from "next/link";
import { MoreHorizontal, Pencil, Trash2, Eye, FileDown, UserCircle, Calendar, Mail } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

import { IDevis, DevisStatus, IUserPublic } from "@/types/models.types";
import { deleteDevis, triggerDevisPDFDownload, getStatusLabel, getStatusVariant } from "@/lib/api/devis";
import { useIsMobile } from "@/hooks/use-mobile";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DevisTableProps {
  devisList: IDevis[];
  isLoading?: boolean;
  onDelete?: () => void;
}

// Helper to get assigned user info from populated devis
function getAssignedUser(devis: IDevis): IUserPublic | null {
  const assignedTo = devis.assignedTo as unknown as IUserPublic | undefined;
  if (!assignedTo || typeof assignedTo === "string") return null;
  return assignedTo;
}

// Status badge styles based on status
function getStatusBadgeStyles(status: DevisStatus): string {
  const styles: Record<DevisStatus, string> = {
    [DevisStatus.PENDING]: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800",
    [DevisStatus.REVIEWED]: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
    [DevisStatus.APPROVED]: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800",
    [DevisStatus.REJECTED]: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",
    [DevisStatus.IN_PROGRESS]: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800",
    [DevisStatus.COMPLETED]: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800",
  };
  return styles[status] ?? "";
}

// Can download PDF only for approved or later statuses
function canDownloadPDF(status: DevisStatus): boolean {
  return [DevisStatus.APPROVED, DevisStatus.IN_PROGRESS, DevisStatus.COMPLETED].includes(status);
}

export function DevisTable({ devisList, isLoading, onDelete }: DevisTableProps) {
  const isMobile = useIsMobile();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [devisToDelete, setDevisToDelete] = useState<IDevis | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDeleteClick = (devis: IDevis) => {
    setDevisToDelete(devis);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!devisToDelete) return;

    setIsDeleting(true);
    try {
      const result = await deleteDevis(devisToDelete._id.toString());
      if (result.success) {
        toast.success("Devis supprimé", {
          description: `Le devis "${devisToDelete.reference}" a été supprimé avec succès.`,
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
      setDevisToDelete(null);
    }
  };

  const handleDownloadPDF = async (devis: IDevis) => {
    const id = devis._id.toString();
    setDownloadingId(id);
    
    try {
      const success = await triggerDevisPDFDownload(id, devis.reference);
      if (success) {
        toast.success("PDF téléchargé", {
          description: `Le PDF du devis "${devis.reference}" a été téléchargé.`,
        });
      } else {
        toast.error("Erreur", {
          description: "Impossible de télécharger le PDF. Le devis doit être approuvé.",
        });
      }
    } catch (error) {
      toast.error("Erreur", {
        description: "Une erreur est survenue lors du téléchargement.",
      });
    } finally {
      setDownloadingId(null);
    }
  };

  if (isLoading) {
    return <DevisTableSkeleton isMobile={isMobile} />;
  }

  if (devisList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-muted p-4 mb-4">
          <Eye className="size-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium">Aucun devis trouvé</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Aucun devis ne correspond à vos critères de recherche.
        </p>
      </div>
    );
  }

  // Mobile card view
  if (isMobile) {
    return (
      <TooltipProvider>
        <div className="space-y-3">
          {devisList.map((devis) => {
            const assignedUser = getAssignedUser(devis);
            return (
              <Card key={devis._id.toString()} className="overflow-hidden">
                <CardContent className="p-4">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/cms/devis/${devis._id.toString()}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {devis.reference}
                      </Link>
                      <div className="text-sm mt-1">
                        {devis.client.firstName} {devis.client.lastName}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Mail className="size-3" />
                        <span className="truncate">{devis.client.email}</span>
                      </div>
                    </div>
                    <Badge 
                      className={getStatusBadgeStyles(devis.status as DevisStatus)}
                      variant="outline"
                    >
                      {getStatusLabel(devis.status as DevisStatus)}
                    </Badge>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 text-sm border-t pt-3">
                    <div className="flex justify-between items-center gap-4">
                      <span className="text-muted-foreground">Date</span>
                      <span>
                        {format(new Date(devis.createdAt), "dd MMM yyyy à HH:mm", { locale: fr })}
                      </span>
                    </div>
                    <div className="flex justify-between items-center gap-4">
                      <span className="text-muted-foreground">Assigné à</span>
                      {assignedUser ? (
                        <span className="flex items-center gap-1">
                          <UserCircle className="size-4 text-muted-foreground" />
                          {assignedUser.firstName} {assignedUser.lastName}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">Non assigné</span>
                      )}
                    </div>
                    <div className="flex justify-between items-center gap-4">
                      <span className="text-muted-foreground">Articles</span>
                      <Badge variant="secondary">{devis.items.length}</Badge>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-3 pt-3 border-t flex justify-end gap-2">
                    <Button variant="outline" size="sm" asChild className="h-9 px-3">
                      <Link href={`/cms/devis/${devis._id.toString()}`}>
                        <Eye className="size-4 mr-1.5" />
                        Voir
                      </Link>
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {canDownloadPDF(devis.status as DevisStatus) && (
                          <DropdownMenuItem
                            onClick={() => handleDownloadPDF(devis)}
                            disabled={downloadingId === devis._id.toString()}
                          >
                            <FileDown className="size-4 mr-2" />
                            {downloadingId === devis._id.toString() ? "Téléchargement..." : "Télécharger PDF"}
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => handleDeleteClick(devis)}
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
          })}
        </div>
      </TooltipProvider>
    );
  }

  // Desktop table view
  return (
    <TooltipProvider>
      <ScrollableTableWrapper>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Référence</TableHead>
              <TableHead>Client</TableHead>
              <TableHead className="hidden sm:table-cell">Date</TableHead>
              <TableHead className="text-center">Statut</TableHead>
              <TableHead className="hidden md:table-cell">Assigné à</TableHead>
              <TableHead className="text-center hidden sm:table-cell">Articles</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {devisList.map((devis) => {
              const assignedUser = getAssignedUser(devis);
              return (
                <TableRow key={devis._id.toString()}>
                  <TableCell>
                    <Link
                      href={`/cms/devis/${devis._id.toString()}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {devis.reference}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {devis.client.firstName} {devis.client.lastName}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Mail className="size-3" />
                        {devis.client.email}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <div className="flex flex-col">
                      <span className="text-sm">
                        {format(new Date(devis.createdAt), "dd MMM yyyy", { locale: fr })}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(devis.createdAt), "HH:mm", { locale: fr })}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge 
                      className={getStatusBadgeStyles(devis.status as DevisStatus)}
                      variant="outline"
                    >
                      {getStatusLabel(devis.status as DevisStatus)}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {assignedUser ? (
                      <div className="flex items-center gap-2">
                        <UserCircle className="size-4 text-muted-foreground" />
                        <span className="text-sm">
                          {assignedUser.firstName} {assignedUser.lastName}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">Non assigné</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center hidden sm:table-cell">
                    <Badge variant="secondary">{devis.items.length}</Badge>
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
                          <Link href={`/cms/devis/${devis._id.toString()}`}>
                            <Eye className="size-4 mr-2" />
                            Voir / Modifier
                          </Link>
                        </DropdownMenuItem>
                        {canDownloadPDF(devis.status as DevisStatus) && (
                          <DropdownMenuItem
                            onClick={() => handleDownloadPDF(devis)}
                            disabled={downloadingId === devis._id.toString()}
                          >
                            <FileDown className="size-4 mr-2" />
                            {downloadingId === devis._id.toString() ? "Téléchargement..." : "Télécharger PDF"}
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => handleDeleteClick(devis)}
                        >
                          <Trash2 className="size-4 mr-2" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </ScrollableTableWrapper>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">Supprimer le devis</DialogTitle>
            <DialogDescription className="text-sm">
              Êtes-vous sûr de vouloir supprimer le devis &quot;{devisToDelete?.reference}&quot; ?
              Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col-reverse sm:flex-row gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
              className="w-full sm:w-auto h-11 sm:h-10"
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="w-full sm:w-auto h-11 sm:h-10"
            >
              {isDeleting ? "Suppression..." : "Supprimer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}

function DevisTableSkeleton({ isMobile }: { isMobile?: boolean }) {
  if (isMobile) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-3 w-40" />
                </div>
                <Skeleton className="h-5 w-20" />
              </div>
              <div className="space-y-2 pt-3 border-t">
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-10" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-16" />
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
          <TableHead>Référence</TableHead>
          <TableHead>Client</TableHead>
          <TableHead className="hidden sm:table-cell">Date</TableHead>
          <TableHead className="text-center">Statut</TableHead>
          <TableHead className="hidden md:table-cell">Assigné à</TableHead>
          <TableHead className="text-center hidden sm:table-cell">Articles</TableHead>
          <TableHead className="w-[100px]">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: 5 }).map((_, i) => (
          <TableRow key={i}>
            <TableCell>
              <Skeleton className="h-4 w-28" />
            </TableCell>
            <TableCell>
              <div className="flex flex-col gap-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-40" />
              </div>
            </TableCell>
            <TableCell className="hidden sm:table-cell">
              <div className="flex flex-col gap-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-12" />
              </div>
            </TableCell>
            <TableCell className="text-center">
              <Skeleton className="h-5 w-20 mx-auto" />
            </TableCell>
            <TableCell className="hidden md:table-cell">
              <Skeleton className="h-4 w-28" />
            </TableCell>
            <TableCell className="text-center hidden sm:table-cell">
              <Skeleton className="h-5 w-8 mx-auto" />
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
