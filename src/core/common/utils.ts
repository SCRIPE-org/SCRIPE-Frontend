import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";
import type { HoverEffectType, HoverEffectIntensity } from "@core/providers/settings-provider";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
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

  const baseTransition = "transition-all duration-300 ease-in-out";

  switch (effectType) {
    case "elevate":
      switch (intensity) {
        case "small":
          return cn(baseTransition, "hover:-translate-y-0.5", "hover:shadow-md");
        case "medium":
          return cn(baseTransition, "hover:-translate-y-2", "hover:shadow-xl");
        case "strong":
          return cn(baseTransition, "hover:-translate-y-4", "hover:shadow-2xl");
        default:
          return "";
      }
    case "scale":
      switch (intensity) {
        case "small":
          return cn(baseTransition, "hover:scale-[1.005]");
        case "medium":
          return cn(baseTransition, "hover:scale-[1.02]");
        case "strong":
          return cn(baseTransition, "hover:scale-[1.05]");
        default:
          return "";
      }
    case "glow":
      switch (intensity) {
        case "small":
          return cn(
            baseTransition,
            "hover:shadow-[0_0_8px_hsl(var(--primary)/0.3)]",
            "hover:border-primary/50"
          );
        case "medium":
          return cn(
            baseTransition,
            "hover:shadow-[0_0_15px_hsl(var(--primary)/0.5)]",
            "hover:border-primary/50"
          );
        case "strong":
          return cn(
            baseTransition,
            "hover:shadow-[0_0_25px_hsl(var(--primary)/0.7)]",
            "hover:border-primary/50"
          );
        default:
          return "";
      }
    case "shimmer":
      // Shimmer effect with intensity-based opacity and animation speed
      let shimmerOpacity: string;
      let shimmerSpeed: string;
      switch (intensity) {
        case "small":
          shimmerOpacity = "after:opacity-20";
          shimmerSpeed = "after:duration-1000";
          break;
        case "medium":
          shimmerOpacity = "after:opacity-40";
          shimmerSpeed = "after:duration-700";
          break;
        case "strong":
          shimmerOpacity = "after:opacity-60";
          shimmerSpeed = "after:duration-500";
          break;
        default:
          shimmerOpacity = "after:opacity-40";
          shimmerSpeed = "after:duration-700";
      }
      return cn(
        baseTransition,
        "relative overflow-hidden",
        "after:absolute after:inset-0 after:bg-gradient-to-r after:from-transparent after:via-white/20 after:to-transparent",
        "after:translate-x-[-100%] hover:after:translate-x-[100%]",
        "after:transition-transform",
        shimmerSpeed,
        shimmerOpacity
      );
    case "rotate":
      switch (intensity) {
        case "small":
          return cn(baseTransition, "hover:rotate-1");
        case "medium":
          return cn(baseTransition, "hover:rotate-[5deg]");
        case "strong":
          return cn(baseTransition, "hover:rotate-[10deg]");
        default:
          return "";
      }
    case "slide":
      switch (intensity) {
        case "small":
          return cn(baseTransition, "hover:-translate-y-0.5", "hover:translate-x-1");
        case "medium":
          return cn(baseTransition, "hover:-translate-y-2", "hover:translate-x-1");
        case "strong":
          return cn(baseTransition, "hover:-translate-y-4", "hover:translate-x-1");
        default:
          return "";
      }
    default:
      return "";
  }
}

/**
 * Generate hover effect classes for tables (shadows only, no transforms)
 */
export function getTableHoverEffectClasses(
  effectType: HoverEffectType,
  intensity: HoverEffectIntensity
): string {
  if (effectType === "none" || intensity === "none") {
    return "";
  }

  const baseTransition = "transition-all duration-300 ease-in-out";

  switch (effectType) {
    case "elevate":
      switch (intensity) {
        case "small":
          return cn(baseTransition, "hover:shadow-md");
        case "medium":
          return cn(baseTransition, "hover:shadow-xl");
        case "strong":
          return cn(baseTransition, "hover:shadow-2xl");
        default:
          return "";
      }
    case "scale":
      // For scale effect, add shadow instead of scaling
      switch (intensity) {
        case "small":
          return cn(baseTransition, "hover:shadow-md");
        case "medium":
          return cn(baseTransition, "hover:shadow-lg");
        case "strong":
          return cn(baseTransition, "hover:shadow-xl");
        default:
          return "";
      }
    case "glow":
      switch (intensity) {
        case "small":
          return cn(
            baseTransition,
            "hover:shadow-[0_0_8px_hsl(var(--primary)/0.3)]",
            "hover:border-primary/50"
          );
        case "medium":
          return cn(
            baseTransition,
            "hover:shadow-[0_0_15px_hsl(var(--primary)/0.5)]",
            "hover:border-primary/50"
          );
        case "strong":
          return cn(
            baseTransition,
            "hover:shadow-[0_0_25px_hsl(var(--primary)/0.7)]",
            "hover:border-primary/50"
          );
        default:
          return "";
      }
    case "shimmer":
      // For shimmer, just add a subtle shadow
      switch (intensity) {
        case "small":
          return cn(baseTransition, "hover:shadow-md");
        case "medium":
          return cn(baseTransition, "hover:shadow-lg");
        case "strong":
          return cn(baseTransition, "hover:shadow-xl");
        default:
          return "";
      }
    case "rotate":
      // For rotate, add shadow instead of rotating
      switch (intensity) {
        case "small":
          return cn(baseTransition, "hover:shadow-md");
        case "medium":
          return cn(baseTransition, "hover:shadow-lg");
        case "strong":
          return cn(baseTransition, "hover:shadow-xl");
        default:
          return "";
      }
    case "slide":
      // For slide, add shadow instead of sliding
      switch (intensity) {
        case "small":
          return cn(baseTransition, "hover:shadow-md");
        case "medium":
          return cn(baseTransition, "hover:shadow-lg");
        case "strong":
          return cn(baseTransition, "hover:shadow-xl");
        default:
          return "";
      }
    default:
      return "";
  }
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
