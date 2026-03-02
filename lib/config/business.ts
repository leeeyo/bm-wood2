/**
 * Single source of truth for BM Wood business profile.
 * Used across footer, contact, devis, schema, and WhatsApp.
 */

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://bmwood.tn"

export const business = {
  name: "BM Wood",
  url: BASE_URL,
  email: "contact@bmwood.tn",
  /** Primary phone for display and tel: links (no spaces) */
  primaryPhone: "98134335",
  /** Primary phone formatted for display */
  primaryPhoneFormatted: "98 134 335",
  /** Secondary phones for display */
  secondaryPhones: ["70 870 210", "98 134 337"] as const,
  /** All phones formatted for display (primary first) */
  phonesFormatted: "98 134 335 / 70 870 210" as const,
  /** WhatsApp number (international format, no +) */
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "21698134335",
  /** Street address */
  streetAddress: "Avenue Ibn Khaldoun",
  /** Locality (city) */
  locality: "Ariana",
  /** Region */
  region: "Tunis",
  /** Country code */
  country: "TN",
  /** Full address for display */
  addressFormatted: "Avenue Ibn Khaldoun, Ariana",
  /** Google Maps embed query */
  mapsQuery: "BM+WOOD+Avenue+Ibn+Khaldoun+Ariana+Tunisia",
  /** Google Maps link */
  mapsLink: "https://maps.app.goo.gl/RzkSTCyQ5j9XbXW19",
  /** Opening hours for schema (optional) */
  openingHours: undefined as string[] | undefined,
} as const

export type Business = typeof business
