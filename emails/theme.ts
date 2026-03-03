/**
 * Shared theme constants for BM Wood email templates.
 * Matches landing page: dark charcoal primary, warm beige accent, premium serif feel.
 */

import { business } from "@/lib/config/business";

export const theme = {
  primary: "#2d2a26",
  primaryLight: "#3d3a35",
  accent: "#C4A574",
  accentLight: "#d4bb93",
  accentDark: "#a8894f",
  background: "#f7f5f2",
  surface: "#ffffff",
  surfaceAlt: "#faf9f7",
  text: "#2d2a26",
  textSecondary: "#5a554f",
  muted: "#8a847d",
  border: "#e8e3dc",
  borderLight: "#f0ece7",
  white: "#ffffff",
  success: "#2e7d52",
  info: "#2a6fa8",
  warning: "#c47f1a",
  danger: "#b53d2f",
  radius: "8px",
  radiusLg: "12px",
  fontHeading: "Georgia, 'Times New Roman', serif",
  fontBody:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
} as const;

const baseUrl =
  process.env.NEXT_PUBLIC_APP_URL || business.url;

export const businessInfo = {
  name: business.name,
  tagline: "Menuiserie sur mesure",
  address: business.addressFormatted,
  phones: business.phonesFormatted,
  email: business.email,
  url: baseUrl,
  mapsLink: business.mapsLink,
  logoUrl: "https://bmwood.tn/icons/logo-f.png",
} as const;
