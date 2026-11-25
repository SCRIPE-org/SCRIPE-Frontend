/**
 * Cross-Window & Iframe `postMessage` Security Validators
 *
 * Enforces exact `event.origin` AND `event.source` verification, strict payload
 * schema validation, prototype-pollution key rejection, and safe internal route
 * validation across Customization Studio previews and Plugin SDK bridges.
 */

import { stripAsciiControlChars } from "./sanitize-css";

const MAX_STUDIO_JSON_BYTES = 1_048_576; // 1 MiB safety bound per JSON draft slot
const ALLOWED_THEMES = new Set(["light", "dark", "system"]);
const FORBIDDEN_KEYS = new Set(["__proto__", "constructor", "prototype"]);
const SAFE_PLUGIN_SCOPE_RE = /^[A-Za-z_][A-Za-z0-9_]*$/;

export interface ValidStudioDraftPayload {
  loginBrandingJson?: string;
  slotConfigJson?: string;
  activeAuthPage?: string;
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

/**
 * Verify a message came both from the current origin AND from `window.parent`.
 */
export function isTrustedSameOriginParentMessage(event: MessageEvent): boolean {
  if (typeof window === "undefined") return false;
  if (event.origin !== window.location.origin) return false;
  return Boolean(window.parent) && event.source === window.parent;
}

/**
 * Verify a message came both from the current origin AND from a specific child `iframe.contentWindow`.
 */
export function isTrustedSameOriginIframeMessage(
  event: MessageEvent,
  iframe: HTMLIFrameElement | null
): boolean {
  if (typeof window === "undefined" || !iframe?.contentWindow) return false;
  if (event.origin !== window.location.origin) return false;
  return event.source === iframe.contentWindow;
}

/**
 * Post a message to `window.parent` strictly when running inside a framed context (`window.parent !== window`).
 */
export function postToSameOriginParent(payload: unknown): void {
  if (typeof window === "undefined") return;
  if (!window.parent || window.parent === window) return;
  window.parent.postMessage(payload, window.location.origin);
}

/**
 * Validate `SCRIPE_STUDIO_SET_THEME` message schema (`light` | `dark` | `system`).
 */
export function parseStudioThemeMessage(data: unknown): "light" | "dark" | "system" | null {
  if (!isPlainRecord(data) || data.type !== "SCRIPE_STUDIO_SET_THEME") return null;
  if (typeof data.theme !== "string" || !ALLOWED_THEMES.has(data.theme)) return null;
  return data.theme as "light" | "dark" | "system";
}

/**
 * Validate `SCRIPE_STUDIO_DRAFT_UPDATE` payload structure and bounded sizes.
 */
export function parseStudioDraftUpdateMessage(data: unknown): ValidStudioDraftPayload | null {
  if (!isPlainRecord(data) || data.type !== "SCRIPE_STUDIO_DRAFT_UPDATE") return null;
  if (!isPlainRecord(data.payload)) return null;

  const raw = data.payload;
  const result: ValidStudioDraftPayload = {};

  if (raw.loginBrandingJson !== undefined) {
    if (
      typeof raw.loginBrandingJson !== "string" ||
      raw.loginBrandingJson.length > MAX_STUDIO_JSON_BYTES
    ) {
      return null;
    }
    result.loginBrandingJson = raw.loginBrandingJson;
  }

  if (raw.slotConfigJson !== undefined) {
    if (
      typeof raw.slotConfigJson !== "string" ||
      raw.slotConfigJson.length > MAX_STUDIO_JSON_BYTES
    ) {
      return null;
    }
    result.slotConfigJson = raw.slotConfigJson;
  }

  if (raw.activeAuthPage !== undefined) {
    if (
      typeof raw.activeAuthPage !== "string" ||
      raw.activeAuthPage.length === 0 ||
      raw.activeAuthPage.length > 64 ||
      !/^[A-Za-z0-9_-]+$/.test(raw.activeAuthPage)
    ) {
      return null;
    }
    result.activeAuthPage = raw.activeAuthPage;
  }

  return result;
}

/**
 * Validate `DASHBOARD_SETTINGS_UPDATE` message schema against explicit allowlisted keys.
 */
export function parseDashboardSettingsUpdateMessage(
  data: unknown,
  validKeys: ReadonlySet<string>
): Record<string, unknown> | null {
  if (!isPlainRecord(data) || data.type !== "DASHBOARD_SETTINGS_UPDATE") return null;
  if (!isPlainRecord(data.settings)) return null;

  const sanitized: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(data.settings)) {
    if (FORBIDDEN_KEYS.has(key) || !validKeys.has(key)) continue;
    if (
      typeof val === "string" ||
      typeof val === "number" ||
      typeof val === "boolean" ||
      val === null
    ) {
      sanitized[key] = val;
    }
  }

  return Object.keys(sanitized).length > 0 ? sanitized : null;
}

/**
 * Validate an internal Next.js App Router path requested via `postMessage` navigation
 * bridges, blocking external origins, protocol-relative `//evil.com`, backslashes, and schemes.
 */
export function isSafeInternalRoutePath(rawPath: unknown): string | null {
  if (typeof rawPath !== "string") return null;
  const cleaned = stripAsciiControlChars(rawPath).trim();
  if (!cleaned || !cleaned.startsWith("/")) return null;
  if (cleaned.startsWith("//") || cleaned.startsWith("/\\") || cleaned.includes("\\")) return null;

  try {
    const parsed = new URL(cleaned, "https://app.scripe.local");
    if (parsed.origin !== "https://app.scripe.local") return null;
    if (!parsed.pathname.startsWith("/") || parsed.pathname.startsWith("//")) return null;
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return null;
  }
}

/**
 * Validate external/plugin iframe or federated module base URLs: requires `https:`
 * in production (also allowing `http://localhost` / `http://127.0.0.1` in non-prod).
 */
export function validateExternalPluginOriginUrl(
  rawUrl: unknown,
  options?: { allowSameOrigin?: boolean; isDev?: boolean }
): URL | null {
  if (typeof rawUrl !== "string") return null;
  const cleaned = stripAsciiControlChars(rawUrl).trim();
  if (!cleaned) return null;

  const isDev = options?.isDev ?? process.env.NODE_ENV !== "production";
  try {
    const parsed = new URL(cleaned);
    const isHttps = parsed.protocol === "https:";
    const isDevLocalhost =
      isDev &&
      parsed.protocol === "http:" &&
      (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1");

    if ((!isHttps && !isDevLocalhost) || !parsed.hostname) return null;
    if (
      options?.allowSameOrigin === false &&
      typeof window !== "undefined" &&
      parsed.origin === window.location.origin
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

/** Validate a Module Federation `window` container global identifier. */
export function isSafeFederationIdentifier(value: string): boolean {
  return (
    SAFE_PLUGIN_SCOPE_RE.test(value) &&
    !FORBIDDEN_KEYS.has(value) &&
    value !== "window" &&
    value !== "document"
  );
}
