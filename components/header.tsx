"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { useAuth } from "@/lib/contexts/auth-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown, LogOut, LayoutDashboard, User } from "lucide-react"
import { UserRole } from "@/types/models.types"

// Showroom megamenu – static list (always visible, no fetch race)
const showroomItems = [
  { label: "Cuisines", href: "/catalogue/cuisine", description: "Modèles, matériaux, accessoires" },
  { label: "Dressings", href: "/catalogue/dressing", description: "Optimisation d'espace, finitions" },
  { label: "Portes", href: "/catalogue/porte", description: "Portes intérieures et extérieures" },
  { label: "Habillage mural", href: "/catalogue/habillage-mural", description: "Revêtements muraux en bois" },
]

const navItems = [
  { label: "Accueil", href: "/" },
  { label: "Réalisations", href: "/realisations" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
]

export function Header() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { isAuthenticated, user, logout } = useAuth()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const closeMobileMenu = () => {
    setMobileMenuOpen(false)
  }

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname === "/") {
      e.preventDefault()
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const linkClass =
    "hover:text-[rgb(251,146,60)] transition-colors duration-300 relative after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 hover:after:w-full after:bg-[rgb(251,146,60)] after:transition-all after:duration-300 text-white"

  return (
    <header
      className={cn(
        "fixed z-50 transition-all duration-500 my-0 py-0 rounded-none",
        scrolled || mobileMenuOpen
          ? "bg-primary backdrop-blur-md py-2 top-2 left-2 right-2 rounded-xl"
          : "bg-transparent py-4 top-0 left-0 right-0",
      )}
    >
      <nav className="container mx-auto px-6 relative flex items-center md:px-[24]">
        {/* Left side - logo */}
        <div className="flex items-center">
          <Link
            href="/"
            className="transition-all duration-500"
            onClick={handleLogoClick}
          >
            <Image
              src="/bmwood-header.png"
              alt="BM Wood"
              width={scrolled ? 80 : 240}
              height={scrolled ? 32 : 110}
              className={cn(
                "w-auto transition-all duration-500",
                scrolled ? "h-7" : "h-24 md:h-28 lg:h-36",
              )}
            />
          </Link>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Center - Navigation with Megamenu */}
        <div className={cn("hidden md:flex items-center tracking-wide font-bold", scrolled ? "gap-8 lg:gap-10 text-xs" : "gap-12 lg:gap-16 text-sm")} style={{ fontFamily: "var(--font-heading)" }}>
          <Link href="/" className={linkClass}>
            Accueil
          </Link>

          <div className="relative group/showroom">
            <button
              type="button"
              className={cn("inline-flex items-center gap-1 font-bold", linkClass)}
              aria-haspopup="true"
              aria-expanded="false"
            >
              Showroom
              <ChevronDown className="w-4 h-4 transition-transform group-hover/showroom:rotate-180" />
            </button>
            <div className="absolute left-0 top-full pt-1 opacity-0 pointer-events-none group-hover/showroom:opacity-100 group-hover/showroom:pointer-events-auto transition-opacity duration-150">
              <div className="bg-primary border border-white/10 rounded-md shadow-xl min-w-[280px] p-3">
                <ul className="grid gap-1">
                  {showroomItems.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="flex flex-col w-full rounded-md px-4 py-3 text-white hover:bg-white/10 transition-colors"
                      >
                        <span className="font-semibold hover:text-[rgb(251,146,60)] transition-colors">
                          {item.label}
                        </span>
                        {item.description && (
                          <span className="text-xs text-white/70 mt-0.5">
                            {item.description}
                          </span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {navItems.slice(1).map((item) => (
            <Link key={item.label} href={item.href} className={linkClass}>
              {item.label}
            </Link>
          ))}

          <Link href="/demander-un-devis" className={linkClass}>
            Demander un devis
          </Link>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right side - Login/Dashboard + CTA */}
        <div className="hidden md:flex items-center gap-2 lg:gap-3">
          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={cn(
                    "inline-flex items-center gap-2 rounded-md transition-all duration-300 text-white hover:bg-white/10",
                    scrolled ? "text-xs px-3 py-1.5" : "text-sm px-4 py-2",
                  )}
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  <User className="w-4 h-4" />
                  <span className="max-w-[100px] truncate">
                    {user.firstName || user.email}
                  </span>
                  <ChevronDown className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href="/mon-compte" className="flex items-center gap-2 cursor-pointer">
                    <User className="w-4 h-4" />
                    Mon compte
                  </Link>
                </DropdownMenuItem>
                {user.role === UserRole.ADMIN && (
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="flex items-center gap-2 cursor-pointer">
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => logout()}
                  className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="w-4 h-4" />
                  Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link
              href="/login"
              className={cn(
                "inline-flex items-center gap-2 transition-all duration-300 text-white hover:text-[rgb(251,146,60)]",
                scrolled ? "text-xs px-3 py-1.5" : "text-sm px-4 py-2",
              )}
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Connexion
            </Link>
          )}

          <Link
            href="/demander-un-devis"
            className={cn(
              "inline-flex items-center gap-2 transition-all duration-300",
              "bg-white text-foreground border border-foreground/20 hover:bg-foreground hover:text-white",
              scrolled ? "text-xs px-4 py-2" : "text-sm px-6 py-3",
            )}
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Devis Gratuit
          </Link>
        </div>

        <button
          className="md:hidden z-50 transition-colors duration-300 text-white"
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <line x1="4" y1="8" x2="20" y2="8" />
              <line x1="4" y1="16" x2="20" y2="16" />
            </svg>
          )}
        </button>
      </nav>

      {/* Mobile menu */}
      <div
        className={cn(
          "md:hidden overflow-hidden transition-all duration-300 ease-in-out",
          mobileMenuOpen ? "max-h-[700px] opacity-100 mt-8" : "max-h-0 opacity-0",
        )}
      >
        <div className="container mx-auto px-6">
          <ul className="flex flex-col gap-6 mb-8" style={{ fontFamily: "var(--font-heading)" }}>
            <li>
              <Link href="/" className="hover:text-[rgb(251,146,60)] transition-colors duration-300 text-white text-4xl font-light block" onClick={closeMobileMenu}>
                Accueil
              </Link>
            </li>
            <li>
              <span className="text-white/60 text-2xl font-light block mb-2">Showroom</span>
              <ul className="flex flex-col gap-3 pl-4">
                {showroomItems.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="hover:text-[rgb(251,146,60)] transition-colors duration-300 text-white text-2xl font-light block"
                      onClick={closeMobileMenu}
                    >
                      {item.label}
                      {"description" in item && item.description && (
                        <span className="block text-lg text-white/70 font-normal">
                          {item.description}
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
            <li>
              <Link href="/realisations" className="hover:text-[rgb(251,146,60)] transition-colors duration-300 text-white text-4xl font-light block" onClick={closeMobileMenu}>
                Réalisations
              </Link>
            </li>
            <li>
              <Link href="/blog" className="hover:text-[rgb(251,146,60)] transition-colors duration-300 text-white text-4xl font-light block" onClick={closeMobileMenu}>
                Blog
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-[rgb(251,146,60)] transition-colors duration-300 text-white text-4xl font-light block" onClick={closeMobileMenu}>
                Contact
              </Link>
            </li>
            <li>
              <Link href="/demander-un-devis" className="hover:text-[rgb(251,146,60)] transition-colors duration-300 text-white text-4xl font-light block" onClick={closeMobileMenu}>
                Demander un devis
              </Link>
            </li>
            {isAuthenticated ? (
              <>
                <li>
                  <Link href="/mon-compte" className="hover:text-[rgb(251,146,60)] transition-colors duration-300 text-white text-4xl font-light block" onClick={closeMobileMenu}>
                    Mon compte
                  </Link>
                </li>
                {user?.role === UserRole.ADMIN && (
                  <li>
                    <Link href="/dashboard" className="hover:text-[rgb(251,146,60)] transition-colors duration-300 text-white text-4xl font-light block" onClick={closeMobileMenu}>
                      Dashboard
                    </Link>
                  </li>
                )}
              </>
            ) : (
              <li>
                <Link href="/login" className="hover:text-[rgb(251,146,60)] transition-colors duration-300 text-white text-4xl font-light block" onClick={closeMobileMenu}>
                  Connexion
                </Link>
              </li>
            )}
          </ul>

          <Link
            href="/demander-un-devis"
            className="inline-flex items-center justify-center gap-2 text-sm px-6 py-3 bg-white text-foreground border border-foreground/20 hover:bg-foreground hover:text-white transition-all duration-300 mb-4 font-medium w-full"
            onClick={closeMobileMenu}
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Devis Gratuit
          </Link>
        </div>
      </div>
    </header>
  )
}
