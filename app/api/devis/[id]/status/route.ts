import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/db/connection";
import { Devis } from "@/lib/db/models";
import { authenticateRequest, requireRole, errorResponse, successResponse } from "@/lib/auth/middleware";
import { updateDevisStatusSchema } from "@/lib/validations/devis.schema";
import { ApiResponse, UnauthorizedError, ForbiddenError, NotFoundError, ValidationError, RouteContext } from "@/types/api.types";
import { IDevis, DevisStatus, UserRole } from "@/types/models.types";
import { sendDevisStatusUpdateEmail } from "@/lib/services/email.service";

// Valid status transitions
const validTransitions: Record<DevisStatus, DevisStatus[]> = {
  [DevisStatus.PENDING]: [DevisStatus.REVIEWED],
  [DevisStatus.REVIEWED]: [DevisStatus.APPROVED, DevisStatus.REJECTED],
  [DevisStatus.APPROVED]: [DevisStatus.IN_PROGRESS],
  [DevisStatus.REJECTED]: [],
  [DevisStatus.IN_PROGRESS]: [DevisStatus.COMPLETED],
  [DevisStatus.COMPLETED]: [],
};

function isValidTransition(currentStatus: DevisStatus, newStatus: DevisStatus): boolean {
  return validTransitions[currentStatus]?.includes(newStatus) ?? false;
}

// PATCH /api/devis/:id/status - Update devis status (protected)
export async function PATCH(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse<ApiResponse<IDevis>>> {
  try {
    await connectDB();

    // Authenticate
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

    const body = await request.json();

    // Validate input
    const validationResult = updateDevisStatusSchema.safeParse(body);
    if (!validationResult.success) {
      const errors = validationResult.error.flatten().fieldErrors;
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          message: Object.values(errors).flat().join(", "),
        },
        { status: 400 }
      );
    }

    const { status: newStatus, adminNotes } = validationResult.data;

    // Get current devis
    const existingDevis = await Devis.findById(id);
    if (!existingDevis) {
      throw new NotFoundError("Devis not found");
    }

    const currentStatus = existingDevis.status as DevisStatus;

    // Validate status transition
    if (!isValidTransition(currentStatus, newStatus)) {
      throw new ValidationError(
        `Invalid status transition from '${currentStatus}' to '${newStatus}'. ` +
        `Allowed transitions: ${validTransitions[currentStatus]?.join(", ") || "none"}`
      );
    }

    // Update devis status
    const updateData: Record<string, unknown> = { status: newStatus };
    if (adminNotes) {
      updateData.adminNotes = adminNotes;
    }

    const devis = await Devis.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    )
      .populate("assignedTo", "firstName lastName email")
      .lean<IDevis>();

    // Send status update email to customer (non-blocking)
    if (devis) {
      sendDevisStatusUpdateEmail(devis, currentStatus, newStatus).catch((err) => {
        console.error("Failed to send status update email:", err);
      });
    }

    return successResponse(devis as IDevis, `Status updated to '${newStatus}'`);
  } catch (error) {
    if (error instanceof NotFoundError) {
      return errorResponse(error.message, 404);
    }
    if (error instanceof ValidationError) {
      return errorResponse(error.message, 400);
    }
    if (error instanceof ForbiddenError) {
      return errorResponse(error.message, 403);
    }

    console.error("Update devis status error:", error);
    return errorResponse("Internal server error", 500);
  }
}
