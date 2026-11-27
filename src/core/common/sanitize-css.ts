/**
 * URI & CSS Security Sanitizers
 *
 * Control-character-resistant URL validation (`sanitizeHttpUrl`, `sanitizeEmailHref`),
 * fixed-point CSS injection neutralization (`sanitizeCss`), and Branding Studio per-page
 * background stylesheet generation (`buildSafePerPageBgCss`).
 */

const SAFE_URL_PROTOCOLS = new Set(["http:", "https:", "mailto:", "tel:"]);
const SAFE_RASTER_DATA_IMAGE_RE =
  /^data:image\/(png|jpeg|jpg|webp|gif|avif);base64,[A-Za-z0-9+/=]+$/i;
const HEX_COLOR_RE = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;
const SIMPLE_COLOR_RE =
  /^(?:transparent|inherit|#[0-9a-fA-F]{3,8}|rgba?\(\s*\d{1,3}(?:\s*,\s*\d{1,3}){2}(?:\s*,\s*(?:0|1|0?\.\d+))?\s*\))$/;
const ALLOWED_BG_FIT = new Set(["cover", "contain", "auto", "fill"]);
const ALLOWED_BG_POS = new Set([
  "center",
  "top",
  "bottom",
  "left",
  "right",
  "top left",
  "top center",
  "top right",
  "center left",
  "center right",
  "bottom left",
  "bottom center",
  "bottom right",
]);
const ALLOWED_GRADIENT_DIRS = new Set([
  "135deg",
  "45deg",
  "90deg",
  "180deg",
  "0deg",
  "to right",
  "to left",
  "to top",
  "to bottom",
  "to bottom right",
  "to bottom left",
  "to top right",
  "to top left",
]);

/**
 * Strip ASCII control characters (`\u0000-\u001F` and `\u007F`) so obfuscated
 * schemes like `java\tscript:` cannot bypass protocol validation.
 */
export function stripAsciiControlChars(value: string): string {
  let cleaned = "";
  for (let i = 0; i < value.length; i += 1) {
    const code = value.charCodeAt(i);
    if (code > 31 && code !== 127) {
      cleaned += value[i];
    }
  }
  return cleaned;
}

/**
 * Validate a navigation/resource URL strictly as `http:` or `https:` (plus root-relative
 * `/path` when `allowRelative` is enabled, rejecting `//` and `/\`).
 */
export function sanitizeHttpUrl(
  url: string | null | undefined,
  options?: { allowRelative?: boolean }
): string | null {
  if (!url || typeof url !== "string") return null;
  const cleaned = stripAsciiControlChars(url).trim();
  if (!cleaned) return null;

  if (options?.allowRelative && cleaned.startsWith("/")) {
    if (cleaned.startsWith("//") || cleaned.startsWith("/\\")) return null;
    return /[\s"'<>]/.test(cleaned) ? null : cleaned;
  }

  try {
    const parsed = new URL(cleaned);
    if ((parsed.protocol !== "http:" && parsed.protocol !== "https:") || !parsed.hostname) {
      return null;
    }
    return parsed.toString();
  } catch {
    return null;
  }
}

/**
 * Validate an href target for emails and rich-text links (`http:`, `https:`, `mailto:`,
 * `tel:`, root-relative `/path`, or same-document `#anchor`).
 */
export function sanitizeEmailHref(url: string | null | undefined): string | null {
  if (!url || typeof url !== "string") return null;
  const cleaned = stripAsciiControlChars(url).trim();
  if (!cleaned) return null;

  if (cleaned.startsWith("#")) {
    return /[\s"'<>]/.test(cleaned) ? null : cleaned;
  }
  if (cleaned.startsWith("/")) {
    if (cleaned.startsWith("//") || cleaned.startsWith("/\\")) return null;
    return /[\s"'<>]/.test(cleaned) ? null : cleaned;
  }

  try {
    const parsed = new URL(cleaned);
    return SAFE_URL_PROTOCOLS.has(parsed.protocol) ? parsed.toString() : null;
  } catch {
    return null;
  }
}

const APPROVED_CSS_ASSET_ORIGINS = new Set([
  "https://media.scripe.org",
  "https://cdn.scripe.org",
  "https://api.scripe.org",
]);

function getApprovedCssAssetOrigins(): Set<string> {
  const origins = new Set(APPROVED_CSS_ASSET_ORIGINS);
  for (const candidate of [process.env.NEXT_PUBLIC_API_URL, process.env.NEXT_PUBLIC_MEDIA_URL]) {
    if (!candidate) continue;
    try {
      const parsed = new URL(candidate.trim());
      if (parsed.protocol === "http:" || parsed.protocol === "https:") {
        origins.add(parsed.origin);
      }
    } catch {
      // Ignore malformed env URL
    }
  }
  return origins;
}

function isDevLocalhostUrl(parsed: URL): boolean {
  if (process.env.NODE_ENV === "production") return false;
  return (
    parsed.hostname === "localhost" ||
    parsed.hostname === "127.0.0.1" ||
    parsed.hostname === "[::1]"
  );
}

/**
 * Validate CSS `url(...)` assets strictly against approved SCRIPE media/API origins,
 * same-origin root-relative `/brand/...` or `/api/files/...` paths, dev localhost,
 * or safe raster base64 data URIs.
 */
export function sanitizeCssAssetUrl(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const trimmed = stripAsciiControlChars(raw).trim();
  if (!trimmed) return null;
  if (SAFE_RASTER_DATA_IMAGE_RE.test(trimmed)) return trimmed;
  if (/[\s"'()\\;{}<>]/.test(trimmed)) return null;

  if (trimmed.startsWith("/")) {
    if (trimmed.startsWith("//") || trimmed.startsWith("/\\")) return null;
    if (/(?:^|\/)\.\.(?:\/|$)/.test(trimmed)) return null;
    if (trimmed.startsWith("/brand/") || trimmed.startsWith("/api/files/")) {
      return trimmed;
    }
    return null;
  }

  const normalized = sanitizeHttpUrl(trimmed, { allowRelative: false });
  if (!normalized) return null;

  try {
    const parsed = new URL(normalized);
    if (parsed.username || parsed.password) return null;
    if (getApprovedCssAssetOrigins().has(parsed.origin) || isDevLocalhostUrl(parsed)) {
      return normalized;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Reject CSS declaration breakout delimiters (`;`, `{`, `}`, `<`, `>`, `\`, comments)
 * and unsafe `url(...)` / `expression(...)` values.
 */
export function sanitizeCssDeclarationValue(raw: unknown): string {
  if (typeof raw !== "string") return "";
  const trimmed = stripAsciiControlChars(raw).trim();
  if (!trimmed) return "";
  if (
    /[;{}<>\\]|\/\*|\*\/|@import|@charset|expression\s*\(|behavior\s*:|-moz-binding\s*:|javascript\s*:|vbscript\s*:|data\s*:\s*text\/html|url\s*\(/i.test(
      trimmed
    )
  ) {
    return "";
  }
  return trimmed;
}

/**
 * Sanitize author-supplied CSS fragments using a fixed-point pass that strips comments
 * and control characters, decodes CSS hex and non-hex L3 escapes, removes `<` / `>`,
 * strips `@import` / legacy script triggers, and validates every `url(...)` / `image-set`.
 */
export function sanitizeCss(input: string): string {
  if (!input || typeof input !== "string") return "";

  let current = stripAsciiControlChars(input);
  let prev = "";

  for (let pass = 0; pass < 6 && current !== prev; pass += 1) {
    prev = current;
    current = stripAsciiControlChars(current)
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/\\([0-9a-fA-F]{1,6})\s?/g, (_match, hex: string) => {
        const cp = Number.parseInt(hex, 16);
        return cp > 0 && cp <= 0x10ffff ? String.fromCodePoint(cp) : "";
      })
      .replace(/\\([^\r\n\f0-9a-fA-F])/g, "$1")
      .replace(/\\/g, "");

    current = stripAsciiControlChars(current)
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/[<>]/g, "")
      .replace(/@import[^;]*;?/gi, "")
      .replace(/@charset[^;]*;?/gi, "")
      .replace(/@namespace[^;]*;?/gi, "")
      .replace(/expression\s*\(/gi, "")
      .replace(/behavior\s*:/gi, "")
      .replace(/-moz-binding\s*:/gi, "")
      .replace(/javascript\s*:/gi, "")
      .replace(/vbscript\s*:/gi, "")
      .replace(/data\s*:\s*text\/html/gi, "");
  }

  return current
    .replace(/(?:-webkit-)?image-set\s*\([^)]*\)/gi, "none")
    .replace(/url\(\s*(['"]?)([\s\S]*?)\1\s*\)/gi, (_m, _q, rawUrl: string) => {
      const safeUrl = sanitizeCssAssetUrl(rawUrl);
      return safeUrl ? `url('${safeUrl}')` : "none";
    });
}

/**
 * Build sanitized CSS override rules for Customization Studio per-page backgrounds.
 */
export function buildSafePerPageBgCss(
  activePageId: string,
  pageOverride: Record<string, unknown>
): string {
  if (activePageId === "login" || pageOverride.inheritBackground !== false) return "";

  const rules: string[] = [];
  const bgType = typeof pageOverride.bgType === "string" ? pageOverride.bgType : "solid";

  if (bgType === "solid" && typeof pageOverride.bgColor === "string") {
    const color = SIMPLE_COLOR_RE.test(pageOverride.bgColor.trim())
      ? pageOverride.bgColor.trim()
      : "";
    if (color) {
      rules.push(`--login-bg: ${color};`);
      rules.push(`background: ${color} !important;`);
    }
  } else if (bgType === "gradient") {
    const dir = ALLOWED_GRADIENT_DIRS.has(String(pageOverride.bgGradientDirection || ""))
      ? String(pageOverride.bgGradientDirection)
      : "135deg";
    const from =
      typeof pageOverride.bgGradientFrom === "string" &&
      SIMPLE_COLOR_RE.test(pageOverride.bgGradientFrom.trim())
        ? pageOverride.bgGradientFrom.trim()
        : "#3b82f6";
    const to =
      typeof pageOverride.bgGradientTo === "string" &&
      SIMPLE_COLOR_RE.test(pageOverride.bgGradientTo.trim())
        ? pageOverride.bgGradientTo.trim()
        : "#8b5cf6";
    rules.push(`--login-bg: ${from};`);
    rules.push(`background: linear-gradient(${dir}, ${from}, ${to}) !important;`);
  } else if (bgType === "image" && typeof pageOverride.bgImageUrl === "string") {
    const safeBgUrl = sanitizeCssAssetUrl(pageOverride.bgImageUrl);
    if (safeBgUrl) {
      const fitRaw = String(pageOverride.bgImageFit || "cover");
      const fit = ALLOWED_BG_FIT.has(fitRaw) ? fitRaw : "cover";
      const posRaw = String(pageOverride.bgImagePosition || "center");
      const pos = ALLOWED_BG_POS.has(posRaw) ? posRaw : "center";

      rules.push(`background-image: url('${safeBgUrl}') !important;`);
      rules.push(`background-size: ${fit === "fill" ? "100% 100%" : fit} !important;`);
      rules.push(`background-position: ${pos} !important;`);
      rules.push("background-repeat: no-repeat !important;");

      if (pageOverride.bgOverlayEnabled) {
        const rawOverlay =
          typeof pageOverride.bgOverlayColor === "string" ? pageOverride.bgOverlayColor.trim() : "";
        const hex = HEX_COLOR_RE.test(rawOverlay) ? rawOverlay.slice(1) : "000000";
        const expandedHex =
          hex.length === 3 || hex.length === 4
            ? hex
                .slice(0, 3)
                .split("")
                .map((c) => `${c}${c}`)
                .join("")
            : hex.slice(0, 6);
        const r = Number.parseInt(expandedHex.slice(0, 2), 16);
        const g = Number.parseInt(expandedHex.slice(2, 4), 16);
        const b = Number.parseInt(expandedHex.slice(4, 6), 16);
        const rawOpacity = Number(pageOverride.bgOverlayOpacity ?? 30);
        const opacity = Number.isFinite(rawOpacity) ? Math.min(100, Math.max(0, rawOpacity)) : 30;
        rules.push(`--login-overlay: rgba(${r},${g},${b},${opacity / 100});`);
      }
    }
  }

  return rules.length > 0 ? `.login-page { ${rules.join(" ")} }` : "";
}
