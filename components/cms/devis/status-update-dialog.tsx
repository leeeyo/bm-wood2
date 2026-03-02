"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ArrowRight, AlertCircle } from "lucide-react";

import { DevisStatus } from "@/types/models.types";
import { updateDevisStatus, getStatusLabel, getNextStatuses, DEVIS_STATUS_CONFIG } from "@/lib/api/devis";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface StatusUpdateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  devisId: string;
  devisReference: string;
  currentStatus: DevisStatus;
  onStatusUpdated: () => void;
}

// Status badge styles
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

export function StatusUpdateDialog({
  open,
  onOpenChange,
  devisId,
  devisReference,
  currentStatus,
  onStatusUpdated,
}: StatusUpdateDialogProps) {
  const [newStatus, setNewStatus] = useState<DevisStatus | "">("");
  const [adminNotes, setAdminNotes] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const availableStatuses = getNextStatuses(currentStatus);

  const handleSubmit = async () => {
    if (!newStatus) {
      toast.error("Erreur", {
        description: "Veuillez sélectionner un nouveau statut.",
      });
      return;
    }

    setIsUpdating(true);
    try {
      const result = await updateDevisStatus(devisId, {
        status: newStatus,
        adminNotes: adminNotes || undefined,
      });

      if (result.success) {
        toast.success("Statut mis à jour", {
          description: `Le devis "${devisReference}" est maintenant "${getStatusLabel(newStatus)}".`,
        });
        onStatusUpdated();
        handleClose();
      } else {
        toast.error("Erreur", {
          description: result.error ?? "Une erreur est survenue lors de la mise à jour.",
        });
      }
    } catch (error) {
      toast.error("Erreur", {
        description: "Une erreur est survenue lors de la mise à jour.",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleClose = () => {
    setNewStatus("");
    setAdminNotes("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Modifier le statut</DialogTitle>
          <DialogDescription>
            Devis <span className="font-medium">{devisReference}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Current status */}
          <div className="flex items-center justify-center gap-4">
            <div className="text-center">
              <Label className="text-xs text-muted-foreground mb-1 block">Statut actuel</Label>
              <Badge className={getStatusBadgeStyles(currentStatus)} variant="outline">
                {getStatusLabel(currentStatus)}
              </Badge>
            </div>
            {availableStatuses.length > 0 && (
              <>
                <ArrowRight className="size-5 text-muted-foreground" />
                <div className="text-center">
                  <Label className="text-xs text-muted-foreground mb-1 block">Nouveau statut</Label>
                  {newStatus ? (
                    <Badge className={getStatusBadgeStyles(newStatus)} variant="outline">
                      {getStatusLabel(newStatus)}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground">
                      Sélectionner
                    </Badge>
                  )}
                </div>
              </>
            )}
          </div>

          {/* No available transitions */}
          {availableStatuses.length === 0 && (
            <Alert>
              <AlertCircle className="size-4" />
              <AlertDescription>
                Ce devis ne peut pas changer de statut. Le statut &quot;{getStatusLabel(currentStatus)}&quot; est un état final.
              </AlertDescription>
            </Alert>
          )}

          {/* Status selection */}
          {availableStatuses.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="new-status">Nouveau statut</Label>
              <Select
                value={newStatus}
                onValueChange={(value) => setNewStatus(value as DevisStatus)}
              >
                <SelectTrigger id="new-status">
                  <SelectValue placeholder="Sélectionner un statut" />
                </SelectTrigger>
                <SelectContent>
                  {availableStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      <div className="flex items-center gap-2">
                        <div
                          className={`size-2 rounded-full ${DEVIS_STATUS_CONFIG[status].color}`}
                        />
                        {getStatusLabel(status)}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Admin notes */}
          {availableStatuses.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="admin-notes">
                Notes administratives <span className="text-muted-foreground">(optionnel)</span>
              </Label>
              <Textarea
                id="admin-notes"
                placeholder="Ajoutez une note concernant ce changement de statut..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={3}
                maxLength={2000}
              />
              <p className="text-xs text-muted-foreground text-right">
                {adminNotes.length}/2000 caractères
              </p>
            </div>
          )}

          {/* Warning for rejection */}
          {newStatus === "rejected" && (
            <Alert variant="destructive">
              <AlertCircle className="size-4" />
              <AlertDescription>
                Attention : Un devis rejeté ne peut plus changer de statut. Cette action est définitive.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isUpdating}>
            Annuler
          </Button>
          {availableStatuses.length > 0 && (
            <Button
              onClick={handleSubmit}
              disabled={!newStatus || isUpdating}
              variant={newStatus === "rejected" ? "destructive" : "default"}
            >
              {isUpdating ? "Mise à jour..." : "Confirmer"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
