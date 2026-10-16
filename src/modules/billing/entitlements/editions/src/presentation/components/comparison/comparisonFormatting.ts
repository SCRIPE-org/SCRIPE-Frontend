import type { BillingCycle } from "../../viewmodels/useEditionComparisonViewModel";

/**
 * Documentation for string
 */
export type ComparisonTranslator = (key: string) => string;

/**
 * Documentation for formatComparisonMessage
 */
export function formatComparisonMessage(
  template: string,
  values: Record<string, string | number>
): string {
  return Object.entries(values).reduce(
    (message, [key, value]) => message.replaceAll(`{${key}}`, String(value)),
    template
  );
}

/**
 * Documentation for module export
 */
export function getLocalizedCycleName(cycle: BillingCycle, t: ComparisonTranslator): string {
  if (cycle === "Monthly") {
    return t("entitlements.editions.comparison.monthly");
  }
  if (cycle === "Yearly") {
    return t("entitlements.editions.comparison.yearly");
  }
  return t("entitlements.editions.comparison.lifetime");
}

/**
 * Documentation for module export
 */
export function getLocalizedCyclePeriod(cycle: BillingCycle, t: ComparisonTranslator): string {
  if (cycle === "Monthly") {
    return t("entitlements.editions.comparison.monthShort");
  }
  if (cycle === "Yearly") {
    return t("entitlements.editions.comparison.yearShort");
  }
  return t("entitlements.editions.comparison.once");
}
