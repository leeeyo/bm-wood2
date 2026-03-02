import type { Metadata } from "next"

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://bmwood.tn"
const REALISATIONS_URL = `${BASE_URL}/realisations`

export const metadata: Metadata = {
  title: "Réalisations — Galerie de projets",
  description:
    "Découvrez nos réalisations par type de projet. Cuisines, dressings, portes, habillage mural et plus. BM Wood, menuiserie sur mesure à Ariana.",
  alternates: {
    canonical: REALISATIONS_URL,
  },
  openGraph: {
    url: REALISATIONS_URL,
    title: "Réalisations | BM Wood — Galerie de projets",
    description:
      "Découvrez nos réalisations par type de projet. Cuisines, dressings, portes, habillage mural et plus.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Réalisations | BM Wood — Galerie de projets",
    description:
      "Découvrez nos réalisations par type de projet. Cuisines, dressings, portes, habillage mural et plus.",
  },
}

export default function RealisationsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
