import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import connectDB from "@/lib/db/connection";
import { User } from "@/lib/db/models";
import { forgotPasswordSchema } from "@/lib/validations/auth.schema";
import { sendPasswordResetEmail } from "@/lib/services/email.service";
import { ApiResponse } from "@/types/api.types";

const RESET_TOKEN_EXPIRY_HOURS = 1;

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<Record<string, never>>>> {
  try {
    await connectDB();

    const body = await request.json();

    const validationResult = forgotPasswordSchema.safeParse(body);
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

    const { email } = validationResult.data;

    const user = await User.findOne({ email }).select("+resetPasswordToken +resetPasswordExpires");
    if (!user) {
      // Don't reveal whether the email exists - always return success
      return NextResponse.json(
        {
          success: true,
          message: "If an account exists with this email, you will receive a password reset link.",
        },
        { status: 200 }
      );
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = hashToken(resetToken);
    const resetPasswordExpires = new Date(Date.now() + RESET_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

    await User.findByIdAndUpdate(user._id, {
      resetPasswordToken: hashedToken,
      resetPasswordExpires,
    });

    const emailResult = await sendPasswordResetEmail(
      user.email,
      resetToken,
      user.firstName
    );

    if (!emailResult.success) {
      // Clear token if email failed so user can try again
      await User.findByIdAndUpdate(user._id, {
        $unset: { resetPasswordToken: "", resetPasswordExpires: "" },
      });
      return NextResponse.json(
        {
          success: false,
          error: "Failed to send reset email",
          message: emailResult.error ?? "Please try again later.",
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "If an account exists with this email, you will receive a password reset link.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
