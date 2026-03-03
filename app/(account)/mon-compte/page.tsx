"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FileText,
  MapPin,
  ArrowRight,
  Loader2,
  Check,
  Mail,
  Phone,
  User,
  History,
} from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/lib/contexts/auth-context";
import { createAuthHeaders } from "@/lib/api/auth";
import { updateProfileSchema, type UpdateProfileInput } from "@/lib/validations/user.schema";
import { UserRole, DevisStatus, type IDevis } from "@/types/models.types";
import { getStatusLabel } from "@/lib/api/devis";
import { business } from "@/lib/config/business";
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
  [DevisStatus.PENDING]: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  [DevisStatus.REVIEWED]: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  [DevisStatus.APPROVED]: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  [DevisStatus.REJECTED]: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  [DevisStatus.IN_PROGRESS]: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  [DevisStatus.COMPLETED]: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
};

export default function MonComptePage() {
  const { user, refreshUserData } = useAuth();
  const [isWelcomeBanner, setIsWelcomeBanner] = useState(false);
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
    const flag = sessionStorage.getItem("mon-compte-welcome-shown");
    if (!flag && user?.role === UserRole.USER) {
      setIsWelcomeBanner(true);
    }
  }, [user?.role]);

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

  const dismissWelcome = () => {
    setIsWelcomeBanner(false);
    sessionStorage.setItem("mon-compte-welcome-shown", "1");
  };

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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bonjour";
    if (hour < 18) return "Bon après-midi";
    return "Bonsoir";
  };

  if (!user) return null;

  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-6 md:px-12">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-primary-foreground/60 text-sm tracking-[0.3em] uppercase mb-6">
              Mon compte
            </p>
            <h1
              className="text-3xl md:text-4xl lg:text-5xl font-medium leading-[1.1] tracking-tight mb-6"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {getGreeting()}, {user.firstName ?? "Utilisateur"}
            </h1>
            <p className="text-primary-foreground/70 text-lg leading-relaxed max-w-2xl mx-auto">
              Gérez votre profil et vos préférences.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container mx-auto px-6 md:px-12">
          <div className="max-w-3xl mx-auto space-y-8">
            {/* Welcome banner (first visit) */}
            {isWelcomeBanner && (
              <Card className="border-primary/30 bg-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-primary" />
                    Bienvenue !
                  </CardTitle>
                  <CardDescription>
                    Découvrez nos créations au showroom ou demandez un devis gratuit pour votre projet.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col sm:flex-row gap-4">
                  <Link href="/demander-un-devis">
                    <Button className="w-full sm:w-auto gap-2">
                      <FileText className="w-4 h-4" />
                      Demander un devis
                    </Button>
                  </Link>
                  <Link href={business.mapsLink} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="w-full sm:w-auto gap-2">
                      <MapPin className="w-4 h-4" />
                      Visiter le showroom
                    </Button>
                  </Link>
                  <Button variant="ghost" size="sm" onClick={dismissWelcome}>
                    Fermer
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* CTAs */}
            <div className="grid sm:grid-cols-2 gap-4">
              <Link href="/demander-un-devis">
                <Card className="h-full hover:border-primary/50 transition-colors cursor-pointer group">
                  <CardContent className="pt-6 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <FileText className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Demander un devis gratuit</p>
                      <p className="text-sm text-muted-foreground">
                        Décrivez votre projet et recevez une estimation personnalisée.
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </CardContent>
                </Card>
              </Link>
              <a href={business.mapsLink} target="_blank" rel="noopener noreferrer">
                <Card className="h-full hover:border-primary/50 transition-colors cursor-pointer group">
                  <CardContent className="pt-6 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <MapPin className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Visiter notre showroom</p>
                      <p className="text-sm text-muted-foreground">
                        {business.addressFormatted}
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </CardContent>
                </Card>
              </a>
            </div>

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
                        <span
                          className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                            STATUS_STYLES[d.status as DevisStatus] ?? "bg-muted text-muted-foreground"
                          }`}
                        >
                          {getStatusLabel(d.status as DevisStatus)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
                {myDevis.length > 0 && (
                  <Link href="/demander-un-devis" className="inline-block mt-4">
                    <Button variant="outline" size="sm">
                      Nouvelle demande
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>

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
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                              Newsletter, nouveautés et promotions. Vous pouvez désactiver à tout moment.
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

            {user.role === UserRole.ADMIN && (
              <Card>
                <CardContent className="pt-6">
                  <Link href="/dashboard">
                    <Button variant="outline" className="gap-2">
                      <FileText className="w-4 h-4" />
                      Accéder au tableau de bord
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
