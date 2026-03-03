import * as React from "react";
import { Section, Text, Hr } from "@react-email/components";
import { BaseLayout } from "./components/base-layout";
import { theme } from "./theme";

export interface DevisConfirmationItem {
  description: string;
  quantity: number;
}

export interface DevisConfirmationEmailProps {
  firstName: string;
  lastName: string;
  reference: string;
  items: DevisConfirmationItem[];
}

export function DevisConfirmationEmail({
  firstName,
  lastName,
  reference,
  items,
}: DevisConfirmationEmailProps) {
  return (
    <BaseLayout headerSubtitle="Confirmation de votre demande">
      <Text style={greetingStyle}>
        Bonjour {firstName} {lastName},
      </Text>

      <Text style={paragraphStyle}>
        Nous avons bien reçu votre demande de devis. Notre équipe va l&apos;étudier
        et vous contactera dans les plus brefs délais.
      </Text>

      <Section style={referenceBoxStyle}>
        <Text style={referenceLabelStyle}>Référence</Text>
        <Text style={referenceValueStyle}>{reference}</Text>
      </Section>

      <Section style={cardStyle}>
        <Text style={cardHeadingStyle}>Récapitulatif de votre demande</Text>
        <Hr style={cardDividerStyle} />
        {items.map((item, index) => (
          <Section key={index} style={itemRowStyle}>
            <Text style={itemDescStyle}>
              {index + 1}. {item.description}
            </Text>
            <Text style={itemQtyStyle}>Quantité: {item.quantity}</Text>
          </Section>
        ))}
      </Section>

      <Text style={paragraphStyle}>
        En cas de questions, n&apos;hésitez pas à nous contacter. Nous nous
        engageons à vous répondre sous 48&nbsp;heures.
      </Text>
    </BaseLayout>
  );
}

const greetingStyle: React.CSSProperties = {
  fontSize: "20px",
  fontWeight: 600,
  fontFamily: theme.fontHeading,
  color: theme.text,
  margin: "0 0 20px",
};

const paragraphStyle: React.CSSProperties = {
  fontSize: "15px",
  lineHeight: "1.7",
  color: theme.text,
  margin: "0 0 24px",
};

const referenceBoxStyle: React.CSSProperties = {
  textAlign: "center" as const,
  backgroundColor: theme.primary,
  borderRadius: theme.radius,
  padding: "16px 24px",
  margin: "0 0 24px",
};

const referenceLabelStyle: React.CSSProperties = {
  fontSize: "11px",
  fontWeight: 600,
  color: theme.accentLight,
  letterSpacing: "0.1em",
  textTransform: "uppercase" as const,
  margin: "0 0 4px",
};

const referenceValueStyle: React.CSSProperties = {
  fontSize: "22px",
  fontWeight: 700,
  fontFamily: theme.fontHeading,
  color: theme.white,
  margin: 0,
  letterSpacing: "0.03em",
};

const cardStyle: React.CSSProperties = {
  backgroundColor: theme.surfaceAlt,
  border: `1px solid ${theme.border}`,
  borderRadius: theme.radius,
  padding: "20px 24px",
  margin: "0 0 24px",
};

const cardHeadingStyle: React.CSSProperties = {
  fontSize: "14px",
  fontWeight: 600,
  fontFamily: theme.fontHeading,
  color: theme.text,
  margin: "0 0 12px",
};

const cardDividerStyle: React.CSSProperties = {
  border: "none",
  borderTop: `1px solid ${theme.border}`,
  margin: "0 0 12px",
};

const itemRowStyle: React.CSSProperties = {
  padding: "6px 0",
};

const itemDescStyle: React.CSSProperties = {
  fontSize: "14px",
  color: theme.text,
  margin: "0 0 2px",
};

const itemQtyStyle: React.CSSProperties = {
  fontSize: "12px",
  color: theme.muted,
  margin: 0,
};

(
  DevisConfirmationEmail as React.FC & { PreviewProps?: unknown }
).PreviewProps = {
  firstName: "Aziz",
  lastName: "Allaya",
  reference: "DEV-2026-001",
  items: [
    { description: "Porte en bois massif", quantity: 2 },
    { description: "Fenêtre sur mesure", quantity: 1 },
  ],
};

export default DevisConfirmationEmail;
