import * as React from "react";
import { Section, Text, Link } from "@react-email/components";
import { BaseLayout } from "./components/base-layout";
import { EmailButton } from "./components/button";
import { theme } from "./theme";

export interface PasswordResetEmailProps {
  firstName: string;
  resetUrl: string;
}

export function PasswordResetEmail({
  firstName,
  resetUrl,
}: PasswordResetEmailProps) {
  return (
    <BaseLayout headerSubtitle="Réinitialisation du mot de passe">
      <Text style={greetingStyle}>Bonjour {firstName},</Text>

      <Text style={paragraphStyle}>
        Vous avez demandé la réinitialisation de votre mot de passe.
        Cliquez sur le bouton ci-dessous pour en définir un nouveau&nbsp;:
      </Text>

      <Section style={ctaStyle}>
        <EmailButton href={resetUrl}>Réinitialiser mon mot de passe</EmailButton>
      </Section>

      <Section style={noticeBoxStyle}>
        <Text style={noticeTextStyle}>
          Ce lien expire dans <strong>1&nbsp;heure</strong>. Si vous n&apos;êtes
          pas à l&apos;origine de cette demande, vous pouvez ignorer cet email
          en toute sécurité.
        </Text>
      </Section>

      <Text style={fallbackStyle}>
        Si le bouton ne fonctionne pas, copiez ce lien dans votre
        navigateur&nbsp;:
      </Text>
      <Text style={urlStyle}>
        <Link href={resetUrl} style={urlLinkStyle}>
          {resetUrl}
        </Link>
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

const ctaStyle: React.CSSProperties = {
  textAlign: "center" as const,
  margin: "8px 0 32px",
};

const noticeBoxStyle: React.CSSProperties = {
  backgroundColor: theme.surfaceAlt,
  borderLeft: `3px solid ${theme.accent}`,
  borderRadius: "0 6px 6px 0",
  padding: "14px 18px",
  margin: "0 0 24px",
};

const noticeTextStyle: React.CSSProperties = {
  fontSize: "13px",
  lineHeight: "1.6",
  color: theme.textSecondary,
  margin: 0,
};

const fallbackStyle: React.CSSProperties = {
  fontSize: "12px",
  color: theme.muted,
  margin: "0 0 4px",
};

const urlStyle: React.CSSProperties = {
  margin: 0,
};

const urlLinkStyle: React.CSSProperties = {
  fontSize: "12px",
  color: theme.accent,
  wordBreak: "break-all" as const,
};

export default PasswordResetEmail;
