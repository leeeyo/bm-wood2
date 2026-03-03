import React from "react";
import { Resend } from "resend";
import { IDevis, DevisStatus } from "@/types/models.types";
import { WelcomeEmail } from "@/emails/welcome";
import { DevisConfirmationEmail } from "@/emails/devis-confirmation";
import { NewDevisNotificationEmail } from "@/emails/new-devis-notification";
import {
  DevisStatusUpdateEmail,
  statusConfig,
} from "@/emails/devis-status-update";
import { PasswordResetEmail } from "@/emails/password-reset";
import { DevisPdfEmail } from "@/emails/devis-pdf";
import { ContactFormEmail } from "@/emails/contact-form";

/** Escape user-provided content for safe HTML interpolation (prevents markup injection) */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Lazy-initialize Resend so build/SSR can run without RESEND_API_KEY
let resendInstance: Resend | null = null;

function getResend(): Resend | null {
  if (resendInstance) return resendInstance;
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey.startsWith("re_xxxxxxxx")) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "[Email] RESEND_API_KEY is missing or placeholder. Get a key at https://resend.com and add to .env.local"
      );
    }
    return null;
  }
  resendInstance = new Resend(apiKey);
  return resendInstance;
}

// On localhost: use Resend's test domain (no domain verification needed)
// Note: Test domain only delivers to the email you signed up with on Resend
const isLocalhost =
  typeof process.env.NEXT_PUBLIC_APP_URL === "string" &&
  process.env.NEXT_PUBLIC_APP_URL.includes("localhost");
const EMAIL_FROM = isLocalhost
  ? "BM Wood <onboarding@resend.dev>"
  : (process.env.EMAIL_FROM || "BM Wood <noreply@bmwood.tn>");
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "contact@bmwood.tn";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

interface EmailResult {
  success: boolean;
  error?: string;
}

/** Check Resend API response - returns error message if send failed */
function checkResendResponse(
  result: { data?: { id?: string } | null; error?: { message?: string } | null },
  context: string
): string | null {
  if (result.error) {
    const msg = result.error.message ?? "Unknown Resend error";
    if (process.env.NODE_ENV === "development") {
      console.error(`[Email] ${context} failed:`, msg);
    }
    return msg;
  }
  return null;
}

/** User shape for welcome email */
interface WelcomeUser {
  firstName: string;
  email: string;
  marketingEmails?: boolean;
}

/**
 * Send welcome email after registration (only if marketingEmails is true)
 */
