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

const ENCODED_BACKSLASH_PATTERN = /%5c/i;

function hasControlChar(value: string): boolean {
  for (let i = 0; i < value.length; i += 1) {
    const code = value.charCodeAt(i);
    if (code <= 0x1f || code === 0x7f) return true;
  }
  return false;
}

/**
 * Returns true when `path` is safe to navigate to: either a strict same-app
 * relative path starting with a single "/", or an absolute HTTP(S) URL whose
 * origin matches the current page's origin. Rejects cross-origin URLs,
 * protocol-relative URLs ("//evil.com"), backslash / encoded-backslash tricks
 * ("/\evil.com", "/%5cevil.com", "foo\bar"), and ASCII control characters.
 */
export function isSafeRedirectTarget(path: string | null | undefined): boolean {
  if (!path) return false;
  const trimmed = path.trim();
  if (!trimmed || hasControlChar(trimmed)) return false;

  // Never allow backslashes or encoded backslashes anywhere in a redirect target.
  if (trimmed.includes("\\") || ENCODED_BACKSLASH_PATTERN.test(trimmed)) {
    return false;
  }

  // Decode once to catch %2f%2f or %5c obfuscation attempts when checking leading sequence.
  let decoded = trimmed;
  try {
    decoded = decodeURIComponent(trimmed);
  } catch {
    return false;
  }
  if (
    hasControlChar(decoded) ||
    decoded.includes("\\") ||
    decoded.startsWith("//") ||
    decoded.startsWith("/\\")
  ) {
    return false;
  }

  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
    return true;
  }

  if (typeof window === "undefined") return false;

  try {
    const target = new URL(trimmed, window.location.origin);
    if (target.protocol !== "http:" && target.protocol !== "https:") {
      return false;
    }
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
