import type { Metadata } from "next"
import connectDB from "@/lib/db/connection"
import { Product } from "@/lib/db/models"
import { JsonLd } from "@/components/seo/json-ld"

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://bmwood.tn"

interface ProductLayoutProps {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}

export async function generateMetadata({
  params,
}: ProductLayoutProps): Promise<Metadata> {
  const { slug } = await params

  try {
    await connectDB()
    const product = await Product.findOne({ slug, isActive: true })
      .populate("categoryId", "name slug")
      .lean()

    if (!product) {
      return {
        title: "Produit non trouvé",
      }
    }

    const category = product.categoryId as unknown as { name?: string; slug?: string } | undefined
    const categoryName = category && typeof category === "object" && "name" in category ? category.name : undefined
    const title = `${product.name}${categoryName ? ` | ${categoryName}` : ""}`
    const description =
      product.description?.slice(0, 160) ||
      `Découvrez ${product.name} - Menuiserie sur mesure par BM Wood`

    const canonical = `${BASE_URL}/produits/${slug}`

    return {
      title,
      description,
      alternates: {
        canonical,
      },
      openGraph: {
        url: canonical,
        type: "website",
        siteName: "BM Wood",
        locale: "fr_FR",
        title: `${title} | BM Wood`,
        description,
        images: product.images?.[0] ? [product.images[0]] : undefined,
      },
      twitter: {
        card: "summary_large_image",
        title: `${title} | BM Wood`,
        description,
        images: product.images?.[0] ? [product.images[0]] : undefined,
      },
    }
  } catch {
    return {
      title: "Produit",
    }
  }
}

export default async function ProductLayout({
  children,
  params,
}: ProductLayoutProps) {
  const { slug } = await params

  let jsonLd: object | object[] | null = null
  try {
    await connectDB()
    const product = await Product.findOne({ slug, isActive: true })
      .populate("categoryId", "name slug")
      .lean()

    if (product) {
      const category = product.categoryId as unknown as { name?: string; slug?: string } | undefined
      const categoryName = category && typeof category === "object" && "name" in category ? category.name : undefined
      const categorySlug = category && typeof category === "object" && "slug" in category ? category.slug : undefined

      jsonLd = [
        {
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.name,
          description: product.description || `Menuiserie sur mesure - ${product.name}`,
          image: product.images?.length ? product.images : undefined,
          brand: {
            "@type": "Brand",
            name: "BM Wood",
          },
          category: categoryName,
        },
        {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Accueil", item: BASE_URL },
            { "@type": "ListItem", position: 2, name: "Catalogue", item: `${BASE_URL}/catalogue` },
            ...(categoryName && categorySlug
              ? [
                  {
                    "@type": "ListItem" as const,
                    position: 3,
                    name: categoryName,
                    item: `${BASE_URL}/catalogue/${categorySlug}`,
                  },
                  {
                    "@type": "ListItem" as const,
                    position: 4,
                    name: product.name,
                    item: `${BASE_URL}/produits/${slug}`,
                  },
                ]
              : [
                  {
                    "@type": "ListItem" as const,
                    position: 3,
                    name: product.name,
                    item: `${BASE_URL}/produits/${slug}`,
                  },
                ]),
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
