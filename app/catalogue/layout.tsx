import type { Metadata } from "next"

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://bmwood.tn"

export const metadata: Metadata = {
  title: "Catalogue — Nos Réalisations",
  description:
    "Découvrez notre catalogue de menuiseries sur mesure. Cuisines, dressings, portes, habillage mural, cache radiateur et plus. BM Wood, Ariana.",
  alternates: {
    canonical: `${BASE_URL}/catalogue`,
  },
  openGraph: {
    url: `${BASE_URL}/catalogue`,
    title: "Catalogue — Nos Réalisations | BM Wood",
    description:
      "Découvrez notre catalogue de menuiseries sur mesure. Cuisines, dressings, portes, habillage mural, cache radiateur et plus. BM Wood, Ariana.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Catalogue — Nos Réalisations | BM Wood",
    description:
      "Découvrez notre catalogue de menuiseries sur mesure. Cuisines, dressings, portes, habillage mural, cache radiateur et plus. BM Wood, Ariana.",
  },
}

export default function CatalogueLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
