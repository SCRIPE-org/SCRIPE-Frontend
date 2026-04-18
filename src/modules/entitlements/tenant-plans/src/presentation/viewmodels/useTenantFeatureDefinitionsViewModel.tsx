/**
 * TenantFeatureDefinitions ViewModel — Feature Catalog CRUD
 *
 * Uses GenericCrudView pattern via useCrudViewModel for the
 * TenantFeatureDefinition catalog. Mirrors the platform-level
 * Features CRUD viewmodel.
 */
"use client";

import { useMemo, useState, useCallback } from "react";
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
import { Switch } from "@core/ui/switch";

export function useTenantFeatureDefinitionsViewModel() {
  const { tenantPlanRepository } = entitlementsContainer;
  const { t, language } = useI18n();
  const [togglingIds, setTogglingIds] = useState<Set<string>>(new Set());

  // ── CRUD ViewModel (defined first so columns can reference refreshItems) ──
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

  // ── Toggle active state handler ──
  const handleToggleActive = useCallback(
    async (item: TenantFeatureDefinition, checked: boolean) => {
      setTogglingIds((prev) => new Set(prev).add(item.id));
      try {
        await tenantPlanRepository.updateFeatureDefinition(item.id, {
          key: item.key,
          displayNameEn: item.displayNameEn,
          displayNameAr: item.displayNameAr,
          valueType: item.valueType,
          defaultValue: item.defaultValue,
          category: item.category,
          description: item.description,
          sortOrder: item.sortOrder,
          isActive: checked,
        });
        vm.refreshItems();
      } finally {
        setTogglingIds((prev) => {
          const next = new Set(prev);
          next.delete(item.id);
          return next;
        });
      }
    },
    [tenantPlanRepository, vm]
  );

  // ── Column definitions ──
  const columns: CrudColumn<TenantFeatureDefinition>[] = useMemo(() => {
    const valueTypeVariant: Record<string, "default" | "secondary" | "outline"> = {
      Boolean: "default",
      Numeric: "secondary",
      String: "outline",
    };

    return [
      {
        key: "_index",
        label: t("common.no") || "#",
        render: (_v: unknown, _item: TenantFeatureDefinition, index: number) =>
          String(index + 1),
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
        render: (value: number) => (
          <Badge variant="secondary">{value ?? 0}</Badge>
        ),
      },
      {
        key: "isActive",
        label: t("common.active") || "Active",
        render: (_v: unknown, item: TenantFeatureDefinition) => {
          const isToggling = togglingIds.has(item.id);
          return (
            <Switch
              checked={item.isActive}
              disabled={isToggling}
              onCheckedChange={(checked: boolean) =>
                handleToggleActive(item, checked)
              }
            />
          );
        },
      },
    ];
  }, [t, language, togglingIds, handleToggleActive]);

  return {
    vm,
    columns,
    t,
  };
}
