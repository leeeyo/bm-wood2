import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/db/connection";
import { Devis } from "@/lib/db/models";
import { authenticateRequest, requireRole, errorResponse, successResponse } from "@/lib/auth/middleware";
import { generateDevisPdf } from "@/lib/services/pdf.service";
import { sendDevisPdfEmail } from "@/lib/services/email.service";
import { UnauthorizedError, ForbiddenError, NotFoundError, RouteContext } from "@/types/api.types";
import { IDevis, DevisStatus, UserRole } from "@/types/models.types";

// POST /api/devis/:id/send-pdf - Generate PDF and send by email (protected)
export async function POST(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  try {
    await connectDB();

    // Authenticate - require Admin or Manager role
    try {
      const authUser = authenticateRequest(request);
      requireRole(authUser, [UserRole.ADMIN]);
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        return errorResponse(error.message, 401);
      }
      if (error instanceof ForbiddenError) {
        return errorResponse(error.message, 403);
      }
      throw error;
    }

    const { id } = await context.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse("Invalid devis ID", 400);
    }

    // Get devis with populated assignedTo
    const devis = await Devis.findById(id)
      .populate("assignedTo", "firstName lastName email")
      .lean<IDevis>();

    if (!devis) {
      throw new NotFoundError("Devis not found");
    }

    // Status check: Only allow PDF send for approved or later statuses
    const allowedStatuses: DevisStatus[] = [
      DevisStatus.APPROVED,
      DevisStatus.IN_PROGRESS,
      DevisStatus.COMPLETED,
    ];

    if (!allowedStatuses.includes(devis.status as DevisStatus)) {
      return errorResponse(
        "Le PDF ne peut être envoyé que pour un devis approuvé ou en cours.",
        400
      );
    }

    // Validate that client has an email
    if (!devis.client?.email) {
      return errorResponse(
        "Le client n'a pas d'adresse email valide.",
        400
      );
    }

    // Generate PDF
    let pdfBuffer: Buffer;
    try {
      pdfBuffer = await generateDevisPdf(devis);
    } catch (pdfError) {
      console.error("PDF generation error:", pdfError);
      return errorResponse("Erreur lors de la génération du PDF.", 500);
    }

    // Send email with PDF attachment
    const emailResult = await sendDevisPdfEmail(devis, pdfBuffer);

    if (!emailResult.success) {
      console.error("Email send error:", emailResult.error);
      return errorResponse(
        emailResult.error || "Erreur lors de l'envoi de l'email.",
        502
      );
    }

    return successResponse(
      { sentTo: devis.client.email },
      `Devis envoyé par email au client (${devis.client.email}).`
    );
  } catch (error) {
    if (error instanceof NotFoundError) {
      return errorResponse(error.message, 404);
    }
    if (error instanceof ForbiddenError) {
      return errorResponse(error.message, 403);
    }

    console.error("Send PDF email error:", error);
    return errorResponse("Une erreur est survenue lors de l'envoi de l'email.", 500);
  }
}
