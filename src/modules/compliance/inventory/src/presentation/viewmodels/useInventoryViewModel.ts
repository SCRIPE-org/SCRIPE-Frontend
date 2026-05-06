"use client";

import { useCallback } from "react";
import { complianceContainer } from "@modules/compliance/di";
import { useI18n } from "@core/providers/i18n-provider";
import { useCrudViewModel } from "@core/crud/hooks/useCrudViewModel";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import type { CrudConfig } from "@core/crud/components/generic-crud-view";
import type { InventoryItem } from "../../domain/entities/InventoryItem";
import type { CreateDataInventoryRequest, UpdateDataInventoryRequest } from "../../data/models/InventoryModels";
import { SYSTEM_PERMISSIONS } from "@core/common/types/permissions";
import { usePermissions } from "@core/hooks/use-permissions";
import { useAppStore } from "@core/store/useAppStore";

export function useInventoryViewModel() {
  const { inventoryRepository } = complianceContainer;
    const { t } = useI18n();
  const { success } = useEnhancedToast();
  const { hasPermission } = usePermissions();
  const tenantCode = useAppStore((state) => state.tenantCode);

  const queryKey = ["compliance", "inventory", tenantCode];

  const vm = useCrudViewModel<InventoryItem, CreateDataInventoryRequest, UpdateDataInventoryRequest>(queryKey, {
    getAll: async (params) => {
      const res = await inventoryRepository.getAll({
        page: params.page,
        pageSize: params.pageSize,
        search: params.search,
      });
      return {
        items: res.items || [],
        pagination: {
          itemsCount: res.totalCount,
          pageSize: params.pageSize,
          page: params.page,
          pagesCount: Math.ceil((res.totalCount || 0) / params.pageSize),
        },
      };
    },
    create: async (data) => {
      await inventoryRepository.create(data);
      success({
        title: t("compliance.inventoryAdded"),
      });
      return {} as InventoryItem;
    },
    update: async (id, data) => {
      await inventoryRepository.update(id, data);
      success({
        title: t("compliance.inventoryUpdated"),
      });
      return {} as InventoryItem;
    },
    delete: async (id) => {
      await inventoryRepository.delete(id);
      success({
        title: t("compliance.inventoryDeleted"),
      });
    },
  });

  const getConfigBase = useCallback(
    (): Partial<CrudConfig<InventoryItem>> => {
      const baseFields = [
        {
          name: "moduleName",
          label: t("compliance.module"),
          type: "text" as const,
          placeholder: t("compliance.placeholders.moduleName"),
          required: true,
        },
        {
          name: "entityName",
          label: t("compliance.entity"),
          type: "text" as const,
          placeholder: t("compliance.placeholders.entityName"),
          required: true,
        },
        {
          name: "fieldName",
          label: t("compliance.field"),
          type: "text" as const,
          placeholder: t("compliance.placeholders.fieldName"),
          required: true,
        },
        {
          name: "dataCategory",
          label: t("compliance.dataCategory"),
          type: "select" as const,
          placeholder: t("compliance.placeholders.selectCategory"),
          required: true,
          options: [
            { value: "Contact", label: t("compliance.categories.ContactData") },
            { value: "Profile", label: t("compliance.categories.IdentityData") },
            { value: "Financial", label: t("compliance.categories.FinancialData") },
            { value: "Security", label: t("compliance.categories.TechnicalData") },
            { value: "Organisation", label: t("compliance.categories.OrganisationData") },
            { value: "Content", label: t("compliance.categories.ContentData") },
          ],
        },
        {
          name: "legalBasis",
          label: t("compliance.legalBasis"),
          type: "select" as const,
          placeholder: t("compliance.placeholders.selectLegalBasis"),
          required: true,
          options: [
            { value: "Consent", label: t("compliance.legalBases.Consent") },
            { value: "Contract", label: t("compliance.legalBases.Contract") },
            { value: "LegalObligation", label: t("compliance.legalBases.LegalObligation") },
            { value: "VitalInterests", label: t("compliance.legalBases.VitalInterests") },
            { value: "PublicTask", label: t("compliance.legalBases.PublicTask") },
            { value: "LegitimateInterest", label: t("compliance.legalBases.LegitimateInterest") },
          ],
        },
        {
          name: "isAnonymizedOnErasure",
          label: t("compliance.isAnonymized"),
          type: "checkbox" as const,
        },
        {
          name: "isIncludedInExport",
          label: t("compliance.isExported"),
          type: "checkbox" as const,
        },
      ];

      return {
        createFields: [
          ...baseFields,
          { name: "isActive", type: "hidden" as const, defaultValue: true },
        ],
        editFields: [
          ...baseFields,
          { name: "id", type: "hidden" as const, required: true },
          { name: "isActive", type: "hidden" as const, required: true },
        ],
        editInitialValues: (item: InventoryItem) => ({
          id: item.id,
          moduleName: item.moduleName,
          entityName: item.entityName,
          fieldName: item.fieldName,
          dataCategory: item.dataCategory,
          legalBasis: item.legalBasis,
          isAnonymizedOnErasure: item.isAnonymizedOnErasure,
          isIncludedInExport: item.isIncludedInExport,
          isActive: item.isActive,
        }),
        getItemDisplayName: (item: InventoryItem) => item.displayName,
        enableBulkActions: true,
        getActions: (vm, t, handleDelete) => [
          {
            label: t("common.edit"),
            onClick: (item) => vm.openEditModal(item),
            show: () => !!tenantCode && hasPermission(SYSTEM_PERMISSIONS.COMPLIANCE_DATA_INVENTORY_MANAGE),
          },
          {
            label: t("common.delete"),
            variant: "destructive",
            onClick: handleDelete,
            show: () => !!tenantCode && hasPermission(SYSTEM_PERMISSIONS.COMPLIANCE_DATA_INVENTORY_MANAGE),
          }
        ],
        permissions: {
          canCreate: !!tenantCode && hasPermission(SYSTEM_PERMISSIONS.COMPLIANCE_DATA_INVENTORY_MANAGE),
          canUpdate: !!tenantCode && hasPermission(SYSTEM_PERMISSIONS.COMPLIANCE_DATA_INVENTORY_MANAGE),
          canDelete: !!tenantCode && hasPermission(SYSTEM_PERMISSIONS.COMPLIANCE_DATA_INVENTORY_MANAGE),
        },
      };
    },
    [t, tenantCode, hasPermission]
  );

  return {
    vm,
    getConfigBase,
    t,
  };
}
