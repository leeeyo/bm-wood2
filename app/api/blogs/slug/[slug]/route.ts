import { NextResponse } from "next/server";
import connectDB from "@/lib/db/connection";
import { BlogPost } from "@/lib/db/models";
import { successResponse, errorResponse } from "@/lib/auth/middleware";
import { ApiResponse } from "@/types/api.types";
import { IBlogPost } from "@/types/models.types";
import { NotFoundError } from "@/types/api.types";

interface RouteContext {
  params: Promise<{ slug: string }>;
}

// GET /api/blogs/slug/:slug - Get single blog by slug (public, published only)
export async function GET(
  _request: Request,
  context: RouteContext
): Promise<NextResponse<ApiResponse<IBlogPost>>> {
  try {
    await connectDB();

    const { slug } = await context.params;

    if (!slug || typeof slug !== "string") {
      return errorResponse("Invalid slug", 400);
    }

    const blog = await BlogPost.findOne({ slug, isPublished: true })
      .populate("authorId", "firstName lastName")
      .lean<IBlogPost>();

    if (!blog) {
      throw new NotFoundError("Blog post not found");
    }

    return successResponse(blog);
  } catch (error) {
    if (error instanceof NotFoundError) {
      return errorResponse(error.message, 404);
    }

    console.error("Get blog by slug error:", error);
    return errorResponse("Internal server error", 500);
  }
}
