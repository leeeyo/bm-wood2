"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { SafeImage } from "@/components/ui/safe-image"
import { ArrowUpRight } from "lucide-react"
import { HighlightedText } from "./highlighted-text"

interface FeaturedProduct {
  _id: string
  name: string
  slug: string
  description?: string
  images: string[]
  isFeatured: boolean
  categoryId: { _id: string; name: string; slug: string } | string
}

function getCategorySlug(product: FeaturedProduct): string {
  const cat = product.categoryId
  return typeof cat === "object" && cat !== null && "slug" in cat ? (cat as { slug: string }).slug : ""
}

function getCategoryName(product: FeaturedProduct): string {
  const cat = product.categoryId
  return typeof cat === "object" && cat !== null && "name" in cat ? (cat as { name: string }).name : ""
}

export function FeaturedProducts() {
  const [products, setProducts] = useState<FeaturedProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [revealed, setRevealed] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    async function fetchFeatured() {
      try {
        const res = await fetch("/api/products?isFeatured=true&isActive=true&limit=4")
        const data = await res.json()
        if (data.success && data.data) {
          setProducts(data.data)
        }
      } catch {
        setProducts([])
      } finally {
        setLoading(false)
      }
    }
    fetchFeatured()
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setRevealed(true)
      },
      { threshold: 0.2 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      id="featured-products"
      ref={sectionRef}
      className="py-24 md:py-20 xl:py-16 bg-background"
    >
      <div className="container mx-auto px-6 md:px-12">
        <div
          className={`mb-16 transition-all duration-700 ${
            revealed ? "animate-in fade-in slide-in-from-bottom-4 duration-700 opacity-100" : "opacity-0 translate-y-4"
          }`}
        >
          <p className="text-muted-foreground text-sm tracking-[0.3em] uppercase mb-6 font-ui">Sélection</p>
          <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-4xl font-medium tracking-tight mb-4">
            Nos Créations <HighlightedText>Phares</HighlightedText>
          </h2>
          <p className="text-muted-foreground max-w-xl">
            Découvrez une sélection de nos réalisations sur mesure.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="rounded-lg border border-border overflow-hidden animate-pulse"
              >
                <div className="aspect-3/4 bg-muted" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>Aucune création phare pour le moment.</p>
            <Link
              href="/catalogue"
              className="inline-flex items-center gap-2 font-ui text-sm tracking-wide text-foreground hover:text-accent transition-colors mt-4"
            >
              Voir tout le catalogue
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {products.map((product, index) => {
            const categorySlug = getCategorySlug(product)
            const categoryName = getCategoryName(product)
            const imageSrc = product.images?.[0] || "/example.jpg"
            const href = categorySlug ? `/catalogue/${categorySlug}` : "/catalogue"

            return (
              <Link
                key={product._id}
                href={href}
                className={`group group/card block transition-all duration-500 ${
                  revealed
                    ? "animate-in fade-in slide-in-from-bottom-4 opacity-100"
                    : "opacity-0 translate-y-4"
                }`}
                style={{
                  transitionDelay: revealed ? `${index * 100}ms` : "0ms",
                }}
              >
                <article className="relative overflow-hidden rounded-lg border border-border hover:shadow-2xl hover:border-accent/50 hover:-translate-y-1 transition-all duration-500">
                  <div className="relative aspect-3/4 overflow-hidden">
                    <SafeImage
                      src={imageSrc}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover/card:scale-110"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-primary/90 via-primary/20 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6">
                      <span className="font-ui text-xs tracking-[0.2em] uppercase text-primary-foreground/80 mb-1">
                        {categoryName}
                      </span>
                      <h3 className="text-xl font-medium text-primary-foreground">
                        {product.name}
                      </h3>
                    </div>
                    <div className="absolute top-3 right-3">
                      <span className="font-ui text-[10px] tracking-widest uppercase bg-primary text-primary-foreground px-2 py-1 rounded">
                        Sur Mesure
                      </span>
                    </div>
                  </div>
                  <div className="p-4 border-t border-border group-hover/card:border-accent/30 transition-colors duration-500">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium">{product.name}</span>
                      <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover/card:text-foreground transition-colors shrink-0" />
                    </div>
                    {categoryName && (
                      <p className="font-ui text-xs tracking-wider uppercase text-muted-foreground mt-1">
                        {categoryName}
                      </p>
                    )}
                  </div>
                </article>
              </Link>
            )
          })}
        </div>
        )}

        <div
          className={`mt-12 text-center transition-all duration-700 delay-300 ${
            revealed ? "animate-in fade-in slide-in-from-bottom-4 opacity-100" : "opacity-0 translate-y-4"
          }`}
        >
          <Link
            href="/catalogue"
            className="inline-flex items-center gap-2 font-ui text-sm tracking-wide text-foreground hover:text-accent transition-colors"
          >
            Voir tout le catalogue
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
