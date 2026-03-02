"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { ICategory } from "@/types/models.types";
import { createCategorySchema, CreateCategoryInput } from "@/lib/validations/category.schema";
import { createCategory, updateCategory } from "@/lib/api/categories";
import { uploadFile } from "@/lib/api/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

interface CategoryFormProps {
  category?: ICategory;
}

// Helper to generate slug from name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function CategoryForm({ category }: CategoryFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [image, setImage] = useState<string | undefined>(category?.image);
  const [isUploading, setIsUploading] = useState(false);

  const isEditing = !!category;

  const form = useForm<CreateCategoryInput>({
    resolver: zodResolver(createCategorySchema),
    defaultValues: {
      name: category?.name ?? "",
      slug: category?.slug ?? "",
      description: category?.description ?? "",
      image: category?.image ?? undefined,
      isActive: category?.isActive ?? true,
      order: category?.order ?? 0,
    },
  });

  // Reset form when category loads (e.g. after async fetch)
  useEffect(() => {
    if (category) {
      form.reset({
        name: category.name,
        slug: category.slug,
        description: category.description ?? "",
        image: category.image ?? undefined,
        isActive: category.isActive ?? true,
        order: category.order ?? 0,
      });
      setImage(category.image);
    }
  }, [category, form]);

  // Auto-generate slug when name changes (only for new categories)
  const handleNameChange = (name: string) => {
    if (!isEditing && name) {
      const slug = generateSlug(name);
      form.setValue("slug", slug);
    }
  };

  // Handle image upload
  const handleImageUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;

      const file = files[0];
      setIsUploading(true);

      try {
        const result = await uploadFile(file);
        if (result.success && result.data) {
          setImage(result.data.url);
          form.setValue("image", result.data.url);
          toast.success("Image téléchargée", {
            description: "L'image a été téléchargée avec succès.",
          });
        } else {
          toast.error("Erreur", {
            description: result.error ?? "Échec du téléchargement de l'image.",
          });
        }
      } catch (error) {
        toast.error("Erreur", {
          description: "Une erreur est survenue lors du téléchargement.",
        });
      } finally {
        setIsUploading(false);
        // Reset the input
        e.target.value = "";
      }
    },
    [form]
  );

  // Remove image
  const removeImage = () => {
    setImage(undefined);
    form.setValue("image", undefined);
  };

  // Handle form submission
  const onSubmit = async (data: CreateCategoryInput) => {
    setIsSubmitting(true);

    try {
      // Prepare data with current image
      const submitData: CreateCategoryInput = {
        ...data,
        image: image,
      };

      const result = isEditing
        ? await updateCategory(category._id.toString(), submitData)
        : await createCategory(submitData);

      if (result.success) {
        toast.success(isEditing ? "Catégorie mise à jour" : "Catégorie créée", {
          description: isEditing
            ? "Les modifications ont été enregistrées."
            : "La catégorie a été créée avec succès.",
        });
        router.push("/cms/categories");
        router.refresh();
      } else {
        toast.error("Erreur", {
          description: result.error ?? result.message ?? "Une erreur est survenue.",
        });
      }
    } catch (error) {
      toast.error("Erreur", {
        description: "Une erreur est survenue lors de l'enregistrement.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onInvalid = (errors: Record<string, { message?: string }>) => {
    const firstError = Object.values(errors)[0]?.message;
    toast.error("Erreur de validation", {
      description: firstError ?? "Vérifiez les champs du formulaire.",
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, onInvalid)}
        className="space-y-6"
      >
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Informations générales</CardTitle>
                <CardDescription>
                  Les informations de base de la catégorie
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom de la catégorie *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex: Mobilier intérieur"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            handleNameChange(e.target.value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="mobilier-interieur"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        URL-friendly identifier. Auto-généré si laissé vide.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Décrivez la catégorie..."
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Maximum 500 caractères
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Image */}
            <Card>
              <CardHeader>
                <CardTitle>Image</CardTitle>
                <CardDescription>
                  Image représentative de la catégorie
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-4">
                  {image ? (
                    <div className="relative w-40 h-40 rounded-lg overflow-hidden bg-muted group">
                      <Image
                        src={image}
                        alt="Category image"
                        fill
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-2 right-2 p-1 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-40 h-40 rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 cursor-pointer transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                        disabled={isUploading}
                      />
                      {isUploading ? (
                        <Loader2 className="size-8 text-muted-foreground animate-spin" />
                      ) : (
                        <>
                          <Upload className="size-8 text-muted-foreground mb-2" />
                          <span className="text-xs text-muted-foreground text-center px-2">
                            Cliquez pour ajouter une image
                          </span>
                        </>
                      )}
                    </label>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status */}
            <Card>
              <CardHeader>
                <CardTitle>Publication</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <FormLabel>Actif</FormLabel>
                        <FormDescription>
                          Visible sur le site
                        </FormDescription>
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

                <FormField
                  control={form.control}
                  name="order"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ordre d&apos;affichage</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          placeholder="0"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormDescription>
                        Plus le nombre est petit, plus la catégorie apparaît en premier
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col gap-2">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && (
                      <Loader2 className="size-4 mr-2 animate-spin" />
                    )}
                    {isEditing ? "Mettre à jour" : "Créer la catégorie"}
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
