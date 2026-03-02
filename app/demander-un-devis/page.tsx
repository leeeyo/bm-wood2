import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, MapPin } from "lucide-react"
import { DevisRequestForm, InitialDevisItem } from "@/components/devis/devis-request-form"
import { Footer } from "@/components/footer"

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://bmwood.tn"

export const metadata: Metadata = {
  title: "Demander un devis",
  description:
    "Demandez un devis gratuit pour votre projet de menuiserie sur mesure. Cuisine, habillage mural, portes, salon, cache radiateur et dressing.",
  alternates: {
    canonical: `${BASE_URL}/demander-un-devis`,
  },
  openGraph: {
    url: `${BASE_URL}/demander-un-devis`,
    title: "Demander un devis gratuit | BM Wood",
    description:
      "Demandez un devis gratuit pour votre projet de menuiserie sur mesure. Cuisine, habillage mural, portes, salon, cache radiateur et dressing.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Demander un devis gratuit | BM Wood",
    description:
      "Demandez un devis gratuit pour votre projet de menuiserie sur mesure. Cuisine, habillage mural, portes, salon, cache radiateur et dressing.",
  },
}

interface DemanderUnDevisPageProps {
  searchParams: Promise<{
    productName?: string
    productDescription?: string
    description?: string
    quantity?: string
    dimensions?: string
    notes?: string
  }>
}

export default async function DemanderUnDevisPage({ searchParams }: DemanderUnDevisPageProps) {
  const params = await searchParams
  
  // Build initial items from URL params
  const initialItems: InitialDevisItem[] = []
  
  // If productName is provided, create a prefilled item
  if (params.productName || params.description) {
    const description = params.productName
      ? params.productDescription
        ? `${params.productName} - ${params.productDescription}`
        : params.productName
      : params.description || ""
    
    initialItems.push({
      description,
      quantity: params.quantity ? parseInt(params.quantity, 10) || 1 : 1,
      dimensions: params.dimensions || "",
      notes: params.notes || "",
    })
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
            href="/"
            className="inline-flex items-center gap-2 text-sm text-white hover:text-orange-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour au site
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-6 md:px-12">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-primary-foreground/60 text-sm tracking-[0.3em] uppercase mb-6">
              Demande de devis
            </p>
            <h1
              className="text-3xl md:text-4xl lg:text-5xl font-medium leading-[1.1] tracking-tight mb-6"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Décrivez votre projet
            </h1>
            <p className="text-primary-foreground/70 text-lg leading-relaxed max-w-2xl mx-auto">
              Remplissez le formulaire ci-dessous pour recevoir un devis personnalisé.
              Notre équipe vous contactera dans les plus brefs délais.
            </p>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-6 md:px-12">
          <div className="max-w-3xl mx-auto">
            <DevisRequestForm initialItems={initialItems.length > 0 ? initialItems : undefined} />
          </div>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-12 bg-muted/30 border-t">
        <div className="container mx-auto px-6 md:px-12">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-muted-foreground mb-4">
              Vous préférez nous contacter directement ?
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:contact@bmwood.tn"
                className="inline-flex items-center justify-center gap-2 text-sm px-6 py-3 border border-foreground/20 hover:bg-foreground hover:text-background transition-colors"
              >
                contact@bmwood.tn
              </a>
              <a
                href="tel:98134335"
                className="inline-flex items-center justify-center gap-2 text-sm px-6 py-3 border border-foreground/20 hover:bg-foreground hover:text-background transition-colors"
              >
                98 134 335
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Visitez notre showroom */}
      <section className="py-12 md:py-16 border-t">
        <div className="container mx-auto px-6 md:px-12">
          <div className="max-w-4xl mx-auto">
            <h2
              className="text-2xl font-medium mb-2 text-center"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Visitez notre showroom
            </h2>
            <p className="text-muted-foreground text-center mb-8">
              Venez découvrir nos modèles et finitions à Avenue Ibn Khaldoun, Ariana
            </p>
            <div className="rounded-lg overflow-hidden border shadow-lg">
              <div className="w-full h-[300px] md:h-[350px] relative">
                <iframe
                  src="https://www.google.com/maps?q=BM+WOOD+Avenue+Ibn+Khaldoun+Ariana+Tunisia&output=embed"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="BM Wood Showroom - Avenue Ibn Khaldoun, Ariana"
                  className="absolute inset-0"
                />
              </div>
              <div className="p-4 bg-muted/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <p className="font-medium">BM Wood</p>
                  <p className="text-sm text-muted-foreground">Riadh Andalous, Tunis</p>
                </div>
                <a
                  href="https://maps.app.goo.gl/RzkSTCyQ5j9XbXW19"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-primary hover:underline font-medium"
                >
                  <MapPin className="w-4 h-4 shrink-0" />
                  Voir sur Google Maps
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
