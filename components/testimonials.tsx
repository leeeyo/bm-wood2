"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import useEmblaCarousel from "embla-carousel-react"
import { Quote, ChevronLeft, ChevronRight } from "lucide-react"

const TESTIMONIALS = [
  {
    id: 1,
    content: "BM Wood a transformé notre cuisine en un espace de rêve. Une qualité exceptionnelle et un travail soigné. Je recommande vivement !",
    author: "Sophie M.",
    role: "Particulier",
  },
  {
    id: 2,
    content: "Notre dressing sur mesure dépasse toutes nos attentes. L'équipe a su comprendre nos besoins et livrer un résultat parfait.",
    author: "Karim B.",
    role: "Particulier",
  },
  {
    id: 3,
    content: "Professionnalisme et savoir-faire au rendez-vous. Un partenaire de confiance pour tous nos projets de menuiserie.",
    author: "Amira D.",
    role: "Architecte d'intérieur",
  },
  {
    id: 4,
    content: "Des habillages muraux en bois d'une finition impeccable. Un vrai plus pour notre salon.",
    author: "Nabil T.",
    role: "Particulier",
  },
]

const AUTOPLAY_DELAY = 6000

export function Testimonials() {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, duration: 25 },
    [],
  )

  const scrollPrev = useCallback(() => {
    emblaApi?.scrollPrev()
  }, [emblaApi])

  const scrollNext = useCallback(() => {
    emblaApi?.scrollNext()
  }, [emblaApi])

  const scrollTo = useCallback(
    (index: number) => {
      emblaApi?.scrollTo(index)
    },
    [emblaApi],
  )

  useEffect(() => {
    if (!emblaApi) return
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap())
    emblaApi.on("select", onSelect)
    return () => {
      emblaApi.off("select", onSelect)
    }
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    const interval = setInterval(() => {
      emblaApi.scrollNext()
    }, AUTOPLAY_DELAY)
    return () => clearInterval(interval)
  }, [emblaApi])

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setRevealed(true)
      },
      { threshold: 0.2 },
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      id="testimonials"
      ref={sectionRef}
      className="relative py-24 md:py-20 xl:py-16 bg-secondary/30 overflow-hidden"
    >
      <div
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
        aria-hidden
      />
      <div className="container relative mx-auto px-6 md:px-12">
        <div
          className={`mb-16 transition-all duration-700 ${
            revealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <p className="text-muted-foreground text-sm tracking-[0.3em] uppercase mb-6 font-ui">
            Avis clients
          </p>
          <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-4xl font-medium tracking-tight">
            Ce que disent nos clients
          </h2>
        </div>

        <div
          ref={emblaRef}
          className="overflow-hidden"
        >
          <div className="flex -ml-4">
            {TESTIMONIALS.map((testimonial) => (
              <div
                key={testimonial.id}
                className="min-w-0 flex-[0_0_100%] pl-4"
              >
                <article
                  className={`h-full rounded-lg border border-border bg-card p-8 transition-all duration-500 hover:shadow-lg hover:border-accent/30 ${
                    revealed ? "animate-fade-in-up" : ""
                  }`}
                >
                  <Quote className="w-10 h-10 text-accent/60 mb-6" aria-hidden />
                  <p className="text-foreground leading-relaxed mb-6 max-w-2xl">
                    "{testimonial.content}"
                  </p>
                  <div>
                    <span className="font-medium text-foreground">{testimonial.author}</span>
                    <span className="text-muted-foreground text-sm font-ui ml-2">
                      — {testimonial.role}
                    </span>
                  </div>
                </article>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 mt-12">
          <button
            onClick={scrollPrev}
            className="p-2 rounded-full border border-border hover:bg-muted/50 transition-colors"
            aria-label="Témoignage précédent"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex gap-2">
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                onClick={() => scrollTo(i)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  i === selectedIndex ? "bg-foreground scale-125" : "bg-muted-foreground/50 hover:bg-muted-foreground/70"
                }`}
                aria-label={`Aller au témoignage ${i + 1}`}
              />
            ))}
          </div>
          <button
            onClick={scrollNext}
            className="p-2 rounded-full border border-border hover:bg-muted/50 transition-colors"
            aria-label="Témoignage suivant"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  )
}
