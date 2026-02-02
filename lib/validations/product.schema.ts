import { z } from "zod";

const productSpecificationsSchema = z.object({
  dimensions: z.string().optional(),
  materials: z.array(z.string()).optional(),
  colors: z.array(z.string()).optional(),
  customizable: z.boolean().optional(),
}).passthrough();

export const createProductSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(200, "Name cannot exceed 200 characters"),
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens")
    .optional(),
  description: z
    .string()
    .max(2000, "Description cannot exceed 2000 characters")
    .optional(),
  categoryId: z
    .string()
    .min(1, "Category is required")
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid category ID"),
  images: z.array(z.string()).optional().default([]),
  specifications: productSpecificationsSchema.optional(),
  isFeatured: z.boolean().optional().default(false),
  isActive: z.boolean().optional().default(true),
});

export const updateProductSchema = createProductSchema.partial();

export const productQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  sortBy: z.enum(["name", "createdAt", "updatedAt"]).optional().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
  categoryId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
  isFeatured: z.coerce.boolean().optional(),
  isActive: z.coerce.boolean().optional(),
  search: z.string().optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductQueryInput = z.infer<typeof productQuerySchema>;
