import { SUPPORTED_CURRENCIES } from "@core/constants/currencies";

/** Baseline USD exchange rates matching SCRIPE-Backend CurrencyExchangeService fallback table. */
export const CRM_FALLBACK_USD_RATES: Record<string, number> = {
  USD: 1.0,
  EUR: 0.92,
  GBP: 0.79,
  SAR: 3.75,
  AED: 3.6725,
  EGP: 50.85,
  KWD: 0.308,
  BHD: 0.376,
  OMR: 0.385,
  QAR: 3.64,
  TRY: 32.5,
  INR: 83.5,
  CAD: 1.37,
  AUD: 1.54,
};

/** Supported currencies exposed across CRM selectors and settings with both name and nameEn. */
export const CRM_CURRENCY_OPTIONS = SUPPORTED_CURRENCIES.map((c) => ({
  ...c,
  nameEn: c.name,
}));

/**
 * Pure deterministic currency conversion utility using USD cross-rates.
 * @param amount - Monetary amount in source currency.
 * @param fromCurrency - Source ISO currency code.
 * @param toCurrency - Target ISO currency code.
 * @param ratesTable - Exchange rate lookup table keyed by currency code against USD.
 * @returns Converted monetary amount rounded to 2 decimal places.
 */
export function convertCrmCurrencyAmount(
  amount: number,
  fromCurrency?: string | null,
  toCurrency?: string | null,
  ratesTable: Record<string, number> = CRM_FALLBACK_USD_RATES
): number {
  if (!Number.isFinite(amount) || amount === 0) return 0;
  const from = (fromCurrency || "SAR").toUpperCase();
  const to = (toCurrency || "SAR").toUpperCase();
  if (from === to) return amount;
  const fromRate = ratesTable[from] ?? CRM_FALLBACK_USD_RATES[from] ?? 1;
  const toRate = ratesTable[to] ?? CRM_FALLBACK_USD_RATES[to] ?? 1;
  return fromRate > 0 && toRate > 0
    ? Math.round((amount / fromRate) * toRate * 100) / 100
    : amount;
}

/**
 * Computes the cross-exchange rate between two currencies.
 * @param fromCurrency - Source ISO currency code.
 * @param toCurrency - Target ISO currency code.
 * @param ratesTable - Exchange rate lookup table keyed by currency code against USD.
 * @returns Number of units of `toCurrency` per 1 unit of `fromCurrency`.
 */
export function getCrossExchangeRate(
  fromCurrency: string,
  toCurrency: string,
  ratesTable: Record<string, number> = CRM_FALLBACK_USD_RATES
): number {
  const from = (fromCurrency || "SAR").toUpperCase();
  const to = (toCurrency || "SAR").toUpperCase();
  if (from === to) return 1;
  const fromRate = ratesTable[from] ?? CRM_FALLBACK_USD_RATES[from] ?? 1;
  const toRate = ratesTable[to] ?? CRM_FALLBACK_USD_RATES[to] ?? 1;
  return fromRate > 0 ? toRate / fromRate : 1;
}
