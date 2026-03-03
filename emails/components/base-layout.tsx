import * as React from "react";
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Link,
  Img,
  Hr,
  Row,
  Column,
} from "@react-email/components";
import { theme, businessInfo } from "../theme";

interface BaseLayoutProps {
  children: React.ReactNode;
  headerTitle?: string;
  headerSubtitle?: string;
  showLogo?: boolean;
  unsubscribeUrl?: string;
}

export function BaseLayout({
  children,
  headerTitle = businessInfo.name,
  headerSubtitle,
  showLogo = true,
  unsubscribeUrl,
}: BaseLayoutProps) {
  return (
    <Html lang="fr">
      <Head />
      <Body style={bodyStyle}>
        <Container style={wrapperStyle}>
          {/* Accent top bar */}
          <Section style={accentBarStyle} />

          {/* Header */}
          <Section style={headerStyle}>
            {showLogo && (
              <Link href={businessInfo.url} style={logoLinkStyle}>
                <Img
                  src={businessInfo.logoUrl}
                  alt={businessInfo.name}
                  width={52}
                  height={52}
                  style={logoImgStyle}
                />
              </Link>
            )}
            <Text style={brandNameStyle}>{headerTitle}</Text>
            {headerSubtitle && (
              <Text style={subtitleStyle}>{headerSubtitle}</Text>
            )}
            {!headerSubtitle && (
              <Text style={taglineStyle}>{businessInfo.tagline}</Text>
            )}
          </Section>

          {/* Decorative separator */}
          <Section style={separatorWrapperStyle}>
            <Row>
              <Column style={separatorLineStyle} />
              <Column style={separatorDiamondCol}>
                <Text style={separatorDiamondStyle}>&#9670;</Text>
              </Column>
              <Column style={separatorLineStyle} />
            </Row>
          </Section>

          {/* Content */}
          <Section style={contentStyle}>{children}</Section>

          {/* Footer */}
          <Section style={footerStyle}>
            <Hr style={footerHrStyle} />
            <Text style={footerBrandStyle}>{businessInfo.name}</Text>
            <Text style={footerTaglineStyle}>{businessInfo.tagline}</Text>
            <Text style={footerDetailStyle}>
              <Link href={businessInfo.mapsLink} style={footerLinkStyle}>
                {businessInfo.address}
              </Link>
            </Text>
            <Text style={footerDetailStyle}>
              Tél: {businessInfo.phones}
            </Text>
            <Text style={footerDetailStyle}>
              <Link
                href={`mailto:${businessInfo.email}`}
                style={footerLinkStyle}
              >
                {businessInfo.email}
              </Link>
            </Text>
            {unsubscribeUrl && (
              <Text style={unsubscribeStyle}>
                <Link href={unsubscribeUrl} style={unsubscribeLinkStyle}>
                  Gérer vos préférences de communication
                </Link>
              </Text>
            )}
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

/* ── Styles ── */

const bodyStyle: React.CSSProperties = {
  fontFamily: theme.fontBody,
  lineHeight: 1.65,
  color: theme.text,
  backgroundColor: "#eae6e1",
  margin: 0,
  padding: 0,
};

const wrapperStyle: React.CSSProperties = {
  maxWidth: "600px",
  margin: "0 auto",
  backgroundColor: theme.surface,
  borderRadius: "0 0 8px 8px",
  overflow: "hidden",
  boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
};

const accentBarStyle: React.CSSProperties = {
  height: "4px",
  backgroundColor: theme.accent,
};

const headerStyle: React.CSSProperties = {
  backgroundColor: theme.primary,
  padding: "36px 40px 32px",
  textAlign: "center" as const,
};

const logoLinkStyle: React.CSSProperties = {
  display: "inline-block",
  textDecoration: "none",
  marginBottom: "14px",
};

const logoImgStyle: React.CSSProperties = {
  display: "block",
  margin: "0 auto",
  borderRadius: "8px",
};

const brandNameStyle: React.CSSProperties = {
  margin: "0",
  fontSize: "26px",
  fontWeight: 600,
  fontFamily: theme.fontHeading,
  color: theme.white,
  letterSpacing: "0.04em",
};

const taglineStyle: React.CSSProperties = {
  margin: "6px 0 0",
  fontSize: "13px",
  fontFamily: theme.fontBody,
  color: theme.accentLight,
  letterSpacing: "0.12em",
  textTransform: "uppercase" as const,
};

const subtitleStyle: React.CSSProperties = {
  margin: "8px 0 0",
  fontSize: "14px",
  fontFamily: theme.fontBody,
  color: theme.accentLight,
  letterSpacing: "0.02em",
};

const separatorWrapperStyle: React.CSSProperties = {
  padding: "0 40px",
  backgroundColor: theme.surface,
};

const separatorLineStyle: React.CSSProperties = {
  borderBottom: `1px solid ${theme.borderLight}`,
  width: "45%",
  verticalAlign: "middle" as const,
};

const separatorDiamondCol: React.CSSProperties = {
  width: "10%",
  textAlign: "center" as const,
  verticalAlign: "middle" as const,
};

const separatorDiamondStyle: React.CSSProperties = {
  fontSize: "8px",
  color: theme.accent,
  margin: 0,
  lineHeight: "1",
};

const contentStyle: React.CSSProperties = {
  padding: "32px 40px 40px",
  backgroundColor: theme.surface,
};

const footerStyle: React.CSSProperties = {
  padding: "0 40px 32px",
  textAlign: "center" as const,
  backgroundColor: theme.surfaceAlt,
};

const footerHrStyle: React.CSSProperties = {
  border: "none",
  borderTop: `1px solid ${theme.border}`,
  margin: "0 0 24px",
};

const footerBrandStyle: React.CSSProperties = {
  margin: "0 0 2px",
  fontSize: "15px",
  fontWeight: 600,
  fontFamily: theme.fontHeading,
  color: theme.text,
};

const footerTaglineStyle: React.CSSProperties = {
  margin: "0 0 16px",
  fontSize: "12px",
  color: theme.muted,
  letterSpacing: "0.06em",
  textTransform: "uppercase" as const,
};

const footerDetailStyle: React.CSSProperties = {
  margin: "2px 0",
  fontSize: "12px",
  color: theme.textSecondary,
};

const footerLinkStyle: React.CSSProperties = {
  color: theme.textSecondary,
  textDecoration: "none",
};

const unsubscribeStyle: React.CSSProperties = {
  margin: "16px 0 0",
  fontSize: "11px",
};

const unsubscribeLinkStyle: React.CSSProperties = {
  color: theme.muted,
  textDecoration: "underline",
};
