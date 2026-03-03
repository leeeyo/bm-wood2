import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connection";
import { Devis, DevisCounter } from "@/lib/db/models";
import { authenticateRequest, authenticateAndRequireRole, errorResponse, successResponse } from "@/lib/auth/middleware";
import { CMS_ROLES } from "@/lib/auth/middleware";
import { checkRateLimit, isLikelyBot, getDevisLimit } from "@/lib/rate-limit";
import { createDevisSchema, devisQuerySchema } from "@/lib/validations/devis.schema";
import { ApiResponse, PaginatedResponse, UnauthorizedError, ForbiddenError } from "@/types/api.types";
import { IDevis, DevisStatus } from "@/types/models.types";
import { sendDevisConfirmationEmail, sendNewDevisNotificationEmail } from "@/lib/services/email.service";

// GET /api/devis - List all quotes (protected)
export async function GET(request: NextRequest): Promise<NextResponse<PaginatedResponse<IDevis>>> {
  try {
    await connectDB();

    // Authenticate and require admin role for listing all devis
    try {
      authenticateAndRequireRole(request, [...CMS_ROLES]);
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        return NextResponse.json(
          {
            success: false,
            error: error.message,
            pagination: { page: 1, limit: 20, total: 0, totalPages: 0, hasNext: false, hasPrev: false },
          },
          { status: 401 }
        );
      }
      if (error instanceof ForbiddenError) {
        return NextResponse.json(
          {
            success: false,
            error: error.message,
            pagination: { page: 1, limit: 20, total: 0, totalPages: 0, hasNext: false, hasPrev: false },
          },
          { status: 403 }
        );
      }
      throw error;
    }

    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());

    // Validate query parameters
    const validationResult = devisQuerySchema.safeParse(queryParams);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid query parameters",
          pagination: { page: 1, limit: 20, total: 0, totalPages: 0, hasNext: false, hasPrev: false },
        },
        { status: 400 }
      );
    }

    const { page, limit, sortBy, sortOrder, status, assignedTo, dateFrom, dateTo, search } = validationResult.data;

    // Build filter query
    const filter: Record<string, unknown> = {};

    if (status) {
      filter.status = status;
    }

    if (assignedTo) {
      filter.assignedTo = assignedTo;
    }

    if (dateFrom || dateTo) {
      const dateFilter: { $gte?: Date; $lte?: Date } = {};
      if (dateFrom) {
        dateFilter.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        dateFilter.$lte = new Date(dateTo);
      }
      filter.createdAt = dateFilter;
    }

    // Search by client email, first name, last name, or reference
    if (search) {
      const searchRegex = { $regex: search, $options: "i" };
      filter.$or = [
        { "client.email": searchRegex },
        { "client.firstName": searchRegex },
        { "client.lastName": searchRegex },
        { reference: searchRegex },
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    const total = await Devis.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    // Build sort object
    const sort: Record<string, 1 | -1> = {
      [sortBy]: sortOrder === "asc" ? 1 : -1,
    };

    // Fetch devis
    const devisList = await Devis.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate("assignedTo", "firstName lastName email")
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
    console.error("Get devis error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0, hasNext: false, hasPrev: false },
      },
      { status: 500 }
    );
  }
}

// POST /api/devis - Submit quote request (public)
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<IDevis>>> {
  try {
    if (isLikelyBot(request)) {
      return errorResponse("Requête non autorisée", 403);
    }
    const limit = checkRateLimit(request, getDevisLimit());
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

    await connectDB();

    const body = await request.json();

    // Validate input
    const validationResult = createDevisSchema.safeParse(body);
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

    // Generate unique reference atomically
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const yearMonth = `${year}${month}`;

    const counter = await DevisCounter.findOneAndUpdate(
      { yearMonth },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    const reference = `DEV-${yearMonth}-${String(counter.seq).padStart(4, "0")}`;

    // If user is authenticated, link devis to their account
    let userId: string | undefined;
    try {
      const authUser = authenticateRequest(request);
      userId = authUser.userId;
    } catch {
      // Not authenticated - devis stays unlinked
    }

    // Create devis with generated reference
    const devis = await Devis.create({
      ...data,
      reference,
      status: DevisStatus.PENDING,
      ...(userId && { userId }),
    });

    // Send confirmation email to customer (non-blocking)
    sendDevisConfirmationEmail(devis.toObject() as IDevis).catch((err) => {
      console.error("Failed to send confirmation email:", err);
    });

    // Send notification to admin (non-blocking)
    sendNewDevisNotificationEmail(devis.toObject() as IDevis).catch((err) => {
      console.error("Failed to send admin notification:", err);
    });

    return successResponse(devis.toObject() as IDevis, "Quote request submitted successfully", 201);
  } catch (error) {
    console.error("Create devis error:", error);
    return errorResponse("Internal server error", 500);
  }
}
