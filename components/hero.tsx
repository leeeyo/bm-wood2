"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { ArrowDown, Sparkles } from "lucide-react"

export function Hero() {
  const contentRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLElement>(null)
  const bgLayerRef = useRef<HTMLDivElement>(null)
  const fgLayerRef = useRef<HTMLDivElement>(null)
  const [animationProgress, setAnimationProgress] = useState(0)
  const [animationComplete, setAnimationComplete] = useState(false)
  const accumulatedScrollRef = useRef(0)
  const lastTouchY = useRef<number>(0)

  const scrollToFeatured = () => {
    document.getElementById("featured-products")?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      const atTopOfPage = window.scrollY === 0

      if (atTopOfPage && !animationComplete) {
        e.preventDefault()

        accumulatedScrollRef.current = Math.max(0, Math.min(700, accumulatedScrollRef.current + e.deltaY))

        const newProgress = Math.max(0, Math.min(1, accumulatedScrollRef.current / 700))
        setAnimationProgress(newProgress)

        if (newProgress >= 1) {
          setAnimationComplete(true)
        }

        if (contentRef.current) {
          const translateY = newProgress * 200
          const rotationX = newProgress * 45
          const scale = 1 - newProgress * 0.3
          contentRef.current.style.transform = `translateY(${translateY}px) rotateX(${rotationX}deg) scale(${scale})`
        }
      } else if (atTopOfPage && animationComplete && e.deltaY < 0) {
        e.preventDefault()

        accumulatedScrollRef.current = Math.max(0, Math.min(700, accumulatedScrollRef.current + e.deltaY))

        const newProgress = Math.max(0, Math.min(1, accumulatedScrollRef.current / 700))
        setAnimationProgress(newProgress)

        if (newProgress < 1) {
          setAnimationComplete(false)
        }

        if (contentRef.current) {
          const translateY = newProgress * 200
          const rotationX = newProgress * 45
          const scale = 1 - newProgress * 0.3
          contentRef.current.style.transform = `translateY(${translateY}px) rotateX(${rotationX}deg) scale(${scale})`
        }
      }
    }

    const handleTouchStart = (e: TouchEvent) => {
      lastTouchY.current = e.touches[0].clientY
    }

    const handleTouchMove = (e: TouchEvent) => {
      const atTopOfPage = window.scrollY === 0
      const currentTouchY = e.touches[0].clientY
      const deltaY = lastTouchY.current - currentTouchY

      if (atTopOfPage && !animationComplete) {
        e.preventDefault()

        accumulatedScrollRef.current = Math.max(0, Math.min(700, accumulatedScrollRef.current + deltaY * 3))

        const newProgress = Math.max(0, Math.min(1, accumulatedScrollRef.current / 700))
        setAnimationProgress(newProgress)

        if (newProgress >= 1) {
          setAnimationComplete(true)
        }

        if (contentRef.current) {
          const translateY = newProgress * 200
          const rotationX = newProgress * 45
          const scale = 1 - newProgress * 0.3
          contentRef.current.style.transform = `translateY(${translateY}px) rotateX(${rotationX}deg) scale(${scale})`
        }
      } else if (atTopOfPage && animationComplete && deltaY < 0) {
        e.preventDefault()

        accumulatedScrollRef.current = Math.max(0, Math.min(700, accumulatedScrollRef.current + deltaY * 3))

        const newProgress = Math.max(0, Math.min(1, accumulatedScrollRef.current / 700))
        setAnimationProgress(newProgress)

        if (newProgress < 1) {
          setAnimationComplete(false)
        }

        if (contentRef.current) {
          const translateY = newProgress * 200
          const rotationX = newProgress * 45
          const scale = 1 - newProgress * 0.3
          contentRef.current.style.transform = `translateY(${translateY}px) rotateX(${rotationX}deg) scale(${scale})`
        }
      }

      lastTouchY.current = currentTouchY
    }

    window.addEventListener("wheel", handleWheel, { passive: false })
    window.addEventListener("touchstart", handleTouchStart, { passive: false })
    window.addEventListener("touchmove", handleTouchMove, { passive: false })

    return () => {
      window.removeEventListener("wheel", handleWheel)
      window.removeEventListener("touchstart", handleTouchStart)
      window.removeEventListener("touchmove", handleTouchMove)
    }
  }, [animationComplete])

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY
      const heroHeight = heroRef.current?.offsetHeight ?? 800
      if (y <= heroHeight && bgLayerRef.current) {
        const rate = y / heroHeight
        bgLayerRef.current.style.transform = `translateY(${y * 0.4}px) scale(${1 + rate * 0.05})`
      }
      if (y <= heroHeight && fgLayerRef.current) {
        fgLayerRef.current.style.transform = `translateY(${y * 0.15}px)`
      }
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <section id="hero" ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div ref={bgLayerRef} className="absolute inset-0 z-0 transition-transform duration-100 will-change-transform">
        <img
          src="/images/hously-background.png"
          alt="Minimalist architectural interior"
          className="w-full h-full object-cover object-center"
        />
        <div
          className="absolute inset-0 bg-linear-to-b from-primary/30 via-transparent to-primary/50"
          aria-hidden
        />
      </div>

      <div
        ref={contentRef}
        className="container mx-auto px-6 md:px-12 lg:pt-0 relative z-10 pb-0 pl-1 pr-1 pt-8 md:pt-0"
        style={{
          willChange: "transform",
          transform: "translateY(0px)",
          perspective: "1000px",
          transformStyle: "preserve-3d",
        }}
      >
        <div className="mb-72 md:mb-60 lg:mb-80">
          <p className="text-xs tracking-[0.3em] uppercase text-center text-secondary mb-1 lg:mt-30 font-ui">
            Menuiserie & Agencement
          </p>

          <h1
            className="animate-in fade-in slide-in-from-bottom-8 duration-1000 fill-mode-both text-4xl font-medium text-balance text-center text-white mb-6 tracking-tight leading-tight md:text-5xl lg:text-6xl"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            Nous créons des espaces
            <br />
            <span className="text-orange-200">sur mesure en bois</span>
          </h1>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 fill-mode-both delay-300">
            <Link
              href="/demander-un-devis"
              className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 text-sm font-ui tracking-wide hover:bg-primary/90 transition-colors"
            >
              Demander un devis
            </Link>
            <button
              type="button"
              onClick={scrollToFeatured}
              className="inline-flex items-center justify-center gap-2 border border-white/40 text-white px-6 py-3 text-sm font-ui tracking-wide hover:bg-white/10 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              Découvrir nos créations
            </button>
          </div>
        </div>
      </div>

      <div ref={fgLayerRef} className="absolute inset-0 z-20 pointer-events-none will-change-transform">
        <img
          src="/images/hously-foreground.png"
          alt="Marble kitchen island detail"
          className="w-full h-full object-cover object-center animate-float"
        />
      </div>

      {animationComplete && (
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-30 animate-pulse">
          <ArrowDown className="w-5 h-5 text-white/80" aria-hidden />
        </div>
      )}
    </section>
  )
}
