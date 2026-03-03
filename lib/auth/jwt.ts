import crypto from "crypto";
import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
import { JWTAccessPayload, JWTRefreshPayload } from "@/types/auth.types";
import { UserRole } from "@/types/models.types";

/**
 * Hash a refresh token for secure storage. Store the hash in DB, never the raw token.
 */
export function hashRefreshToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function getRequiredSecret(name: string): string {
  const value = process.env[name];
  if (!value || value.trim() === "") {
    throw new Error(
      `JWT initialization failed: ${name} is required. Set it in your environment.`
    );
  }
  return value;
}

const ACCESS_TOKEN_SECRET = getRequiredSecret("JWT_ACCESS_SECRET");
const REFRESH_TOKEN_SECRET = getRequiredSecret("JWT_REFRESH_SECRET");

const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_EXPIRY = "7d";

/**
 * Generate an access token
 */
export function generateAccessToken(
  userId: string,
  email: string,
  role: UserRole
): string {
  const payload: JWTAccessPayload = {
    userId,
    email,
    role,
    type: "access",
  };

  const options: SignOptions = {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  };

  return jwt.sign(payload, ACCESS_TOKEN_SECRET, options);
}

/**
 * Generate a refresh token
 */
export function generateRefreshToken(userId: string): string {
  const payload: JWTRefreshPayload = {
    userId,
    type: "refresh",
  };

  const options: SignOptions = {
    expiresIn: REFRESH_TOKEN_EXPIRY,
  };

  return jwt.sign(payload, REFRESH_TOKEN_SECRET, options);
}

/**
 * Verify and decode an access token
 */
export function verifyAccessToken(token: string): JWTAccessPayload | null {
  try {
    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET) as JwtPayload & JWTAccessPayload;
    
    if (decoded.type !== "access") {
      return null;
    }

    return {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      type: decoded.type,
    };
  } catch {
    return null;
  }
}

/**
 * Verify and decode a refresh token
 */
export function verifyRefreshToken(token: string): JWTRefreshPayload | null {
  try {
    const decoded = jwt.verify(token, REFRESH_TOKEN_SECRET) as JwtPayload & JWTRefreshPayload;
    
    if (decoded.type !== "refresh") {
      return null;
    }

    return {
      userId: decoded.userId,
      type: decoded.type,
    };
  } catch {
    return null;
  }
}

/**
 * Decode a token without verification (useful for debugging)
 */
export function decodeToken(token: string): JwtPayload | null {
  try {
    return jwt.decode(token) as JwtPayload | null;
  } catch {
    return null;
  }
}
