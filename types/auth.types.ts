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
  refreshToken?: string; // Deprecated: refresh token is httpOnly cookie only, never in JSON
}

export interface LoginResponse {
  user: IUserPublic;
  tokens: { accessToken: string };
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

export interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthContextType {
  user: IUserPublic | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitializing: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<boolean>;
  resetPassword: (token: string, password: string) => Promise<boolean>;
  refreshUserData: () => Promise<void>;
}
