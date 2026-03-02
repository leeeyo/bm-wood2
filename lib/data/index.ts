import mongoose from "mongoose"
import connectDB from "@/lib/db/connection"
import { Product, Category, BlogPost } from "@/lib/db/models"
import type { IProduct, ICategory, IBlogPost } from "@/types/models.types"

const DEFAULT_PAGE_SIZE = 12

export interface PaginatedResult<T> {
  data: T[]
  pagination: {
    page: number
    totalPages: number
    total: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export async function getCategories(): Promise<ICategory[]> {
  await connectDB()
  const categories = await Category.find({ isActive: true })
    .sort({ order: 1, createdAt: -1 })
    .lean<ICategory[]>()
  return categories
}

export async function getProducts(options: {
  page?: number
  limit?: number
  categoryId?: string
  search?: string
  sortBy?: "name" | "createdAt" | "updatedAt"
  sortOrder?: "asc" | "desc"
}): Promise<PaginatedResult<IProduct>> {
  await connectDB()

  const page = options.page ?? 1
  const limit = options.limit ?? DEFAULT_PAGE_SIZE
  const sortBy = options.sortBy ?? "createdAt"
  const sortOrder = options.sortOrder ?? "desc"

  const filter: Record<string, unknown> = { isActive: true }
  if (options.categoryId) {
    filter.categoryId = new mongoose.Types.ObjectId(options.categoryId)
  }
  if (options.search?.trim()) {
    filter.$text = { $search: options.search.trim() }
  }

  const skip = (page - 1) * limit
  const total = await Product.countDocuments(filter)
  const totalPages = Math.ceil(total / limit)

  const sort: Record<string, 1 | -1> = {
    [sortBy]: sortOrder === "asc" ? 1 : -1,
  }

  const data = await Product.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .populate("categoryId", "name slug")
    .lean<IProduct[]>()

  return {
    data,
    pagination: {
      page,
      totalPages,
      total,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  }
}

export async function getProductBySlug(slug: string): Promise<IProduct | null> {
  await connectDB()
  const product = await Product.findOne({ slug, isActive: true })
    .populate("categoryId", "name slug")
    .lean<IProduct>()
  return product
}

export async function getCategoryBySlug(slug: string): Promise<ICategory | null> {
  await connectDB()
  const category = await Category.findOne({ slug, isActive: true }).lean<ICategory>()
  return category
}

export async function getBlogs(options: {
  page?: number
  limit?: number
}): Promise<PaginatedResult<IBlogPost>> {
  await connectDB()

  const page = options.page ?? 1
  const limit = options.limit ?? DEFAULT_PAGE_SIZE

  const filter = { isPublished: true }
  const skip = (page - 1) * limit
  const total = await BlogPost.countDocuments(filter)
  const totalPages = Math.ceil(total / limit)

  const data = await BlogPost.find(filter)
    .sort({ publishedAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("authorId", "firstName lastName")
    .lean<IBlogPost[]>()

  return {
    data,
    pagination: {
      page,
      totalPages,
      total,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  }
}

export async function getBlogBySlug(slug: string): Promise<IBlogPost | null> {
  await connectDB()
  const blog = await BlogPost.findOne({ slug, isPublished: true })
    .populate("authorId", "firstName lastName")
    .lean<IBlogPost>()
  return blog
}
