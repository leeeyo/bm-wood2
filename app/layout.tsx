import type React from "react"
import type { Metadata } from "next"
import { Playfair_Display, Literata, Tenor_Sans } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { GoogleAnalytics } from "@next/third-parties/google"
import { Toaster } from "@/components/ui/sonner"
import { AuthProvider } from "@/lib/contexts/auth-context"
import { WhatsAppFloat } from "@/components/whatsapp-float"
import { JsonLd } from "@/components/seo/json-ld"
import "./globals.css"

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://bmwood.tn"
const defaultTitle = "BM Wood — Menuiserie et Agencement sur Mesure"
const defaultDescription =
  "BM Wood, spécialiste en menuiserie et agencement sur mesure à Ariana. Cuisine, habillage mural, portes, salon, cache radiateur et dressing."

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "BM Wood",
  url: BASE_URL,
  logo: `${BASE_URL}/logo-bm-wood.svg`,
  address: {
    "@type": "PostalAddress",
    addressLocality: "Ariana",
    addressRegion: "Tunis",
    addressCountry: "TN",
  },
  contactPoint: {
    "@type": "ContactPoint",
    email: "contact@bmwood.tn",
    contactType: "customer service",
  },
}

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "BM Wood",
  url: BASE_URL,
  description: defaultDescription,
  publisher: {
    "@type": "Organization",
    name: "BM Wood",
    logo: {
      "@type": "ImageObject",
      url: `${BASE_URL}/logo-bmwood.svg`,
    },
  },
}

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-playfair",
})

const literata = Literata({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-literata",
})

const tenorSans = Tenor_Sans({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-tenor",
})

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: defaultTitle,
    template: "%s | BM Wood",
  },
  description: defaultDescription,
  keywords: [
    "menuiserie",
    "agencement sur mesure",
    "cuisine",
    "dressing",
    "portes",
    "habillage mural",
    "cache radiateur",
    "Tunis",
    "Ariana",
    "BM Wood",
  ],
  authors: [{ name: "BM Wood", url: BASE_URL }],
  creator: "BM Wood",
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: BASE_URL,
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: BASE_URL,
    siteName: "BM Wood",
    title: defaultTitle,
    description: defaultDescription,
    images: [
      {
        url: "/bmwood-header.png",
        width: 1200,
        height: 630,
        alt: "BM Wood — Menuiserie et Agencement sur Mesure",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: defaultDescription,
    images: ["/bmwood-header.png"],
  },
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr">
      <body className={`${playfairDisplay.variable} ${literata.variable} ${tenorSans.variable} font-sans antialiased`}>
        <JsonLd data={[organizationJsonLd, websiteJsonLd]} />
        <AuthProvider>
          {children}
          <WhatsAppFloat />
          <Analytics />
          {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
            <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
          )}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}
