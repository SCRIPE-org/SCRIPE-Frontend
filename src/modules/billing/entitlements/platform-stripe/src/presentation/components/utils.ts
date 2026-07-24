/**
 * Shared utility functions for Platform Stripe components.
 */

import { formatDateTimeUtc } from "@core/common/utils";

/** Format an amount already in major units (Connect commissions arrive this way) */
export function formatMajorCurrency(amount: number, currency: string): string {
  const code = currency.toUpperCase();
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: code,
      minimumFractionDigits: 2,
    }).format(amount);
  } catch {
    // An unknown ISO code throws rather than degrading, and a Stripe account
    // can hold balances in codes Intl does not carry.
    return `${amount.toFixed(2)} ${code}`;
  }
}

/** Format Stripe amounts (in cents) to currency display */
export function formatStripeCurrency(amountCents: number, currency: string): string {
  return formatMajorCurrency(amountCents / 100, currency);
}

/** Format date strings for display */
export function formatDate(dateStr: string): string {
  return formatDateTimeUtc(dateStr) || dateStr;
}
