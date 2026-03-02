"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowUpRight, Loader2 } from "lucide-react"
import { IProduct } from "@/types/models.types"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface ProductListProps {
  products: IProduct[]
  viewMode: "grid" | "list"
  loadMore?: () => void
  hasNext?: boolean
  isLoadingMore?: boolean
}

export function ProductList({
  products,
  viewMode,
  loadMore,
  hasNext,
  isLoadingMore,
}: ProductListProps) {
  return (
    <>
      <div
        className={cn(
          viewMode === "grid"
            ? "grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
            : "flex flex-col gap-4"
        )}
      >
        {products.map((product) => (
          <ProductCard
            key={product._id.toString()}
            product={product}
            viewMode={viewMode}
          />
        ))}
      </div>

      {hasNext && loadMore && (
        <div className="flex justify-center mt-12">
          <Button
            variant="outline"
            size="lg"
            onClick={loadMore}
            disabled={isLoadingMore}
          >
            {isLoadingMore ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Chargement...
              </>
            ) : (
              "Charger plus de produits"
            )}
          </Button>
        </div>
      )}
    </>
  )
}

interface ProductCardProps {
  product: IProduct
  viewMode: "grid" | "list"
}

function ProductCard({ product, viewMode }: ProductCardProps) {
  const productImage = product.images?.[0]
  const productUrl = `/produits/${product.slug}`

  if (viewMode === "list") {
    return (
      <article className="flex gap-6 p-4 border rounded-lg hover:border-primary/50 transition-colors group">
        <Link
          href={productUrl}
          className="relative w-32 h-32 shrink-0 bg-muted rounded overflow-hidden block"
        >
          {productImage ? (
            <Image
              src={productImage}
              alt={product.name}
              fill
              className="object-cover"
              sizes="128px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-secondary">
              <span className="text-2xl font-medium text-muted-foreground/30">
                {product.name.charAt(0)}
              </span>
            </div>
          )}
        </Link>
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <Link href={productUrl}>
              <h3 className="text-lg font-medium mb-2 group-hover:underline underline-offset-4">
                {product.name}
              </h3>
            </Link>
            {product.description && (
              <p className="text-muted-foreground text-sm line-clamp-2">
                {product.description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-4 mt-4">
            <Button size="sm" variant="outline" asChild>
              <Link href={productUrl}>Voir les détails</Link>
            </Button>
            <Link
              href={`/demander-un-devis?productName=${encodeURIComponent(product.name)}`}
              className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
            >
              Demander un devis
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </article>
    )
  }

  return (
    <article className="group">
      <Link href={productUrl} className="block">
        <div className="relative overflow-hidden aspect-4/3 mb-4 bg-muted rounded-lg">
          {productImage ? (
            <Image
              src={productImage}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-secondary">
              <span className="text-4xl font-medium text-muted-foreground/30">
                {product.name.charAt(0)}
              </span>
            </div>
          )}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />

          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="inline-flex items-center justify-center rounded-md bg-secondary px-4 py-2 text-sm font-medium shadow-sm">
              Voir les détails
            </span>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-2 group-hover:underline underline-offset-4">
            {product.name}
          </h3>
          {product.description && (
            <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
              {product.description}
            </p>
          )}
        </div>
      </Link>
      <Link
        href={`/demander-un-devis?productName=${encodeURIComponent(product.name)}`}
        className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
      >
        Demander un devis
        <ArrowUpRight className="w-3 h-3" />
      </Link>
    </article>
  )
}
