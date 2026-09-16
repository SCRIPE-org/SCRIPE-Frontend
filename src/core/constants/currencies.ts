/**
 * Supported Currencies — Centralized currency configuration
 *
 * All modules that need currency data should import from here
 * instead of duplicating currency lists.
 *
 * @module core/constants
 */

export const SUPPORTED_CURRENCIES = [
  { code: "USD", symbol: "$", flag: "🇺🇸", name: "US Dollar" },
  { code: "EUR", symbol: "€", flag: "🇪🇺", name: "Euro" },
  { code: "GBP", symbol: "£", flag: "🇬🇧", name: "British Pound" },
  { code: "SAR", symbol: "﷼", flag: "🇸🇦", name: "Saudi Riyal" },
  { code: "AED", symbol: "د.إ", flag: "🇦🇪", name: "UAE Dirham" },
  { code: "EGP", symbol: "E£", flag: "🇪🇬", name: "Egyptian Pound" },
  { code: "KWD", symbol: "د.ك", flag: "🇰🇼", name: "Kuwaiti Dinar" },
  { code: "QAR", symbol: "﷼", flag: "🇶🇦", name: "Qatari Riyal" },
  { code: "BHD", symbol: ".د.ب", flag: "🇧🇭", name: "Bahraini Dinar" },
  { code: "OMR", symbol: "﷼", flag: "🇴🇲", name: "Omani Rial" },
  { code: "TRY", symbol: "₺", flag: "🇹🇷", name: "Turkish Lira" },
  { code: "INR", symbol: "₹", flag: "🇮🇳", name: "Indian Rupee" },
  { code: "JPY", symbol: "¥", flag: "🇯🇵", name: "Japanese Yen" },
  { code: "CNY", symbol: "¥", flag: "🇨🇳", name: "Chinese Yuan" },
  { code: "BRL", symbol: "R$", flag: "🇧🇷", name: "Brazilian Real" },
] as const;

export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];

/** Helper: get currency metadata by code */
export function getCurrencyInfo(code: string): SupportedCurrency | undefined {
  return SUPPORTED_CURRENCIES.find((c) => c.code === code);
}

/**
 * The currencies ISO 4217 assigns zero minor units — whole units only, no subunit to show.
 *
 * Mirrors `CurrencyPrecision.ZeroDecimalCurrencies` in the pricing engine literally rather than
 * deriving it, because the two must agree and there is no shared source to derive it from. JPY is
 * in `SUPPORTED_CURRENCIES` above, so this set is reachable from the pickers, not theoretical.
 */
const ZERO_DECIMAL_CURRENCIES = new Set([
  "BIF",
  "CLP",
  "DJF",
  "GNF",
  "JPY",
  "KMF",
  "KRW",
  "MGA",
  "PYG",
  "RWF",
  "UGX",
  "VND",
  "VUV",
  "XAF",
  "XOF",
  "XPF",
]);

/**
 * The seven active currencies ISO 4217 assigns three minor units.
 *
 * Mirrors `CurrencyPrecision.ThreeDecimalCurrencies`. Four of these — BHD, KWD, OMR and (via the
 * billing module's own list) JOD — are offered in this product's currency pickers, so formatting
 * them at two decimals drops a real subunit digit from a displayed price.
 *
 * NOT derived from `Intl` locale data or from the vendored ISO 4217 reference set. Both carry CLDR
 * *formatting* digits, which diverge from the standard's minor units deliberately: CLDR reports 0
 * for IQD where the standard says 3. Reading either here would swap a rounding error for a
 * truncation error.
 */
const THREE_DECIMAL_CURRENCIES = new Set(["BHD", "IQD", "JOD", "KWD", "LYD", "OMR", "TND"]);

/**
 * How many subunit digits a currency actually has, per ISO 4217.
 *
 * @param code - Three-letter ISO 4217 code. Matched case-insensitively; an unknown or malformed
 *   code falls through to 2, which is the same default the pricing engine applies.
 * @returns 0, 2 or 3.
 */
export function minorUnitDigits(code: string): number {
  const normalized = code?.toUpperCase() ?? "";
  if (ZERO_DECIMAL_CURRENCIES.has(normalized)) return 0;
  return THREE_DECIMAL_CURRENCIES.has(normalized) ? 3 : 2;
}

/**
 * Formats an amount as a currency string at the currency's own precision.
 *
 * Both the `Intl` path and the fallback use {@link minorUnitDigits}, so a currency whose code
 * `Intl` rejects still renders with the right number of decimals rather than with two.
 *
 * @param amount - The amount, in major units.
 * @param currencyCode - Three-letter ISO 4217 code.
 * @param locale - BCP 47 locale for grouping and symbol placement. Defaults to `en-US` to preserve
 *   the previous behaviour of every existing caller.
 * @returns A formatted string, e.g. `"KD 1,000.555"`, `"¥1,001"`, `"$1,000.50"`.
 */
export function formatPrice(amount: number, currencyCode: string, locale = "en-US"): string {
  const digits = minorUnitDigits(currencyCode);
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(amount);
  } catch {
    return `${currencyCode} ${amount.toFixed(digits)}`;
  }
}
