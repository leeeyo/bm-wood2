"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Package,
  FileText,
  UserCircle,
  Banknote,
  Clock,
  FileDown,
  RefreshCw,
  Save,
  Send,
} from "lucide-react";

import { IDevis, IUserPublic, DevisStatus } from "@/types/models.types";
import {
  updateDevis,
  getUsers,
  triggerDevisPDFDownload,
  sendDevisPdfByEmail,
  getStatusLabel,
  getNextStatuses,
  DEVIS_STATUS_CONFIG,
} from "@/lib/api/devis";
import { UpdateDevisInput } from "@/lib/validations/devis.schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusUpdateDialog } from "./status-update-dialog";

interface DevisDetailProps {
  devis: IDevis;
  onUpdate: () => void;
}

// Helper to get assigned user info from populated devis
function getAssignedUser(devis: IDevis): IUserPublic | null {
  const assignedTo = devis.assignedTo as unknown as IUserPublic | undefined;
  if (!assignedTo || typeof assignedTo === "string") return null;
  return assignedTo;
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

// Can download PDF only for approved or later statuses
function canDownloadPDF(status: DevisStatus): boolean {
  return [DevisStatus.APPROVED, DevisStatus.IN_PROGRESS, DevisStatus.COMPLETED].includes(status);
}

// Status timeline component
function StatusTimeline({ currentStatus }: { currentStatus: DevisStatus }) {
  const statuses: DevisStatus[] = [DevisStatus.PENDING, DevisStatus.REVIEWED, DevisStatus.APPROVED, DevisStatus.IN_PROGRESS, DevisStatus.COMPLETED];
  const rejectedIndex = statuses.indexOf(DevisStatus.APPROVED); // Rejection branches from reviewed
  const currentIndex = statuses.indexOf(currentStatus);
  const isRejected = currentStatus === DevisStatus.REJECTED;

  return (
    <div className="relative">
      <div className="flex items-center justify-between">
        {statuses.map((status, index) => {
          const isActive = isRejected ? index <= rejectedIndex : index <= currentIndex;
          const isCurrent = status === currentStatus;

          return (
            <div key={status} className="flex flex-col items-center relative z-10">
              <div
                className={`size-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                  isCurrent
                    ? `${DEVIS_STATUS_CONFIG[status].color} text-white`
                    : isActive
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {index + 1}
              </div>
              <span
                className={`text-xs mt-1 text-center ${
                  isCurrent ? "font-medium" : "text-muted-foreground"
                }`}
              >
                {getStatusLabel(status)}
              </span>
            </div>
          );
        })}
      </div>
      {/* Connection lines */}
      <div className="absolute top-4 left-4 right-4 h-0.5 bg-muted z-0">
        <div
          className="h-full bg-primary transition-all"
          style={{
            width: `${(Math.min(currentIndex, statuses.length - 1) / (statuses.length - 1)) * 100}%`,
          }}
        />
      </div>
      {/* Rejected indicator */}
      {isRejected && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 mt-14">
          <Badge className={getStatusBadgeStyles(DevisStatus.REJECTED)} variant="outline">
            Rejeté
          </Badge>
        </div>
      )}
    </div>
  );
}

export function DevisDetail({ devis, onUpdate }: DevisDetailProps) {
  const [users, setUsers] = useState<IUserPublic[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    adminNotes: devis.adminNotes ?? "",
    assignedTo: (getAssignedUser(devis)?._id ?? devis.assignedTo?.toString()) || "",
    estimatedPrice: devis.estimatedPrice?.toString() ?? "",
    estimatedDate: devis.estimatedDate
      ? format(new Date(devis.estimatedDate), "yyyy-MM-dd")
      : "",
  });

  const assignedUser = getAssignedUser(devis);
  const nextStatuses = getNextStatuses(devis.status as DevisStatus);

  // Fetch users for assignment dropdown
  useEffect(() => {
    async function fetchUsers() {
      setIsLoadingUsers(true);
      try {
        const result = await getUsers();
        if (result.success && result.data) {
          setUsers(result.data);
        }
      } catch (error) {
        console.error("Failed to fetch users:", error);
      } finally {
        setIsLoadingUsers(false);
      }
    }
    fetchUsers();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updateData: UpdateDevisInput = {};

      if (formData.adminNotes !== (devis.adminNotes ?? "")) {
        updateData.adminNotes = formData.adminNotes;
      }

      if (formData.assignedTo !== (assignedUser?._id ?? devis.assignedTo?.toString() ?? "")) {
        updateData.assignedTo = formData.assignedTo || undefined;
      }

      if (formData.estimatedPrice !== (devis.estimatedPrice?.toString() ?? "")) {
        updateData.estimatedPrice = formData.estimatedPrice
          ? parseFloat(formData.estimatedPrice)
          : undefined;
      }

      if (
        formData.estimatedDate !==
        (devis.estimatedDate ? format(new Date(devis.estimatedDate), "yyyy-MM-dd") : "")
      ) {
        updateData.estimatedDate = formData.estimatedDate
          ? new Date(formData.estimatedDate).toISOString()
          : undefined;
      }

      if (Object.keys(updateData).length === 0) {
        toast.info("Aucune modification", {
          description: "Aucun changement détecté.",
        });
        return;
      }

      const result = await updateDevis(devis._id.toString(), updateData);

      if (result.success) {
        toast.success("Devis mis à jour", {
          description: "Les modifications ont été enregistrées.",
        });
        onUpdate();
      } else {
        toast.error("Erreur", {
          description: result.error ?? "Une erreur est survenue.",
        });
      }
    } catch (error) {
      toast.error("Erreur", {
        description: "Une erreur est survenue lors de l'enregistrement.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      const success = await triggerDevisPDFDownload(devis._id.toString(), devis.reference);
      if (success) {
        toast.success("PDF téléchargé", {
          description: `Le PDF du devis "${devis.reference}" a été téléchargé.`,
        });
      } else {
        toast.error("Erreur", {
          description: "Impossible de télécharger le PDF.",
        });
      }
    } catch (error) {
      toast.error("Erreur", {
        description: "Une erreur est survenue lors du téléchargement.",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSendEmail = async () => {
    setIsSendingEmail(true);
    try {
      const result = await sendDevisPdfByEmail(devis._id.toString());
      if (result.success) {
        toast.success("Email envoyé", {
          description: result.message || `Devis envoyé par email au client (${devis.client.email}).`,
        });
      } else {
        toast.error("Erreur", {
          description: result.error || "Impossible d'envoyer l'email.",
        });
      }
    } catch (error) {
      toast.error("Erreur", {
        description: "Une erreur est survenue lors de l'envoi de l'email.",
      });
    } finally {
      setIsSendingEmail(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Main content - left side */}
      <div className="lg:col-span-2 space-y-6">
        {/* Status timeline */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Progression</CardTitle>
              {nextStatuses.length > 0 && (
                <Button size="sm" onClick={() => setStatusDialogOpen(true)}>
                  <RefreshCw className="size-4 mr-2" />
                  Changer le statut
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <StatusTimeline currentStatus={devis.status as DevisStatus} />
          </CardContent>
        </Card>

        {/* Client information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="size-5" />
              Informations client
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <Label className="text-muted-foreground text-xs">Nom complet</Label>
                <p className="font-medium">
                  {devis.client.firstName} {devis.client.lastName}
                </p>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground text-xs flex items-center gap-1">
                  <Mail className="size-3" />
                  Email
                </Label>
                <p className="font-medium">
                  <a
                    href={`mailto:${devis.client.email}`}
                    className="text-primary hover:underline"
                  >
                    {devis.client.email}
                  </a>
                </p>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground text-xs flex items-center gap-1">
                  <Phone className="size-3" />
                  Téléphone
                </Label>
                <p className="font-medium">
                  <a
                    href={`tel:${devis.client.phone}`}
                    className="text-primary hover:underline"
                  >
                    {devis.client.phone}
                  </a>
                </p>
              </div>
              {(devis.client.address || devis.client.city) && (
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-xs flex items-center gap-1">
                    <MapPin className="size-3" />
                    Adresse
                  </Label>
                  <p className="font-medium">
                    {[devis.client.address, devis.client.city].filter(Boolean).join(", ")}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Items list */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="size-5" />
              Articles demandés
            </CardTitle>
            <CardDescription>
              {devis.items.length} article{devis.items.length > 1 ? "s" : ""} dans ce devis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">#</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-center">Qté</TableHead>
                  <TableHead>Dimensions</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {devis.items.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell>
                      <span className="font-medium">{item.description}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary">{item.quantity}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {item.dimensions || "-"}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm max-w-[200px] truncate">
                      {item.notes || "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Client notes */}
        {devis.notes && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="size-5" />
                Notes du client
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap">{devis.notes}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Sidebar - right side */}
      <div className="space-y-6">
        {/* Quick info card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Devis {devis.reference}</CardTitle>
              <Badge className={getStatusBadgeStyles(devis.status as DevisStatus)} variant="outline">
                {getStatusLabel(devis.status as DevisStatus)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="size-4 text-muted-foreground" />
              <span className="text-muted-foreground">Créé le</span>
              <span className="font-medium ml-auto">
                {format(new Date(devis.createdAt), "dd/MM/yyyy HH:mm", { locale: fr })}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="size-4 text-muted-foreground" />
              <span className="text-muted-foreground">Mis à jour</span>
              <span className="font-medium ml-auto">
                {format(new Date(devis.updatedAt), "dd/MM/yyyy HH:mm", { locale: fr })}
              </span>
            </div>
            <Separator />
            {canDownloadPDF(devis.status as DevisStatus) && (
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleDownloadPDF}
                  disabled={isDownloading}
                >
                  <FileDown className="size-4 mr-2" />
                  {isDownloading ? "Téléchargement..." : "Télécharger le PDF"}
                </Button>
                <Button
                  variant="default"
                  className="w-full"
                  onClick={handleSendEmail}
                  disabled={isSendingEmail}
                >
                  <Send className="size-4 mr-2" />
                  {isSendingEmail ? "Envoi en cours..." : "Envoyer le devis par email"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Admin management card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCircle className="size-5" />
              Gestion administrative
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Assignment */}
            <div className="space-y-2">
              <Label htmlFor="assignedTo">Assigné à</Label>
              <Select
                value={formData.assignedTo}
                onValueChange={(value) => handleInputChange("assignedTo", value === "none" ? "" : value)}
                disabled={isLoadingUsers}
              >
                <SelectTrigger id="assignedTo">
                  <SelectValue placeholder={isLoadingUsers ? "Chargement..." : "Sélectionner un utilisateur"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Non assigné</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user._id} value={user._id}>
                      {user.firstName} {user.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Estimated price */}
            <div className="space-y-2">
              <Label htmlFor="estimatedPrice">Prix estimé (TND)</Label>
              <div className="relative">
                <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="estimatedPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className="pl-9"
                  value={formData.estimatedPrice}
                  onChange={(e) => handleInputChange("estimatedPrice", e.target.value)}
                />
              </div>
            </div>

            {/* Estimated date */}
            <div className="space-y-2">
              <Label htmlFor="estimatedDate">Date estimée</Label>
              <Input
                id="estimatedDate"
                type="date"
                value={formData.estimatedDate}
                onChange={(e) => handleInputChange("estimatedDate", e.target.value)}
              />
            </div>

            <Separator />

            {/* Admin notes */}
            <div className="space-y-2">
              <Label htmlFor="adminNotes">Notes administratives</Label>
              <Textarea
                id="adminNotes"
                placeholder="Notes internes concernant ce devis..."
                value={formData.adminNotes}
                onChange={(e) => handleInputChange("adminNotes", e.target.value)}
                rows={4}
                maxLength={2000}
              />
              <p className="text-xs text-muted-foreground text-right">
                {formData.adminNotes.length}/2000 caractères
              </p>
            </div>

            <Button className="w-full" onClick={handleSave} disabled={isSaving}>
              <Save className="size-4 mr-2" />
              {isSaving ? "Enregistrement..." : "Enregistrer les modifications"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Status update dialog */}
      <StatusUpdateDialog
        open={statusDialogOpen}
        onOpenChange={setStatusDialogOpen}
        devisId={devis._id.toString()}
        devisReference={devis.reference}
        currentStatus={devis.status as DevisStatus}
        onStatusUpdated={onUpdate}
      />
    </div>
  );
}
