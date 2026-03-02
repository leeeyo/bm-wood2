"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/validations/auth.schema";

export default function ForgotPasswordPage() {
  const { forgotPassword, isLoading } = useAuth();
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
    mode: "onBlur",
  });

  async function onSubmit(values: ForgotPasswordInput) {
    const success = await forgotPassword(values.email);
    if (success) setSubmitted(true);
  }

  return (
    <PublicRoute>
      <Link
        href="/"
        className="absolute left-4 top-4 text-sm text-muted-foreground hover:text-primary transition-colors"
      >
        ← Retour à l&apos;accueil
      </Link>
      <AuthCard
        title="Mot de passe oublié"
        description="Recevez un lien de réinitialisation"
      >
        {submitted ? (
          <div className="space-y-4 text-center">
            <p className="text-sm text-muted-foreground">
              Si un compte existe avec cette adresse, vous recevrez un email contenant un lien pour réinitialiser votre mot de passe.
            </p>
            <Link
              href="/login"
              className="inline-block text-sm text-primary hover:underline transition-colors"
            >
              Retour à la connexion
            </Link>
          </div>
        ) : (
          <>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex flex-col gap-6"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="votre@email.com"
                          aria-label="Email"
                          disabled={isLoading}
                          className="h-11"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-xs sm:text-sm">
                        Un email avec un lien de réinitialisation sera envoyé à cette adresse
                      </FormDescription>
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
                    "Envoyer le lien"
                  )}
                </Button>
              </form>
            </Form>
            <p className="mt-6 text-center text-sm text-muted-foreground">
              <Link
                href="/login"
                className="text-primary hover:underline transition-colors"
              >
                Retour à la connexion
              </Link>
            </p>
          </>
        )}
      </AuthCard>
    </PublicRoute>
  );
}
