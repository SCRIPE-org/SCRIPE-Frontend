// ═══════════════════════════════════════════════════════════════════════════
// currencyGeo — Single source of truth for currency → country / flag mapping.
//
// Consolidates what used to be two divergent copies of CURRENCY_TO_COUNTRY
// (one in useSignupWizardState for region inference, one in BillingCountrySelector
// for flag display). Import from here everywhere instead of re-declaring.
// ═══════════════════════════════════════════════════════════════════════════

/**
 * ISO 4217 currency code → ISO 3166-1 alpha-2 country code.
 * Used to infer a tenant `region` from the display currency. The euro maps to a
 * representative member state (DE) for region purposes; the flag is special-cased
 * to 🇪🇺 in {@link currencyFlag}.
 */
export const CURRENCY_TO_COUNTRY: Record<string, string> = {
  USD: "US",
  EUR: "DE",
  GBP: "GB",
  SAR: "SA",
  AED: "AE",
  EGP: "EG",
  KWD: "KW",
  QAR: "QA",
  BHD: "BH",
  OMR: "OM",
  JOD: "JO",
  TRY: "TR",
  PKR: "PK",
  INR: "IN",
  CNY: "CN",
  JPY: "JP",
  KRW: "KR",
  MYR: "MY",
  SGD: "SG",
  AUD: "AU",
  CAD: "CA",
  CHF: "CH",
  SEK: "SE",
  NOK: "NO",
  DKK: "DK",
  MAD: "MA",
  TND: "TN",
  DZD: "DZ",
  NGN: "NG",
  ZAR: "ZA",
  BRL: "BR",
  MXN: "MX",
  ARS: "AR",
  CLP: "CL",
  COP: "CO",
};

/** ISO 3166-1 alpha-2 country code → flag emoji (regional indicator symbols). */
export function countryToFlag(code: string): string {
  try {
    return code
      .toUpperCase()
      .replace(/./g, (char) => String.fromCodePoint(char.charCodeAt(0) + 127397));
  } catch {
    return "🌐";
  }
}

/** Flag emoji for a currency code. Falls back to 🌐; the euro renders as 🇪🇺. */
export function currencyFlag(currencyCode: string): string {
  const code = currencyCode.toUpperCase();
  if (code === "EUR") return "🇪🇺";
  const country = CURRENCY_TO_COUNTRY[code];
  return country ? countryToFlag(country) : "🌐";
}

/** ISO 3166-1 alpha-2 country code → default ISO 4217 billing currency code. */
export const COUNTRY_TO_CURRENCY: Record<string, string> = {
  EG: "EGP",
  SA: "SAR",
  AE: "AED",
  GB: "GBP",
  DE: "EUR",
  FR: "EUR",
  IT: "EUR",
  ES: "EUR",
  NL: "EUR",
  US: "USD",
};

/** Resolves a country code to its default billing currency, returning undefined if unknown/missing. */
export function resolveCurrencyFromCountry(
  countryCode: string | null | undefined
): string | undefined {
  if (!countryCode) return undefined;
  return COUNTRY_TO_CURRENCY[countryCode.toUpperCase()];
}
