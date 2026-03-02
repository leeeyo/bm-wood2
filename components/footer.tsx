"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { business } from "@/lib/config/business"

export function Footer() {
  const [revealed, setRevealed] = useState(false)
  const footerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setRevealed(true)
      },
      { threshold: 0.1 },
    )
    if (footerRef.current) observer.observe(footerRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <footer
      ref={footerRef}
      className={`py-12 md:py-16 xl:py-14 border-t border-border transition-all duration-700 ${
        revealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="md:col-span-2 flex flex-col items-center text-center">
            <Link href="/" className="mb-6 flex justify-center">
              <Image src="/logo-bm-wood.png" alt="BM Wood" width={200} height={60} className="w-auto h-12 md:h-16" />
            </Link>
            <p className="text-muted-foreground leading-relaxed max-w-sm text-center">
              BM WOOD Pour toutes vos envies
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-sm font-medium mb-4">Navigation</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <Link href="/realisations" className="hover:text-foreground transition-colors">
                  Réalisations
                </Link>
              </li>
              <li>
                <Link href="/catalogue" className="hover:text-foreground transition-colors">
                  Catalogue
                </Link>
              </li>
              <li>
                <Link href="/demander-un-devis" className="hover:text-foreground transition-colors">
                  Demander un devis
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-foreground transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-medium mb-4">Contact</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <a href={`mailto:${business.email}`} className="hover:text-foreground transition-colors">
                  {business.email}
                </a>
              </li>
              <li>
                <a href={`tel:${business.primaryPhone}`} className="hover:text-foreground transition-colors">
                  {business.primaryPhoneFormatted}
                </a>
              </li>
              {business.secondaryPhones.map((phone) => (
                <li key={phone}>
                  <a
                    href={`tel:${phone.replace(/\s/g, "")}`}
                    className="hover:text-foreground transition-colors"
                  >
                    {phone}
                  </a>
                </li>
              ))}
              <li className="text-muted-foreground">
                {business.addressFormatted}
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-border flex flex-col md:flex-row md:items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© 2025 BM Wood. Tous droits réservés.</p>
          <div className="flex gap-6">
            <Link href="/confidentialite" className="hover:text-foreground transition-colors">
              Confidentialité
            </Link>
            <Link href="/conditions" className="hover:text-foreground transition-colors">
              Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
