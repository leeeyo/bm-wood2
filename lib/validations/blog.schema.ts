import { z } from "zod";

export const createBlogPostSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title cannot exceed 200 characters"),
  slug: z
    .string()
    .optional()
    .transform((val) => (val === "" || !val ? undefined : val))
    .refine(
      (val) => !val || /^[a-z0-9-]+$/.test(val),
      "Slug can only contain lowercase letters, numbers, and hyphens"
    ),
  excerpt: z
    .string()
    .max(500, "Excerpt cannot exceed 500 characters")
    .optional(),
  content: z
    .string()
    .min(1, "Content is required"),
  coverImage: z
    .string()
    .optional()
    .refine(
      (val) =>
        !val ||
        val.startsWith("/") ||
        val.startsWith("http://") ||
        val.startsWith("https://"),
      "Cover image must be a valid URL or path"
    ),
  isPublished: z.boolean().optional().default(false),
  publishedAt: z
    .union([z.string(), z.date()])
    .optional()
    .nullable()
    .transform((val) => {
      if (val === "" || val === undefined || val === null) return null;
      return val instanceof Date ? val : new Date(val);
    }),
  authorId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid author ID")
    .optional()
    .nullable(),
});

export const updateBlogPostSchema = createBlogPostSchema.partial();

export const blogQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(12),
  isPublished: z
    .enum(["true", "false"])
    .optional()
    .transform((val) => (val === "true" ? true : val === "false" ? false : undefined)),
  sortBy: z.enum(["publishedAt", "createdAt", "title"]).optional().default("publishedAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

export type CreateBlogPostInput = z.infer<typeof createBlogPostSchema>;
export type UpdateBlogPostInput = z.infer<typeof updateBlogPostSchema>;
export type BlogQueryInput = z.infer<typeof blogQuerySchema>;
