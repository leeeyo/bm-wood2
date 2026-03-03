"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FileText,
  Loader2,
  Mail,
  Phone,
  User,
  History,
} from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/lib/contexts/auth-context";
import { createAuthHeaders } from "@/lib/api/auth";
import {
  updateProfileSchema,
  type UpdateProfileInput,
} from "@/lib/validations/user.schema";
import { DevisStatus, type IDevis } from "@/types/models.types";
import { getStatusLabel } from "@/lib/api/devis";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { UserRole } from "@/types/models.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const STATUS_STYLES: Record<DevisStatus, string> = {
  [DevisStatus.PENDING]:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  [DevisStatus.REVIEWED]:
    "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  [DevisStatus.APPROVED]:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  [DevisStatus.REJECTED]:
    "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  [DevisStatus.IN_PROGRESS]:
    "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  [DevisStatus.COMPLETED]:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
};

function ProfilePageContent() {
  const { user, refreshUserData } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [myDevis, setMyDevis] = useState<IDevis[]>([]);
  const [isLoadingDevis, setIsLoadingDevis] = useState(true);

  const form = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      marketingEmails: true,
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        firstName: user.firstName ?? "",
        lastName: user.lastName ?? "",
        phone: user.phone ?? "",
        marketingEmails: user.marketingEmails ?? true,
      });
    }
  }, [user, form]);

  useEffect(() => {
    if (!user) return;
    async function fetchDevis() {
      setIsLoadingDevis(true);
      try {
        const res = await fetch("/api/devis/me?limit=5", {
          headers: createAuthHeaders(),
        });
        const data = await res.json();
        if (data.success && data.data) {
          setMyDevis(data.data);
        }
      } catch {
        setMyDevis([]);
      } finally {
        setIsLoadingDevis(false);
      }
    }
    fetchDevis();
  }, [user]);

  const onSubmit = async (data: UpdateProfileInput) => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...createAuthHeaders(),
        },
        body: JSON.stringify(data),
      });
      const json = await res.json();

      if (!res.ok) {
        toast.error(json.message ?? json.error ?? "Erreur lors de la mise à jour");
        return;
      }

      await refreshUserData();
      toast.success("Profil mis à jour");
    } catch {
      toast.error("Erreur réseau");
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">
          Mon profil
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Gérez vos informations personnelles et préférences.
        </p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Profile form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Informations personnelles
            </CardTitle>
            <CardDescription>
              Mettez à jour vos coordonnées et préférences.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <div className="grid sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prénom</FormLabel>
                        <FormControl>
                          <Input placeholder="Prénom" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom</FormLabel>
                        <FormControl>
                          <Input placeholder="Nom" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm">{user.email}</span>
                </div>

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        Téléphone
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          placeholder="98 134 335"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="marketingEmails"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Recevoir les actualités et offres BM Wood
                        </FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Newsletter, nouveautés et promotions. Vous pouvez
                          désactiver à tout moment.
                        </p>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <Button type="submit" disabled={isSaving}>
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Enregistrer les modifications"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Mes devis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="w-5 h-5" />
              Mes devis
            </CardTitle>
            <CardDescription>
              Vos demandes de devis et leur statut.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingDevis ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : myDevis.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">
                Vous n&apos;avez pas encore de demande de devis.
              </p>
            ) : (
              <ul className="space-y-3">
                {myDevis.map((d) => (
                  <li
                    key={String(d._id)}
                    className="flex items-center justify-between gap-4 py-3 border-b last:border-0"
                  >
                    <div>
                      <p className="font-medium">{d.reference}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(d.createdAt).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                          STATUS_STYLES[d.status as DevisStatus] ??
                          "bg-muted text-muted-foreground"
                        }`}
                      >
                        {getStatusLabel(d.status as DevisStatus)}
                      </span>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/cms/devis/${d._id}`}>
                          <FileText className="w-4 h-4" />
                        </Link>
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {myDevis.length > 0 && (
              <div className="flex gap-2 mt-4">
                <Link href="/demander-un-devis">
                  <Button variant="outline" size="sm">
                    Nouvelle demande
                  </Button>
                </Link>
                <Link href="/cms/devis">
                  <Button variant="ghost" size="sm">
                    Voir tous les devis
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
      <ProfilePageContent />
    </ProtectedRoute>
  );
}
