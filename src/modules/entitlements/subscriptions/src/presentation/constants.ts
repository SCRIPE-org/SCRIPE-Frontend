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

/** Supported billing currencies */
export const BILLING_CURRENCIES = ["USD", "EUR", "GBP", "SAR", "AED", "EGP"] as const;
