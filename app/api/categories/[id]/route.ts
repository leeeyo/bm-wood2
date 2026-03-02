import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/db/connection";
import { Category } from "@/lib/db/models";
import { authenticateRequest, requireRole, errorResponse, successResponse } from "@/lib/auth/middleware";
import { updateCategorySchema } from "@/lib/validations/category.schema";
import { ApiResponse, UnauthorizedError, ForbiddenError, NotFoundError, ConflictError, RouteContext } from "@/types/api.types";
import { ICategory, UserRole } from "@/types/models.types";

// GET /api/categories/:id - Get single category (public)
export async function GET(
  _request: NextRequest,
  context: RouteContext
): Promise<NextResponse<ApiResponse<ICategory>>> {
  try {
    await connectDB();

    const { id } = await context.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse("Invalid category ID", 400);
    }

    const category = await Category.findById(id).lean<ICategory>();
    if (!category) {
      throw new NotFoundError("Category not found");
    }

    return successResponse(category);
  } catch (error) {
    if (error instanceof NotFoundError) {
      return errorResponse(error.message, 404);
    }

    console.error("Get category error:", error);
    return errorResponse("Internal server error", 500);
  }
}

// PUT /api/categories/:id - Update category (protected)
export async function PUT(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse<ApiResponse<ICategory>>> {
  try {
    await connectDB();

    // Authenticate
    try {
      const authUser = authenticateRequest(request);
      requireRole(authUser, [UserRole.ADMIN, UserRole.MANAGER]);
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
      return errorResponse("Invalid category ID", 400);
    }

    const body = await request.json();

    // Validate input
    const validationResult = updateCategorySchema.safeParse(body);
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

    // Check if category exists
    const existingCategory = await Category.findById(id);
    if (!existingCategory) {
      throw new NotFoundError("Category not found");
    }

    // If slug is being updated, check for conflicts
    if (data.slug && data.slug !== existingCategory.slug) {
      const slugConflict = await Category.findOne({ slug: data.slug, _id: { $ne: id } });
      if (slugConflict) {
        throw new ConflictError("Category with this slug already exists");
      }
    }

    // Update category
    const category = await Category.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    ).lean<ICategory>();

    return successResponse(category as ICategory, "Category updated successfully");
  } catch (error) {
    if (error instanceof NotFoundError) {
      return errorResponse(error.message, 404);
    }
    if (error instanceof ConflictError) {
      return errorResponse(error.message, 409);
    }
    if (error instanceof ForbiddenError) {
      return errorResponse(error.message, 403);
    }

    console.error("Update category error:", error);
    return errorResponse("Internal server error", 500);
  }
}

// DELETE /api/categories/:id - Delete category (protected)
export async function DELETE(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse<ApiResponse>> {
  try {
    await connectDB();

    // Authenticate
    try {
      const authUser = authenticateRequest(request);
      requireRole(authUser, [UserRole.ADMIN, UserRole.MANAGER]);
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
      return errorResponse("Invalid category ID", 400);
    }

    const category = await Category.findByIdAndDelete(id);
    if (!category) {
      throw new NotFoundError("Category not found");
    }

    return successResponse(null, "Category deleted successfully");
  } catch (error) {
    if (error instanceof NotFoundError) {
      return errorResponse(error.message, 404);
    }
    if (error instanceof ForbiddenError) {
      return errorResponse(error.message, 403);
    }

    console.error("Delete category error:", error);
    return errorResponse("Internal server error", 500);
  }
}
