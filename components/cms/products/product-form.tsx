"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { SafeImage } from "@/components/ui/safe-image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Upload, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { IProduct, ICategory } from "@/types/models.types";
import { createProductSchema, CreateProductInput } from "@/lib/validations/product.schema";
import { createProduct, updateProduct, uploadFile } from "@/lib/api/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ProductFormProps {
  product?: IProduct;
  categories: ICategory[];
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

export function ProductForm({ product, categories }: ProductFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [isUploading, setIsUploading] = useState(false);
  const [materials, setMaterials] = useState<string[]>(
    product?.specifications?.materials ?? []
  );
  const [colors, setColors] = useState<string[]>(
    product?.specifications?.colors ?? []
  );
  const [newMaterial, setNewMaterial] = useState("");
  const [newColor, setNewColor] = useState("");

  const isEditing = !!product;

  // Get the category ID from the populated product
  const getDefaultCategoryId = (): string => {
    if (!product?.categoryId) return "";
    const categoryId = product.categoryId as unknown;
    if (typeof categoryId === "object" && categoryId !== null && "_id" in categoryId) {
      return (categoryId as { _id: string })._id.toString();
    }
    return String(categoryId);
  };

  const form = useForm<CreateProductInput>({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      name: product?.name ?? "",
      slug: product?.slug ?? "",
      description: product?.description ?? "",
      categoryId: getDefaultCategoryId(),
      images: product?.images ?? [],
      specifications: {
        dimensions: product?.specifications?.dimensions ?? "",
        materials: product?.specifications?.materials ?? [],
        colors: product?.specifications?.colors ?? [],
        customizable: product?.specifications?.customizable ?? false,
      },
      isFeatured: product?.isFeatured ?? false,
      isActive: product?.isActive ?? true,
    },
  });

  // Auto-generate slug when name changes (only for new products)
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

      setIsUploading(true);
      const uploadPromises = Array.from(files).map(async (file) => {
        const result = await uploadFile(file);
        if (result.success && result.data) {
          return result.data.url;
        }
        toast.error("Erreur", {
          description: `Échec du téléchargement de ${file.name}`,
        });
        return null;
      });

      try {
        const results = await Promise.all(uploadPromises);
        const uploadedUrls = results.filter((url): url is string => url !== null);
        const newImages = [...images, ...uploadedUrls];
        setImages(newImages);
        form.setValue("images", newImages);
        if (uploadedUrls.length > 0) {
          toast.success("Images téléchargées", {
            description: `${uploadedUrls.length} image(s) ajoutée(s) avec succès.`,
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
    [images, form]
  );

  // Remove image
  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    form.setValue("images", newImages);
  };

  // Add material
  const addMaterial = () => {
    if (newMaterial.trim() && !materials.includes(newMaterial.trim())) {
      const updated = [...materials, newMaterial.trim()];
      setMaterials(updated);
      form.setValue("specifications.materials", updated);
      setNewMaterial("");
    }
  };

  // Remove material
  const removeMaterial = (index: number) => {
    const updated = materials.filter((_, i) => i !== index);
    setMaterials(updated);
    form.setValue("specifications.materials", updated);
  };

  // Add color
  const addColor = () => {
    if (newColor.trim() && !colors.includes(newColor.trim())) {
      const updated = [...colors, newColor.trim()];
      setColors(updated);
      form.setValue("specifications.colors", updated);
      setNewColor("");
    }
  };

  // Remove color
  const removeColor = (index: number) => {
    const updated = colors.filter((_, i) => i !== index);
    setColors(updated);
    form.setValue("specifications.colors", updated);
  };

  // Handle form submission
  const onSubmit = async (data: CreateProductInput) => {
    setIsSubmitting(true);

    try {
      // Prepare data with current images and specifications
      const submitData: CreateProductInput = {
        ...data,
        images,
        specifications: {
          dimensions: data.specifications?.dimensions || undefined,
          materials: materials.length > 0 ? materials : undefined,
          colors: colors.length > 0 ? colors : undefined,
          customizable: data.specifications?.customizable || false,
        },
      };

      const result = isEditing
        ? await updateProduct(product._id.toString(), submitData)
        : await createProduct(submitData);

      if (result.success) {
        toast.success(isEditing ? "Produit mis à jour" : "Produit créé", {
          description: isEditing
            ? "Les modifications ont été enregistrées."
            : "Le produit a été créé avec succès.",
        });
        router.push("/cms/products");
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Mobile: Actions at top */}
        <div className="lg:hidden">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col gap-2">
                <Button type="submit" disabled={isSubmitting} className="w-full h-11">
                  {isSubmitting && (
                    <Loader2 className="size-4 mr-2 animate-spin" />
                  )}
                  {isEditing ? "Mettre à jour" : "Créer le produit"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isSubmitting}
                  className="w-full h-11"
                >
                  Annuler
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Informations générales</CardTitle>
                <CardDescription>
                  Les informations de base du produit
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom du produit *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex: Table en chêne massif"
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
                          placeholder="table-en-chene-massif"
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
                          placeholder="Décrivez le produit..."
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Catégorie *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Sélectionner une catégorie" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem
                              key={category._id.toString()}
                              value={category._id.toString()}
                            >
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Images */}
            <Card>
              <CardHeader>
                <CardTitle>Images</CardTitle>
                <CardDescription>
                  Ajoutez des images pour présenter le produit
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {images.map((url, index) => (
                    <div
                      key={index}
                      className="relative aspect-square rounded-lg overflow-hidden bg-muted group"
                    >
                      <SafeImage
                        src={url}
                        alt={`Image ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 p-1 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                  ))}
                  <label className="flex flex-col items-center justify-center aspect-square rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 cursor-pointer transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={isUploading}
                    />
                    {isUploading ? (
                      <Loader2 className="size-8 text-muted-foreground animate-spin" />
                    ) : (
                      <>
                        <Upload className="size-8 text-muted-foreground mb-2" />
                        <span className="text-xs text-muted-foreground">
                          Ajouter
                        </span>
                      </>
                    )}
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* Specifications */}
            <Card>
              <CardHeader>
                <CardTitle>Spécifications</CardTitle>
                <CardDescription>
                  Détails techniques du produit
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="specifications.dimensions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dimensions</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex: 180 x 90 x 75 cm"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Materials */}
                <div className="space-y-2">
                  <Label>Matériaux</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Ex: Chêne"
                      value={newMaterial}
                      onChange={(e) => setNewMaterial(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addMaterial();
                        }
                      }}
                    />
                    <Button type="button" variant="outline" onClick={addMaterial}>
                      <Plus className="size-4" />
                    </Button>
                  </div>
                  {materials.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {materials.map((material, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-secondary text-secondary-foreground text-sm"
                        >
                          {material}
                          <button
                            type="button"
                            onClick={() => removeMaterial(index)}
                            className="hover:text-destructive"
                          >
                            <X className="size-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Colors */}
                <div className="space-y-2">
                  <Label>Couleurs disponibles</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Ex: Naturel"
                      value={newColor}
                      onChange={(e) => setNewColor(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addColor();
                        }
                      }}
                    />
                    <Button type="button" variant="outline" onClick={addColor}>
                      <Plus className="size-4" />
                    </Button>
                  </div>
                  {colors.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {colors.map((color, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-secondary text-secondary-foreground text-sm"
                        >
                          {color}
                          <button
                            type="button"
                            onClick={() => removeColor(index)}
                            className="hover:text-destructive"
                          >
                            <X className="size-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <FormField
                  control={form.control}
                  name="specifications.customizable"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Personnalisable</FormLabel>
                        <FormDescription>
                          Ce produit peut être personnalisé sur mesure
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
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Desktop only */}
          <div className="hidden lg:block space-y-6">
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
                  name="isFeatured"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <FormLabel>Mis en avant</FormLabel>
                        <FormDescription>
                          Afficher en vedette
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
                    {isEditing ? "Mettre à jour" : "Créer le produit"}
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

        {/* Mobile: Publication settings at bottom */}
        <div className="lg:hidden">
          <Card>
            <CardHeader>
              <CardTitle>Publication</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Actif</FormLabel>
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
                name="isFeatured"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Mis en avant</FormLabel>
                      <FormDescription>
                        Afficher en vedette
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
            </CardContent>
          </Card>
        </div>
      </form>
    </Form>
  );
}
