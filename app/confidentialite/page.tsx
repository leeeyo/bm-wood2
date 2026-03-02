import type { Metadata } from "next"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { business } from "@/lib/config/business"

const baseUrl = business.url

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description:
    "Politique de confidentialité de BM Wood. Découvrez comment nous collectons, utilisons et protégeons vos données personnelles.",
  alternates: {
    canonical: `${baseUrl}/confidentialite`,
  },
  openGraph: {
    url: `${baseUrl}/confidentialite`,
    title: "Politique de confidentialité | BM Wood",
    description:
      "Politique de confidentialité de BM Wood. Découvrez comment nous collectons, utilisons et protégeons vos données personnelles.",
  },
}

const LAST_UPDATED = "3 mars 2025"

export default function ConfidentialitePage() {
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
              Politique de confidentialité
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

            <h2 className="text-xl font-medium mt-8 mb-4">1. Responsable du traitement</h2>
            <p>
              Les données personnelles collectées sur ce site sont traitées par {business.name},
              situé à {business.addressFormatted}. Vous pouvez nous contacter à {business.email}
              ou au {business.primaryPhoneFormatted}.
            </p>

            <h2 className="text-xl font-medium mt-8 mb-4">2. Données collectées</h2>
            <p>
              Nous collectons les données que vous nous fournissez volontairement lors de la
              soumission de formulaires (contact, demande de devis) : nom, prénom, adresse email,
              numéro de téléphone, adresse postale, et tout message ou description de projet que
              vous transmettez.
            </p>

            <h2 className="text-xl font-medium mt-8 mb-4">3. Finalités du traitement</h2>
            <p>
              Vos données sont utilisées pour répondre à vos demandes, traiter vos devis, et vous
              contacter dans le cadre de nos services de menuiserie sur mesure. Nous ne vendons pas
              vos données à des tiers.
            </p>

            <h2 className="text-xl font-medium mt-8 mb-4">4. Durée de conservation</h2>
            <p>
              Les données sont conservées pendant la durée nécessaire à la relation commerciale et
              aux obligations légales. Vous pouvez demander leur suppression à tout moment.
            </p>

            <h2 className="text-xl font-medium mt-8 mb-4">5. Vos droits</h2>
            <p>
              Conformément à la réglementation en vigueur, vous disposez d&apos;un droit d&apos;accès,
              de rectification, de suppression et de portabilité de vos données. Pour exercer ces
              droits, contactez-nous à {business.email}.
            </p>

            <h2 className="text-xl font-medium mt-8 mb-4">6. Cookies</h2>
            <p>
              Ce site peut utiliser des cookies techniques nécessaires au fonctionnement du site et
              des cookies d&apos;analyse. Vous pouvez configurer votre navigateur pour refuser les
              cookies non essentiels.
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
