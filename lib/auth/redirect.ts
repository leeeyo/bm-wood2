export const REDIRECT_AFTER_LOGIN_KEY = "auth.redirectAfterLogin";

export function getRedirectAfterLogin(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const url = sessionStorage.getItem(REDIRECT_AFTER_LOGIN_KEY);
    sessionStorage.removeItem(REDIRECT_AFTER_LOGIN_KEY);
    return url;
  } catch {
    return null;
  }
}
