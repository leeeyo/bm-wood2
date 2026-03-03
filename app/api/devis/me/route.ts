import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connection";
import { Devis } from "@/lib/db/models";
import { authenticateRequest, errorResponse } from "@/lib/auth/middleware";
import { ApiResponse, PaginatedResponse, UnauthorizedError } from "@/types/api.types";
import { IDevis } from "@/types/models.types";

// GET /api/devis/me - List devis for current user (protected)
export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<IDevis[]> | PaginatedResponse<IDevis>>> {
  try {
    await connectDB();

    const authUser = authenticateRequest(request);

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "10", 10), 50);
    const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);
    const skip = (page - 1) * limit;

    // Fetch devis where userId matches OR client.email matches (for legacy devis)
    const filter = {
      $or: [
        { userId: authUser.userId },
        { "client.email": authUser.email },
      ],
    };

    const total = await Devis.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    const devisList = await Devis.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("-adminNotes")
      .lean<IDevis[]>();

    return NextResponse.json<PaginatedResponse<IDevis>>({
      success: true,
      data: devisList,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return errorResponse(error.message, 401);
    }
    console.error("Get my devis error:", error);
    return errorResponse("Internal server error", 500);
  }
}
