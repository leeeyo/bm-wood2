import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connection";
import { User } from "@/lib/db/models";
import { comparePassword } from "@/lib/auth/password";
import { generateAccessToken, generateRefreshToken, hashRefreshToken } from "@/lib/auth/jwt";
import { loginSchema } from "@/lib/validations/auth.schema";
import { checkAuthRateLimit, AUTH_FAILURE_MESSAGE } from "@/lib/rate-limit";
import { ApiResponse, UnauthorizedError } from "@/types/api.types";
import { LoginResponse } from "@/types/auth.types";
import { IUserPublic } from "@/types/models.types";

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<LoginResponse>>> {
  try {
    const body = await request.json().catch(() => ({}));
    const email = typeof body?.email === "string" ? body.email : undefined;

    const limit = checkAuthRateLimit(request, email);
    if (!limit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: AUTH_FAILURE_MESSAGE,
        },
        {
          status: 429,
          headers: limit.retryAfter ? { "Retry-After": String(limit.retryAfter) } : undefined,
        }
      );
    }

    await connectDB();
    
    // Validate input
    const validationResult = loginSchema.safeParse(body);
    if (!validationResult.success) {
      const errors = validationResult.error.flatten().fieldErrors;
      return NextResponse.json(
        { 
          success: false, 
          error: "Validation failed",
          message: Object.values(errors).flat().join(", ")
        },
        { status: 400 }
      );
    }

    const { email: validatedEmail, password } = validationResult.data;

    // Find user with password field
    const user = await User.findOne({ email: validatedEmail }).select("+password");
    if (!user) {
      throw new UnauthorizedError(AUTH_FAILURE_MESSAGE);
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedError(AUTH_FAILURE_MESSAGE);
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError(AUTH_FAILURE_MESSAGE);
    }

    // Generate tokens
    const accessToken = generateAccessToken(
      user._id.toString(),
      user.email,
      user.role
    );
    const refreshToken = generateRefreshToken(user._id.toString());

    // Save hashed refresh token to user (never store raw token)
    const refreshTokenHash = hashRefreshToken(refreshToken);
    await User.findByIdAndUpdate(user._id, { refreshToken: refreshTokenHash });

    // Prepare user response (without sensitive data)
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

    // Return accessToken only; refresh token is httpOnly cookie only
    const response = NextResponse.json<ApiResponse<LoginResponse>>(
      {
        success: true,
        data: {
          user: userResponse,
          tokens: {
            accessToken,
          },
        },
        message: "Login successful",
      },
      { status: 200 }
    );

    // Set refresh token as httpOnly cookie
    response.cookies.set("refreshToken", refreshToken, {
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

    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
