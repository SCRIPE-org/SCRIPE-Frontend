/**
 * CLDR-aware plural formatting utilities for Workspace Hub counters.
 * Maps `Intl.PluralRules` categories to static localization keys so `validate-locales`
 * can verify all six Arabic CLDR plural forms (`zero`, `one`, `two`, `few`, `many`, `other`).
 */

type TranslateFn = (key: string, params?: Record<string, string | number>) => string;

function resolveCldrRuleLocale(language: string): string {
  return language.toLowerCase().startsWith("ar") ? "ar" : "en";
}

function selectCldrCategory(count: number, language: string): Intl.LDMLPluralRule {
  const safeCount = Math.max(0, Math.floor(Number.isFinite(count) ? count : 0));
  return new Intl.PluralRules(resolveCldrRuleLocale(language)).select(safeCount);
}

/** Formats workspace item count (`0`–`N`) using CLDR plural rules for English and Arabic. */
export function formatHubItemCount(count: number, language: string, t: TranslateFn): string {
  const safeCount = Math.max(0, Math.floor(Number.isFinite(count) ? count : 0));
  if (safeCount === 0) {
    return t("workspaceHub.items.zero", { count: 0 });
  }
  const category = selectCldrCategory(safeCount, language);
  switch (category) {
    case "zero":
      return t("workspaceHub.items.zero", { count: safeCount });
    case "one":
      return t("workspaceHub.items.one", { count: safeCount });
    case "two":
      return t("workspaceHub.items.two", { count: safeCount });
    case "few":
      return t("workspaceHub.items.few", { count: safeCount });
    case "many":
      return t("workspaceHub.items.many", { count: safeCount });
    default:
      return t("workspaceHub.items.other", { count: safeCount });
  }
}

/** Formats pinned workspace count using CLDR plural rules for English and Arabic. */
export function formatPinnedWorkspaceCount(
  count: number,
  language: string,
  t: TranslateFn
): string {
  const safeCount = Math.max(0, Math.floor(Number.isFinite(count) ? count : 0));
  if (safeCount === 0) {
    return t("workspaceHub.pinned.apps_zero", { count: 0 });
  }
  const category = selectCldrCategory(safeCount, language);
  switch (category) {
    case "zero":
      return t("workspaceHub.pinned.apps_zero", { count: safeCount });
    case "one":
      return t("workspaceHub.pinned.apps_one", { count: safeCount });
    case "two":
      return t("workspaceHub.pinned.apps_two", { count: safeCount });
    case "few":
      return t("workspaceHub.pinned.apps_few", { count: safeCount });
    case "many":
      return t("workspaceHub.pinned.apps_many", { count: safeCount });
    default:
      return t("workspaceHub.pinned.apps_other", { count: safeCount });
  }
}
