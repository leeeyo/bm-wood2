import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connection";
import { User } from "@/lib/db/models";
import { authenticateRequest } from "@/lib/auth/middleware";
import { ApiResponse, UnauthorizedError } from "@/types/api.types";

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    await connectDB();

    const user = authenticateRequest(request);

    // Clear refresh token from database (revoke session)
    await User.findByIdAndUpdate(user.userId, { $unset: { refreshToken: "" } });

    const response = NextResponse.json<ApiResponse>(
      {
        success: true,
        message: "Logged out successfully",
      },
      { status: 200 }
    );

    // Clear refresh token cookie
    response.cookies.set("refreshToken", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    });

    return response;
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 }
      );
    }

    console.error("Logout error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
