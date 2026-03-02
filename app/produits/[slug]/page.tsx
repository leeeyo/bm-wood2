import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, ArrowUpRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Footer } from "@/components/footer"
import { getProductBySlug } from "@/lib/data"
import { formatSpecifications } from "@/lib/utils/product"
import { ProductGallery } from "@/components/produits/product-gallery"
import { notFound } from "next/navigation"

interface ProductPageProps {
  params: Promise<{ slug: string }>
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params

  const product = await getProductBySlug(slug)

  if (!product) {
    notFound()
  }

  const images = product.images || []
  const category = product.categoryId as unknown as { name: string; slug: string } | undefined
  const specs = product.specifications
    ? formatSpecifications(product.specifications)
    : []

  return (
    <main className="min-h-screen">
      <header className="fixed top-0 left-0 right-0 z-50 bg-primary py-4">
        <nav className="container mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="transition-all duration-300">
            <Image
              src="/bmwood-header.png"
              alt="BM Wood"
              width={100}
              height={50}
              className="w-auto h-10"
            />
          </Link>

          <Link
            href={category ? `/catalogue/${category.slug}` : "/catalogue"}
            className="inline-flex items-center gap-2 text-sm text-white hover:text-orange-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour au catalogue
          </Link>
        </nav>
      </header>

      <section className="pt-32 pb-16 md:pt-40 md:pb-24">
        <div className="container mx-auto px-6 md:px-12">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <Link href="/" className="hover:text-foreground transition-colors">
              Accueil
            </Link>
            <span>/</span>
            <Link href="/catalogue" className="hover:text-foreground transition-colors">
              Catalogue
            </Link>
            {category && (
              <>
                <span>/</span>
                <Link
                  href={`/catalogue/${category.slug}`}
                  className="hover:text-foreground transition-colors"
                >
                  {category.name}
                </Link>
              </>
            )}
            <span>/</span>
            <span className="text-foreground font-medium">{product.name}</span>
          </nav>

          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
            <ProductGallery images={images} productName={product.name} />

            <div className="flex flex-col">
              <div className="mb-6">
                {category && (
                  <Link
                    href={`/catalogue/${category.slug}`}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors mb-2 inline-block"
                  >
                    {category.name}
                  </Link>
                )}
                <h1
                  className="text-3xl md:text-4xl lg:text-5xl font-medium leading-tight mb-4"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {product.name}
                </h1>
                {product.isFeatured && (
                  <Badge variant="secondary" className="text-sm">
                    En vedette
                  </Badge>
                )}
              </div>

              {product.description && (
                <div className="mb-8">
                  <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
                    Description
                  </h2>
                  <p className="text-foreground/90 leading-relaxed text-lg">
                    {product.description}
                  </p>
                </div>
              )}

              {specs.length > 0 && (
                <div className="mb-8 p-6 rounded-xl bg-muted/50 border">
                  <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-4">
                    Spécifications
                  </h2>
                  <dl className="space-y-3">
                    {specs.map((spec, idx) => (
                      <div key={idx} className="flex gap-3 sm:gap-4">
                        <dt className="text-muted-foreground min-w-[140px]">
                          {spec.label}:
                        </dt>
                        <dd className="font-medium">{spec.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}

              <div className="mt-auto pt-8 border-t space-y-4">
                <Button asChild size="lg" className="w-full sm:w-auto text-base px-8 py-6">
                  <Link
                    href={`/demander-un-devis?productName=${encodeURIComponent(product.name)}&productDescription=${encodeURIComponent(product.description || "")}`}
                  >
                    Demander un devis gratuit
                    <ArrowUpRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
                <Link
                  href={category ? `/catalogue/${category.slug}` : "/catalogue"}
                  className="block text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Voir les autres produits de cette catégorie
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-muted/30 border-t">
        <div className="container mx-auto px-6 md:px-12">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-muted-foreground mb-4">
              Vous avez un projet en tête ?
            </p>
            <Link
              href="/demander-un-devis"
              className="inline-flex items-center gap-2 text-sm px-6 py-3 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Demander un devis gratuit
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
