import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connection";
import { Category } from "@/lib/db/models";
import { authenticateRequest, errorResponse, successResponse } from "@/lib/auth/middleware";
import { createCategorySchema } from "@/lib/validations/category.schema";
import { ApiResponse, UnauthorizedError, ConflictError } from "@/types/api.types";
import { ICategory } from "@/types/models.types";

// GET /api/categories - List all categories (public)
export async function GET(): Promise<NextResponse<ApiResponse<ICategory[]>>> {
  try {
    await connectDB();

    const categories = await Category.find()
      .sort({ order: 1, createdAt: -1 })
      .lean<ICategory[]>();

    return successResponse(categories);
  } catch (error) {
    console.error("Get categories error:", error);
    return errorResponse("Internal server error", 500);
  }
}

// POST /api/categories - Create category (protected)
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<ICategory>>> {
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

    const body = await request.json();

    // Validate input
    const validationResult = createCategorySchema.safeParse(body);
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

    // Generate slug if not provided
    const slug = data.slug || data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    // Check if slug already exists
    const existingCategory = await Category.findOne({ slug });
    if (existingCategory) {
      throw new ConflictError("Category with this slug already exists");
    }

    // Create category
    const category = await Category.create({
      ...data,
      slug,
    });

    return successResponse(category.toObject() as ICategory, "Category created successfully", 201);
  } catch (error) {
    if (error instanceof ConflictError) {
      return errorResponse(error.message, 409);
    }

    console.error("Create category error:", error);
    return errorResponse("Internal server error", 500);
  }
}
