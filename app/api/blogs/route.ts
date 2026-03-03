import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connection";
import { BlogPost } from "@/lib/db/models";
import { authenticateRequest, requireRole, errorResponse, successResponse } from "@/lib/auth/middleware";
import { CMS_ROLES } from "@/lib/auth/middleware";
import { createBlogPostSchema, blogQuerySchema } from "@/lib/validations/blog.schema";
import {
  ApiResponse,
  PaginatedResponse,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
} from "@/types/api.types";
import { IBlogPost, UserRole } from "@/types/models.types";

// GET /api/blogs - List blogs with pagination (public sees published only; CMS sees all)
export async function GET(
  request: NextRequest
): Promise<NextResponse<PaginatedResponse<IBlogPost>>> {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());

    const validationResult = blogQuerySchema.safeParse(queryParams);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid query parameters",
          pagination: { page: 1, limit: 12, total: 0, totalPages: 0, hasNext: false, hasPrev: false },
        },
        { status: 400 }
      );
    }

    const { page, limit, isPublished, sortBy, sortOrder } = validationResult.data;

    const filter: Record<string, unknown> = {};

    // Only CMS roles can see unpublished content; public sees published only
    let hasCmsRole = false;
    try {
      const authUser = authenticateRequest(request);
      hasCmsRole = (CMS_ROLES as readonly UserRole[]).includes(authUser.role);
    } catch {
      // Public request - filter to published only
    }
    if (!hasCmsRole) {
      filter.isPublished = true;
    } else if (typeof isPublished === "boolean") {
      filter.isPublished = isPublished;
    }

    const skip = (page - 1) * limit;
    const total = await BlogPost.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    const sort: Record<string, 1 | -1> = {
      [sortBy]: sortOrder === "asc" ? 1 : -1,
    };

    const blogs = await BlogPost.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate("authorId", "firstName lastName")
      .lean<IBlogPost[]>();

    return NextResponse.json<PaginatedResponse<IBlogPost>>({
      success: true,
      data: blogs,
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
    console.error("Get blogs error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        pagination: { page: 1, limit: 12, total: 0, totalPages: 0, hasNext: false, hasPrev: false },
      },
      { status: 500 }
    );
  }
}

// POST /api/blogs - Create blog post (protected)
export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<IBlogPost>>> {
  try {
    await connectDB();

    try {
      const authUser = authenticateRequest(request);
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

    const authUser = authenticateRequest(request);
    const body = await request.json();

    const validationResult = createBlogPostSchema.safeParse(body);
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

    const slug =
      data.slug ||
      data.title
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

    const existingBlog = await BlogPost.findOne({ slug });
    if (existingBlog) {
      throw new ConflictError("Blog post with this slug already exists");
    }

    const blog = await BlogPost.create({
      ...data,
      slug,
      authorId: authUser.userId,
      publishedAt: data.isPublished ? data.publishedAt ?? new Date() : null,
    });

    return successResponse(blog.toObject() as IBlogPost, "Blog post created successfully", 201);
  } catch (error) {
    if (error instanceof ConflictError) {
      return errorResponse(error.message, 409);
    }
    if (error instanceof ForbiddenError) {
      return errorResponse(error.message, 403);
    }

    console.error("Create blog error:", error);
    return errorResponse("Internal server error", 500);
  }
}
