import * as React from "react";
import { Section, Text } from "@react-email/components";
import { BaseLayout } from "./components/base-layout";
import { theme } from "./theme";

export interface DevisPdfEmailProps {
  firstName: string;
  lastName: string;
  reference: string;
}

export function DevisPdfEmail({
  firstName,
  lastName,
  reference,
}: DevisPdfEmailProps) {
  return (
    <BaseLayout headerSubtitle="Votre devis est prêt">
      <Text style={greetingStyle}>
        Bonjour {firstName} {lastName},
      </Text>

      <Text style={paragraphStyle}>
        Veuillez trouver ci-joint votre devis personnalisé.
      </Text>

      <Section style={referenceBoxStyle}>
        <Text style={referenceLabelStyle}>Référence du devis</Text>
        <Text style={referenceValueStyle}>{reference}</Text>
      </Section>

      <Text style={paragraphStyle}>
        N&apos;hésitez pas à nous contacter pour toute question ou pour
        confirmer votre commande. Notre équipe reste à votre entière
        disposition.
      </Text>

      <Section style={tipBoxStyle}>
        <Text style={tipTextStyle}>
          <strong>Conseil&nbsp;:</strong> Vérifiez votre dossier spam si vous ne
          voyez pas la pièce jointe.
        </Text>
      </Section>
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

const tipBoxStyle: React.CSSProperties = {
  backgroundColor: theme.surfaceAlt,
  borderLeft: `3px solid ${theme.accent}`,
  borderRadius: "0 6px 6px 0",
  padding: "14px 18px",
};

const tipTextStyle: React.CSSProperties = {
  fontSize: "13px",
  lineHeight: "1.6",
  color: theme.textSecondary,
  margin: 0,
};

export default DevisPdfEmail;
