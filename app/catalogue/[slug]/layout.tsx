import type { Metadata } from "next"
import connectDB from "@/lib/db/connection"
import { Category } from "@/lib/db/models"
import { JsonLd } from "@/components/seo/json-ld"

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://bmwood.tn"

interface CategoryLayoutProps {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}

export async function generateMetadata({
  params,
}: CategoryLayoutProps): Promise<Metadata> {
  const { slug } = await params

  try {
    await connectDB()
    const category = await Category.findOne({ slug, isActive: true }).lean()

    if (!category) {
      return {
        title: "Catégorie non trouvée",
      }
    }

    const title = `${category.name} | Catalogue`
    const description =
      category.description?.slice(0, 160) ||
      `Découvrez nos réalisations en ${category.name}. Menuiserie sur mesure par BM Wood, Ariana.`

    return {
      title,
      description,
      alternates: {
        canonical: `${BASE_URL}/catalogue/${slug}`,
      },
      openGraph: {
        url: `${BASE_URL}/catalogue/${slug}`,
        title: `${title} | BM Wood`,
        description,
        images: category.image ? [category.image] : undefined,
      },
      twitter: {
        card: "summary_large_image",
        title: `${title} | BM Wood`,
        description,
        images: category.image ? [category.image] : undefined,
      },
    }
  } catch {
    return {
      title: "Catalogue | BM Wood",
    }
  }
}

export default async function CategoryLayout({
  children,
  params,
}: CategoryLayoutProps) {
  const { slug } = await params

  let jsonLd: object | null = null
  try {
    await connectDB()
    const category = await Category.findOne({ slug, isActive: true }).lean()
    if (category) {
      jsonLd = [
        {
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: category.name,
          description: category.description || `Catalogue ${category.name} - BM Wood`,
          url: `${BASE_URL}/catalogue/${slug}`,
        },
        {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Accueil", item: BASE_URL },
            { "@type": "ListItem", position: 2, name: "Catalogue", item: `${BASE_URL}/catalogue` },
            { "@type": "ListItem", position: 3, name: category.name, item: `${BASE_URL}/catalogue/${slug}` },
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
