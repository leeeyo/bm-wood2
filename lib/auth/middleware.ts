import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "./jwt";
import { AuthenticatedUser } from "@/types/auth.types";
import { UserRole } from "@/types/models.types";
import { ApiResponse, UnauthorizedError, ForbiddenError } from "@/types/api.types";

/**
 * Extract the bearer token from the Authorization header
 */
export function extractBearerToken(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization");
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  return authHeader.substring(7);
}

/**
 * Authenticate a request and return the user payload
 */
export function authenticateRequest(request: NextRequest): AuthenticatedUser {
  const token = extractBearerToken(request);

  if (!token) {
    throw new UnauthorizedError("No token provided");
  }

  const payload = verifyAccessToken(token);

  if (!payload) {
    throw new UnauthorizedError("Invalid or expired token");
  }

  return {
    userId: payload.userId,
    email: payload.email,
    role: payload.role,
  };
}

/**
 * Check if the authenticated user has one of the required roles
 */
export function requireRole(
  user: AuthenticatedUser,
  allowedRoles: UserRole[]
): void {
  if (!allowedRoles.includes(user.role)) {
    throw new ForbiddenError("Insufficient permissions");
  }
}

/**
 * Higher-order function to create a protected API route handler
 */
export function withAuth<T>(
  handler: (
    request: NextRequest,
    user: AuthenticatedUser,
    context?: T
  ) => Promise<NextResponse>
) {
  return async (request: NextRequest, context?: T): Promise<NextResponse> => {
    try {
      const user = authenticateRequest(request);
      return await handler(request, user, context);
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        return NextResponse.json<ApiResponse>(
          { success: false, error: error.message },
          { status: 401 }
        );
      }
      throw error;
    }
  };
}

/**
 * Higher-order function to create a role-protected API route handler
 */
export function withRole<T>(
  allowedRoles: UserRole[],
  handler: (
    request: NextRequest,
    user: AuthenticatedUser,
    context?: T
  ) => Promise<NextResponse>
) {
  return async (request: NextRequest, context?: T): Promise<NextResponse> => {
    try {
      const user = authenticateRequest(request);
      requireRole(user, allowedRoles);
      return await handler(request, user, context);
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        return NextResponse.json<ApiResponse>(
          { success: false, error: error.message },
          { status: 401 }
        );
      }
      if (error instanceof ForbiddenError) {
        return NextResponse.json<ApiResponse>(
          { success: false, error: error.message },
          { status: 403 }
        );
      }
      throw error;
    }
  };
}

/**
 * Create JSON error response
 */
export function errorResponse<T = never>(
  message: string,
  statusCode: number = 500
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    { success: false, error: message } as ApiResponse<T>,
    { status: statusCode }
  );
}

/**
 * Create JSON success response
 */
export function successResponse<T>(
  data: T,
  message?: string,
  statusCode: number = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    { success: true, data, message } as ApiResponse<T>,
    { status: statusCode }
  );
}
