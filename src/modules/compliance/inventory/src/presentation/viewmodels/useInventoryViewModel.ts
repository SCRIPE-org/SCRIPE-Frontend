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

export function useInventoryViewModel() {
  const { inventoryRepository } = complianceContainer;
  const { t } = useI18n();
  const { success } = useEnhancedToast();

  const queryKey = ["compliance", "inventory"];

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
        title: t("compliance.inventoryAdded") || "Inventory added successfully",
      });
      return {} as InventoryItem;
    },
    update: async (id, data) => {
      await inventoryRepository.update(id, data);
      success({
        title: t("compliance.inventoryUpdated") || "Inventory updated successfully",
      });
      return {} as InventoryItem;
    },
    delete: async (id) => {
      await inventoryRepository.delete(id);
      success({
        title: t("compliance.inventoryDeleted") || "Inventory deleted successfully",
      });
    },
  });

  const getConfigBase = useCallback(
    (): Partial<CrudConfig<InventoryItem>> => {
      const baseFields = [
        {
          name: "moduleName",
          label: t("compliance.module") || "Module",
          type: "text" as const,
          placeholder: t("compliance.placeholders.moduleName") || "e.g., Identity",
          required: true,
        },
        {
          name: "entityName",
          label: t("compliance.entity") || "Entity",
          type: "text" as const,
          placeholder: t("compliance.placeholders.entityName") || "e.g., User",
          required: true,
        },
        {
          name: "fieldName",
          label: t("compliance.field") || "Field",
          type: "text" as const,
          placeholder: t("compliance.placeholders.fieldName") || "e.g., EmailAddress",
          required: true,
        },
        {
          name: "dataCategory",
          label: t("compliance.dataCategory") || "Category",
          type: "select" as const,
          placeholder: t("compliance.placeholders.selectCategory") || "Select category",
          required: true,
          options: [
            { value: "Contact", label: t("compliance.categories.ContactData") || "Contact Data" },
            { value: "Profile", label: t("compliance.categories.IdentityData") || "Profile Data" },
            { value: "Financial", label: t("compliance.categories.FinancialData") || "Financial Data" },
            { value: "Security", label: t("compliance.categories.TechnicalData") || "Security Data" },
            { value: "Organisation", label: t("compliance.categories.OrganisationData") || "Organisation Data" },
            { value: "Content", label: t("compliance.categories.ContentData") || "Content Data" },
          ],
        },
        {
          name: "legalBasis",
          label: t("compliance.legalBasis") || "Legal Basis",
          type: "select" as const,
          placeholder: t("compliance.placeholders.selectLegalBasis") || "Select legal basis",
          required: true,
          options: [
            { value: "Consent", label: t("compliance.legalBases.Consent") || "Consent" },
            { value: "Contract", label: t("compliance.legalBases.Contract") || "Contract" },
            { value: "LegalObligation", label: t("compliance.legalBases.LegalObligation") || "Legal Obligation" },
            { value: "VitalInterests", label: t("compliance.legalBases.VitalInterests") || "Vital Interests" },
            { value: "PublicTask", label: t("compliance.legalBases.PublicTask") || "Public Task" },
            { value: "LegitimateInterest", label: t("compliance.legalBases.LegitimateInterest") || "Legitimate Interest" },
          ],
        },
        {
          name: "isAnonymizedOnErasure",
          label: t("compliance.isAnonymized") || "Anonymized on Erasure",
          type: "checkbox" as const,
        },
        {
          name: "isIncludedInExport",
          label: t("compliance.isExported") || "Included in Export",
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
        permissions: {
          // Fallbacks for types if SYSTEM_PERMISSIONS doesn't have COMPLIANCE specifically
          canCreate: "compliance.create" as any,
          canUpdate: "compliance.update" as any,
          canDelete: "compliance.delete" as any,
        },
      };
    },
    [t]
  );

  return {
    vm,
    getConfigBase,
    t,
  };
}
