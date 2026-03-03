import { z } from "zod";

export const createCategorySchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name cannot exceed 100 characters"),
  slug: z
    .string()
    .optional()
    .transform((val) => (val === "" || !val ? undefined : val))
    .refine(
      (val) => !val || /^[a-z0-9-]+$/.test(val),
      "Slug can only contain lowercase letters, numbers, and hyphens"
    ),
  description: z
    .string()
    .max(500, "Description cannot exceed 500 characters")
    .optional(),
  image: z
    .string()
    .optional()
    .refine(
      (val) =>
        !val ||
        val.startsWith("/") ||
        val.startsWith("http://") ||
        val.startsWith("https://"),
      "Image must be a valid URL or path (e.g. /images/... or https://...)"
    ),
  isActive: z.boolean().optional().default(true),
  order: z.number().int().min(0).optional().default(0),
});

export const updateCategorySchema = createCategorySchema.partial();

export const categoryQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(500).optional().default(500),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CategoryQueryInput = z.infer<typeof categoryQuerySchema>;