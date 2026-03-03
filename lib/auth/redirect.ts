import { UserRole } from "@/types/models.types";

export const REDIRECT_AFTER_LOGIN_KEY = "auth.redirectAfterLogin";

/** CMS routes - only ADMIN can access */
const CMS_PATHS = ["/dashboard", "/cms"];

function isCmsPath(path: string): boolean {
  return CMS_PATHS.some((p) => path === p || path.startsWith(`${p}/`));
}

/**
 * Get redirect URL after login/register.
 * - ADMIN: stored URL or /dashboard
 * - USER: stored URL only if not CMS path, else /mon-compte
 */
export function getRedirectAfterLogin(role: UserRole): string {
  if (typeof window === "undefined") {
    return role === UserRole.ADMIN ? "/dashboard" : "/mon-compte";
  }
  try {
    const url = sessionStorage.getItem(REDIRECT_AFTER_LOGIN_KEY);
    sessionStorage.removeItem(REDIRECT_AFTER_LOGIN_KEY);
    if (url && url !== "/login") {
      if (role === UserRole.USER && isCmsPath(url)) {
        return "/mon-compte";
      }
      return url;
    }
  } catch {
    // ignore
  }
  return role === UserRole.ADMIN ? "/dashboard" : "/mon-compte";
}
