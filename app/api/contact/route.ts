import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sendContactFormEmail } from "@/lib/services/email.service";
import { errorResponse, successResponse } from "@/lib/auth/middleware";
import { ApiResponse } from "@/types/api.types";
import { checkRateLimit, isLikelyBot, getContactLimit } from "@/lib/rate-limit";

const contactSchema = z.object({
  firstName: z.string().min(1, "Le prénom est requis"),
  lastName: z.string().min(1, "Le nom est requis"),
  email: z.string().email("Adresse email invalide"),
  phone: z.string().min(1, "Le téléphone est requis"),
  subject: z.string().max(200).optional(),
  message: z.string().min(10, "Le message doit contenir au moins 10 caractères").max(2000, "Le message ne peut pas dépasser 2000 caractères"),
});

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<null>>> {
  try {
    if (isLikelyBot(request)) {
      return errorResponse("Requête non autorisée", 403);
    }
    const limit = checkRateLimit(request, getContactLimit());
    if (!limit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: "Trop de requêtes. Veuillez réessayer plus tard.",
          retryAfter: limit.retryAfter,
        },
        { status: 429, headers: limit.retryAfter ? { "Retry-After": String(limit.retryAfter) } : undefined }
      );
    }

    const body = await request.json();
    const validationResult = contactSchema.safeParse(body);

    if (!validationResult.success) {
      const errors = validationResult.error.flatten().fieldErrors;
      const message = Object.values(errors)
        .flat()
        .join(", ");
      return errorResponse(message, 400);
    }

    const result = await sendContactFormEmail(validationResult.data);

    if (!result.success) {
      return errorResponse(result.error || "Erreur lors de l'envoi du message", 500);
    }

    return successResponse(null, "Message envoyé avec succès");
  } catch (error) {
    console.error("Contact form error:", error);
    return errorResponse("Erreur serveur", 500);
  }
}
