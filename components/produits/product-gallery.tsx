"use client"

import { useState } from "react"
import { SafeImage } from "@/components/ui/safe-image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface ProductGalleryProps {
  images: string[]
  productName: string
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const hasMultipleImages = images.length > 1

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  if (images.length === 0) {
    return (
      <div className="relative aspect-square bg-muted rounded-2xl overflow-hidden">
        <div className="w-full h-full flex items-center justify-center bg-secondary">
          <span className="text-8xl font-medium text-muted-foreground/30">
            {productName.charAt(0)}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      <div className="relative aspect-square bg-muted rounded-2xl overflow-hidden">
        <SafeImage
          src={images[currentImageIndex]}
          alt={productName}
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
                    idx === currentImageIndex ? "bg-white" : "bg-white/50 hover:bg-white/75"
                  )}
                  aria-label={`Voir image ${idx + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

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
              <span className="relative block w-full h-full">
                <SafeImage
                  src={img}
                  alt={`${productName} - image ${idx + 1}`}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
