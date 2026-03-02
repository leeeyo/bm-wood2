import type { Metadata } from "next"
import { Mail, Phone, MapPin } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ContactForm } from "@/components/contact/contact-form"

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://bmwood.tn"

export const metadata: Metadata = {
  title: "Contact — BM Wood",
  description:
    "Contactez BM Wood pour vos projets de menuiserie sur mesure. Avenue Ibn Khaldoun, Ariana. Tél: 98 134 335 / 70 870 210.",
  alternates: {
    canonical: `${BASE_URL}/contact`,
  },
  openGraph: {
    url: `${BASE_URL}/contact`,
    title: "Contact | BM Wood — Menuiserie sur mesure",
    description:
      "Contactez BM Wood pour vos projets de menuiserie sur mesure. Avenue Ibn Khaldoun, Ariana.",
  },
}

export default function ContactPage() {
  return (
    <main className="min-h-screen">
      <Header />

      <section className="pt-32 pb-16 md:pt-40 md:pb-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-6 md:px-12">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-primary-foreground/60 text-sm tracking-[0.3em] uppercase mb-6">
              Contact
            </p>
            <h1
              className="text-3xl md:text-4xl lg:text-5xl font-medium leading-[1.1] tracking-tight mb-6"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Parlons de votre projet
            </h1>
            <p className="text-primary-foreground/70 text-lg leading-relaxed max-w-2xl mx-auto">
              Notre équipe est à votre disposition pour répondre à vos questions
              et vous accompagner dans vos projets de menuiserie sur mesure.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Contact info */}
            <div>
              <h2
                className="text-2xl font-medium mb-8"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Nos coordonnées
              </h2>
              <div className="space-y-6">
                <a
                  href="mailto:contact@bmwood.tn"
                  className="flex items-start gap-4 group"
                >
                  <div className="shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium mb-1">Email</p>
                    <p className="text-muted-foreground group-hover:text-foreground transition-colors">
                      contact@bmwood.tn
                    </p>
                  </div>
                </a>
                <a
                  href="tel:98134335"
                  className="flex items-start gap-4 group"
                >
                  <div className="shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium mb-1">Téléphone</p>
                    <p className="text-muted-foreground group-hover:text-foreground transition-colors">
                      98 134 335 / 70 870 210
                    </p>
                  </div>
                </a>
                <div className="flex items-start gap-4">
                  <div className="shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium mb-1">Adresse</p>
                    <p className="text-muted-foreground">
                      Avenue Ibn Khaldoun, Ariana
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact form */}
            <div>
              <h2
                className="text-2xl font-medium mb-8"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Envoyez-nous un message
              </h2>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      {/* Google Maps */}
      <section className="py-0">
        <div className="w-full h-[400px] md:h-[500px] relative">
          <iframe
            src="https://www.google.com/maps?q=BM+WOOD+Avenue+Ibn+Khaldoun+Ariana+Tunisia&output=embed"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="BM Wood - Avenue Ibn Khaldoun, Ariana"
            className="absolute inset-0"
          />
          <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-background/95 backdrop-blur-sm rounded-lg p-4 shadow-lg">
            <p className="font-medium mb-1">BM Wood</p>
            <p className="text-sm text-muted-foreground">
              Avenue Ibn Khaldoun, Ariana
            </p>
            <a
              href="https://maps.app.goo.gl/RzkSTCyQ5j9XbXW19"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-primary hover:underline mt-2"
            >
              <MapPin className="w-4 h-4" />
              Voir sur Google Maps
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
