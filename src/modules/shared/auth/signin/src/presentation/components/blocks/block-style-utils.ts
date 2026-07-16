"use client";

/**
 * Exported function defining parameters and fields for block color configurations.
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
 * Exported function defining parameters and fields for clamp configurations.
 */
export function clamp(value: number | undefined, min: number, max: number, fallback: number) {
  if (typeof value !== "number" || Number.isNaN(value)) return fallback;
  return Math.min(Math.max(value, min), max);
}

/**
 * Exported function defining parameters and fields for safe items configurations.
 */
export function safeItems<T>(items: T[] | undefined, limit: number): T[] {
  return Array.isArray(items) ? items.slice(0, limit) : [];
}
