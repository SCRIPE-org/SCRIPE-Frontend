import type { BillingCycle } from "../../viewmodels/useEditionComparisonViewModel";

export type ComparisonTranslator = (key: string) => string;

export function formatComparisonMessage(
  template: string,
  values: Record<string, string | number>
): string {
  return Object.entries(values).reduce(
    (message, [key, value]) => message.replaceAll(`{${key}}`, String(value)),
    template
  );
}

export function getLocalizedCycleName(cycle: BillingCycle, t: ComparisonTranslator): string {
  if (cycle === "Monthly") {
    return t("entitlements.editions.comparison.monthly");
  }
  if (cycle === "Yearly") {
    return t("entitlements.editions.comparison.yearly");
  }
  return t("entitlements.editions.comparison.lifetime");
}

export function getLocalizedCyclePeriod(cycle: BillingCycle, t: ComparisonTranslator): string {
  if (cycle === "Monthly") {
    return t("entitlements.editions.comparison.monthShort");
  }
  if (cycle === "Yearly") {
    return t("entitlements.editions.comparison.yearShort");
  }
  return t("entitlements.editions.comparison.once");
}
