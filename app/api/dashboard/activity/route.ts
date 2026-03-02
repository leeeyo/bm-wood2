import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connection";
import { Devis, Product, Category } from "@/lib/db/models";
import { authenticateRequest, errorResponse, successResponse } from "@/lib/auth/middleware";
import { ApiResponse, UnauthorizedError } from "@/types/api.types";

// ============ Activity Types ============

export type ActivityType = "devis" | "product" | "category";

export interface ActivityItem {
  type: ActivityType;
  id: string;
  title: string;
  updatedAt: string;
  createdAt: string;
}

// ============ GET /api/dashboard/activity ============

const ITEMS_PER_ENTITY = 10;
const MAX_TOTAL_ITEMS = 20;

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<ActivityItem[]>>> {
  try {
    // Authenticate - only CMS users can access dashboard activity
    try {
      authenticateRequest(request);
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        return errorResponse(error.message, 401);
      }
      throw error;
    }

    await connectDB();

    // Fetch recent items from each collection in parallel
    const [devisItems, productItems, categoryItems] = await Promise.all([
      Devis.find()
        .sort({ updatedAt: -1 })
        .limit(ITEMS_PER_ENTITY)
        .select("_id reference updatedAt createdAt")
        .lean(),
      Product.find()
        .sort({ updatedAt: -1 })
        .limit(ITEMS_PER_ENTITY)
        .select("_id name updatedAt createdAt")
        .lean(),
      Category.find()
        .sort({ updatedAt: -1 })
        .limit(ITEMS_PER_ENTITY)
        .select("_id name updatedAt createdAt")
        .lean(),
    ]);

    // Map to unified activity items
    const activities: ActivityItem[] = [];

    for (const devis of devisItems) {
      activities.push({
        type: "devis",
        id: devis._id.toString(),
        title: devis.reference,
        updatedAt: (devis.updatedAt as Date).toISOString(),
        createdAt: (devis.createdAt as Date).toISOString(),
      });
    }

    for (const product of productItems) {
      activities.push({
        type: "product",
        id: product._id.toString(),
        title: product.name,
        updatedAt: (product.updatedAt as Date).toISOString(),
        createdAt: (product.createdAt as Date).toISOString(),
      });
    }

    for (const category of categoryItems) {
      activities.push({
        type: "category",
        id: category._id.toString(),
        title: category.name,
        updatedAt: (category.updatedAt as Date).toISOString(),
        createdAt: (category.createdAt as Date).toISOString(),
      });
    }

    // Sort by updatedAt descending and limit
    activities.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    const limitedActivities = activities.slice(0, MAX_TOTAL_ITEMS);

    return successResponse(limitedActivities);
  } catch (error) {
    console.error("Get dashboard activity error:", error);
    return errorResponse("Internal server error", 500);
  }
}
