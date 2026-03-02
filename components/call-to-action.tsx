"use client"

import Link from "next/link"
import { ArrowRight, FileText } from "lucide-react"
import { HighlightedText } from "./highlighted-text"

export function CallToAction() {
  return (
    <section id="contact" className="relative py-24 md:py-20 xl:py-16 bg-foreground text-primary-foreground overflow-hidden">
      <div
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: "url(/images/hously-background.png)" }}
        aria-hidden
      />
      <div
        className="absolute inset-0 z-0 opacity-90"
        style={{
          background: "linear-gradient(135deg, var(--foreground) 0%, oklch(0.2 0.01 75) 50%, var(--foreground) 100%)",
          backgroundSize: "200% 200%",
          animation: "gradient-shift 12s ease infinite",
        }}
        aria-hidden
      />
      <div className="absolute inset-0 z-0 bg-foreground/80" aria-hidden />

      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <span className="absolute top-1/4 left-[10%] w-2 h-2 rounded-full bg-primary-foreground/20 animate-float" style={{ animationDelay: "0s" }} aria-hidden />
        <span className="absolute top-1/3 right-[15%] w-3 h-3 rounded-full bg-primary-foreground/15 animate-float" style={{ animationDelay: "1.5s" }} aria-hidden />
        <span className="absolute bottom-1/3 left-[20%] w-2 h-2 rounded-full bg-primary-foreground/10 animate-float" style={{ animationDelay: "3s" }} aria-hidden />
        <span className="absolute bottom-1/4 right-[10%] w-1 h-1 rounded-full bg-primary-foreground/25 animate-float" style={{ animationDelay: "0.5s" }} aria-hidden />
      </div>

      <div className="container relative z-10 mx-auto px-6 md:px-12">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-primary-foreground/60 text-sm tracking-[0.3em] uppercase mb-8 font-ui">Démarrer un Projet</p>

          <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-medium leading-[1.1] tracking-tight mb-8 text-balance">
            Prêt à créer
            <br />
            quelque chose d'<HighlightedText>extraordinaire</HighlightedText> ?
          </h2>

          <p className="text-primary-foreground/70 text-lg md:text-xl leading-relaxed mb-6 max-w-2xl mx-auto">
            Discutons de la façon dont nous pouvons donner vie à votre vision. Chaque grand espace commence par une conversation.
          </p>

          <p className="text-primary-foreground/90 font-ui text-sm tracking-wider uppercase mb-12">
            Demandez votre devis gratuit aujourd'hui
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/demander-un-devis"
              className="inline-flex items-center justify-center gap-3 bg-primary-foreground text-foreground px-8 py-4 text-sm tracking-wide hover:bg-primary-foreground/90 transition-all duration-300 group hover:scale-105 hover:shadow-2xl hover:shadow-primary-foreground/20"
            >
              <FileText className="w-4 h-4" />
              Demander un devis
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <a
              href="mailto:contact@bmwood.tn"
              className="inline-flex items-center justify-center gap-2 border border-primary-foreground/30 px-8 py-4 text-sm tracking-wide hover:bg-primary-foreground/10 transition-all duration-300 hover:scale-105"
            >
              Contactez-nous
            </a>
            <a
              href="tel:98134335"
              className="inline-flex items-center justify-center gap-2 border border-primary-foreground/30 px-8 py-4 text-sm tracking-wide hover:bg-primary-foreground/10 transition-all duration-300 hover:scale-105"
            >
              Appelez-nous
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
