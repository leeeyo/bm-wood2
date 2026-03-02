import { Types } from "mongoose";

// ============ Enums ============

export enum UserRole {
  ADMIN = "admin",
  MANAGER = "manager",
  STAFF = "staff",
}

export enum DevisStatus {
  PENDING = "pending",
  REVIEWED = "reviewed",
  APPROVED = "approved",
  REJECTED = "rejected",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
}

export enum MediaType {
  IMAGE = "image",
  DOCUMENT = "document",
}

// ============ Base Types ============

export interface BaseDocument {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// ============ User Types ============

export interface IUser extends BaseDocument {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  refreshToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  isActive: boolean;
}

export interface IUserPublic {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateUserInput = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
};

export type UpdateUserInput = Partial<Omit<CreateUserInput, "password">> & {
  password?: string;
  isActive?: boolean;
};

// ============ Category Types ============

export interface ICategory extends BaseDocument {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  isActive: boolean;
  order: number;
}

export type CreateCategoryInput = {
  name: string;
  slug?: string;
  description?: string;
  image?: string;
  isActive?: boolean;
  order?: number;
};

export type UpdateCategoryInput = Partial<CreateCategoryInput>;

// ============ Product Types ============

export interface ProductSpecifications {
  dimensions?: string;
  materials?: string[];
  colors?: string[];
  customizable?: boolean;
  [key: string]: string | string[] | boolean | undefined;
}

export interface IProduct extends BaseDocument {
  name: string;
  slug: string;
  description?: string;
  categoryId: Types.ObjectId;
  images: string[];
  specifications?: ProductSpecifications;
  isFeatured: boolean;
  isActive: boolean;
  createdBy?: Types.ObjectId;
}

export type CreateProductInput = {
  name: string;
  slug?: string;
  description?: string;
  categoryId: string;
  images?: string[];
  specifications?: ProductSpecifications;
  isFeatured?: boolean;
  isActive?: boolean;
};

export type UpdateProductInput = Partial<CreateProductInput>;

// ============ Devis (Quote) Types ============

export interface DevisClient {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
}

export interface DevisItem {
  productId?: string;
  categoryId?: string;
  description: string;
  quantity: number;
  dimensions?: string;
  notes?: string;
}

export interface IDevis extends BaseDocument {
  reference: string;
  client: DevisClient;
  items: DevisItem[];
  status: DevisStatus;
  notes?: string;
  adminNotes?: string;
  assignedTo?: Types.ObjectId;
  estimatedPrice?: number;
  estimatedDate?: Date;
  attachments: string[];
}

export type CreateDevisInput = {
  client: DevisClient;
  items: DevisItem[];
  notes?: string;
  attachments?: string[];
};

export type UpdateDevisInput = {
  client?: Partial<DevisClient>;
  items?: DevisItem[];
  notes?: string;
  adminNotes?: string;
  assignedTo?: string;
  estimatedPrice?: number;
  estimatedDate?: Date;
  attachments?: string[];
};

export type UpdateDevisStatusInput = {
  status: DevisStatus;
  adminNotes?: string;
};

// ============ Media Types ============

export interface IMedia extends BaseDocument {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  url: string;
  type: MediaType;
  uploadedBy?: Types.ObjectId;
}

export type CreateMediaInput = {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  url: string;
  type: MediaType;
  uploadedBy?: string;
};

// ============ Blog Post Types ============

export interface IBlogPost extends BaseDocument {
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  coverImage?: string;
  isPublished: boolean;
  publishedAt?: Date | null;
  authorId?: Types.ObjectId | null;
}
