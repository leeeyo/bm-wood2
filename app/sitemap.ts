import type { MetadataRoute } from "next"
import connectDB from "@/lib/db/connection"
import { Product, Category, BlogPost } from "@/lib/db/models"

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://bmwood.tn"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/catalogue`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/demander-un-devis`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/realisations`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.85,
    },
  ]

  try {
    await connectDB()

    const [products, categories, blogPosts] = await Promise.all([
      Product.find({ isActive: true }).select("slug updatedAt").lean(),
      Category.find({ isActive: true }).select("slug updatedAt").lean(),
      BlogPost.find({ isPublished: true }).select("slug updatedAt publishedAt").lean(),
    ])

    const productEntries: MetadataRoute.Sitemap = products.map((p) => ({
      url: `${BASE_URL}/produits/${p.slug}`,
      lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }))

    const categoryEntries: MetadataRoute.Sitemap = categories.map((c) => ({
      url: `${BASE_URL}/catalogue/${c.slug}`,
      lastModified: c.updatedAt ? new Date(c.updatedAt) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.85,
    }))

    const blogEntries: MetadataRoute.Sitemap = blogPosts.map((b) => ({
      url: `${BASE_URL}/blog/${b.slug}`,
      lastModified:
        (b.publishedAt && new Date(b.publishedAt)) ||
        (b.updatedAt && new Date(b.updatedAt)) ||
        new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }))

    return [...staticRoutes, ...categoryEntries, ...productEntries, ...blogEntries]
  } catch {
    return staticRoutes
  }
}
