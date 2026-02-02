import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connection";
import { Media } from "@/lib/db/models";
import { authenticateRequest, errorResponse, successResponse } from "@/lib/auth/middleware";
import { saveFile, isUploadError } from "@/lib/services/upload.service";
import { ApiResponse, UnauthorizedError } from "@/types/api.types";
import { IMedia } from "@/types/models.types";

// POST /api/uploads - Upload file (protected)
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<IMedia>>> {
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

    // Get form data
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return errorResponse("No file provided", 400);
    }

    // Read file as buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Save file
    const result = await saveFile(buffer, file.name, file.type);

    if (isUploadError(result)) {
      const statusCode = result.code === "FILE_TOO_LARGE" ? 413 : 400;
      return errorResponse(result.message, statusCode);
    }

    // Create media record in database
    const media = await Media.create({
      filename: result.filename,
      originalName: result.originalName,
      mimeType: result.mimeType,
      size: result.size,
      path: result.path,
      url: result.url,
      type: result.type,
      uploadedBy: authUser.userId,
    });

    return successResponse(media.toObject() as IMedia, "File uploaded successfully", 201);
  } catch (error) {
    console.error("Upload error:", error);
    return errorResponse("Internal server error", 500);
  }
}

// GET /api/uploads - List all uploads (protected)
export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<IMedia[]>>> {
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

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    // Build filter
    const filter: Record<string, string> = {};
    if (type && (type === "image" || type === "document")) {
      filter.type = type;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Fetch media
    const media = await Media.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("uploadedBy", "firstName lastName email")
      .lean<IMedia[]>();

    return successResponse(media);
  } catch (error) {
    console.error("Get uploads error:", error);
    return errorResponse("Internal server error", 500);
  }
}
