"use client"

import { useState, useEffect, use } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, ArrowUpRight, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { IProduct } from "@/types/models.types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Footer } from "@/components/footer"
import { formatSpecifications } from "@/lib/utils/product"
import { cn } from "@/lib/utils"

interface ProductPageProps {
  params: Promise<{ slug: string }>
}

export default function ProductPage({ params }: ProductPageProps) {
  const { slug } = use(params)
  const [product, setProduct] = useState<IProduct | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`/api/products/slug/${slug}`)
        const data = await res.json()

        if (data.success && data.data) {
          setProduct(data.data)
        } else {
          setError("Produit non trouvé")
        }
      } catch (err) {
        console.error("Error fetching product:", err)
        setError("Une erreur est survenue")
      } finally {
        setIsLoading(false)
      }
    }

    fetchProduct()
  }, [slug])

  if (isLoading) {
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
          </nav>
        </header>
        <div className="flex flex-col items-center justify-center min-h-screen pt-32">
          <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Chargement du produit...</p>
        </div>
      </main>
    )
  }

  if (error || !product) {
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
          </nav>
        </header>
        <div className="flex flex-col items-center justify-center min-h-screen pt-32">
          <p className="text-destructive mb-4">{error}</p>
          <Link href="/catalogue" className="text-primary hover:underline">
            Retour au catalogue
          </Link>
        </div>
      </main>
    )
  }

  const images = product.images || []
  const hasMultipleImages = images.length > 1
  const category = product.categoryId as unknown as { name: string; slug: string } | undefined
  const specs = product.specifications
    ? formatSpecifications(product.specifications)
    : []

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  return (
    <main className="min-h-screen">
      {/* Header */}
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

      {/* Hero / Product */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-24">
        <div className="container mx-auto px-6 md:px-12">
          {/* Breadcrumb */}
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
            {/* Image Gallery */}
            <div className="relative">
              <div className="relative aspect-square bg-muted rounded-2xl overflow-hidden">
                {images.length > 0 ? (
                  <>
                    <Image
                      src={images[currentImageIndex]}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      priority
                    />
                    {hasMultipleImages && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 hover:bg-white rounded-full shadow-lg transition-colors"
                          aria-label="Image précédente"
                        >
                          <ChevronLeft className="w-6 h-6" />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 hover:bg-white rounded-full shadow-lg transition-colors"
                          aria-label="Image suivante"
                        >
                          <ChevronRight className="w-6 h-6" />
                        </button>
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                          {images.map((_, idx) => (
                            <button
                              key={idx}
                              onClick={() => setCurrentImageIndex(idx)}
                              className={cn(
                                "w-2.5 h-2.5 rounded-full transition-colors",
                                idx === currentImageIndex
                                  ? "bg-white"
                                  : "bg-white/50 hover:bg-white/75"
                              )}
                              aria-label={`Voir image ${idx + 1}`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-secondary">
                    <span className="text-8xl font-medium text-muted-foreground/30">
                      {product.name.charAt(0)}
                    </span>
                  </div>
                )}
              </div>

              {/* Thumbnail strip */}
              {hasMultipleImages && images.length <= 8 && (
                <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={cn(
                        "relative w-16 h-16 shrink-0 rounded-lg overflow-hidden border-2 transition-colors",
                        idx === currentImageIndex
                          ? "border-primary"
                          : "border-transparent hover:border-muted-foreground/50"
                      )}
                    >
                      <Image
                        src={img}
                        alt={`${product.name} - image ${idx + 1}`}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Details */}
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

              {/* Description */}
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

              {/* Specifications */}
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

              {/* CTA */}
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

      {/* CTA Section */}
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
