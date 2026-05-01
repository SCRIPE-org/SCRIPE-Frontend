/**
 * TenantFeatureDefinitionsView — Feature Catalog CRUD Page
 *
 * Thin orchestrator using GenericCrudView + CrudConfig.
 * Mirrors the platform-level FeaturesView for Tier 2.
 *
 * Create navigates to /entitlements/tenant-feature-definitions/create
 * Edit navigates to /entitlements/tenant-feature-definitions/[id]/edit
 */
"use client";

import { useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTenantFeatureDefinitionsViewModel } from "../viewmodels/useTenantFeatureDefinitionsViewModel";
import { GenericCrudView } from "@core/crud/components/generic-crud-view";
import type { CrudConfig, CrudAction } from "@core/crud/components/generic-crud-view";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { useI18n } from "@core/providers/i18n-provider";
import type { TenantFeatureDefinition } from "../../domain/entities/TenantPlan";
import { Pencil, Trash2, Eye } from "lucide-react";
import { Badge } from "@core/ui/badge";

export function TenantFeatureDefinitionsView() {
  useModuleLocales(() => import("../../../locales"), "tenant-plans");
  const { t } = useI18n();
  const { vm, columns } = useTenantFeatureDefinitionsViewModel();
  const router = useRouter();

  // Navigate to the dedicated create page
  const handleCreateClick = useCallback(() => {
    router.push("/entitlements/tenant-feature-definitions/create");
  }, [router]);

  // Navigate to the dedicated edit page
  const handleEditClick = useCallback(
    (item: TenantFeatureDefinition) => {
      router.push(`/entitlements/tenant-feature-definitions/${item.id}/edit`);
    },
    [router]
  );

  const handleViewClick = useCallback(
    (item: TenantFeatureDefinition) => {
      router.push(`/entitlements/tenant-feature-definitions/${item.id}`);
    },
    [router]
  );

  const config: CrudConfig<TenantFeatureDefinition> = useMemo(
    () => ({
      titleKey: "entitlements.featureDefinitions.title",
      subtitleKey: "entitlements.featureDefinitions.description",
      resource: "tenant_feature_definitions",
      columns,
      customHeaderContent: (
        <Badge variant="outline" className="w-fit text-xs">
          {t("entitlements.featureDefinitions.tier2Badge") || "Tier 2"}
        </Badge>
      ),
      // Redirect "Add" button to the full-page create form
      onCreateClick: handleCreateClick,
      getItemDisplayName: (item: TenantFeatureDefinition) => item.displayNameEn || item.key,
      deleteService: async (id: string) => {
        await vm.deleteItem(id);
      },
      getActions: (_vmInstance, tFn, handleDelete): CrudAction<TenantFeatureDefinition>[] => [
        {
          label: tFn("common.view") || "View",
          onClick: (item: TenantFeatureDefinition) => handleViewClick(item),
          variant: "ghost" as const,
          icon: <Eye className="h-4 w-4" />,
        },
        {
          label: tFn("common.edit") || "Edit",
          onClick: (item: TenantFeatureDefinition) => handleEditClick(item),
          variant: "ghost" as const,
          icon: <Pencil className="h-4 w-4" />,
        },
        {
          label: tFn("common.delete") || "Delete",
          onClick: handleDelete as (item: TenantFeatureDefinition) => void,
          variant: "ghost" as const,
          className: "text-red-600 hover:text-red-700",
          icon: <Trash2 className="h-4 w-4" />,
          show: (item: TenantFeatureDefinition) => (item.planUsageCount ?? 0) === 0,
        },
      ],
    }),
    [columns, t, vm, handleCreateClick, handleEditClick, handleViewClick]
  );

  return <GenericCrudView viewModel={vm} config={config} />;
}
