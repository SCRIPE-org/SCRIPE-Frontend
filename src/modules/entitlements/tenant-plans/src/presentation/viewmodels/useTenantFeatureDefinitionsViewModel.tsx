/**
 * TenantFeatureDefinitions ViewModel — Feature Catalog CRUD
 *
 * Uses GenericCrudView pattern via useCrudViewModel for the
 * TenantFeatureDefinition catalog. Mirrors the platform-level
 * Features CRUD viewmodel.
 */
"use client";

import { useMemo } from "react";
import { useCrudViewModel } from "@core/crud/hooks/useCrudViewModel";
import { entitlementsContainer } from "@modules/entitlements/di";
import type { TenantFeatureDefinition } from "../../domain/entities/TenantPlan";
import type {
  CreateFeatureDefinitionRequest,
  UpdateFeatureDefinitionRequest,
} from "../../domain/entities/TenantPlanRequests";
import { useI18n } from "@core/providers/i18n-provider";
import type { CrudColumn } from "@core/crud/components/generic-crud-view";
import { Badge } from "@core/ui/badge";

export function useTenantFeatureDefinitionsViewModel() {
  const { tenantPlanRepository } = entitlementsContainer;
  const { t, language } = useI18n();

  // ── CRUD ViewModel ──
  const vm = useCrudViewModel<
    TenantFeatureDefinition,
    CreateFeatureDefinitionRequest,
    UpdateFeatureDefinitionRequest
  >(["entitlements", "tenant-feature-definitions"], {
    getAll: async (params) => {
      const result = await tenantPlanRepository.getFeatureDefinitions({
        page: params.page ?? 1,
        pageSize: params.pageSize ?? 20,
        search: params.search,
      });
      return {
        items: result.items,
        pagination: {
          itemsCount: result.totalCount,
          pageSize: params.pageSize ?? 20,
          page: params.page ?? 1,
          pagesCount: result.totalPages,
        },
      };
    },
    create: async (data) => {
      const id = await tenantPlanRepository.createFeatureDefinition(data);
      return { id } as unknown as TenantFeatureDefinition;
    },
    update: async (id, data) => {
      await tenantPlanRepository.updateFeatureDefinition(id, data);
      return {} as TenantFeatureDefinition;
    },
    delete: async (id) => {
      await tenantPlanRepository.deleteFeatureDefinition(id);
    },
  });

  // ── Column definitions ──
  const columns: CrudColumn<TenantFeatureDefinition>[] = useMemo(() => {
    const valueTypeVariant: Record<string, "default" | "secondary" | "outline"> = {
      Boolean: "default",
      Numeric: "secondary",
      String: "outline",
    };

    return [
      {
        key: "sortOrder",
        label: t("common.serial") || (language === "ar" ? "م" : "No."),
        sortable: true,
      },
      {
        key: "key",
        label: t("entitlements.featureDefinitions.key") || "Key",
        sortable: true,
      },
      {
        key: "displayName",
        label: t("entitlements.featureDefinitions.displayName") || "Display Name",
        render: (_v: unknown, item: TenantFeatureDefinition) =>
          language === "ar" ? item.displayNameAr : item.displayNameEn,
      },
      {
        key: "valueType",
        label: t("entitlements.featureDefinitions.valueType") || "Type",
        render: (value: string) => (
          <Badge variant={valueTypeVariant[value] ?? "outline"}>
            {t(`entitlements.featureDefinitions.type${value}`) || value}
          </Badge>
        ),
      },
      {
        key: "category",
        label: t("entitlements.featureDefinitions.category") || "Category",
        sortable: true,
      },
      {
        key: "defaultValue",
        label: t("entitlements.featureDefinitions.defaultValue") || "Default",
      },
      {
        key: "planUsageCount",
        label: t("entitlements.featureDefinitions.usageCount") || "Plans Using",
        render: (value: number) => <Badge variant="secondary">{value ?? 0}</Badge>,
      },
      {
        key: "isActive",
        label: t("common.active") || "Active",
        render: (_v: unknown, item: TenantFeatureDefinition) => (
          <Badge variant={item.isActive ? "default" : "secondary"}>
            {item.isActive ? t("common.active") || "Active" : t("common.inactive") || "Inactive"}
          </Badge>
        ),
      },
    ];
  }, [t, language]);

  return {
    vm,
    columns,
    t,
  };
}
