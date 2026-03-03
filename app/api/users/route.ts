import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connection";
import { User } from "@/lib/db/models";
import { authenticateRequest, requireRole, errorResponse, successResponse } from "@/lib/auth/middleware";
import { hashPassword } from "@/lib/auth/password";
import { createUserSchema, userQuerySchema } from "@/lib/validations/user.schema";
import { ApiResponse, PaginatedResponse, UnauthorizedError, ForbiddenError, ConflictError } from "@/types/api.types";
import { IUser, IUserPublic, UserRole } from "@/types/models.types";

// Convert IUser to IUserPublic
function toUserPublic(user: IUser): IUserPublic {
  return {
    _id: user._id.toString(),
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    phone: user.phone,
    marketingEmails: user.marketingEmails ?? true,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

// GET /api/users - List all users (admin only)
export async function GET(request: NextRequest): Promise<NextResponse<PaginatedResponse<IUserPublic>>> {
  try {
    await connectDB();

    // Authenticate and authorize
    let authUser;
    try {
      authUser = authenticateRequest(request);
      requireRole(authUser, [UserRole.ADMIN]);
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
    const validationResult = userQuerySchema.safeParse(queryParams);
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

    const { page, limit, sortBy, sortOrder, role, isActive, search } = validationResult.data;

    // Build filter query
    const filter: Record<string, unknown> = {};

    if (role) {
      filter.role = role;
    }

    if (typeof isActive === "boolean") {
      filter.isActive = isActive;
    }

    // Add search filter for email, firstName, lastName
    if (search) {
      filter.$or = [
        { email: { $regex: search, $options: "i" } },
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    const total = await User.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    // Build sort object
    const sort: Record<string, 1 | -1> = {
      [sortBy]: sortOrder === "asc" ? 1 : -1,
    };

    // Fetch users
    const users = await User.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean<IUser[]>();

    const usersPublic = users.map(toUserPublic);

    return NextResponse.json<PaginatedResponse<IUserPublic>>({
      success: true,
      data: usersPublic,
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
    console.error("Get users error:", error);
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

// POST /api/users - Create user (admin only)
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<IUserPublic>>> {
  try {
    await connectDB();

    // Authenticate and authorize
    let authUser;
    try {
      authUser = authenticateRequest(request);
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

    const body = await request.json();

    // Validate input
    const validationResult = createUserSchema.safeParse(body);
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

    // Check if user already exists
    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      throw new ConflictError("User with this email already exists");
    }

    // Hash password
    const hashedPassword = await hashPassword(data.password);

    // Create user
    const user = await User.create({
      ...data,
      password: hashedPassword,
    });

    return successResponse(toUserPublic(user.toObject() as IUser), "User created successfully", 201);
  } catch (error) {
    if (error instanceof ConflictError) {
      return errorResponse(error.message, 409);
    }

    console.error("Create user error:", error);
    return errorResponse("Internal server error", 500);
  }
}
