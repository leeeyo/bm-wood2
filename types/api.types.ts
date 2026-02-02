import { NextRequest } from "next/server";
import { AuthenticatedUser } from "./auth.types";

// ============ API Response Types ============

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// ============ API Error Types ============

export class ApiError extends Error {
  statusCode: number;
  
  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = "ApiError";
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message: string = "Unauthorized") {
    super(message, 401);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends ApiError {
  constructor(message: string = "Forbidden") {
    super(message, 403);
    this.name = "ForbiddenError";
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string = "Resource not found") {
    super(message, 404);
    this.name = "NotFoundError";
  }
}

export class ValidationError extends ApiError {
  errors: Record<string, string[]>;
  
  constructor(message: string = "Validation failed", errors: Record<string, string[]> = {}) {
    super(message, 400);
    this.name = "ValidationError";
    this.errors = errors;
  }
}

export class ConflictError extends ApiError {
  constructor(message: string = "Resource already exists") {
    super(message, 409);
    this.name = "ConflictError";
  }
}

// ============ Request Types ============

export interface AuthenticatedRequest extends NextRequest {
  user: AuthenticatedUser;
}

// ============ Query Parameters ============

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface SortParams {
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface ProductQueryParams extends PaginationParams, SortParams {
  categoryId?: string;
  isFeatured?: boolean;
  isActive?: boolean;
  search?: string;
}

export interface DevisQueryParams extends PaginationParams, SortParams {
  status?: string;
  assignedTo?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface UserQueryParams extends PaginationParams, SortParams {
  role?: string;
  isActive?: boolean;
}

// ============ Route Context Types ============

export interface RouteContext {
  params: Promise<{ id: string }>;
}
