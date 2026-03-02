import type { Metadata } from "next"
import connectDB from "@/lib/db/connection"
import { BlogPost } from "@/lib/db/models"
import { JsonLd } from "@/components/seo/json-ld"

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://bmwood.tn"

interface BlogArticleLayoutProps {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}

export async function generateMetadata({
  params,
}: BlogArticleLayoutProps): Promise<Metadata> {
  const { slug } = await params

  try {
    await connectDB()
    const blog = await BlogPost.findOne({ slug, isPublished: true }).lean()

    if (!blog) {
      return {
        title: "Article non trouvé",
      }
    }

    const title = blog.title
    const description =
      blog.excerpt?.slice(0, 160) ||
      blog.content?.slice(0, 160).replace(/#{1,6}\s/g, "").trim() ||
      `Lire ${blog.title} sur le blog BM Wood.`

    return {
      title,
      description,
      alternates: {
        canonical: `${BASE_URL}/blog/${slug}`,
      },
      openGraph: {
        url: `${BASE_URL}/blog/${slug}`,
        title: `${title} | BM Wood`,
        description,
        type: "article",
        publishedTime: blog.publishedAt
          ? new Date(blog.publishedAt).toISOString()
          : undefined,
        modifiedTime: blog.updatedAt
          ? new Date(blog.updatedAt).toISOString()
          : undefined,
        images: blog.coverImage ? [blog.coverImage] : undefined,
      },
      twitter: {
        card: "summary_large_image",
        title: `${title} | BM Wood`,
        description,
        images: blog.coverImage ? [blog.coverImage] : undefined,
      },
    }
  } catch {
    return {
      title: "Blog | BM Wood",
    }
  }
}

export default async function BlogArticleLayout({
  children,
  params,
}: BlogArticleLayoutProps) {
  const { slug } = await params

  let jsonLd: object | object[] | null = null
  try {
    await connectDB()
    const blog = await BlogPost.findOne({ slug, isPublished: true }).lean()
    if (blog) {
      jsonLd = [
        {
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: blog.title,
          description: blog.excerpt || blog.content?.slice(0, 200),
          image: blog.coverImage ? [blog.coverImage] : undefined,
          datePublished: blog.publishedAt
            ? new Date(blog.publishedAt).toISOString()
            : undefined,
          dateModified: blog.updatedAt
            ? new Date(blog.updatedAt).toISOString()
            : undefined,
          author: {
            "@type": "Organization",
            name: "BM Wood",
            url: BASE_URL,
          },
          publisher: {
            "@type": "Organization",
            name: "BM Wood",
            logo: {
              "@type": "ImageObject",
              url: `${BASE_URL}/logo-bmwood.svg`,
            },
          },
          mainEntityOfPage: {
            "@type": "WebPage",
            "@id": `${BASE_URL}/blog/${slug}`,
          },
        },
        {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Accueil", item: BASE_URL },
            { "@type": "ListItem", position: 2, name: "Blog", item: `${BASE_URL}/blog` },
            { "@type": "ListItem", position: 3, name: blog.title, item: `${BASE_URL}/blog/${slug}` },
          ],
        },
      ]
    }
  } catch {
    // Ignore
  }

  return (
    <>
      {jsonLd && <JsonLd data={jsonLd} />}
      {children}
    </>
  )
}
