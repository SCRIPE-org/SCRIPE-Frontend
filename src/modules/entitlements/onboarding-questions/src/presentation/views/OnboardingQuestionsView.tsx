/**
 * OnboardingQuestionsView — Admin catalog for onboarding engine questions.
 *
 * Loads module locales, delegates CRUD config to OnboardingQuestionsCatalogView.
 */
"use client";

import { useOnboardingQuestionsViewModel } from "../viewmodels/useOnboardingQuestionsViewModel";
import { useI18n } from "@core/providers/i18n-provider";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { OnboardingQuestionsCatalogView } from "../components/OnboardingQuestionsCatalogView";

/**
 * React presentation component representing the onboarding questions view UI element.
 */
export function OnboardingQuestionsView() {
  useModuleLocales(() => import("../../../locales"), "onboarding-questions");
  const { t, language } = useI18n();
  const vm = useOnboardingQuestionsViewModel();

  return <OnboardingQuestionsCatalogView vm={vm} t={t} language={language} />;
}
