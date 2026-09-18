/**
 * Countries and Geographic Constants
 *
 * Source of truth for supported countries, ISO 3166-1 alpha-2 codes,
 * flag emojis, international dial codes, default IANA timezones, and currencies.
 *
 * Used across tenant onboarding, facility scheduling, profile addresses, and billing.
 *
 * @module core/constants/countries
 */

export interface Country {
  code: string; // ISO 3166-1 alpha-2 (uppercase)
  name: string;
  flag: string;
  dialCode: string;
  defaultTimeZone: string;
  defaultCurrency: string;
}

export const COUNTRIES: readonly Country[] = [
  // Middle East & North Africa (Core SCRIPE Sports Markets)
  { code: "SA", name: "Saudi Arabia", flag: "🇸🇦", dialCode: "+966", defaultTimeZone: "Asia/Riyadh", defaultCurrency: "SAR" },
  { code: "AE", name: "United Arab Emirates", flag: "🇦🇪", dialCode: "+971", defaultTimeZone: "Asia/Dubai", defaultCurrency: "AED" },
  { code: "EG", name: "Egypt", flag: "🇪🇬", dialCode: "+20", defaultTimeZone: "Africa/Cairo", defaultCurrency: "EGP" },
  { code: "QA", name: "Qatar", flag: "🇶🇦", dialCode: "+974", defaultTimeZone: "Asia/Qatar", defaultCurrency: "QAR" },
  { code: "KW", name: "Kuwait", flag: "🇰🇼", dialCode: "+965", defaultTimeZone: "Asia/Kuwait", defaultCurrency: "KWD" },
  { code: "BH", name: "Bahrain", flag: "🇧🇭", dialCode: "+973", defaultTimeZone: "Asia/Bahrain", defaultCurrency: "BHD" },
  { code: "OM", name: "Oman", flag: "🇴🇲", dialCode: "+968", defaultTimeZone: "Asia/Muscat", defaultCurrency: "OMR" },
  { code: "JO", name: "Jordan", flag: "🇯🇴", dialCode: "+962", defaultTimeZone: "Asia/Amman", defaultCurrency: "JOD" },
  { code: "MA", name: "Morocco", flag: "🇲🇦", dialCode: "+212", defaultTimeZone: "Africa/Casablanca", defaultCurrency: "MAD" },
  { code: "TN", name: "Tunisia", flag: "🇹🇳", dialCode: "+216", defaultTimeZone: "Africa/Tunis", defaultCurrency: "TND" },
  { code: "DZ", name: "Algeria", flag: "🇩🇿", dialCode: "+213", defaultTimeZone: "Africa/Algiers", defaultCurrency: "DZD" },

  // Europe
  { code: "GB", name: "United Kingdom", flag: "🇬🇧", dialCode: "+44", defaultTimeZone: "Europe/London", defaultCurrency: "GBP" },
  { code: "ES", name: "Spain", flag: "🇪🇸", dialCode: "+34", defaultTimeZone: "Europe/Madrid", defaultCurrency: "EUR" },
  { code: "FR", name: "France", flag: "🇫🇷", dialCode: "+33", defaultTimeZone: "Europe/Paris", defaultCurrency: "EUR" },
  { code: "DE", name: "Germany", flag: "🇩🇪", dialCode: "+49", defaultTimeZone: "Europe/Berlin", defaultCurrency: "EUR" },
  { code: "IT", name: "Italy", flag: "🇮🇹", dialCode: "+39", defaultTimeZone: "Europe/Rome", defaultCurrency: "EUR" },
  { code: "PT", name: "Portugal", flag: "🇵🇹", dialCode: "+351", defaultTimeZone: "Europe/Lisbon", defaultCurrency: "EUR" },
  { code: "NL", name: "Netherlands", flag: "🇳🇱", dialCode: "+31", defaultTimeZone: "Europe/Amsterdam", defaultCurrency: "EUR" },
  { code: "BE", name: "Belgium", flag: "🇧🇪", dialCode: "+32", defaultTimeZone: "Europe/Brussels", defaultCurrency: "EUR" },
  { code: "CH", name: "Switzerland", flag: "🇨🇭", dialCode: "+41", defaultTimeZone: "Europe/Zurich", defaultCurrency: "CHF" },
  { code: "AT", name: "Austria", flag: "🇦🇹", dialCode: "+43", defaultTimeZone: "Europe/Vienna", defaultCurrency: "EUR" },
  { code: "SE", name: "Sweden", flag: "🇸🇪", dialCode: "+46", defaultTimeZone: "Europe/Stockholm", defaultCurrency: "SEK" },
  { code: "NO", name: "Norway", flag: "🇳🇴", dialCode: "+47", defaultTimeZone: "Europe/Oslo", defaultCurrency: "NOK" },
  { code: "DK", name: "Denmark", flag: "🇩🇰", dialCode: "+45", defaultTimeZone: "Europe/Copenhagen", defaultCurrency: "DKK" },
  { code: "IE", name: "Ireland", flag: "🇮🇪", dialCode: "+353", defaultTimeZone: "Europe/Dublin", defaultCurrency: "EUR" },
  { code: "TR", name: "Turkey", flag: "🇹🇷", dialCode: "+90", defaultTimeZone: "Europe/Istanbul", defaultCurrency: "TRY" },
  { code: "GR", name: "Greece", flag: "🇬🇷", dialCode: "+30", defaultTimeZone: "Europe/Athens", defaultCurrency: "EUR" },

  // Americas
  { code: "US", name: "United States", flag: "🇺🇸", dialCode: "+1", defaultTimeZone: "America/New_York", defaultCurrency: "USD" },
  { code: "CA", name: "Canada", flag: "🇨🇦", dialCode: "+1", defaultTimeZone: "America/Toronto", defaultCurrency: "CAD" },
  { code: "MX", name: "Mexico", flag: "🇲🇽", dialCode: "+52", defaultTimeZone: "America/Mexico_City", defaultCurrency: "MXN" },
  { code: "BR", name: "Brazil", flag: "🇧🇷", dialCode: "+55", defaultTimeZone: "America/Sao_Paulo", defaultCurrency: "BRL" },
  { code: "AR", name: "Argentina", flag: "🇦🇷", dialCode: "+54", defaultTimeZone: "America/Argentina/Buenos_Aires", defaultCurrency: "ARS" },
  { code: "CL", name: "Chile", flag: "🇨🇱", dialCode: "+56", defaultTimeZone: "America/Santiago", defaultCurrency: "CLP" },
  { code: "CO", name: "Colombia", flag: "🇨🇴", dialCode: "+57", defaultTimeZone: "America/Bogota", defaultCurrency: "COP" },

  // Asia Pacific
  { code: "AU", name: "Australia", flag: "🇦🇺", dialCode: "+61", defaultTimeZone: "Australia/Sydney", defaultCurrency: "AUD" },
  { code: "NZ", name: "New Zealand", flag: "🇳🇿", dialCode: "+64", defaultTimeZone: "Pacific/Auckland", defaultCurrency: "NZD" },
  { code: "JP", name: "Japan", flag: "🇯🇵", dialCode: "+81", defaultTimeZone: "Asia/Tokyo", defaultCurrency: "JPY" },
  { code: "KR", name: "South Korea", flag: "🇰🇷", dialCode: "+82", defaultTimeZone: "Asia/Seoul", defaultCurrency: "KRW" },
  { code: "SG", name: "Singapore", flag: "🇸🇬", dialCode: "+65", defaultTimeZone: "Asia/Singapore", defaultCurrency: "SGD" },
  { code: "MY", name: "Malaysia", flag: "🇲🇾", dialCode: "+60", defaultTimeZone: "Asia/Kuala_Lumpur", defaultCurrency: "MYR" },
  { code: "IN", name: "India", flag: "🇮🇳", dialCode: "+91", defaultTimeZone: "Asia/Kolkata", defaultCurrency: "INR" },
  { code: "PK", name: "Pakistan", flag: "🇵🇰", dialCode: "+92", defaultTimeZone: "Asia/Karachi", defaultCurrency: "PKR" },
  { code: "CN", name: "China", flag: "🇨🇳", dialCode: "+86", defaultTimeZone: "Asia/Shanghai", defaultCurrency: "CNY" },

  // Africa
  { code: "ZA", name: "South Africa", flag: "🇿🇦", dialCode: "+27", defaultTimeZone: "Africa/Johannesburg", defaultCurrency: "ZAR" },
  { code: "NG", name: "Nigeria", flag: "🇳🇬", dialCode: "+234", defaultTimeZone: "Africa/Lagos", defaultCurrency: "NGN" },
  { code: "KE", name: "Kenya", flag: "🇰🇪", dialCode: "+254", defaultTimeZone: "Africa/Nairobi", defaultCurrency: "USD" },
  { code: "GH", name: "Ghana", flag: "🇬🇭", dialCode: "+233", defaultTimeZone: "Africa/Accra", defaultCurrency: "USD" },
] as const;

export const COUNTRY_MAP: ReadonlyMap<string, Country> = new Map(
  COUNTRIES.map((c) => [c.code.toUpperCase(), c])
);

/** Gets a country definition by ISO 3166-1 alpha-2 code */
export function getCountryByCode(code: string | null | undefined): Country | undefined {
  if (!code) return undefined;
  return COUNTRY_MAP.get(code.toUpperCase());
}

/** ISO 3166-1 alpha-2 country code → flag emoji */
export function countryToFlag(code: string): string {
  try {
    return code
      .toUpperCase()
      .replace(/./g, (char) => String.fromCodePoint(char.charCodeAt(0) + 127397));
  } catch {
    return "🌐";
  }
}

/** Resolves default IANA timezone for a country code */
export function getDefaultTimeZoneForCountry(code: string | null | undefined): string {
  if (!code) return "UTC";
  const country = getCountryByCode(code);
  return country?.defaultTimeZone || "UTC";
}

/** Resolves default billing currency for a country code */
export function getDefaultCurrencyForCountry(code: string | null | undefined): string {
  if (!code) return "USD";
  const country = getCountryByCode(code);
  return country?.defaultCurrency || "USD";
}
