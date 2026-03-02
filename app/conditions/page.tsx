import type { Metadata } from "next"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { business } from "@/lib/config/business"

const baseUrl = business.url

export const metadata: Metadata = {
  title: "Conditions générales",
  description:
    "Conditions générales d'utilisation et de vente de BM Wood. Menuiserie sur mesure à Ariana.",
  alternates: {
    canonical: `${baseUrl}/conditions`,
  },
  openGraph: {
    url: `${baseUrl}/conditions`,
    title: "Conditions générales | BM Wood",
    description:
      "Conditions générales d'utilisation et de vente de BM Wood. Menuiserie sur mesure à Ariana.",
  },
}

const LAST_UPDATED = "3 mars 2025"

export default function ConditionsPage() {
  return (
    <main className="min-h-screen">
      <Header />

      <section className="pt-32 pb-16 md:pt-40 md:pb-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-6 md:px-12">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-primary-foreground/60 text-sm tracking-[0.3em] uppercase mb-6">
              Légal
            </p>
            <h1
              className="text-3xl md:text-4xl lg:text-5xl font-medium leading-[1.1] tracking-tight mb-6"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Conditions générales
            </h1>
            <p className="text-primary-foreground/70 text-sm">
              Dernière mise à jour : {LAST_UPDATED}
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container mx-auto px-6 md:px-12">
          <div className="max-w-3xl mx-auto prose prose-neutral dark:prose-invert">
            <p className="text-sm text-muted-foreground mb-8">
              <strong>Propriétaire :</strong> {business.name} — {business.addressFormatted}
            </p>

            <h2 className="text-xl font-medium mt-8 mb-4">1. Objet</h2>
            <p>
              Les présentes conditions générales régissent l&apos;utilisation du site {baseUrl} et
              les relations commerciales entre {business.name} et ses clients. L&apos;accès au site
              et la soumission de demandes de devis impliquent l&apos;acceptation de ces conditions.
            </p>

            <h2 className="text-xl font-medium mt-8 mb-4">2. Services</h2>
            <p>
              {business.name} propose des services de menuiserie et d&apos;agencement sur mesure :
              cuisines, dressings, portes, habillage mural, cache radiateur et réalisations
              personnalisées. Les devis sont gratuits et sans engagement.
            </p>

            <h2 className="text-xl font-medium mt-8 mb-4">3. Demandes de devis</h2>
            <p>
              Les demandes de devis transmises via le formulaire en ligne sont étudiées par notre
              équipe. Un devis détaillé vous sera adressé après analyse de votre projet. La
              soumission d&apos;une demande ne constitue pas un engagement de commande.
            </p>

            <h2 className="text-xl font-medium mt-8 mb-4">4. Propriété intellectuelle</h2>
            <p>
              L&apos;ensemble du contenu du site (textes, images, logos, structure) est protégé par
              le droit d&apos;auteur et appartient à {business.name}. Toute reproduction non
              autorisée est interdite.
            </p>

            <h2 className="text-xl font-medium mt-8 mb-4">5. Contact</h2>
            <p>
              Pour toute question relative à ces conditions, contactez-nous à {business.email} ou
              au {business.primaryPhoneFormatted}.
            </p>

            <div className="mt-12 pt-8 border-t">
              <Link href="/" className="text-primary hover:underline">
                ← Retour à l&apos;accueil
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
