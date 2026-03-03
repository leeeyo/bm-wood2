import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/db/connection";
import { Media } from "@/lib/db/models";
import { authenticateRequest, requireRole, errorResponse, successResponse } from "@/lib/auth/middleware";
import { deleteFile } from "@/lib/services/upload.service";
import { ApiResponse, UnauthorizedError, ForbiddenError, NotFoundError, RouteContext } from "@/types/api.types";
import { IMedia, UserRole } from "@/types/models.types";

/** Public media metadata (no path, no uploader) */
type MediaPublicMeta = Pick<IMedia, "_id" | "url" | "filename" | "originalName" | "mimeType" | "size" | "type" | "createdAt" | "updatedAt">;

// GET /api/uploads/:id - Get file info (protected; full details only for admin/manager)
export async function GET(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse<ApiResponse<IMedia | MediaPublicMeta>>> {
  try {
    await connectDB();

    // Authenticate
    let authUser;
    try {
      authUser = authenticateRequest(request);
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

    const media = await Media.findById(id)
      .populate("uploadedBy", "firstName lastName email")
      .lean<IMedia & { uploadedBy?: unknown }>();

    if (!media) {
      throw new NotFoundError("Media not found");
    }

    const isAuthorized = authUser.role === UserRole.ADMIN;
    if (isAuthorized) {
      return successResponse(media as IMedia);
    }

    // Return only public URL and basic metadata (omit path and uploader)
    const publicMeta: MediaPublicMeta = {
      _id: media._id,
      url: media.url,
      filename: media.filename,
      originalName: media.originalName,
      mimeType: media.mimeType,
      size: media.size,
      type: media.type,
      createdAt: media.createdAt,
      updatedAt: media.updatedAt,
    };
    return successResponse(publicMeta);
  } catch (error) {
    if (error instanceof NotFoundError) {
      return errorResponse(error.message, 404);
    }
    if (error instanceof ForbiddenError) {
      return errorResponse(error.message, 403);
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
    if (error instanceof ForbiddenError) {
      return errorResponse(error.message, 403);
    }

    console.error("Delete media error:", error);
    return errorResponse("Internal server error", 500);
  }
}
