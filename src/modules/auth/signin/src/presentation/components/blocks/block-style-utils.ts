"use client";

/**
 * Utility function executing operational rules for block color.
 */
export function blockColor(
  color: string | undefined,
  fallback = "var(--login-text, hsl(var(--foreground)))"
): string {
  if (!color || color === "auto") return fallback;
  if (color === "primary") return "var(--login-primary, hsl(var(--primary)))";
  if (color === "secondary") return "var(--login-secondary, hsl(var(--secondary)))";
  if (color === "muted") return "var(--login-text-muted, hsl(var(--muted-foreground)))";
  if (color === "success") return "var(--login-success, hsl(142 70% 45%))";
  if (color === "error") return "var(--login-error, hsl(var(--destructive)))";
  return color;
}

/**
 * Utility function executing operational rules for clamp.
 */
export function clamp(value: number | undefined, min: number, max: number, fallback: number) {
  if (typeof value !== "number" || Number.isNaN(value)) return fallback;
  return Math.min(Math.max(value, min), max);
}

/**
 * Utility function executing operational rules for safe items.
 */
export function safeItems<T>(items: T[] | undefined, limit: number): T[] {
  return Array.isArray(items) ? items.slice(0, limit) : [];
}
