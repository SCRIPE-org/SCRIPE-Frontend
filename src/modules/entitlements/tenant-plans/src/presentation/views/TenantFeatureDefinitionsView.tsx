/**
 * TenantFeatureDefinitionsView — Feature Catalog CRUD Page
 *
 * Thin orchestrator using GenericCrudView + CrudConfig.
 * Mirrors the platform-level FeaturesView for Tier 2.
 */
"use client";

import { useMemo } from "react";
import { useTenantFeatureDefinitionsViewModel } from "../viewmodels/useTenantFeatureDefinitionsViewModel";
import { GenericCrudView } from "@core/crud/components/generic-crud-view";
import type { CrudConfig, CrudAction } from "@core/crud/components/generic-crud-view";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { useI18n } from "@core/providers/i18n-provider";
import { FeatureDefinitionPageHeader } from "../components/feature-definitions/FeatureDefinitionPageHeader";
import type { TenantFeatureDefinition } from "../../domain/entities/TenantPlan";
import type {
  CreateFeatureDefinitionRequest,
  UpdateFeatureDefinitionRequest,
} from "../../domain/entities/TenantPlanRequests";
import { Pencil, Trash2 } from "lucide-react";

export function TenantFeatureDefinitionsView() {
  useModuleLocales(() => import("../../../locales"), "tenant-plans");
  const { t, language } = useI18n();
  const { vm, columns } = useTenantFeatureDefinitionsViewModel();

  const config: CrudConfig<TenantFeatureDefinition> = useMemo(
    () => ({
      titleKey: "entitlements.featureDefinitions.title",
      subtitleKey: "entitlements.featureDefinitions.description",
      resource: "tenant_feature_definitions",
      columns,
      createFields: [
        {
          name: "key",
          label: t("entitlements.featureDefinitions.key") || "Key",
          type: "text" as const,
          required: true,
          placeholder: "e.g. max_projects",
        },
        {
          name: "displayNameEn",
          label: t("entitlements.featureDefinitions.displayNameEn") || "Name (EN)",
          type: "text" as const,
          required: true,
        },
        {
          name: "displayNameAr",
          label: t("entitlements.featureDefinitions.displayNameAr") || "Name (AR)",
          type: "text" as const,
          required: true,
        },
        {
          name: "valueType",
          label: t("entitlements.featureDefinitions.valueType") || "Value Type",
          type: "select" as const,
          required: true,
          options: [
            { label: t("entitlements.featureDefinitions.typeBoolean") || "Boolean", value: "Boolean" },
            { label: t("entitlements.featureDefinitions.typeNumeric") || "Numeric", value: "Numeric" },
            { label: t("entitlements.featureDefinitions.typeString") || "String", value: "String" },
          ],
        },
        {
          name: "defaultValue",
          label: t("entitlements.featureDefinitions.defaultValue") || "Default Value",
          type: "text" as const,
          placeholder: "e.g. true, 10, basic",
        },
        {
          name: "category",
          label: t("entitlements.featureDefinitions.category") || "Category",
          type: "text" as const,
          placeholder: "e.g. Limits, Access",
        },
        {
          name: "description",
          label: t("common.description") || "Description",
          type: "textarea" as const,
        },
        {
          name: "sortOrder",
          label: t("entitlements.featureDefinitions.sortOrder") || "Sort Order",
          type: "number" as const,
          defaultValue: 0,
        },
        {
          name: "isActive",
          label: t("common.active") || "Active",
          type: "switch" as const,
          defaultValue: true,
        },
      ],
      editInitialValues: (item: TenantFeatureDefinition) => ({
        key: item.key,
        displayNameEn: item.displayNameEn,
        displayNameAr: item.displayNameAr,
        valueType: item.valueType,
        defaultValue: item.defaultValue,
        category: item.category,
        description: item.description ?? "",
        sortOrder: item.sortOrder,
        isActive: item.isActive,
      }),
      getItemDisplayName: (item: TenantFeatureDefinition) => item.displayNameEn || item.key,
      deleteService: async (id: string) => {
        await vm.deleteItem(id);
      },
      getActions: (_vmInstance, tFn, handleDelete): CrudAction<TenantFeatureDefinition>[] => [
        {
          label: tFn("common.edit") || "Edit",
          onClick: (item: TenantFeatureDefinition) => vm.openEditModal(item),
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
    [columns, t, vm]
  );

  return (
    <div className="space-y-6">
      <FeatureDefinitionPageHeader t={t} />
      <GenericCrudView viewModel={vm} config={config} />
    </div>
  );
}
