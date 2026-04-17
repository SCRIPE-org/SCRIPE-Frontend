/**
 * Features View
 *
 * Context-aware:
 * - System admin (no tenant): Global feature catalog (read-only CRUD table)
 * - Tenant admin / drill-down: Tenant's effective features (edition + overrides)
 */
"use client";

import { useFeaturesViewModel } from "../viewmodels/useFeaturesViewModel";
import { useI18n } from "@core/providers/i18n-provider";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { CatalogView } from "../components/CatalogView";
import { EffectiveFeaturesView } from "../components/EffectiveFeaturesView";

export function FeaturesView() {
  useModuleLocales(() => import("../../../locales"), "features");
  const { t, language } = useI18n();
  const vm = useFeaturesViewModel();

  if (vm.isSystemCatalogMode && vm.catalogVm) {
    return <CatalogView vm={vm.catalogVm} t={t} language={language} />;
  }

  return (
    <EffectiveFeaturesView
      features={vm.effectiveFeatures}
      isLoading={vm.isLoadingEffective}
      error={vm.effectiveError}
      t={t}
      language={language}
    />
  );
}
