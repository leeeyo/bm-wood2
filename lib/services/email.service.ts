import { Resend } from "resend";
import { IDevis, DevisStatus } from "@/types/models.types";

// Lazy-initialize Resend so build/SSR can run without RESEND_API_KEY
let resendInstance: Resend | null = null;

function getResend(): Resend | null {
  if (resendInstance) return resendInstance;
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey.startsWith("re_xxxxxxxx")) {
    return null;
  }
  resendInstance = new Resend(apiKey);
  return resendInstance;
}

const EMAIL_FROM = process.env.EMAIL_FROM || "BM Wood <noreply@bmwood.tn>";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "contact@bmwood.tn";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

interface EmailResult {
  success: boolean;
  error?: string;
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

    const itemsList = items
      .map((item, index) => `${index + 1}. ${item.description} (Quantité: ${item.quantity})`)
      .join("\n");

    await resend.emails.send({
      from: EMAIL_FROM,
      to: client.email,
      subject: `Confirmation de votre demande de devis - ${reference}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #8B4513; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
            .reference { font-size: 24px; font-weight: bold; color: #8B4513; }
            .items { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>BM Wood</h1>
              <p>Menuiserie sur mesure</p>
            </div>
            <div class="content">
              <h2>Bonjour ${client.firstName} ${client.lastName},</h2>
              <p>Nous avons bien reçu votre demande de devis.</p>
              <p class="reference">Référence: ${reference}</p>
              
              <div class="items">
                <h3>Récapitulatif de votre demande:</h3>
                <pre>${itemsList}</pre>
              </div>
              
              <p>Notre équipe va étudier votre demande et vous contactera dans les plus brefs délais.</p>
              <p>En cas de questions, n'hésitez pas à nous contacter.</p>
            </div>
            <div class="footer">
              <p>BM Wood - Menuiserie sur mesure</p>
              <p>Avenue Ibn Khaldoun, Ariana</p>
              <p>Tél: 98 134 335 / 70 870 210</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

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

    const itemsList = items
      .map((item, index) => `${index + 1}. ${item.description} (Quantité: ${item.quantity})`)
      .join("\n");

    await resend.emails.send({
      from: EMAIL_FROM,
      to: ADMIN_EMAIL,
      subject: `Nouvelle demande de devis - ${reference}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #8B4513; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .section { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
            .btn { display: inline-block; padding: 10px 20px; background: #8B4513; color: white; text-decoration: none; border-radius: 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Nouvelle demande de devis</h1>
              <p>Référence: ${reference}</p>
            </div>
            <div class="content">
              <div class="section">
                <h3>Informations client:</h3>
                <p><strong>Nom:</strong> ${client.firstName} ${client.lastName}</p>
                <p><strong>Email:</strong> ${client.email}</p>
                <p><strong>Téléphone:</strong> ${client.phone}</p>
                ${client.address ? `<p><strong>Adresse:</strong> ${client.address}</p>` : ""}
                ${client.city ? `<p><strong>Ville:</strong> ${client.city}</p>` : ""}
              </div>
              
              <div class="section">
                <h3>Articles demandés:</h3>
                <pre>${itemsList}</pre>
              </div>
              
              ${notes ? `
              <div class="section">
                <h3>Notes du client:</h3>
                <p>${notes}</p>
              </div>
              ` : ""}
              
              <p style="text-align: center; margin-top: 20px;">
                <a href="${APP_URL}/admin/devis/${devis._id}" class="btn">Voir le devis</a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

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

    // Define status messages
    const statusMessages: Record<DevisStatus, { subject: string; message: string; color: string }> = {
      [DevisStatus.PENDING]: {
        subject: "Demande en attente",
        message: "Votre demande est en cours de traitement.",
        color: "#FFA500",
      },
      [DevisStatus.REVIEWED]: {
        subject: "Devis en cours d'étude",
        message: "Notre équipe étudie actuellement votre demande.",
        color: "#2196F3",
      },
      [DevisStatus.APPROVED]: {
        subject: "Devis approuvé",
        message: "Bonne nouvelle ! Votre devis a été approuvé.",
        color: "#4CAF50",
      },
      [DevisStatus.REJECTED]: {
        subject: "Devis non retenu",
        message: "Nous sommes désolés, mais nous ne pouvons pas donner suite à votre demande.",
        color: "#f44336",
      },
      [DevisStatus.IN_PROGRESS]: {
        subject: "Travaux en cours",
        message: "Les travaux sur votre projet ont commencé.",
        color: "#9C27B0",
      },
      [DevisStatus.COMPLETED]: {
        subject: "Projet terminé",
        message: "Votre projet est terminé ! Nous espérons que vous êtes satisfait.",
        color: "#4CAF50",
      },
    };

    const statusInfo = statusMessages[newStatus];

    await resend.emails.send({
      from: EMAIL_FROM,
      to: client.email,
      subject: `${statusInfo.subject} - ${reference}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #8B4513; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .status-badge { display: inline-block; padding: 8px 16px; background: ${statusInfo.color}; color: white; border-radius: 20px; font-weight: bold; }
            .section { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
            .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>BM Wood</h1>
              <p>Mise à jour de votre devis</p>
            </div>
            <div class="content">
              <h2>Bonjour ${client.firstName} ${client.lastName},</h2>
              <p>Le statut de votre devis <strong>${reference}</strong> a été mis à jour.</p>
              
              <p style="text-align: center; margin: 20px 0;">
                <span class="status-badge">${statusInfo.subject}</span>
              </p>
              
              <p>${statusInfo.message}</p>
              
              ${newStatus === DevisStatus.APPROVED && estimatedPrice ? `
              <div class="section">
                <h3>Détails du devis:</h3>
                <p><strong>Prix estimé:</strong> ${estimatedPrice.toLocaleString("fr-TN")} TND</p>
                ${estimatedDate ? `<p><strong>Date estimée:</strong> ${new Date(estimatedDate).toLocaleDateString("fr-TN")}</p>` : ""}
              </div>
              ` : ""}
              
              ${adminNotes ? `
              <div class="section">
                <h3>Message de notre équipe:</h3>
                <p>${adminNotes}</p>
              </div>
              ` : ""}
              
              <p>Pour toute question, n'hésitez pas à nous contacter.</p>
            </div>
            <div class="footer">
              <p>BM Wood - Menuiserie sur mesure</p>
              <p>Avenue Ibn Khaldoun, Ariana</p>
              <p>Tél: 98 134 335 / 70 870 210</p>
              <p>Email: contact@bmwood.tn</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

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

    await resend.emails.send({
      from: EMAIL_FROM,
      to: email,
      subject: "Réinitialisation de votre mot de passe - BM Wood",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #8B4513; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
            .btn { display: inline-block; padding: 12px 24px; background: #8B4513; color: white !important; text-decoration: none; border-radius: 5px; margin: 16px 0; }
            .muted { font-size: 12px; color: #666; word-break: break-all; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>BM Wood</h1>
              <p>Réinitialisation du mot de passe</p>
            </div>
            <div class="content">
              <h2>Bonjour ${firstName},</h2>
              <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
              <p>Cliquez sur le bouton ci-dessous pour définir un nouveau mot de passe :</p>
              <p style="text-align: center;">
                <a href="${resetUrl}" class="btn">Réinitialiser mon mot de passe</a>
              </p>
              <p class="muted">Ce lien expire dans 1 heure. Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>
              <p class="muted">Lien direct : ${resetUrl}</p>
            </div>
            <div class="footer">
              <p>BM Wood - Menuiserie sur mesure</p>
              <p>Avenue Ibn Khaldoun, Ariana</p>
              <p>Tél: 98 134 335 / 70 870 210</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

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

    await resend.emails.send({
      from: EMAIL_FROM,
      to: client.email,
      subject: `Votre devis ${reference} - BM Wood`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #8B4513; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>BM Wood</h1>
              <p>Votre devis est prêt</p>
            </div>
            <div class="content">
              <h2>Bonjour ${client.firstName} ${client.lastName},</h2>
              <p>Veuillez trouver ci-joint votre devis personnalisé (référence: ${reference}).</p>
              <p>N'hésitez pas à nous contacter pour toute question ou pour confirmer votre commande.</p>
            </div>
            <div class="footer">
              <p>BM Wood - Menuiserie sur mesure</p>
              <p>Avenue Ibn Khaldoun, Ariana</p>
              <p>Tél: 98 134 335 / 70 870 210</p>
            </div>
          </div>
        </body>
        </html>
      `,
      attachments: [
        {
          filename: `devis-${reference}.pdf`,
          content: pdfBuffer,
        },
      ],
    });

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

    await resend.emails.send({
      from: EMAIL_FROM,
      to: ADMIN_EMAIL,
      replyTo: data.email,
      subject: data.subject
        ? `[Contact] ${data.subject} - ${data.firstName} ${data.lastName}`
        : `[Contact] Message de ${data.firstName} ${data.lastName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #8B4513; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .section { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Nouveau message de contact</h1>
            </div>
            <div class="content">
              <div class="section">
                <h3>Informations:</h3>
                <p><strong>Nom:</strong> ${data.firstName} ${data.lastName}</p>
                <p><strong>Email:</strong> ${data.email}</p>
                <p><strong>Téléphone:</strong> ${data.phone}</p>
                ${data.subject ? `<p><strong>Sujet:</strong> ${data.subject}</p>` : ""}
              </div>
              <div class="section">
                <h3>Message:</h3>
                <p>${data.message.replace(/\n/g, "<br>")}</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to send contact form email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
