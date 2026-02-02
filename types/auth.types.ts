import { IUserPublic, UserRole } from "./models.types";

// ============ JWT Payload Types ============

export interface JWTAccessPayload {
  userId: string;
  email: string;
  role: UserRole;
  type: "access";
}

export interface JWTRefreshPayload {
  userId: string;
  type: "refresh";
}

// ============ Auth Request Types ============

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface RefreshTokenRequest {
  refreshToken?: string;
}

// ============ Auth Response Types ============

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  user: IUserPublic;
  tokens: AuthTokens;
}

export interface RefreshResponse {
  accessToken: string;
}

// ============ Auth Context Types ============

export interface AuthenticatedUser {
  userId: string;
  email: string;
  role: UserRole;
}
