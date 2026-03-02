"use client"

import { StoryCarousel, type StorySlide } from "./story-carousel"
import { HighlightedText } from "./highlighted-text"

const SERVICES_SLIDES: StorySlide[] = [
  { image: "/philosophie-services/Menuiserie%20sur%20mesure.png", headline: "Menuiserie sur mesure" },
  { image: "/philosophie-services/Agencement%20int%C3%A9rieur.png", headline: "Agencement intérieur" },
  { image: "/philosophie-services/Solutions%20personnalis%C3%A9es.png", headline: "Solutions personnalisées" },
  { image: "/philosophie-services/Qualit%C3%A9%20premium.png", headline: "Qualité premium" },
]

export function Expertise() {
  return (
    <StoryCarousel
      slides={SERVICES_SLIDES}
      sectionLabel="Nos services"
      sectionTitle={
        <>
          <HighlightedText>Expertise</HighlightedText> raffinée
          <br />
          par la pratique
        </>
      }
      sectionId="services"
      autoplayDelay={6000}
    />
  )
}
