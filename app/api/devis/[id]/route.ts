import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/db/connection";
import { Devis, User } from "@/lib/db/models";
import { authenticateRequest, requireRole, errorResponse, successResponse } from "@/lib/auth/middleware";
import { updateDevisSchema } from "@/lib/validations/devis.schema";
import { ApiResponse, UnauthorizedError, ForbiddenError, NotFoundError, RouteContext } from "@/types/api.types";
import { IDevis, UserRole } from "@/types/models.types";

// GET /api/devis/:id - Get single devis (protected)
export async function GET(
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

    const devis = await Devis.findById(id)
      .populate("assignedTo", "firstName lastName email")
      .lean<IDevis>();

    if (!devis) {
      throw new NotFoundError("Devis not found");
    }

    return successResponse(devis);
  } catch (error) {
    if (error instanceof NotFoundError) {
      return errorResponse(error.message, 404);
    }
    if (error instanceof ForbiddenError) {
      return errorResponse(error.message, 403);
    }

    console.error("Get devis error:", error);
    return errorResponse("Internal server error", 500);
  }
}

// PUT /api/devis/:id - Update devis (protected)
export async function PUT(
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
    const validationResult = updateDevisSchema.safeParse(body);
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

    const data = validationResult.data;

    // Check if devis exists
    const existingDevis = await Devis.findById(id);
    if (!existingDevis) {
      throw new NotFoundError("Devis not found");
    }

    // If assignedTo is being updated, verify user exists
    if (data.assignedTo) {
      const user = await User.findById(data.assignedTo);
      if (!user) {
        throw new NotFoundError("Assigned user not found");
      }
    }

    // Build update object with proper handling of nested client object
    const updateData: Record<string, unknown> = {};
    
    if (data.client) {
      // Update only provided client fields
      Object.entries(data.client).forEach(([key, value]) => {
        if (value !== undefined) {
          updateData[`client.${key}`] = value;
        }
      });
    }

    // Add other fields
    const { client: _client, ...otherData } = data;
    Object.entries(otherData).forEach(([key, value]) => {
      if (value !== undefined) {
        updateData[key] = value;
      }
    });

    // Update devis
    const devis = await Devis.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    )
      .populate("assignedTo", "firstName lastName email")
      .lean<IDevis>();

    return successResponse(devis as IDevis, "Devis updated successfully");
  } catch (error) {
    if (error instanceof NotFoundError) {
      return errorResponse(error.message, 404);
    }
    if (error instanceof ForbiddenError) {
      return errorResponse(error.message, 403);
    }

    console.error("Update devis error:", error);
    return errorResponse("Internal server error", 500);
  }
}

// DELETE /api/devis/:id - Delete devis (protected)
export async function DELETE(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse<ApiResponse>> {
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

    const devis = await Devis.findByIdAndDelete(id);
    if (!devis) {
      throw new NotFoundError("Devis not found");
    }

    return successResponse(null, "Devis deleted successfully");
  } catch (error) {
    if (error instanceof NotFoundError) {
      return errorResponse(error.message, 404);
    }
    if (error instanceof ForbiddenError) {
      return errorResponse(error.message, 403);
    }

    console.error("Delete devis error:", error);
    return errorResponse("Internal server error", 500);
  }
}
