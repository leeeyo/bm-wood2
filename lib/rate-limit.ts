/**
 * Per-IP rate limiting for public API routes.
 * In-memory storage; configurable per environment.
 * Add observability for blocked requests.
 */

import { NextRequest } from "next/server";

const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 10;
const RATE_LIMIT_UPLOAD_MAX = Number(process.env.RATE_LIMIT_UPLOAD_MAX) || 5;

type Entry = { count: number; resetAt: number };

const store = new Map<string, Entry>();

function prune() {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (entry.resetAt < now) store.delete(key);
  }
}

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  if (forwarded) return forwarded.split(",")[0]?.trim() ?? "unknown";
  if (realIp) return realIp;
  return "unknown";
}

/**
 * Lightweight bot mitigation: reject requests with missing or obviously automated User-Agent.
 */
export function isLikelyBot(request: NextRequest): boolean {
  const ua = request.headers.get("user-agent") ?? "";
  if (!ua || ua.length < 10) return true;
  const botPatterns = [/bot/i, /crawler/i, /spider/i, /scraper/i];
  return botPatterns.some((p) => p.test(ua));
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfter?: number;
}

export function checkRateLimit(
  request: NextRequest,
  maxRequests: number = RATE_LIMIT_MAX_REQUESTS
): RateLimitResult {
  if (store.size > 10000) prune();

  const ip = getClientIp(request);
  const now = Date.now();
  let entry = store.get(ip);

  if (!entry || entry.resetAt < now) {
    entry = { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS };
    store.set(ip, entry);
    return { allowed: true, remaining: maxRequests - 1 };
  }

  entry.count++;
  if (entry.count > maxRequests) {
    if (process.env.NODE_ENV !== "test") {
      console.warn("[rate-limit] Blocked request", { ip, count: entry.count, maxRequests });
    }
    return {
      allowed: false,
      remaining: 0,
      retryAfter: Math.ceil((entry.resetAt - now) / 1000),
    };
  }

  return { allowed: true, remaining: maxRequests - entry.count };
}

export function getContactLimit() {
  return RATE_LIMIT_MAX_REQUESTS;
}

export function getDevisLimit() {
  return RATE_LIMIT_MAX_REQUESTS;
}

export function getUploadLimit() {
  return RATE_LIMIT_UPLOAD_MAX;
}
