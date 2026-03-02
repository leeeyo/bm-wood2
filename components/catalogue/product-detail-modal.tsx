"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowUpRight, X, ChevronLeft, ChevronRight } from "lucide-react"
import { IProduct } from "@/types/models.types"
import { formatSpecifications } from "@/lib/utils/product"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface ProductDetailModalProps {
  product: IProduct | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProductDetailModal({
  product,
  open,
  onOpenChange,
}: ProductDetailModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  if (!product) return null

  const images = product.images || []
  const hasMultipleImages = images.length > 1

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  // Get category info from populated categoryId
  const category = product.categoryId as unknown as { name: string; slug: string } | undefined

  const specs = product.specifications
    ? formatSpecifications(product.specifications)
    : []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        <div className="grid md:grid-cols-2 gap-0">
          {/* Image Gallery */}
          <div className="relative bg-muted aspect-square md:aspect-auto md:h-full">
            {images.length > 0 ? (
              <>
                <Image
                  src={images[currentImageIndex]}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                {hasMultipleImages && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white rounded-full shadow-md transition-colors"
                      aria-label="Image précédente"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white rounded-full shadow-md transition-colors"
                      aria-label="Image suivante"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    {/* Image dots */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {images.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentImageIndex(idx)}
                          className={cn(
                            "w-2 h-2 rounded-full transition-colors",
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
              <div className="w-full h-full min-h-[300px] flex items-center justify-center bg-secondary">
                <span className="text-6xl font-medium text-muted-foreground/30">
                  {product.name.charAt(0)}
                </span>
              </div>
            )}

            {/* Close button for mobile */}
            <button
              onClick={() => onOpenChange(false)}
              className="md:hidden absolute top-2 right-2 p-2 bg-white/80 hover:bg-white rounded-full shadow-md transition-colors"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Product Details */}
          <div className="p-6 md:p-8">
            <DialogHeader className="text-left mb-6">
              {category && (
                <Link
                  href={`/catalogue/${category.slug}`}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors mb-2 inline-block"
                >
                  {category.name}
                </Link>
              )}
              <DialogTitle className="text-2xl md:text-3xl font-medium">
                {product.name}
              </DialogTitle>
            </DialogHeader>

            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-6">
              {product.isFeatured && (
                <Badge variant="secondary">En vedette</Badge>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2">
                  Description
                </h4>
                <p className="text-foreground/80 leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            {/* Specifications */}
            {specs.length > 0 && (
              <div className="mb-8">
                <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
                  Spécifications
                </h4>
                <dl className="space-y-2">
                  {specs.map((spec, idx) => (
                    <div key={idx} className="flex gap-2">
                      <dt className="text-muted-foreground min-w-[120px]">
                        {spec.label}:
                      </dt>
                      <dd className="font-medium">{spec.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
              <Button asChild className="flex-1">
                <Link
                  href={`/demander-un-devis?productName=${encodeURIComponent(product.name)}&productDescription=${encodeURIComponent(product.description || "")}`}
                >
                  Demander un devis
                  <ArrowUpRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Continuer à explorer
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
