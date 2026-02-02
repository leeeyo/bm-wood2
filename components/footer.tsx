import Link from "next/link"
import Image from "next/image"

export function Footer() {
  return (
    <footer className="py-16 md:py-24 border-t border-border">
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="inline-block mb-6 flex justify-center">
              <Image src="/logo-bm-wood.png" alt="BM Wood" width={200} height={60} className="w-auto h-12 md:h-16" />
            </Link>
            <p className="text-muted-foreground leading-relaxed max-w-sm">
              We design spaces that elevate living. A refined architectural experience where form, light, and intention
              meet.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-sm font-medium mb-4">Navigation</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <Link href="#projects" className="hover:text-foreground transition-colors">
                  Catégories
                </Link>
              </li>
              <li>
                <Link href="#about" className="hover:text-foreground transition-colors">
                  À propos
                </Link>
              </li>
              <li>
                <Link href="#services" className="hover:text-foreground transition-colors">
                  Services
                </Link>
              </li>
              <li>
                <Link href="#contact" className="hover:text-foreground transition-colors">
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
                <a href="mailto:contact@bmwood.tn" className="hover:text-foreground transition-colors">
                  contact@bmwood.tn
                </a>
              </li>
              <li>
                <a href="tel:98134335" className="hover:text-foreground transition-colors">
                  98 134 335
                </a>
              </li>
              <li>
                <a href="tel:70870210" className="hover:text-foreground transition-colors">
                  70 870 210
                </a>
              </li>
              <li className="text-muted-foreground">
                Riadh Andalous, Tunis
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-border flex flex-col md:flex-row md:items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© 2025 BM Wood. Tous droits réservés.</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-foreground transition-colors">
              Confidentialité
            </Link>
            <Link href="#" className="hover:text-foreground transition-colors">
              Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
