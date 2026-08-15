import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";
import type { HoverEffectType, HoverEffectIntensity } from "@core/providers/settings-provider";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * The BCP-47 locale string for native `Intl`/`toLocaleString` calls, derived
 * from the app's `language` setting ("en" | "ar"). Call sites used to inline
 * `language === "ar" ? "ar-EG" : "en-US"` at each use — 28 copies of the same
 * mapping, each a place a future locale change would be missed.
 *
 * Digits: plain `"ar-EG"` renders Eastern Arabic-Indic digits (٠١٢٣...) via
 * `Intl.NumberFormat`. Roughly two dozen billing/marketplace call sites
 * bypass this helper entirely and hardcode `"en-US"` specifically to avoid
 * that — the project's established convention is Western digits everywhere,
 * even in Arabic UI, so numerals stay legible next to Latin-script currency
 * codes ($, USD, EGP) and don't visually fracture a single screen into two
 * numeral systems depending on which component happened to format a given
 * value. Rather than hunt down and "fix" every one of those call sites (that
 * would flip THEM to the currently-wrong Eastern-Arabic-Indic behavior), this
 * keeps `ar-EG` as the base locale (correct for month/weekday names, list
 * formatting, etc.) but pins the numbering system to Latin via the `-u-nu-`
 * Unicode extension — so `resolveIntlLocale("ar")` now agrees with the
 * hardcoded `"en-US"` call sites on digit shape instead of contradicting them.
 */
export function resolveIntlLocale(language: string): string {
  return language === "ar" ? "ar-EG-u-nu-latn" : "en-US";
}

/**
 * Picks the display string from a stored EN/AR pair. For genuinely bilingual
 * DATA (a static page catalog, a user-entered name field) rather than
 * translatable UI copy — that case goes through `t()` and a locale shard
 * instead. Centralizing this one comparison is still worth it: it is the same
 * `language === "ar" ? ar : en` shape the section-5 gate bans when inlined ad
 * hoc, and a single call site means a future third locale only needs updating
 * here.
 */
export function resolveBilingualLabel(en: string, ar: string, language: string): string {
  return language === "ar" ? ar : en;
}

export function formatDate(date: string | Date | null | undefined, locale: string = "ar-SA") {
  try {
    // Handle null/undefined cases
    if (date === null || date === undefined || date === "") {
      return "-";
    }

    const dateObj = parseUtcDate(date);
    if (!dateObj) {
      return "-";
    }

    // Always use dd/mm/yyyy format — UTC values to match server time
    const day = dateObj.getUTCDate().toString().padStart(2, "0");
    const month = (dateObj.getUTCMonth() + 1).toString().padStart(2, "0");
    const year = dateObj.getUTCFullYear();

    return `${day}/${month}/${year}`;
  } catch (error) {
    return "-";
  }
}

export function formatDateTime(date: string | Date | null | undefined, locale: string = "ar-SA") {
  try {
    // Handle null/undefined cases
    if (date === null || date === undefined || date === "") {
      return "-";
    }

    const dateObj = parseUtcDate(date);
    if (!dateObj) {
      return "-";
    }

    // Always use dd/mm/yyyy HH:MM format — UTC values to match server time
    const day = dateObj.getUTCDate().toString().padStart(2, "0");
    const month = (dateObj.getUTCMonth() + 1).toString().padStart(2, "0");
    const year = dateObj.getUTCFullYear();
    const hours = dateObj.getUTCHours().toString().padStart(2, "0");
    const minutes = dateObj.getUTCMinutes().toString().padStart(2, "0");

    return `${day}/${month}/${year} ${hours}:${minutes}`;
  } catch (error) {
    return "-";
  }
}

export function formatCurrency(amount: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

// Convert ISO date string to HTML date input format (YYYY-MM-DD)
export function toDateInputValue(date: string | Date | null | undefined): string {
  if (!date) return "";

  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return "";

    // Format as YYYY-MM-DD for HTML date input
    const year = dateObj.getFullYear();
    const month = (dateObj.getMonth() + 1).toString().padStart(2, "0");
    const day = dateObj.getDate().toString().padStart(2, "0");

    return `${year}-${month}-${day}`;
  } catch (error) {
    return "";
  }
}

