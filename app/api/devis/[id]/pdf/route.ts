import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/db/connection";
import { Devis } from "@/lib/db/models";
import { authenticateRequest, requireRole, errorResponse } from "@/lib/auth/middleware";
import { generateDevisPdf, getDevisPdfFilename } from "@/lib/services/pdf.service";
import { UnauthorizedError, ForbiddenError, NotFoundError, RouteContext } from "@/types/api.types";
import { IDevis, DevisStatus, UserRole } from "@/types/models.types";

// GET /api/devis/:id/pdf - Generate and download PDF (protected)
export async function GET(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  try {
    await connectDB();

    // Authenticate
    try {
      const authUser = authenticateRequest(request);
      requireRole(authUser, [UserRole.ADMIN, UserRole.MANAGER]);
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

    // Get devis
    const devis = await Devis.findById(id)
      .populate("assignedTo", "firstName lastName email")
      .lean<IDevis>();

    if (!devis) {
      throw new NotFoundError("Devis not found");
    }

    // Only allow PDF generation for approved or later statuses
    const allowedStatuses: DevisStatus[] = [
      DevisStatus.APPROVED,
      DevisStatus.IN_PROGRESS,
      DevisStatus.COMPLETED,
    ];

    if (!allowedStatuses.includes(devis.status as DevisStatus)) {
      return errorResponse(
        "PDF can only be generated for approved devis",
        400
      );
    }

    // Generate PDF
    const pdfBuffer = await generateDevisPdf(devis);
    const filename = getDevisPdfFilename(devis.reference);

    // Return PDF as download
    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    if (error instanceof NotFoundError) {
      return errorResponse(error.message, 404);
    }
    if (error instanceof ForbiddenError) {
      return errorResponse(error.message, 403);
    }

    console.error("Generate PDF error:", error);
    return errorResponse("Failed to generate PDF", 500);
  }
}
