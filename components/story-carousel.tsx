"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { SafeImage } from "@/components/ui/safe-image"
import useEmblaCarousel from "embla-carousel-react"
import { ChevronLeft, ChevronRight } from "lucide-react"

export interface StorySlide {
  image: string
  headline: string
  alt?: string
}

interface StoryCarouselProps {
  slides: StorySlide[]
  sectionLabel: string
  sectionTitle: React.ReactNode
  sectionId?: string
  autoplayDelay?: number
}

const DEFAULT_AUTOPLAY_DELAY = 6000

export function StoryCarousel({
  slides,
  sectionLabel,
  sectionTitle,
  sectionId,
  autoplayDelay = DEFAULT_AUTOPLAY_DELAY,
}: StoryCarouselProps) {
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
    }, autoplayDelay)
    return () => clearInterval(interval)
  }, [emblaApi, autoplayDelay])

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
      ref={sectionRef}
      id={sectionId}
      className="relative py-24 md:py-20 xl:py-16 overflow-hidden"
    >
      <div className="container relative mx-auto px-6 md:px-12">
        <div
          className={`mb-12 transition-all duration-700 ${
            revealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <p className="text-muted-foreground text-sm tracking-[0.3em] uppercase mb-6 font-ui">
            {sectionLabel}
          </p>
          <div className="text-2xl md:text-3xl lg:text-4xl xl:text-4xl font-medium tracking-tight text-balance">
            {sectionTitle}
          </div>
        </div>

        <div ref={emblaRef} className="overflow-hidden rounded-lg">
          <div className="flex -ml-4">
            {slides.map((slide, i) => (
              <div
                key={i}
                className="min-w-0 flex-[0_0_100%] pl-4"
              >
                <div className="relative aspect-video w-full overflow-hidden">
                  <SafeImage
                    src={slide.image}
                    alt={slide.alt ?? slide.headline}
                    fill
                    className="object-cover"
                    sizes="100vw"
                  />
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent"
                    aria-hidden
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 flex items-end">
                    <h3
                      className="text-2xl md:text-3xl font-medium text-primary-foreground text-center w-full"
                      style={{ fontFamily: "var(--font-heading)" }}
                    >
                      {slide.headline}
                    </h3>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            onClick={scrollPrev}
            className="p-2 rounded-full border border-border hover:bg-muted/50 transition-colors"
            aria-label="Slide précédent"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => scrollTo(i)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  i === selectedIndex ? "bg-foreground scale-125" : "bg-muted-foreground/50 hover:bg-muted-foreground/70"
                }`}
                aria-label={`Aller au slide ${i + 1}`}
              />
            ))}
          </div>
          <button
            onClick={scrollNext}
            className="p-2 rounded-full border border-border hover:bg-muted/50 transition-colors"
            aria-label="Slide suivant"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  )
}
