import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connection";
import { User } from "@/lib/db/models";
import { authenticateRequest } from "@/lib/auth/middleware";
import { ApiResponse, UnauthorizedError, NotFoundError } from "@/types/api.types";
import { IUserPublic } from "@/types/models.types";

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<IUserPublic>>> {
  try {
    await connectDB();

    const authUser = authenticateRequest(request);

    // Get full user data from database
    const user = await User.findById(authUser.userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const userResponse: IUserPublic = {
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

    return NextResponse.json<ApiResponse<IUserPublic>>(
      {
        success: true,
        data: userResponse,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 }
      );
    }

    if (error instanceof NotFoundError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 404 }
      );
    }

    console.error("Get current user error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
