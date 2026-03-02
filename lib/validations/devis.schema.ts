import { z } from "zod";
import { DevisStatus } from "@/types/models.types";

const devisClientSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone is required"),
  address: z.string().optional(),
  city: z.string().optional(),
});

const devisItemSchema = z.object({
  productId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
  categoryId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
  description: z.string().min(1, "Item description is required"),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
  dimensions: z.string().optional(),
  notes: z.string().optional(),
});

export const createDevisSchema = z.object({
  client: devisClientSchema,
  items: z.array(devisItemSchema).min(1, "At least one item is required"),
  notes: z.string().max(2000).optional(),
  attachments: z.array(z.string()).optional().default([]),
});

export const updateDevisSchema = z.object({
  client: devisClientSchema.partial().optional(),
  items: z.array(devisItemSchema).min(1).optional(),
  notes: z.string().max(2000).optional(),
  adminNotes: z.string().max(2000).optional(),
  assignedTo: z.string().regex(/^[0-9a-fA-F]{24}$/).optional().nullable(),
  estimatedPrice: z.number().min(0).optional(),
  estimatedDate: z.string().datetime().optional(),
  attachments: z.array(z.string()).optional(),
});

export const updateDevisStatusSchema = z.object({
  status: z.nativeEnum(DevisStatus),
  adminNotes: z.string().max(2000).optional(),
});

export const devisQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  sortBy: z.enum(["reference", "createdAt", "updatedAt", "status"]).optional().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
  status: z.nativeEnum(DevisStatus).optional(),
  assignedTo: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  search: z.string().min(1).max(100).optional(),
});

export type CreateDevisInput = z.infer<typeof createDevisSchema>;
export type UpdateDevisInput = z.infer<typeof updateDevisSchema>;
export type UpdateDevisStatusInput = z.infer<typeof updateDevisStatusSchema>;
export type DevisQueryInput = z.infer<typeof devisQuerySchema>;
