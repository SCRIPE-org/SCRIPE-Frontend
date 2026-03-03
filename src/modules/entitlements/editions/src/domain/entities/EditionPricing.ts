/**
 * Edition Pricing Entities — Multi-currency pricing for editions
 */

export interface EditionPriceItem {
      currency: string;
      billingCycle: string;
      amount: number;
}

export interface EditionPriceListResponse {
      editionId: string;
      prices: EditionPriceItem[];
}

export interface SetEditionPricesRequest {
      prices: EditionPriceItem[];
}

/** Supported currencies with display metadata */
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
      { code: "JOD", symbol: "د.ا", flag: "🇯🇴", name: "Jordanian Dinar" },
      { code: "TRY", symbol: "₺", flag: "🇹🇷", name: "Turkish Lira" },
      { code: "INR", symbol: "₹", flag: "🇮🇳", name: "Indian Rupee" },
      { code: "JPY", symbol: "¥", flag: "🇯🇵", name: "Japanese Yen" },
      { code: "CAD", symbol: "C$", flag: "🇨🇦", name: "Canadian Dollar" },
] as const;

export const BILLING_CYCLES = [
      { value: "Monthly", label: "Monthly" },
      { value: "Yearly", label: "Yearly" },
] as const;

/** Helper: get currency metadata by code */
export function getCurrencyInfo(code: string) {
      return SUPPORTED_CURRENCIES.find((c) => c.code === code);
}

/** Helper: format price with currency */
export function formatPrice(amount: number, currencyCode: string): string {
      try {
            return new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: currencyCode,
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
            }).format(amount);
      } catch {
            return `${currencyCode} ${amount.toFixed(2)}`;
      }
}
