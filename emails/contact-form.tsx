import * as React from "react";
import { Section, Text, Hr } from "@react-email/components";
import { BaseLayout } from "./components/base-layout";
import { theme } from "./theme";

export interface ContactFormEmailProps {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  subject?: string;
  message: string;
}

export function ContactFormEmail({
  firstName,
  lastName,
  email,
  phone,
  subject,
  message,
}: ContactFormEmailProps) {
  return (
    <BaseLayout headerTitle="Nouveau message de contact">
      {/* Sender info card */}
      <Section style={cardStyle}>
        <Text style={cardHeadingStyle}>Informations</Text>
        <Hr style={cardDividerStyle} />
        <Text style={fieldStyle}>
          <span style={labelStyle}>Nom:</span> {firstName} {lastName}
        </Text>
        <Text style={fieldStyle}>
          <span style={labelStyle}>Email:</span> {email}
        </Text>
        <Text style={fieldStyle}>
          <span style={labelStyle}>Téléphone:</span> {phone}
        </Text>
        {subject && (
          <Text style={fieldStyle}>
            <span style={labelStyle}>Sujet:</span> {subject}
          </Text>
        )}
      </Section>

      {/* Message card */}
      <Section style={messageCardStyle}>
        <Text style={cardHeadingStyle}>Message</Text>
        <Hr style={cardDividerStyle} />
        <Text style={messageTextStyle}>{message}</Text>
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

const messageCardStyle: React.CSSProperties = {
  backgroundColor: theme.surfaceAlt,
  borderLeft: `3px solid ${theme.accent}`,
  borderRadius: "0 6px 6px 0",
  padding: "20px 24px",
  margin: "0 0 20px",
};

const messageTextStyle: React.CSSProperties = {
  fontSize: "14px",
  lineHeight: "1.7",
  color: theme.text,
  margin: 0,
  whiteSpace: "pre-wrap" as const,
};

export default ContactFormEmail;