// Convert HTML date input value (YYYY-MM-DD or YYYY-MM-DDTHH:mm) to ISO string for API
export function fromDateInputValue(dateValue: string): string {
  if (!dateValue) return "";

  try {
    // If it's already a datetime-local format (includes T and time)
    if (dateValue.includes("T")) {
      // datetime-local format: YYYY-MM-DDTHH:mm
      // IMPORTANT: Treat the selected time as the EXACT time to send (no timezone conversion)
      // The user selects 11:11 PM and expects 11:11 PM to be sent, not converted to UTC
      const parts = dateValue.split("T");
      if (parts.length === 2) {
        const datePart = parts[0]; // YYYY-MM-DD
        const timePart = parts[1]; // HH:mm

        // Ensure time part has seconds (add :00 if only HH:mm)
        const timeWithSeconds =
          timePart.includes(":") && timePart.split(":").length === 2 ? `${timePart}:00` : timePart;

        // Construct ISO string directly from the datetime-local value
        // This treats the selected time as UTC to preserve the exact time chosen
        // Format: YYYY-MM-DDTHH:mm:ss.sssZ (Z indicates UTC)
        return `${datePart}T${timeWithSeconds}.000Z`;
      }
    }

    // dateValue is in YYYY-MM-DD format (date input), convert to ISO string
    // For date-only inputs, use midnight UTC
    const date = new Date(dateValue + "T00:00:00.000Z");
    if (isNaN(date.getTime())) return "";
    return date.toISOString();
  } catch (error) {
    return "";
  }
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Resolve a file URL from the server.
 *
 * - If the value is empty/null → returns empty string
 * - If the value is already an absolute URL (http/https) → returns as-is
 * - Otherwise → prefixes with NEXT_PUBLIC_File_URL (server-hosted file)
 *
 * NOT for `<img>`/`<video>` rendering: `/api/files/*` now requires a JWT
 * Bearer header (a P0 fix — see MiddlewarePipeline.cs), which native media
 * tags can never attach, so the URL this returns for a relative path 401s
 * when actually loaded by the browser. This stays synchronous on purpose —
 * it is called from non-component mappers (`OAuthAppMapper`,
 * `IdentityProviderMapper`) and from inside async upload handlers to build
 * a plain string paired with `unresolveFileUrl` for round-tripping form
 * values — and a working authenticated URL can't be produced synchronously
 * (minting one is a network call). For anything actually painted into an
 * `<img>`/`<video>` element, use the `useResolvedFileUrl()` hook
 * (`@core/hooks/use-resolved-file-url`) instead: it mints/caches a
 * DownloadsController session and resolves to the anonymous-safe
 * `/downloads/session/{id}` redemption URL.
 *
 * Use this in mappers/repositories to resolve file paths from the API.
 */
const FILE_URL_BASE = process.env.NEXT_PUBLIC_File_URL || "";

export function resolveFileUrl(value: string | null | undefined): string {
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;
  return `${FILE_URL_BASE}${value}`;
}

/**
 * Strip the server URL from a resolved file URL before sending to the backend.
 *
 * Use this in mappers (toCreateJson/toUpdateJson) to convert full URLs back to relative paths.
 */
export function unresolveFileUrl(value: string | null | undefined): string {
  if (!value) return "";
  if (FILE_URL_BASE && value.startsWith(FILE_URL_BASE)) {
    return value.replace(FILE_URL_BASE, "");
  }
  return value;
}

/**
 * Generate hover effect classes based on type and intensity
 */
export function getHoverEffectClasses(
  effectType: HoverEffectType,
  intensity: HoverEffectIntensity
): string {
  if (effectType === "none" || intensity === "none") {
    return "";
  }

  const baseTransition =
    "transition-[border-color] duration-nx-panel ease-nx-enter motion-reduce:transition-none";

  switch (effectType) {
    case "elevate":
    case "scale":
    case "glow":
    case "shimmer":
    case "rotate":
    case "slide":
      // All variants converge on the same border-brighten treatment — no raw
      // box-shadow depth, no transform lifts/scale/rotate, no shimmer sweep.
      // `intensity` no longer changes the output; it is kept as a parameter
      // only so call sites (card.tsx, generic-table.tsx) don't need updating.
      return cn(baseTransition, "hover:border-nx-line-hi");
    default:
      return "";
  }
}

/**
 * Generate hover effect classes for tables (border brighten only, no
 * transforms, no raw box-shadow — see §5.3)
 */
export function getTableHoverEffectClasses(
  effectType: HoverEffectType,
  intensity: HoverEffectIntensity
): string {
  if (effectType === "none" || intensity === "none") {
    return "";
  }

  const baseTransition =
    "transition-[border-color] duration-nx-panel ease-nx-enter motion-reduce:transition-none";

  // generic-table.tsx already applies `hover:bg-nx-hover` on rows via its own
  // row classes, so the table variant of the hover helper only needs to
  // brighten the border — no raw box-shadow depth per §5.3, and no
  // intensity-based shadow ladder to preserve. `intensity` is accepted but
  // unused so call sites don't need updating.
  return cn(baseTransition, "hover:border-nx-line-hi");
}

/**
 * Safely parses a date string, guaranteeing it is treated as UTC if no timezone is specified.
 */
export function parseUtcDate(date: string | Date | null | undefined): Date | null {
  if (date === null || date === undefined || date === "") return null;
  if (date instanceof Date) return isNaN(date.getTime()) ? null : date;

  let s = date.trim();
  // If it's a date-time string without timezone offset, append 'Z' to treat as UTC
  if (
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(s) &&
    !s.endsWith("Z") &&
    !s.includes("+") &&
    !s.includes("-", 10)
  ) {
    s += "Z";
  }

  const dateObj = new Date(s);
  return isNaN(dateObj.getTime()) ? null : dateObj;
}

/**
 * Formats a date in UTC as "YYYY-MM-DD HH:mm:ss"
 */
export function formatDateTimeUtc(date: string | Date | null | undefined): string {
  const parsed = parseUtcDate(date);
  if (!parsed) return "-";

  const year = parsed.getUTCFullYear();
  const month = String(parsed.getUTCMonth() + 1).padStart(2, "0");
  const day = String(parsed.getUTCDate()).padStart(2, "0");
  const hours = String(parsed.getUTCHours()).padStart(2, "0");
  const minutes = String(parsed.getUTCMinutes()).padStart(2, "0");
  const seconds = String(parsed.getUTCSeconds()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * Formats a date in UTC as "HH:mm"
 */
export function formatTimeUtc(date: string | Date | null | undefined): string {
  const parsed = parseUtcDate(date);
  if (!parsed) return "";

  const hours = String(parsed.getUTCHours()).padStart(2, "0");
  const minutes = String(parsed.getUTCMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

/**
 * Formats a date in UTC as "MMM d" (e.g., "Jul 9")
 */
export function formatDateUtc(date: string | Date | null | undefined): string {
  const parsed = parseUtcDate(date);
  if (!parsed) return "";

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const month = months[parsed.getUTCMonth()];
  const day = parsed.getUTCDate();
  return `${month} ${day}`;
}

/**
 * Formats a date in UTC using any date-fns format pattern.
 *
 * date-fns `format(new Date(x), pattern)` renders in the browser's local
 * timezone, which shifts server (UTC) timestamps by the client's offset.
 * This helper renders the UTC wall-clock instead, so the displayed value
 * always matches the backend/server (UTC) clock, while preserving the exact
 * date-fns pattern (e.g. "MMM d, yyyy", "PPp", "MMM d, HH:mm:ss").
 */
export function formatUtc(date: string | Date | null | undefined, pattern: string): string {
  const parsed = parseUtcDate(date);
  if (!parsed) return "";
  // Shift the epoch so date-fns' local getters read the UTC wall-clock values.
  const utcAsLocal = new Date(parsed.getTime() + parsed.getTimezoneOffset() * 60000);
  return format(utcAsLocal, pattern);
}
