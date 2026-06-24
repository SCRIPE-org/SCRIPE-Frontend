/**
 * RecommendationRulesView — Admin catalog for onboarding engine recommendation rules.
 *
 * Loads module locales, delegates CRUD config to RecommendationRulesCatalogView.
 */
"use client";

import { useRecommendationRulesViewModel } from "../viewmodels/useRecommendationRulesViewModel";
import { useI18n } from "@core/providers/i18n-provider";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { RecommendationRulesCatalogView } from "../components/RecommendationRulesCatalogView";

/**
 * Presentation UI component rendering the recommendation rules view.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function RecommendationRulesView() {
  useModuleLocales(() => import("../../../locales"), "recommendation-rules");
  const { t, language } = useI18n();
  const vm = useRecommendationRulesViewModel();

  return <RecommendationRulesCatalogView vm={vm} t={t} language={language} />;
}