export async function sendWelcomeEmail(
  user: WelcomeUser,
  unsubscribeUrl: string
): Promise<EmailResult> {
  if (user.marketingEmails === false) {
    return { success: true };
  }
  try {
    const resend = getResend();
    if (!resend) {
      return { success: false, error: "Email service not configured (RESEND_API_KEY missing)" };
    }

    const firstName = escapeHtml(user.firstName);
    const devisUrl = `${APP_URL}/demander-un-devis`;
    const mapsUrl = "https://maps.app.goo.gl/RzkSTCyQ5j9XbXW19";

    const result = await resend.emails.send({
      from: EMAIL_FROM,
      to: user.email,
      subject: "Bienvenue chez BM Wood - Menuiserie sur mesure",
      react: React.createElement(WelcomeEmail, {
        firstName,
        devisUrl,
        showroomUrl: APP_URL,
        mapsUrl,
        unsubscribeUrl,
      }),
    });

    const err = checkResendResponse(result, "Welcome email");
    if (err) return { success: false, error: err };
    return { success: true };
  } catch (error) {
    console.error("Failed to send welcome email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Send confirmation email to customer when they submit a quote request
 */
export async function sendDevisConfirmationEmail(devis: IDevis): Promise<EmailResult> {
  try {
    const resend = getResend();
    if (!resend) {
      return { success: false, error: "Email service not configured (RESEND_API_KEY missing)" };
    }
    const { client, reference, items } = devis;

    const itemsForEmail = items.map((item) => ({
      description: escapeHtml(item.description),
      quantity: item.quantity,
    }));

    const result = await resend.emails.send({
      from: EMAIL_FROM,
      to: client.email,
      subject: `Confirmation de votre demande de devis - ${reference}`,
      react: React.createElement(DevisConfirmationEmail, {
        firstName: escapeHtml(client.firstName),
        lastName: escapeHtml(client.lastName),
        reference,
        items: itemsForEmail,
      }),
    });

    const err = checkResendResponse(result, "Devis confirmation");
    if (err) return { success: false, error: err };
    return { success: true };
  } catch (error) {
    console.error("Failed to send confirmation email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Send notification to admin when a new quote request is submitted
 */
export async function sendNewDevisNotificationEmail(devis: IDevis): Promise<EmailResult> {
  try {
    const resend = getResend();
    if (!resend) {
      return { success: false, error: "Email service not configured (RESEND_API_KEY missing)" };
    }
    const { client, reference, items, notes } = devis;

    const itemsForEmail = items.map((item) => ({
      description: escapeHtml(item.description),
      quantity: item.quantity,
    }));

    const result = await resend.emails.send({
      from: EMAIL_FROM,
      to: ADMIN_EMAIL,
      subject: `Nouvelle demande de devis - ${reference}`,
      react: React.createElement(NewDevisNotificationEmail, {
        client: {
          firstName: escapeHtml(client.firstName),
          lastName: escapeHtml(client.lastName),
          email: escapeHtml(client.email),
          phone: escapeHtml(client.phone),
          address: client.address ? escapeHtml(client.address) : undefined,
          city: client.city ? escapeHtml(client.city) : undefined,
        },
        reference,
        items: itemsForEmail,
        notes: notes ? escapeHtml(notes) : undefined,
        cmsDevisUrl: `${APP_URL}/cms/devis/${devis._id}`,
      }),
    });

    const err = checkResendResponse(result, "New devis notification");
    if (err) return { success: false, error: err };
    return { success: true };
  } catch (error) {
    console.error("Failed to send admin notification email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Send status update email to customer
 */
export async function sendDevisStatusUpdateEmail(
  devis: IDevis,
  _previousStatus: DevisStatus,
  newStatus: DevisStatus
): Promise<EmailResult> {
  try {
    const resend = getResend();
    if (!resend) {
      return { success: false, error: "Email service not configured (RESEND_API_KEY missing)" };
    }
    const { client, reference, adminNotes, estimatedPrice, estimatedDate } = devis;

    const statusInfo = statusConfig[newStatus];

    const result = await resend.emails.send({
      from: EMAIL_FROM,
      to: client.email,
      subject: `${statusInfo.subject} - ${reference}`,
      react: React.createElement(DevisStatusUpdateEmail, {
        firstName: escapeHtml(client.firstName),
        lastName: escapeHtml(client.lastName),
        reference,
        newStatus,
        statusSubject: statusInfo.subject,
        statusMessage: statusInfo.message,
        statusColor: statusInfo.color,
        adminNotes: adminNotes ? escapeHtml(adminNotes) : undefined,
        estimatedPrice,
        estimatedDate: estimatedDate
          ? new Date(estimatedDate).toLocaleDateString("fr-TN")
          : undefined,
      }),
    });

    const err = checkResendResponse(result, "Devis status update");
    if (err) return { success: false, error: err };
    return { success: true };
  } catch (error) {
    console.error("Failed to send status update email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Send password reset email with reset link
 */
export async function sendPasswordResetEmail(
  email: string,
  resetToken: string,
  firstName: string
): Promise<EmailResult> {
  try {
    const resend = getResend();
    if (!resend) {
      return { success: false, error: "Email service not configured (RESEND_API_KEY missing)" };
    }

    const resetUrl = `${APP_URL}/reset-password?token=${resetToken}`;

    const result = await resend.emails.send({
      from: EMAIL_FROM,
      to: email,
      subject: "Réinitialisation de votre mot de passe - BM Wood",
      react: React.createElement(PasswordResetEmail, {
        firstName: escapeHtml(firstName),
        resetUrl,
      }),
    });

    const err = checkResendResponse(result, "Password reset");
    if (err) return { success: false, error: err };
    return { success: true };
  } catch (error) {
    console.error("Failed to send password reset email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Send email with PDF attachment (for approved devis)
 */
export async function sendDevisPdfEmail(
  devis: IDevis,
  pdfBuffer: Buffer
): Promise<EmailResult> {
  try {
    const resend = getResend();
    if (!resend) {
      return { success: false, error: "Email service not configured (RESEND_API_KEY missing)" };
    }
    const { client, reference } = devis;

    const result = await resend.emails.send({
      from: EMAIL_FROM,
      to: client.email,
      subject: `Votre devis ${reference} - BM Wood`,
      react: React.createElement(DevisPdfEmail, {
        firstName: escapeHtml(client.firstName),
        lastName: escapeHtml(client.lastName),
        reference,
      }),
      attachments: [
        {
          filename: `devis-${reference}.pdf`,
          content: pdfBuffer,
        },
      ],
    });

    const err = checkResendResponse(result, "Devis PDF");
    if (err) return { success: false, error: err };
    return { success: true };
  } catch (error) {
    console.error("Failed to send PDF email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  subject?: string;
  message: string;
}

/**
 * Send contact form submission to admin
 */
export async function sendContactFormEmail(data: ContactFormData): Promise<EmailResult> {
  try {
    const resend = getResend();
    if (!resend) {
      return { success: false, error: "Email service not configured (RESEND_API_KEY missing)" };
    }

    const result = await resend.emails.send({
      from: EMAIL_FROM,
      to: ADMIN_EMAIL,
      replyTo: data.email,
      subject: data.subject
        ? `[Contact] ${data.subject} - ${data.firstName} ${data.lastName}`
        : `[Contact] Message de ${data.firstName} ${data.lastName}`,
      react: React.createElement(ContactFormEmail, {
        firstName: escapeHtml(data.firstName),
        lastName: escapeHtml(data.lastName),
        email: escapeHtml(data.email),
        phone: escapeHtml(data.phone),
        subject: data.subject ? escapeHtml(data.subject) : undefined,
        message: escapeHtml(data.message),
      }),
    });

    const err = checkResendResponse(result, "Contact form");
    if (err) return { success: false, error: err };
    return { success: true };
  } catch (error) {
    console.error("Failed to send contact form email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
