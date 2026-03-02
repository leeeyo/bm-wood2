"use client"

import { useState } from "react"
import Link from "next/link"
import { Plus } from "lucide-react"

const faqs = [
  {
    question: "Où êtes-vous situés ?",
    answer:
      "Notre atelier est basé à Ariana (Avenue Ibn Khaldoun). Nous intervenons dans toute la région de Tunis et ses environs pour réaliser vos projets de menuiserie et d'agencement sur mesure.",
  },
  {
    question: "Quel est le délai de réalisation d'un projet ?",
    answer:
      "Les délais varient selon l'envergure et la complexité du projet. Un projet standard prend généralement entre 4 à 8 semaines de la conception à la livraison. Nous travaillons en étroite collaboration avec nos clients pour établir des délais réalistes.",
  },
  {
    question: "Quels matériaux utilisez-vous ?",
    answer:
      "Nous privilégions des matériaux de qualité supérieure, principalement du bois massif et des panneaux agglomérés de haute qualité. Nous sélectionnons rigoureusement nos fournisseurs pour garantir durabilité et finitions impeccables.",
  },
  {
    question: "Quels services proposez-vous ?",
    answer:
      "Nous proposons une gamme complète de services : cuisines sur mesure, habillage mural, portes, agencement de salon, cache radiateur et dressings. Chaque projet est conçu selon vos besoins spécifiques.",
  },
  {
    question: "Travaillez-vous sur des projets de rénovation ?",
    answer:
      "Absolument. Nous excellons dans l'adaptation et la rénovation d'espaces existants. Que ce soit pour une rénovation complète ou des modifications ponctuelles, nous abordons chaque projet avec respect et créativité.",
  },
  {
    question: "Comment démarrer un projet ?",
    answer:
      "Commencez par une consultation initiale où nous discutons de votre vision, vos besoins, votre budget et vos délais. Cela nous permet de comprendre si nous sommes le bon partenaire pour votre projet. Ensuite, nous établirons un devis personnalisé.",
  },
]

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggleQuestion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section id="faq" className="relative py-16 md:py-20 xl:py-16 overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 20h40M20 0v40' stroke='%23000' stroke-width='0.5' fill='none'/%3E%3C/svg%3E")`,
        }}
        aria-hidden
      />
      <div className="container relative mx-auto px-6 md:px-12">
        <div className="max-w-3xl mb-16">
          <p className="text-muted-foreground text-sm tracking-[0.3em] uppercase mb-6 font-ui">FAQ</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl xl:text-5xl font-medium leading-[1.15] tracking-tight mb-6 text-balance">
            Questions & Réponses
          </h2>
        </div>

        <div>
          {faqs.map((faq, index) => (
            <div key={index} className={`border-b border-border transition-colors duration-300 ${openIndex === index ? "animate-pulse-subtle" : ""}`}>
              <button
                onClick={() => toggleQuestion(index)}
                className="w-full py-6 flex items-start justify-between gap-6 text-left group"
              >
                <span className="text-lg font-medium text-foreground transition-colors group-hover:text-foreground/70">
                  {faq.question}
                </span>
                <Plus
                  className={`w-6 h-6 text-foreground flex-shrink-0 transition-transform duration-300 ease-out ${
                    openIndex === index ? "rotate-45" : "rotate-0"
                  }`}
                  strokeWidth={1.5}
                />
              </button>
              <div
                className={`grid transition-[grid-template-rows] duration-500 ease-in-out ${
                  openIndex === index ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                }`}
              >
                <div className="overflow-hidden">
                  <div
                    className={`transition-all duration-500 ease-out ${
                      openIndex === index
                        ? "opacity-100 scale-y-100"
                        : "opacity-0 scale-y-95"
                    }`}
                  >
                    <p className="text-muted-foreground leading-relaxed pb-6 pr-12">{faq.answer}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-muted-foreground mb-4 font-ui">Encore des questions ?</p>
          <Link
            href="/demander-un-devis"
            className="inline-flex items-center gap-2 text-foreground font-medium hover:text-accent transition-colors"
          >
            Contactez-nous pour en discuter
          </Link>
        </div>
      </div>
    </section>
  )
}
