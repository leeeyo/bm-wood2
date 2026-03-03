import type { Metadata } from "next";
import { business } from "@/lib/config/business";

export const metadata: Metadata = {
  title: "Mon compte",
  description: "Gérez votre profil et vos préférences BM Wood.",
  alternates: {
    canonical: `${business.url}/mon-compte`,
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function MonCompteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
