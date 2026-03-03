import * as React from "react";
import { Section, Text, Hr } from "@react-email/components";
import { BaseLayout } from "./components/base-layout";
import { EmailButton } from "./components/button";
import { theme } from "./theme";

export interface NewDevisNotificationClient {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
}

export interface NewDevisNotificationItem {
  description: string;
  quantity: number;
}

export interface NewDevisNotificationEmailProps {
  client: NewDevisNotificationClient;
  reference: string;
  items: NewDevisNotificationItem[];
  notes?: string;
  cmsDevisUrl: string;
}

export function NewDevisNotificationEmail({
  client,
  reference,
  items,
  notes,
  cmsDevisUrl,
}: NewDevisNotificationEmailProps) {
  return (
    <BaseLayout
      headerTitle="Nouvelle demande de devis"
      headerSubtitle={`Référence: ${reference}`}
      showLogo={true}
    >
      {/* Client info card */}
      <Section style={cardStyle}>
        <Text style={cardHeadingStyle}>Informations client</Text>
        <Hr style={cardDividerStyle} />
        <Text style={fieldStyle}>
          <span style={labelStyle}>Nom:</span> {client.firstName}{" "}
          {client.lastName}
        </Text>
        <Text style={fieldStyle}>
          <span style={labelStyle}>Email:</span> {client.email}
        </Text>
        <Text style={fieldStyle}>
          <span style={labelStyle}>Téléphone:</span> {client.phone}
        </Text>
        {client.address && (
          <Text style={fieldStyle}>
            <span style={labelStyle}>Adresse:</span> {client.address}
          </Text>
        )}
        {client.city && (
          <Text style={fieldStyle}>
            <span style={labelStyle}>Ville:</span> {client.city}
          </Text>
        )}
      </Section>

      {/* Items card */}
      <Section style={cardStyle}>
        <Text style={cardHeadingStyle}>Articles demandés</Text>
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

      {/* Notes card */}
      {notes && (
        <Section style={noteBoxStyle}>
          <Text style={noteHeadingStyle}>Notes du client</Text>
          <Text style={noteTextStyle}>{notes}</Text>
        </Section>
      )}

      {/* CTA */}
      <Section style={ctaStyle}>
        <EmailButton href={cmsDevisUrl}>Voir le devis dans le CMS</EmailButton>
      </Section>
    </BaseLayout>
  );
}

const cardStyle: React.CSSProperties = {
  backgroundColor: theme.surfaceAlt,
  border: `1px solid ${theme.border}`,
  borderRadius: theme.radius,
  padding: "20px 24px",
  margin: "0 0 20px",
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

const fieldStyle: React.CSSProperties = {
  fontSize: "14px",
  color: theme.text,
  margin: "0 0 6px",
  lineHeight: "1.5",
};

const labelStyle: React.CSSProperties = {
  fontWeight: 600,
  color: theme.textSecondary,
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

const noteBoxStyle: React.CSSProperties = {
  backgroundColor: theme.surfaceAlt,
  borderLeft: `3px solid ${theme.accent}`,
  borderRadius: "0 6px 6px 0",
  padding: "16px 20px",
  margin: "0 0 20px",
};

const noteHeadingStyle: React.CSSProperties = {
  fontSize: "13px",
  fontWeight: 600,
  color: theme.text,
  margin: "0 0 8px",
};

const noteTextStyle: React.CSSProperties = {
  fontSize: "14px",
  lineHeight: "1.6",
  color: theme.textSecondary,
  margin: 0,
  whiteSpace: "pre-wrap" as const,
};

const ctaStyle: React.CSSProperties = {
  textAlign: "center" as const,
  margin: "8px 0 0",
};

(
  NewDevisNotificationEmail as React.FC & { PreviewProps?: unknown }
).PreviewProps = {
  client: {
    firstName: "Jean",
    lastName: "Dupont",
    email: "jean@example.com",
    phone: "98 134 335",
    address: "123 Rue Example",
    city: "Ariana",
  },
  reference: "DEV-2024-001",
  items: [
    { description: "Porte en bois massif", quantity: 2 },
    { description: "Fenêtre sur mesure", quantity: 1 },
  ],
  notes: "Livraison souhaitée avant fin du mois.",
  cmsDevisUrl: "http://localhost:3000/cms/devis/123",
};

export default NewDevisNotificationEmail;
