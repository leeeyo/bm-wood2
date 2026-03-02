import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Home, LayoutGrid, FileText, ArrowLeft } from "lucide-react"

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      <section className="relative flex-1 flex items-center justify-center py-24 md:py-32 overflow-hidden">
        {/* Background - matches hero/call-to-action aesthetic */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{ backgroundImage: "url(/images/hously-background.png)" }}
          aria-hidden
        />
        <div
          className="absolute inset-0 z-0 opacity-90"
          style={{
            background:
              "linear-gradient(135deg, var(--foreground) 0%, oklch(0.2 0.01 75) 50%, var(--foreground) 100%)",
            backgroundSize: "200% 200%",
            animation: "gradient-shift 12s ease infinite",
          }}
          aria-hidden
        />
        <div className="absolute inset-0 z-0 bg-foreground/80" aria-hidden />

        {/* Subtle floating accents */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <span
            className="absolute top-1/4 left-[10%] w-2 h-2 rounded-full bg-primary-foreground/20 animate-float"
            style={{ animationDelay: "0s" }}
            aria-hidden
          />
          <span
            className="absolute top-1/3 right-[15%] w-3 h-3 rounded-full bg-primary-foreground/15 animate-float"
            style={{ animationDelay: "1.5s" }}
            aria-hidden
          />
          <span
            className="absolute bottom-1/3 left-[20%] w-2 h-2 rounded-full bg-primary-foreground/10 animate-float"
            style={{ animationDelay: "3s" }}
            aria-hidden
          />
        </div>

        <div className="container relative z-10 mx-auto px-6 md:px-12">
          <div className="max-w-2xl mx-auto text-center animate-slide-up-fade">
            {/* 404 number - decorative */}
            <p
              className="text-6xl md:text-8xl font-medium text-primary-foreground/20 tracking-tighter mb-4 select-none"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              404
            </p>

            <p className="text-primary-foreground/60 text-sm tracking-[0.3em] uppercase mb-6 font-ui">
              Page introuvable
            </p>

            <h1
              className="text-2xl md:text-3xl lg:text-4xl font-medium leading-tight text-primary-foreground mb-6"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Cette page semble avoir
              <br />
              <span className="text-[rgb(251,146,60)]">disparu des radars</span>
            </h1>

            <p className="text-primary-foreground/70 text-base md:text-lg leading-relaxed mb-10 max-w-md mx-auto">
              La page que vous recherchez n'existe pas ou a été déplacée. Retournez à l'accueil ou explorez notre catalogue.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 bg-primary-foreground text-foreground px-6 py-3 text-sm font-ui tracking-wide hover:bg-primary-foreground/90 transition-all duration-300 group hover:scale-105"
              >
                <Home className="w-4 h-4" />
                Retour à l'accueil
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              </Link>
              <Link
                href="/catalogue"
                className="inline-flex items-center justify-center gap-2 border border-primary-foreground/30 text-primary-foreground px-6 py-3 text-sm font-ui tracking-wide hover:bg-primary-foreground/10 transition-all duration-300 hover:scale-105"
              >
                <LayoutGrid className="w-4 h-4" />
                Catalogue
              </Link>
              <Link
                href="/demander-un-devis"
                className="inline-flex items-center justify-center gap-2 border border-primary-foreground/30 text-primary-foreground px-6 py-3 text-sm font-ui tracking-wide hover:bg-primary-foreground/10 transition-all duration-300 hover:scale-105"
              >
                <FileText className="w-4 h-4" />
                Demander un devis
              </Link>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}
