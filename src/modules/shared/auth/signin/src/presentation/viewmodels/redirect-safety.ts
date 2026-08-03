/**
 * redirect-safety — Guards against open-redirect attacks in the login flow.
 *
 * The `?redirect=` query param (and similar backend-echoed paths) is
 * attacker-controlled: a phishing link like
 * `/login?redirect=https://evil.com` must never cause the app to navigate
 * a freshly-authenticated user off-origin.
 *
 * Used by use-login-viewmodel.ts (handleRedirect), use2FAHandler.ts, and
 * useWorkspaceSelector.ts — the three places in the login flow that
 * navigate to a caller-supplied path after authentication.
 */

/**
 * Returns true when `path` is safe to navigate to: either a relative
 * in-app path, or an absolute URL whose origin matches the current page's
 * origin. Rejects cross-origin absolute URLs, protocol-relative URLs
 * ("//evil.com"), and backslash tricks browsers normalize to
 * protocol-relative ("/\evil.com").
 */
export function isSafeRedirectTarget(path: string | null | undefined): boolean {
  if (!path) return false;
  const trimmed = path.trim();
  if (!trimmed) return false;

  // A single leading slash NOT followed by another slash or a backslash is
  // a safe same-app relative path. "//evil.com" and "/\evil.com" are both
  // browser-normalized to protocol-relative (i.e. off-origin) URLs.
  if (trimmed.startsWith("/") && !trimmed.startsWith("//") && !trimmed.startsWith("/\\")) {
    return true;
  }

  if (typeof window === "undefined") return false;

  try {
    const target = new URL(trimmed, window.location.origin);
    return target.origin === window.location.origin;
  } catch {
    return false;
  }
}

/**
 * Returns `path` when it's a safe same-origin/relative redirect target,
 * otherwise falls back to `fallback` (default `/dashboard`).
 */
export function getSafeRedirectPath(
  path: string | null | undefined,
  fallback = "/dashboard"
): string {
  return isSafeRedirectTarget(path) ? (path as string) : fallback;
}
