import * as React from "react";
import { Section, Text, Hr } from "@react-email/components";
import { BaseLayout } from "./components/base-layout";
import { theme } from "./theme";

export type DevisStatus =
  | "pending"
  | "reviewed"
  | "approved"
  | "rejected"
  | "in_progress"
  | "completed";

export interface DevisStatusUpdateEmailProps {
  firstName: string;
  lastName: string;
  reference: string;
  newStatus: DevisStatus;
  statusSubject: string;
  statusMessage: string;
  statusColor: string;
  adminNotes?: string;
  estimatedPrice?: number;
  estimatedDate?: string;
}

const statusConfig: Record<
  DevisStatus,
  { subject: string; message: string; color: string }
> = {
  pending: {
    subject: "Demande en attente",
    message: "Votre demande est en cours de traitement.",
    color: theme.warning,
  },
  reviewed: {
    subject: "Devis en cours d'étude",
    message: "Notre équipe étudie actuellement votre demande.",
    color: theme.info,
  },
  approved: {
    subject: "Devis approuvé",
    message: "Bonne nouvelle ! Votre devis a été approuvé.",
    color: theme.success,
  },
  rejected: {
    subject: "Devis non retenu",
    message:
      "Nous sommes désolés, mais nous ne pouvons pas donner suite à votre demande.",
    color: theme.danger,
  },
  in_progress: {
    subject: "Travaux en cours",
    message: "Les travaux sur votre projet ont commencé.",
    color: "#7b5ea7",
  },
  completed: {
    subject: "Projet terminé",
    message:
      "Votre projet est terminé ! Nous espérons que vous êtes satisfait.",
    color: theme.success,
  },
};

export { statusConfig };

export function DevisStatusUpdateEmail({
  firstName,
  lastName,
  reference,
  statusSubject,
  statusMessage,
  statusColor,
  adminNotes,
  estimatedPrice,
  estimatedDate,
}: DevisStatusUpdateEmailProps) {
  return (
    <BaseLayout headerSubtitle="Mise à jour de votre devis">
      <Text style={greetingStyle}>
        Bonjour {firstName} {lastName},
      </Text>

      <Text style={paragraphStyle}>
        Le statut de votre devis <strong>{reference}</strong> a été mis à jour.
      </Text>

      {/* Status badge */}
      <Section style={badgeWrapperStyle}>
        <Text
          style={{
            ...badgeStyle,
            backgroundColor: statusColor,
          }}
        >
          {statusSubject}
        </Text>
      </Section>

      <Text style={paragraphStyle}>{statusMessage}</Text>

      {/* Pricing / date details */}
      {estimatedPrice !== undefined && (
        <Section style={cardStyle}>
          <Text style={cardHeadingStyle}>Détails du devis</Text>
          <Hr style={cardDividerStyle} />
          <Section style={detailRowStyle}>
            <Text style={detailLabelStyle}>Prix estimé</Text>
            <Text style={detailValueStyle}>
              {estimatedPrice.toLocaleString("fr-TN")} TND
            </Text>
          </Section>
          {estimatedDate && (
            <Section style={detailRowStyle}>
              <Text style={detailLabelStyle}>Date estimée</Text>
              <Text style={detailValueStyle}>{estimatedDate}</Text>
            </Section>
          )}
        </Section>
      )}

      {/* Admin notes */}
      {adminNotes && (
        <Section style={noteBoxStyle}>
          <Text style={noteHeadingStyle}>Message de notre équipe</Text>
          <Text style={noteTextStyle}>{adminNotes}</Text>
        </Section>
      )}

      <Text style={paragraphStyle}>
        Pour toute question, n&apos;hésitez pas à nous contacter.
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

const badgeWrapperStyle: React.CSSProperties = {
  textAlign: "center" as const,
  margin: "0 0 24px",
};

const badgeStyle: React.CSSProperties = {
  display: "inline-block",
  padding: "10px 24px",
  color: theme.white,
  borderRadius: "24px",
  fontWeight: 700,
  fontSize: "13px",
  fontFamily: theme.fontBody,
  letterSpacing: "0.03em",
  textTransform: "uppercase" as const,
  margin: 0,
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

const detailRowStyle: React.CSSProperties = {
  padding: "4px 0",
};

const detailLabelStyle: React.CSSProperties = {
  fontSize: "12px",
  color: theme.muted,
  textTransform: "uppercase" as const,
  letterSpacing: "0.06em",
  margin: "0 0 2px",
};

const detailValueStyle: React.CSSProperties = {
  fontSize: "16px",
  fontWeight: 600,
  fontFamily: theme.fontHeading,
  color: theme.text,
  margin: 0,
};

const noteBoxStyle: React.CSSProperties = {
  backgroundColor: theme.surfaceAlt,
  borderLeft: `3px solid ${theme.accent}`,
  borderRadius: "0 6px 6px 0",
  padding: "16px 20px",
  margin: "0 0 24px",
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
};

export default DevisStatusUpdateEmail;
