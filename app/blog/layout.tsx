import type { Metadata } from "next"

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://bmwood.tn"

export const metadata: Metadata = {
  title: "Blog — Actualités & Inspirations",
  description:
    "Découvrez nos articles sur la menuiserie, l'agencement et nos réalisations. Conseils, inspirations et actualités BM Wood.",
  alternates: {
    canonical: `${BASE_URL}/blog`,
  },
  openGraph: {
    url: `${BASE_URL}/blog`,
    title: "Blog — Actualités & Inspirations | BM Wood",
    description:
      "Découvrez nos articles sur la menuiserie, l'agencement et nos réalisations. Conseils, inspirations et actualités BM Wood.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog — Actualités & Inspirations | BM Wood",
    description:
      "Découvrez nos articles sur la menuiserie, l'agencement et nos réalisations. Conseils, inspirations et actualités BM Wood.",
  },
}

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
