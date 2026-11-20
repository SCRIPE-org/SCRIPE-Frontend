const KNOWN_PAYMENT_METHODS = new Set([
  "Cash",
  "Card",
  "POS",
  "BankTransfer",
  "Other",
]);

const KNOWN_INVOICE_STATUSES: Record<
  string,
  {
    localeKey: string;
    variant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "info";
  }
> = {
  Issued: { localeKey: "money.landing.tables.invoiceStatus.Issued", variant: "info" },
  PartiallyPaid: {
    localeKey: "money.landing.tables.invoiceStatus.PartiallyPaid",
    variant: "warning",
  },
  Paid: { localeKey: "money.landing.tables.invoiceStatus.Paid", variant: "success" },
  Draft: { localeKey: "money.landing.tables.invoiceStatus.Draft", variant: "secondary" },
  Void: { localeKey: "money.landing.tables.invoiceStatus.Void", variant: "destructive" },
  Overdue: { localeKey: "money.landing.tables.invoiceStatus.Overdue", variant: "destructive" },
  Cancelled: {
    localeKey: "money.landing.tables.invoiceStatus.Cancelled",
    variant: "destructive",
  },
};

/**
 * Formats a numeric amount in the provided currency and locale with safe fallback.
 */
export function formatMoney(value: number, currency: string, locale: string): string {
  try {
    return new Intl.NumberFormat(locale, { style: "currency", currency }).format(value);
  } catch {
    return `${value.toFixed(2)} ${currency}`;
  }
}

/**
 * Formats an ISO UTC timestamp into a short localized date/time string.
 */
export function formatDateTime(dateStr: string, locale: string): string {
  try {
    return new Intl.DateTimeFormat(locale, {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

/**
 * Formats a trend bucket label (strips leading year prefix on ISO date buckets).
 */
export function formatTrendBucketLabel(label: string): string {
  return label.includes("-") ? label.slice(5) : label;
}

/**
 * Resolves a known payment method code to its localization key, or returns null for custom methods.
 */
export function getPaymentMethodLocaleKey(method: string): string | null {
  if (KNOWN_PAYMENT_METHODS.has(method)) {
    return `money.payments.methods.${method}`;
  }
  return null;
}

/**
 * Resolves an invoice status string to its localization key and semantic badge variant.
 */
export function getInvoiceStatusMeta(status: string): {
  localeKey: string | null;
  variant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "info";
} {
  const known = KNOWN_INVOICE_STATUSES[status];
  if (known) {
    return known;
  }
  return { localeKey: null, variant: "outline" };
}
