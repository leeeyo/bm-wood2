import { NextRequest, NextResponse } from "next/server";
import { saveFile, isUploadError } from "@/lib/services/upload.service";
import { errorResponse, successResponse } from "@/lib/auth/middleware";
import { ApiResponse } from "@/types/api.types";
import { checkRateLimit, isLikelyBot, getUploadLimit } from "@/lib/rate-limit";

/**
 * POST /api/devis/upload - Public upload for devis attachments (plans, photos)
 * Accepts: image/* (jpeg, png, webp, gif) and application/pdf
 * Returns: { url } for use in devis attachments array
 */
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<{ url: string }>>> {
  try {
    if (isLikelyBot(request)) {
      return errorResponse("Requête non autorisée", 403);
    }
    const limit = checkRateLimit(request, getUploadLimit());
    if (!limit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: "Trop d'uploads. Veuillez réessayer plus tard.",
          retryAfter: limit.retryAfter,
        },
        { status: 429, headers: limit.retryAfter ? { "Retry-After": String(limit.retryAfter) } : undefined }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return errorResponse("Aucun fichier fourni", 400);
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const result = await saveFile(buffer, file.name, file.type);

    if (isUploadError(result)) {
      const statusCode = result.code === "FILE_TOO_LARGE" ? 413 : 400;
      return errorResponse(result.message, statusCode);
    }

    return successResponse({ url: result.url }, "Fichier uploadé avec succès", 201);
  } catch (error) {
    console.error("Devis upload error:", error);
    return errorResponse("Erreur serveur lors de l'upload", 500);
  }
}
