import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/db/connection";
import { Media } from "@/lib/db/models";
import { authenticateRequest, errorResponse, successResponse } from "@/lib/auth/middleware";
import { deleteFile } from "@/lib/services/upload.service";
import { ApiResponse, UnauthorizedError, NotFoundError, RouteContext } from "@/types/api.types";
import { IMedia } from "@/types/models.types";

// GET /api/uploads/:id - Get file info (public)
export async function GET(
  _request: NextRequest,
  context: RouteContext
): Promise<NextResponse<ApiResponse<IMedia>>> {
  try {
    await connectDB();

    const { id } = await context.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse("Invalid media ID", 400);
    }

    const media = await Media.findById(id)
      .populate("uploadedBy", "firstName lastName email")
      .lean<IMedia>();

    if (!media) {
      throw new NotFoundError("Media not found");
    }

    return successResponse(media);
  } catch (error) {
    if (error instanceof NotFoundError) {
      return errorResponse(error.message, 404);
    }

    console.error("Get media error:", error);
    return errorResponse("Internal server error", 500);
  }
}

// DELETE /api/uploads/:id - Delete file (protected)
export async function DELETE(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse<ApiResponse>> {
  try {
    await connectDB();

    // Authenticate
    try {
      authenticateRequest(request);
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        return errorResponse(error.message, 401);
      }
      throw error;
    }

    const { id } = await context.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse("Invalid media ID", 400);
    }

    // Find and delete media
    const media = await Media.findById(id);
    if (!media) {
      throw new NotFoundError("Media not found");
    }

    // Delete file from filesystem
    await deleteFile(media.path);

    // Delete media record
    await Media.findByIdAndDelete(id);

    return successResponse(null, "File deleted successfully");
  } catch (error) {
    if (error instanceof NotFoundError) {
      return errorResponse(error.message, 404);
    }

    console.error("Delete media error:", error);
    return errorResponse("Internal server error", 500);
  }
}
