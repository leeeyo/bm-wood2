"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AuthCard } from "@/components/auth/auth-card";
import { PublicRoute } from "@/components/auth/public-route";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/lib/contexts/auth-context";
import { resetPasswordSchema } from "@/lib/validations/auth.schema";

const resetPasswordFormSchema = resetPasswordSchema.extend({
  confirmPassword: z.string().min(1, "Veuillez confirmer le mot de passe"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

type ResetPasswordFormInput = z.infer<typeof resetPasswordFormSchema>;

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const { resetPassword, isLoading } = useAuth();
  const [success, setSuccess] = useState(false);

  const form = useForm<ResetPasswordFormInput>({
    resolver: zodResolver(resetPasswordFormSchema),
    defaultValues: {
      token,
      password: "",
      confirmPassword: "",
    },
    mode: "onBlur",
  });

  async function onSubmit(values: ResetPasswordFormInput) {
    const ok = await resetPassword(values.token, values.password);
    if (ok) setSuccess(true);
  }

  if (!token) {
    return (
      <AuthCard
        title="Nouveau mot de passe"
        description="Choisissez un nouveau mot de passe"
      >
        <div className="space-y-4 text-center">
          <p className="text-sm text-destructive">Lien invalide</p>
          <Link
            href="/forgot-password"
            className="inline-block text-sm text-primary hover:underline transition-colors"
          >
            Demander un nouveau lien
          </Link>
          <p className="mt-6 text-sm text-muted-foreground">
            <Link href="/login" className="text-primary hover:underline transition-colors">
              Retour à la connexion
            </Link>
          </p>
        </div>
      </AuthCard>
    );
  }

  if (success) {
    return (
      <AuthCard
        title="Nouveau mot de passe"
        description="Choisissez un nouveau mot de passe"
      >
        <div className="space-y-4 text-center">
          <p className="text-sm text-muted-foreground">
            Votre mot de passe a été réinitialisé. Vous pouvez maintenant vous connecter.
          </p>
          <Link
            href="/login"
            className="inline-block text-sm text-primary hover:underline transition-colors"
          >
            Aller à la connexion
          </Link>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Nouveau mot de passe"
      description="Choisissez un nouveau mot de passe"
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-6"
        >
          <FormField
            control={form.control}
            name="token"
            render={({ field }) => (
              <FormItem className="hidden">
                <FormControl>
                  <input type="hidden" aria-hidden {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nouveau mot de passe</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Nouveau mot de passe"
                    aria-label="Nouveau mot de passe"
                    disabled={isLoading}
                    className="h-11"
                    {...field}
                  />
                </FormControl>
                <FormDescription className="text-xs sm:text-sm">
                  8 caractères minimum, majuscule, minuscule, chiffre
                </FormDescription>
                <FormMessage className="text-destructive" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirmer le mot de passe</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Confirmer le mot de passe"
                    aria-label="Confirmer le mot de passe"
                    disabled={isLoading}
                    className="h-11"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-destructive" />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            variant="default"
            className="w-full h-11 disabled:opacity-50 disabled:pointer-events-none"
            disabled={isLoading}
          >
            {isLoading ? (
              <Spinner className="size-4" />
            ) : (
              "Réinitialiser"
            )}
          </Button>
        </form>
      </Form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Lien invalide ou expiré ?{" "}
        <Link
          href="/forgot-password"
          className="text-primary hover:underline transition-colors"
        >
          Demander un nouveau lien
        </Link>
      </p>
    </AuthCard>
  );
}

export default function ResetPasswordPage() {
  return (
    <PublicRoute>
      <Link
        href="/"
        className="absolute left-4 top-4 text-sm text-muted-foreground hover:text-primary transition-colors"
      >
        ← Retour à l&apos;accueil
      </Link>
      <Suspense
        fallback={
          <AuthCard
            title="Nouveau mot de passe"
            description="Chargement..."
          >
            <div className="flex justify-center py-6">
              <Spinner className="size-6" />
            </div>
          </AuthCard>
        }
      >
        <ResetPasswordForm />
      </Suspense>
    </PublicRoute>
  );
}
