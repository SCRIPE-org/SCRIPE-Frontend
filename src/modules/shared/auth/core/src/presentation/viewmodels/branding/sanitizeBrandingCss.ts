/**
 * sanitizeBrandingCss — Strict CSS value, URL, and numeric token sanitizers
 * for dynamic tenant login-page branding & accessibility style injection.
 *
 * Prevents CSS injection / rule breakout (`;`, `{`, `}`, `</style`),
 * remote CSS loading (`@import`), script execution (`expression()`, `javascript:`),
 * and unconstrained numeric token injection in style sheets.
 */

const DANGEROUS_CSS_VALUE_REGEX =
  /[;{}<>]|\/\*|\*\/|@import|expression\s*\(|behavior\s*:|-moz-binding\s*:|javascript\s*:|vbscript\s*:|data\s*:\s*text\/html|data\s*:\s*image\/svg\+xml/i;
const CSS_URL_EXTRACT_REGEX = /url\(\s*(['"]?)([^'")]+)\1\s*\)/gi;
const SAFE_RASTER_DATA_IMAGE_REGEX =
  /^data:image\/(png|jpeg|jpg|webp|gif|avif);base64,[A-Za-z0-9+/=]+$/i;
const SAFE_CSS_LENGTH_REGEX = /^\d+(?:\.\d+)?(?:px|rem|em)$/;

function hasControlChars(value: string): boolean {
  for (let i = 0; i < value.length; i += 1) {
    const code = value.charCodeAt(i);
    if (code <= 31 || code === 127) return true;
  }
  return false;
}

const ALLOWED_FOCUS_STYLES = new Set(["solid", "dashed", "dotted", "double", "none"]);
const ALLOWED_TEXT_ALIGNS = new Set([
  "inherit",
  "left",
  "center",
  "right",
  "start",
  "end",
  "justify",
]);

/**
 * Validates and returns a safe background/image URL for CSS `url(...)`, or `null` if unsafe.
 * Rejects control characters, quotes, parentheses, backslashes, CSS delimiters, and unsafe schemes.
 */
export function sanitizeCssUrl(raw: string | undefined): string | null {
  if (!raw || typeof raw !== "string") return null;
  if (hasControlChars(raw)) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (/[\s"'()\\;{}<>]/.test(trimmed)) return null;

  const lower = trimmed.toLowerCase();
  if (
    lower.includes("javascript:") ||
    lower.includes("vbscript:") ||
    lower.includes("blob:") ||
    lower.includes("data:text/html") ||
    lower.includes("data:image/svg")
  ) {
    return null;
  }

  if (SAFE_RASTER_DATA_IMAGE_REGEX.test(trimmed)) {
    return trimmed;
  }

  if (lower.startsWith("/")) {
    return !lower.startsWith("//") && !lower.startsWith("/\\") ? trimmed : null;
  }

  if (lower.startsWith("https://")) {
    try {
      const parsed = new URL(trimmed);
      return parsed.protocol === "https:" && parsed.hostname.length > 0 ? trimmed : null;
    } catch {
      return null;
    }
  }

  return null;
}

/**
 * Sanitizes a CSS property value before interpolation into `:root` / `.dark` / a11y rules.
 * Fails closed (`""`) on declaration/rule breakout characters, unsafe `url(...)`, or legacy script vectors.
 */
export function sanitizeCssValue(raw: string | undefined): string {
  if (!raw || typeof raw !== "string") return "";
  if (hasControlChars(raw)) return "";
  const trimmed = raw.trim();
  if (!trimmed) return "";
  if (DANGEROUS_CSS_VALUE_REGEX.test(trimmed)) return "";

  CSS_URL_EXTRACT_REGEX.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = CSS_URL_EXTRACT_REGEX.exec(trimmed)) !== null) {
    if (!sanitizeCssUrl(match[2])) {
      return "";
    }
  }

  return trimmed;
}

export function sanitizeCssLength(raw: string | undefined, fallback: string): string {
  const cleaned = sanitizeCssValue(raw);
  return SAFE_CSS_LENGTH_REGEX.test(cleaned) ? cleaned : fallback;
}

export function sanitizeCssLineStyle(raw: string | undefined, fallback: string): string {
  const cleaned = sanitizeCssValue(raw).toLowerCase();
  return ALLOWED_FOCUS_STYLES.has(cleaned) ? cleaned : fallback;
}

export function sanitizeCssTextAlign(raw: string | undefined): string {
  const cleaned = sanitizeCssValue(raw).toLowerCase();
  return ALLOWED_TEXT_ALIGNS.has(cleaned) ? cleaned : "inherit";
}

export function parseClampedNumber(
  raw: string | undefined,
  fallback: number,
  min: number,
  max: number,
  integer = false
): number {
  if (!raw || typeof raw !== "string") return fallback;
  const num = integer ? parseInt(raw, 10) : parseFloat(raw);
  if (!Number.isFinite(num)) return fallback;
  return Math.min(max, Math.max(min, num));
}
