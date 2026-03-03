import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/db/connection";
import { User } from "@/lib/db/models";
import { authenticateRequest, requireRole, errorResponse, successResponse } from "@/lib/auth/middleware";
import { hashPassword } from "@/lib/auth/password";
import { updateUserSchema } from "@/lib/validations/user.schema";
import { ApiResponse, UnauthorizedError, ForbiddenError, NotFoundError, ConflictError, RouteContext } from "@/types/api.types";
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

// GET /api/users/:id - Get single user (protected)
export async function GET(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse<ApiResponse<IUserPublic>>> {
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
      return errorResponse("Invalid user ID", 400);
    }

    // Users can only view their own profile unless they are admin
    if (authUser.userId !== id && authUser.role !== UserRole.ADMIN) {
      return errorResponse("Forbidden", 403);
    }

    const user = await User.findById(id).lean<IUser>();
    if (!user) {
      throw new NotFoundError("User not found");
    }

    return successResponse(toUserPublic(user));
  } catch (error) {
    if (error instanceof NotFoundError) {
      return errorResponse(error.message, 404);
    }

    console.error("Get user error:", error);
    return errorResponse("Internal server error", 500);
  }
}

// PUT /api/users/:id - Update user (protected)
export async function PUT(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse<ApiResponse<IUserPublic>>> {
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
      return errorResponse("Invalid user ID", 400);
    }

    // Users can only update their own profile unless they are admin
    const isOwnProfile = authUser.userId === id;
    const isAdmin = authUser.role === UserRole.ADMIN;

    if (!isOwnProfile && !isAdmin) {
      return errorResponse("Forbidden", 403);
    }

    const body = await request.json();

    // Validate input
    const validationResult = updateUserSchema.safeParse(body);
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

    // Non-admins cannot change role or isActive status
    if (!isAdmin) {
      delete data.role;
      delete data.isActive;
    }

    // Check if user exists
    const existingUser = await User.findById(id);
    if (!existingUser) {
      throw new NotFoundError("User not found");
    }

    // If email is being updated, check for conflicts
    if (data.email && data.email !== existingUser.email) {
      const emailConflict = await User.findOne({ email: data.email, _id: { $ne: id } });
      if (emailConflict) {
        throw new ConflictError("User with this email already exists");
      }
    }

    // Hash password if being updated
    const updateData: Record<string, unknown> = { ...data };
    const newPassword = data.password;
    const passwordChanged = !!newPassword;
    if (passwordChanged && newPassword) {
      updateData.password = await hashPassword(newPassword);
    }

    // Update user; revoke refresh sessions when password changes
    const user = await User.findByIdAndUpdate(
      id,
      {
        $set: updateData,
        ...(passwordChanged && { $unset: { refreshToken: "" } }),
      },
      { new: true, runValidators: true }
    ).lean<IUser>();

    return successResponse(toUserPublic(user as IUser), "User updated successfully");
  } catch (error) {
    if (error instanceof NotFoundError) {
      return errorResponse(error.message, 404);
    }
    if (error instanceof ConflictError) {
      return errorResponse(error.message, 409);
    }

    console.error("Update user error:", error);
    return errorResponse("Internal server error", 500);
  }
}

// DELETE /api/users/:id - Delete user (admin only)
export async function DELETE(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse<ApiResponse>> {
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

    const { id } = await context.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse("Invalid user ID", 400);
    }

    // Prevent self-deletion
    if (authUser.userId === id) {
      return errorResponse("Cannot delete your own account", 400);
    }

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    return successResponse(null, "User deleted successfully");
  } catch (error) {
    if (error instanceof NotFoundError) {
      return errorResponse(error.message, 404);
    }

    console.error("Delete user error:", error);
    return errorResponse("Internal server error", 500);
  }
}
