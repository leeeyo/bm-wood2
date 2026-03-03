"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SafeImage } from "@/components/ui/safe-image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { IBlogPost } from "@/types/models.types";
import { createBlogPostSchema, CreateBlogPostInput } from "@/lib/validations/blog.schema";
import { createBlog, updateBlog } from "@/lib/api/blogs";
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

interface BlogFormProps {
  blog?: IBlogPost;
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function BlogForm({ blog }: BlogFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coverImage, setCoverImage] = useState<string | undefined>(blog?.coverImage);
  const [isUploading, setIsUploading] = useState(false);

  const isEditing = !!blog;

  const form = useForm<CreateBlogPostInput>({
    resolver: zodResolver(createBlogPostSchema),
    defaultValues: {
      title: blog?.title ?? "",
      slug: blog?.slug ?? "",
      excerpt: blog?.excerpt ?? "",
      content: blog?.content ?? "",
      coverImage: blog?.coverImage ?? undefined,
      isPublished: blog?.isPublished ?? false,
      publishedAt: blog?.publishedAt ? new Date(blog.publishedAt) : undefined,
    },
  });

  useEffect(() => {
    if (blog) {
      form.reset({
        title: blog.title,
        slug: blog.slug,
        excerpt: blog.excerpt ?? "",
        content: blog.content,
        coverImage: blog.coverImage ?? undefined,
        isPublished: blog.isPublished ?? false,
        publishedAt: blog.publishedAt ? new Date(blog.publishedAt) : undefined,
      });
      setCoverImage(blog.coverImage);
    }
  }, [blog, form]);

  const handleTitleChange = (title: string) => {
    if (!isEditing && title) {
      form.setValue("slug", generateSlug(title));
    }
  };

  const handleImageUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;

      const file = files[0];
      setIsUploading(true);

      try {
        const result = await uploadFile(file);
        if (result.success && result.data) {
          setCoverImage(result.data.url);
          form.setValue("coverImage", result.data.url);
          toast.success("Image téléchargée", {
            description: "L'image de couverture a été téléchargée avec succès.",
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
        e.target.value = "";
      }
    },
    [form]
  );

  const removeImage = () => {
    setCoverImage(undefined);
    form.setValue("coverImage", undefined);
  };

  const onSubmit = async (data: CreateBlogPostInput) => {
    setIsSubmitting(true);

    try {
      const submitData: CreateBlogPostInput = {
        ...data,
        coverImage,
        publishedAt: data.publishedAt
          ? data.publishedAt
          : data.isPublished
            ? new Date()
            : null,
      };

      const result = isEditing
        ? await updateBlog(blog._id.toString(), submitData)
        : await createBlog(submitData);

      if (result.success) {
        toast.success(
          isEditing ? "Article mis à jour" : "Article créé",
          {
            description: isEditing
              ? "Les modifications ont été enregistrées."
              : "L'article a été créé avec succès.",
          }
        );
        router.push("/cms/blogs");
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
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Contenu</CardTitle>
                <CardDescription>
                  Le titre et le contenu de l&apos;article
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Titre *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex: Notre nouvelle collection"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            handleTitleChange(e.target.value);
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
                          placeholder="notre-nouvelle-collection"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        URL-friendly identifier. Auto-généré à partir du titre si laissé vide.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="excerpt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Extrait</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Courte description pour les aperçus..."
                          className="min-h-[80px]"
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

                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contenu (Markdown) *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="# Titre&#10;&#10;Écrivez votre article en Markdown..."
                          className="min-h-[400px] font-mono text-sm"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Markdown supporté : titres, listes, liens, images, etc.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Image de couverture</CardTitle>
                <CardDescription>
                  Image représentative de l&apos;article
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-4">
                  {coverImage ? (
                    <div className="relative w-40 h-40 rounded-lg overflow-hidden bg-muted group">
                      <SafeImage
                        src={coverImage}
                        alt="Cover"
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

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Publication</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="isPublished"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <FormLabel>Publié</FormLabel>
                        <FormDescription>
                          Visible sur le blog public
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
                  name="publishedAt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date de publication</FormLabel>
                      <FormControl>
                        <Input
                          type="datetime-local"
                          value={
                            field.value
                              ? (field.value instanceof Date
                                  ? field.value
                                  : new Date(field.value as string)
                                ).toISOString().slice(0, 16)
                              : ""
                          }
                          onChange={(e) =>
                            field.onChange(
                              e.target.value ? new Date(e.target.value) : undefined
                            )
                          }
                        />
                      </FormControl>
                      <FormDescription>
                        Optionnel. Par défaut : maintenant si publié.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col gap-2">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && (
                      <Loader2 className="size-4 mr-2 animate-spin" />
                    )}
                    {isEditing ? "Mettre à jour" : "Créer l'article"}
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
