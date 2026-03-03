"use client"

import { useEffect, useRef, useState } from "react"
import { SafeImage } from "@/components/ui/safe-image"
import { HighlightedText } from "./highlighted-text"

interface PhilosophyItem {
  image: string
  title: string
  description: string
}

const PHILOSOPHY_ITEMS: PhilosophyItem[] = [
  {
    image: "/philosophie-services/bois-passion.png",
    title: "Le bois, notre passion",
    description:
      "Chaque essence est choisie avec soin pour sublimer vos espaces de vie.",
  },
  {
    image: "/philosophie-services/tradition.png",
    title: "Tradition et excellence",
    description:
      "Des techniques ancestrales au service d'une exigence contemporaine.",
  },
  {
    image: "/philosophie-services/Chaque%20projet%20unique.png",
    title: "Savoir-faire tunisien",
    description:
      "Un héritage artisanal transmis de génération en génération.",
  },
  {
    image: "/philosophie-services/Savoir-faire%20tunisien.png",
    title: "Chaque Projet Unique",
    description:
      "Votre vision devient réalité grâce à une approche entièrement sur mesure.",
  },
]

const GRID_PLACEMENT = [
  "md:row-span-2",
  "",
  "",
  "md:col-span-2",
]

export function Philosophy() {
  const sectionRef = useRef<HTMLElement>(null)
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setRevealed(true)
      },
      { threshold: 0.1 },
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      ref={sectionRef}
      id="about"
      className="relative py-24 md:py-20 xl:py-16 overflow-hidden"
    >
      <div className="container relative mx-auto px-6 md:px-12">
        <div
          className={`mb-12 transition-all duration-700 ${
            revealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <p className="text-muted-foreground text-sm tracking-[0.3em] uppercase mb-6 font-ui">
            Notre philosophie
          </p>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-medium tracking-tight text-balance">
            Concevoir avec
            <br />
            <HighlightedText>intention</HighlightedText>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 auto-rows-[240px] md:auto-rows-[280px]">
          {PHILOSOPHY_ITEMS.map((item, i) => (
            <div
              key={i}
              className={`group relative overflow-hidden rounded-lg cursor-default ${GRID_PLACEMENT[i]} transition-all duration-700 ${
                revealed
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
              style={{
                transitionDelay: revealed ? `${150 + i * 120}ms` : "0ms",
              }}
            >
              <SafeImage
                src={item.image}
                alt={item.title}
                fill
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
              />

              <div
                className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent transition-all duration-500 group-hover:from-black/80 group-hover:via-black/30"
                aria-hidden
              />

              <div
                className="absolute bottom-0 left-0 h-[3px] bg-orange-400 transition-all duration-500 ease-out w-0 group-hover:w-full"
                aria-hidden
              />

              <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8">
                <h3
                  className="text-lg md:text-xl lg:text-2xl font-medium text-white tracking-tight transition-transform duration-500 group-hover:-translate-y-1"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {item.title}
                </h3>
                <p className="text-white/0 text-sm mt-2 max-w-xs leading-relaxed transition-all duration-500 translate-y-4 group-hover:text-white/90 group-hover:translate-y-0 font-ui">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
