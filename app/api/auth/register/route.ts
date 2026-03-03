import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connection";
import { User } from "@/lib/db/models";
import { hashPassword } from "@/lib/auth/password";
import { generateAccessToken, generateRefreshToken, hashRefreshToken } from "@/lib/auth/jwt";
import { registerSchema } from "@/lib/validations/auth.schema";
import { sendWelcomeEmail } from "@/lib/services/email.service";
import { checkAuthRateLimit, AUTH_FAILURE_MESSAGE } from "@/lib/rate-limit";
import { ApiResponse, ConflictError } from "@/types/api.types";
import { LoginResponse } from "@/types/auth.types";
import { IUserPublic, UserRole } from "@/types/models.types";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<LoginResponse>>> {
  try {
    const body = await request.json().catch(() => ({}));
    const identifier = typeof body?.email === "string" ? body.email : undefined;

    const limit = checkAuthRateLimit(request, identifier);
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
    
    // Validate input
    const validationResult = registerSchema.safeParse(body);
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

    const { email, password, firstName, lastName } = validationResult.data;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ConflictError("User with this email already exists");
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user (explicit role to avoid relying on schema default/cache)
    const user = await User.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role: UserRole.USER,
    });

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

    // Send welcome email (non-blocking, only if marketingEmails is true)
    sendWelcomeEmail(
      {
        firstName: user.firstName,
        email: user.email,
        marketingEmails: user.marketingEmails ?? true,
      },
      `${APP_URL}/mon-compte`
    ).catch((err) => {
      console.error("Failed to send welcome email:", err);
    });

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
        message: "Registration successful",
      },
      { status: 201 }
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
    if (error instanceof ConflictError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 409 }
      );
    }

    console.error("Registration error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
