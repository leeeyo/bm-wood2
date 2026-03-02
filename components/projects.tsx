"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

interface Category {
  id: number | string
  title: string
  description: string
  image: string
  slug: string
}

export function Projects() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [hoveredId, setHoveredId] = useState<number | string | null>(null)
  const [revealedImages, setRevealedImages] = useState<Set<number | string>>(new Set())
  const imageRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("/api/categories")
        const data = await res.json()

        if (data.success && data.data) {
          const apiCategories = data.data
            .filter((cat: { isActive: boolean }) => cat.isActive)
            .slice(0, 6)
            .map((cat: { _id: { toString: () => string }; name: string; description?: string; image?: string; slug: string }) => ({
              id: cat._id.toString(),
              title: cat.name,
              description: cat.description || "",
              image: cat.image || "",
              slug: cat.slug,
            }))
          setCategories(apiCategories)
        }
      } catch (err) {
        console.error("Error fetching categories:", err)
        setCategories([])
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = imageRefs.current.indexOf(entry.target as HTMLDivElement)
            if (index !== -1 && categories[index]) {
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
  }, [categories])

  return (
    <section id="projects" className="relative py-24 md:py-20 xl:py-16 bg-secondary/50 overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
        aria-hidden
      />
      <div className="container relative mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <p className="text-muted-foreground text-sm tracking-[0.3em] uppercase mb-6 font-ui">Sélection</p>
            <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-4xl font-medium tracking-tight">Nos Catégories</h2>
          </div>
          <Link
            href="/catalogue"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group font-ui"
          >
            Voir toutes les catégories
            <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-lg overflow-hidden animate-pulse">
                <div className="aspect-4/3 bg-muted mb-6 rounded-lg" />
                <div className="space-y-2">
                  <div className="h-5 bg-muted rounded w-1/3" />
                  <div className="h-4 bg-muted rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p>Aucune catégorie pour le moment.</p>
            <Link
              href="/catalogue"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mt-4 font-ui"
            >
              Voir le catalogue
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          {categories.map((category, index) => (
            <Link
              key={category.id}
              href={`/catalogue/${category.slug}`}
              className="group cursor-pointer block"
              onMouseEnter={() => setHoveredId(category.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <article className="relative">
                <div
                  ref={(el) => { imageRefs.current[index] = el; }}
                  className={`relative overflow-hidden aspect-4/3 mb-6 rounded-lg border-2 border-transparent transition-all duration-700 group-hover:border-accent/40 group-hover:shadow-xl group-hover:-translate-y-0.5 after:absolute after:inset-0 after:rounded-lg after:border-2 after:border-accent/0 after:transition-all after:duration-500 group-hover:after:border-accent/20 ${
                    revealedImages.has(category.id) ? "animate-in blur-in-sm fade-in duration-700" : ""
                  }`}
                >
                  <img
                    src={category.image || "/example.jpg"}
                    alt={category.title}
                    className={`w-full h-full object-cover transition-transform duration-700 ${
                      hoveredId === category.id ? "scale-105" : "scale-100"
                    }`}
                  />
                  <div
                    className="absolute inset-0 bg-primary origin-top"
                    style={{
                      transform: revealedImages.has(category.id) ? "scaleY(0)" : "scaleY(1)",
                      transition: "transform 1.5s cubic-bezier(0.76, 0, 0.24, 1)",
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-primary/0 group-hover:bg-primary/20 transition-colors duration-500">
                    <span className="font-ui text-sm tracking-widest uppercase text-primary-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-primary/80 px-4 py-2 rounded">
                      Voir les produits
                    </span>
                  </div>
                  <div className="absolute top-3 left-3">
                    <span className="font-ui text-[10px] tracking-widest uppercase bg-background/90 text-foreground px-2 py-1 rounded">
                      {category.title}
                    </span>
                  </div>
                </div>

                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-medium mb-2 group-hover:underline underline-offset-4">{category.title}</h3>
                    <p className="text-muted-foreground text-sm">
                      {category.description}
                    </p>
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors shrink-0 mt-1" />
                </div>
              </article>
            </Link>
          ))}
        </div>
        )}
      </div>
    </section>
  )
}
