import * as React from "react";
import { Section, Text, Hr } from "@react-email/components";
import { BaseLayout } from "./components/base-layout";
import { EmailButton } from "./components/button";
import { theme, businessInfo } from "./theme";

export interface WelcomeEmailProps {
  firstName: string;
  devisUrl: string;
  showroomUrl: string;
  mapsUrl: string;
  unsubscribeUrl: string;
}

export function WelcomeEmail({
  firstName,
  devisUrl,
  mapsUrl,
  unsubscribeUrl,
}: WelcomeEmailProps) {
  return (
    <BaseLayout
      headerSubtitle="Bienvenue dans l'univers du bois"
      unsubscribeUrl={unsubscribeUrl}
    >
      <Text style={greetingStyle}>Bonjour {firstName},</Text>

      <Text style={paragraphStyle}>
        Bienvenue chez <strong>BM&nbsp;Wood</strong>&nbsp;! Nous sommes ravis de
        vous compter parmi nos clients. Notre équipe de menuisiers est à votre
        disposition pour donner vie à vos projets sur mesure.
      </Text>

      <Section style={ctaBlockStyle}>
        <EmailButton href={devisUrl}>Demander un devis gratuit</EmailButton>
      </Section>

      <Section style={ctaBlockStyle}>
        <EmailButton href={mapsUrl} variant="outline">
          Visiter notre showroom
        </EmailButton>
      </Section>

      <Hr style={dividerStyle} />

      <Section style={infoBoxStyle}>
        <Text style={infoHeadingStyle}>Notre showroom</Text>
        <Text style={infoTextStyle}>{businessInfo.address}</Text>
        <Text style={infoTextStyle}>Tél: {businessInfo.phones}</Text>
      </Section>

      <Text style={closingStyle}>À très bientôt&nbsp;!</Text>
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

const ctaBlockStyle: React.CSSProperties = {
  textAlign: "center" as const,
  margin: "0 0 12px",
};

const dividerStyle: React.CSSProperties = {
  border: "none",
  borderTop: `1px solid ${theme.border}`,
  margin: "28px 0",
};

const infoBoxStyle: React.CSSProperties = {
  backgroundColor: theme.surfaceAlt,
  borderRadius: theme.radius,
  padding: "18px 22px",
  margin: "0 0 24px",
};

const infoHeadingStyle: React.CSSProperties = {
  fontSize: "14px",
  fontWeight: 600,
  fontFamily: theme.fontHeading,
  color: theme.text,
  margin: "0 0 8px",
};

const infoTextStyle: React.CSSProperties = {
  fontSize: "13px",
  color: theme.textSecondary,
  margin: "0 0 2px",
  lineHeight: "1.6",
};

const closingStyle: React.CSSProperties = {
  fontSize: "15px",
  color: theme.text,
  margin: 0,
};

export default WelcomeEmail;
