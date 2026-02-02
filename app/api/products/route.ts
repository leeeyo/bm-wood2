import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/db/connection";
import { Product, Category } from "@/lib/db/models";
import { authenticateRequest, errorResponse, successResponse } from "@/lib/auth/middleware";
import { createProductSchema, productQuerySchema } from "@/lib/validations/product.schema";
import { ApiResponse, PaginatedResponse, UnauthorizedError, ConflictError, NotFoundError } from "@/types/api.types";
import { IProduct } from "@/types/models.types";

// GET /api/products - List products with filtering and pagination (public)
export async function GET(request: NextRequest): Promise<NextResponse<PaginatedResponse<IProduct>>> {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());

    // Validate query parameters
    const validationResult = productQuerySchema.safeParse(queryParams);
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

    const { page, limit, sortBy, sortOrder, categoryId, isFeatured, isActive, search } = validationResult.data;

    // Build filter query
    const filter: Record<string, unknown> = {};

    if (categoryId) {
      filter.categoryId = new mongoose.Types.ObjectId(categoryId);
    }

    if (typeof isFeatured === "boolean") {
      filter.isFeatured = isFeatured;
    }

    if (typeof isActive === "boolean") {
      filter.isActive = isActive;
    } else {
      // By default, only show active products for public queries
      filter.isActive = true;
    }

    if (search) {
      filter.$text = { $search: search };
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    const total = await Product.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    // Build sort object
    const sort: Record<string, 1 | -1> = {
      [sortBy]: sortOrder === "asc" ? 1 : -1,
    };

    // Fetch products
    const products = await Product.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate("categoryId", "name slug")
      .lean<IProduct[]>();

    return NextResponse.json<PaginatedResponse<IProduct>>({
      success: true,
      data: products,
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
    console.error("Get products error:", error);
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

// POST /api/products - Create product (protected)
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<IProduct>>> {
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

    const body = await request.json();

    // Validate input
    const validationResult = createProductSchema.safeParse(body);
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

    // Verify category exists
    const category = await Category.findById(data.categoryId);
    if (!category) {
      throw new NotFoundError("Category not found");
    }

    // Generate slug if not provided
    const slug = data.slug || data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    // Check if slug already exists
    const existingProduct = await Product.findOne({ slug });
    if (existingProduct) {
      throw new ConflictError("Product with this slug already exists");
    }

    // Create product with validated data
    const newProduct = new Product({
      name: data.name,
      slug,
      description: data.description,
      categoryId: data.categoryId,
      images: data.images || [],
      specifications: data.specifications,
      isFeatured: data.isFeatured ?? false,
      isActive: data.isActive ?? true,
      createdBy: authUser.userId,
    });

    const savedProduct = await newProduct.save();

    const populatedProduct = await Product.findById(savedProduct._id)
      .populate("categoryId", "name slug")
      .lean<IProduct>();

    return successResponse(populatedProduct as IProduct, "Product created successfully", 201);
  } catch (error) {
    if (error instanceof NotFoundError) {
      return errorResponse(error.message, 404);
    }
    if (error instanceof ConflictError) {
      return errorResponse(error.message, 409);
    }

    console.error("Create product error:", error);
    return errorResponse("Internal server error", 500);
  }
}
