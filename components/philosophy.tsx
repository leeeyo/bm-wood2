"use client"

import { StoryCarousel, type StorySlide } from "./story-carousel"
import { HighlightedText } from "./highlighted-text"

const PHILOSOPHY_SLIDES: StorySlide[] = [
  { image: "/philosophie-services/bois-passion.png", headline: "Le bois, notre passion" },
  { image: "/philosophie-services/tradition.png", headline: "Tradition et excellence" },
  { image: "/philosophie-services/Chaque%20projet%20unique.png", headline: "Savoir-faire tunisien" },
  { image: "/philosophie-services/Savoir-faire%20tunisien.png", headline: "Chaque Projet Unique" },
]

export function Philosophy() {
  return (
    <StoryCarousel
      slides={PHILOSOPHY_SLIDES}
      sectionLabel="Notre philosophie"
      sectionTitle={
        <>
          Concevoir avec
          <br />
          <HighlightedText>intention</HighlightedText>
        </>
      }
      sectionId="about"
      autoplayDelay={6000}
    />
  )
}
