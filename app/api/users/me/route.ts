import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connection";
import { User } from "@/lib/db/models";
import { authenticateRequest, errorResponse, successResponse } from "@/lib/auth/middleware";
import { updateProfileSchema } from "@/lib/validations/user.schema";
import { ApiResponse, UnauthorizedError, NotFoundError } from "@/types/api.types";
import { IUser, IUserPublic } from "@/types/models.types";

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

// GET /api/users/me - Get current user profile (alias for /api/auth/me, for consistency)
export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<IUserPublic>>> {
  try {
    await connectDB();

    const authUser = authenticateRequest(request);

    const user = await User.findById(authUser.userId).lean<IUser>();
    if (!user) {
      throw new NotFoundError("User not found");
    }

    return successResponse(toUserPublic(user));
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return errorResponse(error.message, 401);
    }
    if (error instanceof NotFoundError) {
      return errorResponse(error.message, 404);
    }
    console.error("Get profile error:", error);
    return errorResponse("Internal server error", 500);
  }
}

// PATCH /api/users/me - Update current user profile (firstName, lastName, phone, marketingEmails)
export async function PATCH(request: NextRequest): Promise<NextResponse<ApiResponse<IUserPublic>>> {
  try {
    await connectDB();

    const authUser = authenticateRequest(request);

    const body = await request.json();
    const validationResult = updateProfileSchema.safeParse(body);
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
    const updatePayload: Record<string, unknown> = {};
    if (data.firstName !== undefined) updatePayload.firstName = data.firstName;
    if (data.lastName !== undefined) updatePayload.lastName = data.lastName;
    if (data.phone !== undefined) updatePayload.phone = data.phone ?? null;
    if (data.marketingEmails !== undefined) updatePayload.marketingEmails = data.marketingEmails;

    const user = await User.findByIdAndUpdate(
      authUser.userId,
      { $set: updatePayload },
      { new: true, runValidators: true }
    ).lean<IUser>();

    if (!user) {
      throw new NotFoundError("User not found");
    }

    return successResponse(toUserPublic(user), "Profil mis à jour");
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return errorResponse(error.message, 401);
    }
    if (error instanceof NotFoundError) {
      return errorResponse(error.message, 404);
    }
    console.error("Update profile error:", error);
    return errorResponse("Internal server error", 500);
  }
}
