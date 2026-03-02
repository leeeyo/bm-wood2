import { NextResponse } from "next/server"
import connectDB from "@/lib/db/connection"
import { Product } from "@/lib/db/models"
import { successResponse, errorResponse } from "@/lib/auth/middleware"
import { ApiResponse } from "@/types/api.types"
import { IProduct } from "@/types/models.types"
import { NotFoundError } from "@/types/api.types"

interface RouteContext {
  params: Promise<{ slug: string }>
}

// GET /api/products/slug/:slug - Get single product by slug (public)
export async function GET(
  _request: Request,
  context: RouteContext
): Promise<NextResponse<ApiResponse<IProduct>>> {
  try {
    await connectDB()

    const { slug } = await context.params

    if (!slug || typeof slug !== "string") {
      return errorResponse("Invalid slug", 400)
    }

    const product = await Product.findOne({ slug, isActive: true })
      .populate("categoryId", "name slug")
      .lean<IProduct>()

    if (!product) {
      throw new NotFoundError("Product not found")
    }

    return successResponse(product)
  } catch (error) {
    if (error instanceof NotFoundError) {
      return errorResponse(error.message, 404)
    }

    console.error("Get product by slug error:", error)
    return errorResponse("Internal server error", 500)
  }
}
