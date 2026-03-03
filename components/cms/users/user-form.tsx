"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { IUserPublic, UserRole } from "@/types/models.types";
import { createUserSchema, updateUserSchema } from "@/lib/validations/user.schema";
import { createUser, updateUser } from "@/lib/api/users";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormDescription,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/lib/contexts/auth-context";

interface UserFormProps {
  user?: IUserPublic;
}

// Form schema for create mode
const createFormSchema = createUserSchema;

// Form schema for update mode (password is optional and has different rules)
const updateFormSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email address"),
  firstName: z
    .string()
    .min(1, "Le prénom est requis")
    .max(50, "Le prénom ne peut pas dépasser 50 caractères"),
  lastName: z
    .string()
    .min(1, "Le nom est requis")
    .max(50, "Le nom ne peut pas dépasser 50 caractères"),
  role: z.nativeEnum(UserRole),
  isActive: z.boolean(),
  password: z
    .string()
    .optional()
    .refine(
      (val) => !val || (val.length >= 8 && /[A-Z]/.test(val) && /[a-z]/.test(val) && /[0-9]/.test(val)),
      {
        message: "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre",
      }
    ),
});

type CreateFormData = z.infer<typeof createFormSchema>;
type UpdateFormData = z.infer<typeof updateFormSchema>;

// Role options
const roleOptions = [
  { value: UserRole.ADMIN, label: "Administrateur" },
  { value: UserRole.USER, label: "Utilisateur" },
];

export function UserForm({ user }: UserFormProps) {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isEditing = !!user;
  const isCurrentUser = currentUser?._id === user?._id;

  const form = useForm<CreateFormData | UpdateFormData>({
    resolver: zodResolver(isEditing ? updateFormSchema : createFormSchema),
    defaultValues: {
      email: user?.email ?? "",
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
      role: user?.role ?? UserRole.USER,
      isActive: user?.isActive ?? true,
      password: "",
    },
  });

  const onSubmit = async (data: CreateFormData | UpdateFormData) => {
    setIsSubmitting(true);

    try {
      if (isEditing) {
        // For update, only send password if it's provided
        const updateData: Record<string, unknown> = {
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          role: data.role,
          isActive: (data as UpdateFormData).isActive,
        };

        if ((data as UpdateFormData).password) {
          updateData.password = (data as UpdateFormData).password;
        }

        const result = await updateUser(user._id, updateData);

        if (result.success) {
          toast.success("Utilisateur mis à jour", {
            description: "Les modifications ont été enregistrées.",
          });
          router.push("/cms/users");
          router.refresh();
        } else {
          toast.error("Erreur", {
            description: result.error ?? result.message ?? "Une erreur est survenue.",
          });
        }
      } else {
        const result = await createUser(data as CreateFormData);

        if (result.success) {
          toast.success("Utilisateur créé", {
            description: "L'utilisateur a été créé avec succès.",
          });
          router.push("/cms/users");
          router.refresh();
        } else {
          toast.error("Erreur", {
            description: result.error ?? result.message ?? "Une erreur est survenue.",
          });
        }
      }
    } catch (error) {
      toast.error("Erreur", {
        description: "Une erreur est survenue lors de l'enregistrement.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle>Informations personnelles</CardTitle>
                <CardDescription>
                  Les informations de base de l&apos;utilisateur
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prénom *</FormLabel>
                        <FormControl>
                          <Input placeholder="Jean" {...field} />
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
                        <FormLabel>Nom *</FormLabel>
                        <FormControl>
                          <Input placeholder="Dupont" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="jean.dupont@example.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Security */}
            <Card>
              <CardHeader>
                <CardTitle>Sécurité</CardTitle>
                <CardDescription>
                  {isEditing
                    ? "Laissez vide pour conserver le mot de passe actuel"
                    : "Définissez le mot de passe de l'utilisateur"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Mot de passe {!isEditing && "*"}
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder={isEditing ? "Nouveau mot de passe (optionnel)" : "Mot de passe"}
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            className="absolute right-2 top-1/2 -translate-y-1/2"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="size-4" />
                            ) : (
                              <Eye className="size-4" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormDescription>
                        8 caractères minimum avec une majuscule, une minuscule et un chiffre
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Role */}
            <Card>
              <CardHeader>
                <CardTitle>Rôle</CardTitle>
                <CardDescription>
                  Définit les permissions de l&apos;utilisateur
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rôle *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isCurrentUser}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez un rôle" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {roleOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {isCurrentUser && (
                        <FormDescription>
                          Vous ne pouvez pas modifier votre propre rôle
                        </FormDescription>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Status */}
            {isEditing && (
              <Card>
                <CardHeader>
                  <CardTitle>Statut</CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <FormLabel>Compte actif</FormLabel>
                          <FormDescription>
                            L&apos;utilisateur peut se connecter
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={isCurrentUser}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  {isCurrentUser && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Vous ne pouvez pas désactiver votre propre compte
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col gap-2">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && (
                      <Loader2 className="size-4 mr-2 animate-spin" />
                    )}
                    {isEditing ? "Mettre à jour" : "Créer l'utilisateur"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={isSubmitting}
                  >
                    Annuler
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </Form>
  );
}
