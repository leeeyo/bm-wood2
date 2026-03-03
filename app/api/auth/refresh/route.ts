import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connection";
import { User } from "@/lib/db/models";
import { generateAccessToken, generateRefreshToken, hashRefreshToken, verifyRefreshToken } from "@/lib/auth/jwt";
import { checkAuthRateLimit, AUTH_FAILURE_MESSAGE } from "@/lib/rate-limit";
import { ApiResponse, UnauthorizedError } from "@/types/api.types";
import { RefreshResponse } from "@/types/auth.types";

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<RefreshResponse>>> {
  try {
    const limit = checkAuthRateLimit(request);
    if (!limit.allowed) {
      return NextResponse.json(
        { success: false, error: AUTH_FAILURE_MESSAGE },
        {
          status: 429,
          headers: limit.retryAfter ? { "Retry-After": String(limit.retryAfter) } : undefined,
        }
      );
    }

    await connectDB();

    // Get refresh token from httpOnly cookie only (no body acceptance)
    const refreshToken = request.cookies.get("refreshToken")?.value;
    if (!refreshToken) {
      throw new UnauthorizedError("Refresh token is required");
    }

    // Verify refresh token
    const payload = verifyRefreshToken(refreshToken);
    if (!payload) {
      throw new UnauthorizedError("Invalid or expired refresh token");
    }

    // Find user and verify stored refresh token (hash or legacy raw)
    const user = await User.findById(payload.userId).select("+refreshToken");
    const stored = user?.refreshToken;
    const incomingHash = hashRefreshToken(refreshToken);
    const isValid =
      user &&
      stored &&
      (stored === incomingHash || stored === refreshToken); // support legacy raw token migration
    if (!isValid) {
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

    // Update to hashed refresh token in database (migrates legacy raw tokens)
    const newRefreshTokenHash = hashRefreshToken(newRefreshToken);
    await User.findByIdAndUpdate(user._id, { refreshToken: newRefreshTokenHash });

    // Return accessToken only; refresh token is httpOnly cookie only
    const response = NextResponse.json<ApiResponse<RefreshResponse>>(
      {
        success: true,
        data: {
          accessToken: newAccessToken,
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
