import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connection";
import { User } from "@/lib/db/models";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "@/lib/auth/jwt";
import { ApiResponse, UnauthorizedError } from "@/types/api.types";
import { RefreshResponse, AuthTokens } from "@/types/auth.types";

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<RefreshResponse | AuthTokens>>> {
  try {
    await connectDB();

    // Get refresh token from cookie or body
    let refreshToken = request.cookies.get("refreshToken")?.value;
    
    if (!refreshToken) {
      const body = await request.json().catch(() => ({}));
      refreshToken = body.refreshToken;
    }

    if (!refreshToken) {
      throw new UnauthorizedError("Refresh token is required");
    }

    // Verify refresh token
    const payload = verifyRefreshToken(refreshToken);
    if (!payload) {
      throw new UnauthorizedError("Invalid or expired refresh token");
    }

    // Find user and verify stored refresh token
    const user = await User.findById(payload.userId).select("+refreshToken");
    if (!user || user.refreshToken !== refreshToken) {
      throw new UnauthorizedError("Invalid refresh token");
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedError("Account is disabled");
    }

    // Generate new tokens
    const newAccessToken = generateAccessToken(
      user._id.toString(),
      user.email,
      user.role
    );
    const newRefreshToken = generateRefreshToken(user._id.toString());

    // Update refresh token in database
    await User.findByIdAndUpdate(user._id, { refreshToken: newRefreshToken });

    const response = NextResponse.json<ApiResponse<AuthTokens>>(
      {
        success: true,
        data: {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        },
        message: "Token refreshed successfully",
      },
      { status: 200 }
    );

    // Set new refresh token as httpOnly cookie
    response.cookies.set("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
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

    console.error("Token refresh error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
