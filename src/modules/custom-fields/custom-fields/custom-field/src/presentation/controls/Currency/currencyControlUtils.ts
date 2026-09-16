import { SUPPORTED_CURRENCIES } from "@core/constants/currencies";
import { resolveIntlLocale } from "@core/common/utils";

/**
 * Checks if an entered amount value is blank or unpopulated.
 */
export function isBlankAmount(amount: unknown): boolean {
  return amount === undefined || amount === null || amount === "";
}

/**
 * Generates localized suggestions for ISO currency codes using Intl.DisplayNames.
 */
export function getCurrencySuggestions(language: string): Array<{ code: string; label: string }> {
  let names: Intl.DisplayNames | null = null;
  try {
    names = new Intl.DisplayNames([resolveIntlLocale(language)], { type: "currency" });
  } catch {
    names = null;
  }
  return SUPPORTED_CURRENCIES.map((currency) => {
    let localized: string | undefined;
    try {
      localized = names?.of(currency.code);
    } catch {
      localized = undefined;
    }
    return { code: currency.code, label: localized ?? currency.name };
  });
}
