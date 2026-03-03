import * as React from "react";
import { Button } from "@react-email/components";
import { theme } from "../theme";

interface EmailButtonProps {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "outline";
}

export function EmailButton({
  href,
  children,
  variant = "primary",
}: EmailButtonProps) {
  const isPrimary = variant === "primary";

  const style: React.CSSProperties = {
    display: "inline-block",
    padding: "14px 32px",
    textDecoration: "none",
    borderRadius: theme.radius,
    fontWeight: 600,
    fontSize: "14px",
    fontFamily: theme.fontBody,
    letterSpacing: "0.02em",
    textAlign: "center" as const,
    ...(isPrimary
      ? {
          backgroundColor: theme.accent,
          color: theme.primary,
          border: `2px solid ${theme.accent}`,
        }
      : {
          backgroundColor: "transparent",
          color: theme.accent,
          border: `2px solid ${theme.accent}`,
        }),
  };

  return (
    <Button href={href} style={style}>
      {children}
    </Button>
  );
}
