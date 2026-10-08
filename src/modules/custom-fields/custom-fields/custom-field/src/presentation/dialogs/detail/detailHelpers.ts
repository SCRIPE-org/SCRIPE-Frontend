import { resolveIntlLocale } from "@core/common/utils";

/**
 * Documentation for Record<
 */
export const SENSITIVITY_BADGE_VARIANTS: Record<
  string,
  "outline" | "secondary" | "warning" | "destructive"
> = {
  None: "outline",
  Internal: "secondary",
  Confidential: "warning",
  Restricted: "destructive",
};

/**
 * Formats an ISO date-time string according to the active language locale.
 */
export function formatDetailDate(iso: string | null | undefined, language: string): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString(resolveIntlLocale(language));
}
