import type { Metadata } from "next"
import { Header } from "@/components/header"
import { Hero } from "@/components/hero"

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://bmwood.tn"

export const metadata: Metadata = {
  title: "BM Wood — Menuiserie et Agencement sur Mesure à Tunis",
  description:
    "BM Wood, spécialiste en menuiserie et agencement sur mesure à Ariana. Cuisine, habillage mural, portes, salon, cache radiateur et dressing.",
  alternates: {
    canonical: BASE_URL,
  },
  openGraph: {
    url: BASE_URL,
    title: "BM Wood — Menuiserie et Agencement sur Mesure à Tunis",
    description:
      "BM Wood, spécialiste en menuiserie et agencement sur mesure à Ariana. Cuisine, habillage mural, portes, salon, cache radiateur et dressing.",
  },
  twitter: {
    card: "summary_large_image",
    title: "BM Wood — Menuiserie et Agencement sur Mesure à Tunis",
    description:
      "BM Wood, spécialiste en menuiserie et agencement sur mesure à Ariana. Cuisine, habillage mural, portes, salon, cache radiateur et dressing.",
  },
}
import { FeaturedProducts } from "@/components/featured-products"
import { Philosophy } from "@/components/philosophy"
import { Projects } from "@/components/projects"
import { Expertise } from "@/components/expertise"
import { FAQ } from "@/components/faq"
import { Testimonials } from "@/components/testimonials"
import { CallToAction } from "@/components/call-to-action"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <FeaturedProducts />
      <Projects />
      <Philosophy />
      <Expertise />
      <Testimonials />
      <CallToAction />
      <FAQ />
      <Footer />
    </main>
  )
}
