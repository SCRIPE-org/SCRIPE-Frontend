/**
 * Subscription Constants
 *
 * Badge variant maps and locale key maps shared across subscription components.
 */

/** Status → Badge variant mapping */
export const STATUS_VARIANTS: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  Active: "default",
  Trialing: "secondary",
  Canceled: "destructive",
  Expired: "outline",
  Suspended: "destructive",
  PendingPayment: "secondary",
  PastDue: "destructive",
};

/** Subscription type → Badge variant mapping */
export const TYPE_VARIANTS: Record<string, "default" | "secondary" | "outline"> = {
  Lifetime: "default",
  Monthly: "secondary",
  Yearly: "secondary",
  Trial: "outline",
};

/** Maps PascalCase API values → camelCase locale keys */
export const STATUS_KEY_MAP: Record<string, string> = {
  Active: "active",
  Trialing: "trialing",
  Canceled: "canceled",
  Expired: "expired",
  Suspended: "suspended",
  PendingPayment: "pendingPayment",
  PastDue: "pastDue",
};

/** Maps PascalCase subscription type → camelCase locale keys */
export const TYPE_KEY_MAP: Record<string, string> = {
  Lifetime: "lifetime",
  Monthly: "monthly",
  Yearly: "yearly",
  Trial: "trial",
  Base: "base",
  AddOn: "addOn",
};

/** Supported billing currencies — E-01: comprehensive Stripe-supported set */
export const BILLING_CURRENCIES = [
  { code: "USD", label: "USD — US Dollar", symbol: "$" },
  { code: "EUR", label: "EUR — Euro", symbol: "€" },
  { code: "GBP", label: "GBP — British Pound", symbol: "£" },
  { code: "SAR", label: "SAR — Saudi Riyal", symbol: "﷼" },
  { code: "AED", label: "AED — UAE Dirham", symbol: "د.إ" },
  { code: "EGP", label: "EGP — Egyptian Pound", symbol: "E£" },
  { code: "CAD", label: "CAD — Canadian Dollar", symbol: "C$" },
  { code: "AUD", label: "AUD — Australian Dollar", symbol: "A$" },
  { code: "JPY", label: "JPY — Japanese Yen", symbol: "¥" },
  { code: "CHF", label: "CHF — Swiss Franc", symbol: "CHF" },
  { code: "INR", label: "INR — Indian Rupee", symbol: "₹" },
  { code: "BRL", label: "BRL — Brazilian Real", symbol: "R$" },
  { code: "TRY", label: "TRY — Turkish Lira", symbol: "₺" },
  { code: "KWD", label: "KWD — Kuwaiti Dinar", symbol: "د.ك" },
  { code: "QAR", label: "QAR — Qatari Riyal", symbol: "ر.ق" },
  { code: "BHD", label: "BHD — Bahraini Dinar", symbol: "BD" },
  { code: "OMR", label: "OMR — Omani Rial", symbol: "ر.ع" },
  { code: "JOD", label: "JOD — Jordanian Dinar", symbol: "JD" },
  { code: "SGD", label: "SGD — Singapore Dollar", symbol: "S$" },
  { code: "MYR", label: "MYR — Malaysian Ringgit", symbol: "RM" },
  { code: "ZAR", label: "ZAR — South African Rand", symbol: "R" },
  { code: "SEK", label: "SEK — Swedish Krona", symbol: "kr" },
  { code: "NOK", label: "NOK — Norwegian Krone", symbol: "kr" },
  { code: "DKK", label: "DKK — Danish Krone", symbol: "kr" },
  { code: "PLN", label: "PLN — Polish Zloty", symbol: "zł" },
  { code: "MXN", label: "MXN — Mexican Peso", symbol: "Mex$" },
  { code: "HKD", label: "HKD — Hong Kong Dollar", symbol: "HK$" },
  { code: "NZD", label: "NZD — New Zealand Dollar", symbol: "NZ$" },
] as const;

/** Shorthand codes for backward compatibility */
export const BILLING_CURRENCY_CODES = BILLING_CURRENCIES.map((c) => c.code);

