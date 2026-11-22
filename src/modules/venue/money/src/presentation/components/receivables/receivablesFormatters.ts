import type { MoneyInvoice } from "../../../domain/entities/Money";

export interface CurrencySummaryTotals {
  total: number;
  paid: number;
  outstanding: number;
  count: number;
}

const KNOWN_STATUS_KEYS = new Set([
  "Draft",
  "Issued",
  "PartiallyPaid",
  "Paid",
  "Voided",
  "Void",
  "CreditBalance",
  "Overdue",
  "Cancelled",
]);

/**
 * Formats an authoritative monetary value using the active locale,
 * leaving unspecified currencies as raw fixed-decimal numbers.
 */
export function formatReceivableMoney(
  value: number,
  currency: string | null | undefined,
  locale: string
): string {
  const safeValue = Number.isFinite(value) ? value : 0;
  const trimmed = currency?.trim();
  if (!trimmed || trimmed.toUpperCase() === "UNSPECIFIED") {
    return safeValue.toFixed(2);
  }
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: trimmed.toUpperCase(),
    }).format(safeValue);
  } catch {
    return `${safeValue.toFixed(2)} ${trimmed}`;
  }
}

/**
 * Formats a UTC ISO timestamp for display in the active locale.
 */
export function formatReceivableDate(
  isoDate: string | null | undefined,
  locale: string,
  dateStyle: "short" | "medium" = "medium"
): string {
  if (!isoDate) return "—";
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) return "—";
  try {
    return new Intl.DateTimeFormat(locale, { dateStyle }).format(parsed);
  } catch {
    return isoDate;
  }
}

/**
 * Truncates a party identifier for compact table/card presentation.
 */
export function formatShortPartyId(payerPartyId: string | null | undefined): string {
  if (!payerPartyId) return "—";
  if (payerPartyId.length <= 12) return payerPartyId;
  return `${payerPartyId.slice(0, 8)}...`;
}

/**
 * Maps an invoice's current financial state to a semantic Nexus Badge variant.
 */
export function getInvoiceStatusBadgeVariant(
  invoice: MoneyInvoice
): "success" | "warning" | "info" | "destructive" | "secondary" | "outline" {
  const status = invoice.status;
  if (status === "Voided" || status === "Void" || status === "Cancelled" || status === "Overdue") {
    return "destructive";
  }
  if (status === "CreditBalance" || invoice.creditAmount > 0) {
    return "info";
  }
  if (status === "Paid" || (invoice.outstandingAmount === 0 && invoice.paidAmount > 0)) {
    return "success";
  }
  if (status === "PartiallyPaid" || invoice.outstandingAmount > 0) {
    return "warning";
  }
  if (status === "Draft") {
    return "secondary";
  }
  return "outline";
}

/**
 * Resolves a localized invoice status label using `money.receivables.status.*`.
 */
export function formatInvoiceStatusLabel(
  status: string,
  t: (key: string, params?: Record<string, string | number>) => string
): string {
  if (KNOWN_STATUS_KEYS.has(status)) {
    return t(`money.receivables.status.${status}`);
  }
  return status;
}

/**
 * Aggregates invoice totals isolated strictly by currency code.
 * Missing currency codes are grouped under UNSPECIFIED rather than assumed.
 */
export function aggregateReceivablesByCurrency(
  invoices: MoneyInvoice[]
): Record<string, CurrencySummaryTotals> {
  const totals: Record<string, CurrencySummaryTotals> = {};

  for (const inv of invoices) {
    const trimmed = inv.currencyCode?.trim();
    const code = trimmed ? trimmed.toUpperCase() : "UNSPECIFIED";
    if (!totals[code]) {
      totals[code] = { total: 0, paid: 0, outstanding: 0, count: 0 };
    }
    totals[code].total += inv.effectiveTotalAmount ?? inv.totalAmount ?? 0;
    totals[code].paid += inv.paidAmount ?? 0;
    totals[code].outstanding += inv.outstandingAmount ?? 0;
    totals[code].count += 1;
  }

  return totals;
}
