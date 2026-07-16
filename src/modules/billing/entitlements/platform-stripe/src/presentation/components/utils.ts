/**
 * Shared utility functions for Platform Stripe components.
 */

import { formatDateTimeUtc } from "@core/common/utils";

/** Format Stripe amounts (in cents) to currency display */
export function formatStripeCurrency(amountCents: number, currency: string): string {
  const amount = amountCents / 100;
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
      minimumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency.toUpperCase()}`;
  }
}

/** Format date strings for display */
export function formatDate(dateStr: string): string {
  return formatDateTimeUtc(dateStr) || dateStr;
}
