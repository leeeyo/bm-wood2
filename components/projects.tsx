"use client"

import { useState, useEffect, useRef } from "react"
import { ArrowUpRight } from "lucide-react"

const categories = [
  {
    id: 1,
    title: "Cuisine",
    description: "Cuisines sur mesure",
    image: "/images/hously-1.png",
  },
  {
    id: 2,
    title: "Habillage Mural",
    description: "Revêtements muraux en bois",
    image: "/images/hously-2.png",
  },
  {
    id: 3,
    title: "Porte",
    description: "Portes intérieures et extérieures",
    image: "/images/hously-3.png",
  },
  {
    id: 4,
    title: "Salon",
    description: "Agencement de salon sur mesure",
    image: "/images/hously-4.png",
  },
  {
    id: 5,
    title: "Cache Radiateur",
    description: "Habillages de radiateurs",
    image: "/images/desk.png",
  },
  {
    id: 6,
    title: "Dressing",
    description: "Dressings et rangements sur mesure",
    image: "/images/exterior.png",
  },
]

export function Projects() {
  const [hoveredId, setHoveredId] = useState<number | null>(null)
  const [revealedImages, setRevealedImages] = useState<Set<number>>(new Set())
  const imageRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = imageRefs.current.indexOf(entry.target as HTMLDivElement)
            if (index !== -1) {
              setRevealedImages((prev) => new Set(prev).add(categories[index].id))
            }
          }
        })
      },
      { threshold: 0.2 },
    )

    imageRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref)
    })

    return () => observer.disconnect()
  }, [])

  return (
    <section id="projects" className="py-32 md:py-29 bg-secondary/50">
      <div className="container mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16">
          <div>
            <p className="text-muted-foreground text-sm tracking-[0.3em] uppercase mb-6">Sélection</p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight">Nos Catégories</h2>
          </div>
          <a
            href="#"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
          >
            Voir toutes les catégories
            <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </div>

        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          {categories.map((category, index) => (
            <article
              key={category.id}
              className="group cursor-pointer"
              onMouseEnter={() => setHoveredId(category.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <div ref={(el) => { imageRefs.current[index] = el; }} className="relative overflow-hidden aspect-[4/3] mb-6">
                <img
                  src={category.image || "/placeholder.svg"}
                  alt={category.title}
                  className={`w-full h-full object-cover transition-transform duration-700 ${
                    hoveredId === category.id ? "scale-105" : "scale-100"
                  }`}
                />
                <div
                  className="absolute inset-0 bg-primary origin-top"
                  style={{
                    transform: revealedImages.has(category.id) ? "scaleY(0)" : "scaleY(1)",
                    transition: "transform 1.5s cubic-bezier(0.76, 0, 0.24, 1)", // Increased duration from 0.6s to 1.5s for slower reveal
                  }}
                />
              </div>

              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-medium mb-2 group-hover:underline underline-offset-4">{category.title}</h3>
                  <p className="text-muted-foreground text-sm">
                    {category.description}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
