import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/db/connection";
import { Product, Category } from "@/lib/db/models";
import { authenticateRequest, errorResponse, successResponse } from "@/lib/auth/middleware";
import { updateProductSchema } from "@/lib/validations/product.schema";
import { ApiResponse, UnauthorizedError, NotFoundError, ConflictError, RouteContext } from "@/types/api.types";
import { IProduct } from "@/types/models.types";

// GET /api/products/:id - Get single product (public)
export async function GET(
  _request: NextRequest,
  context: RouteContext
): Promise<NextResponse<ApiResponse<IProduct>>> {
  try {
    await connectDB();

    const { id } = await context.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse("Invalid product ID", 400);
    }

    const product = await Product.findById(id)
      .populate("categoryId", "name slug")
      .lean<IProduct>();

    if (!product) {
      throw new NotFoundError("Product not found");
    }

    return successResponse(product);
  } catch (error) {
    if (error instanceof NotFoundError) {
      return errorResponse(error.message, 404);
    }

    console.error("Get product error:", error);
    return errorResponse("Internal server error", 500);
  }
}

// PUT /api/products/:id - Update product (protected)
export async function PUT(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse<ApiResponse<IProduct>>> {
  try {
    await connectDB();

    // Authenticate
    try {
      authenticateRequest(request);
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        return errorResponse(error.message, 401);
      }
      throw error;
    }

    const { id } = await context.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse("Invalid product ID", 400);
    }

    const body = await request.json();

    // Validate input
    const validationResult = updateProductSchema.safeParse(body);
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

    // Check if product exists
    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      throw new NotFoundError("Product not found");
    }

    // If categoryId is being updated, verify it exists
    if (data.categoryId) {
      const category = await Category.findById(data.categoryId);
      if (!category) {
        throw new NotFoundError("Category not found");
      }
    }

    // If slug is being updated, check for conflicts
    if (data.slug && data.slug !== existingProduct.slug) {
      const slugConflict = await Product.findOne({ slug: data.slug, _id: { $ne: id } });
      if (slugConflict) {
        throw new ConflictError("Product with this slug already exists");
      }
    }

    // Update product
    const product = await Product.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    )
      .populate("categoryId", "name slug")
      .lean<IProduct>();

    return successResponse(product as IProduct, "Product updated successfully");
  } catch (error) {
    if (error instanceof NotFoundError) {
      return errorResponse(error.message, 404);
    }
    if (error instanceof ConflictError) {
      return errorResponse(error.message, 409);
    }

    console.error("Update product error:", error);
    return errorResponse("Internal server error", 500);
  }
}

// DELETE /api/products/:id - Delete product (protected)
export async function DELETE(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse<ApiResponse>> {
  try {
    await connectDB();

    // Authenticate
    try {
      authenticateRequest(request);
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        return errorResponse(error.message, 401);
      }
      throw error;
    }

    const { id } = await context.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse("Invalid product ID", 400);
    }

    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      throw new NotFoundError("Product not found");
    }

    return successResponse(null, "Product deleted successfully");
  } catch (error) {
    if (error instanceof NotFoundError) {
      return errorResponse(error.message, 404);
    }

    console.error("Delete product error:", error);
    return errorResponse("Internal server error", 500);
  }
}
