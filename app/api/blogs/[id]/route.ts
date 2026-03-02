import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/db/connection";
import { BlogPost } from "@/lib/db/models";
import { authenticateRequest, requireRole, errorResponse, successResponse } from "@/lib/auth/middleware";
import { updateBlogPostSchema } from "@/lib/validations/blog.schema";
import {
  ApiResponse,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  RouteContext,
} from "@/types/api.types";
import { IBlogPost, UserRole } from "@/types/models.types";

// GET /api/blogs/:id - Get single blog (public for published; CMS can get any)
export async function GET(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse<ApiResponse<IBlogPost>>> {
  try {
    await connectDB();

    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse("Invalid blog ID", 400);
    }

    let blog = await BlogPost.findById(id)
      .populate("authorId", "firstName lastName")
      .lean<IBlogPost>();

    if (!blog) {
      throw new NotFoundError("Blog post not found");
    }

    // If not published, require auth
    if (!blog.isPublished) {
      try {
        authenticateRequest(request);
      } catch {
        throw new NotFoundError("Blog post not found");
      }
    }

    return successResponse(blog);
  } catch (error) {
    if (error instanceof NotFoundError) {
      return errorResponse(error.message, 404);
    }

    console.error("Get blog error:", error);
    return errorResponse("Internal server error", 500);
  }
}

// PUT /api/blogs/:id - Update blog (protected)
export async function PUT(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse<ApiResponse<IBlogPost>>> {
  try {
    await connectDB();

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

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse("Invalid blog ID", 400);
    }

    const body = await request.json();

    const validationResult = updateBlogPostSchema.safeParse(body);
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
    const existingBlog = await BlogPost.findById(id);

    if (!existingBlog) {
      throw new NotFoundError("Blog post not found");
    }

    if (data.slug && data.slug !== existingBlog.slug) {
      const slugConflict = await BlogPost.findOne({ slug: data.slug, _id: { $ne: id } });
      if (slugConflict) {
        throw new ConflictError("Blog post with this slug already exists");
      }
    }

    const updateData: Record<string, unknown> = { ...data };
    if (data.isPublished && !existingBlog.publishedAt) {
      updateData.publishedAt = data.publishedAt ?? new Date();
    } else if (!data.isPublished) {
      updateData.publishedAt = null;
    }

    const blog = await BlogPost.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true })
      .populate("authorId", "firstName lastName")
      .lean<IBlogPost>();

    return successResponse(blog as IBlogPost, "Blog post updated successfully");
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

    console.error("Update blog error:", error);
    return errorResponse("Internal server error", 500);
  }
}

// DELETE /api/blogs/:id - Delete blog (protected)
export async function DELETE(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse<ApiResponse>> {
  try {
    await connectDB();

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

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse("Invalid blog ID", 400);
    }

    const blog = await BlogPost.findByIdAndDelete(id);
    if (!blog) {
      throw new NotFoundError("Blog post not found");
    }

    return successResponse(null, "Blog post deleted successfully");
  } catch (error) {
    if (error instanceof NotFoundError) {
      return errorResponse(error.message, 404);
    }
    if (error instanceof ForbiddenError) {
      return errorResponse(error.message, 403);
    }

    console.error("Delete blog error:", error);
    return errorResponse("Internal server error", 500);
  }
}
