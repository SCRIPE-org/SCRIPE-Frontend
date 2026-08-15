"use client";

import { useCallback } from "react";
import { complianceContainer } from "@modules/compliance/di";
import { useI18n } from "@core/providers/i18n-provider";
import { useCrudViewModel } from "@core/crud/hooks/useCrudViewModel";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import type { CrudConfig } from "@core/crud/components/generic-crud-view";
import type {
  InventoryItem,
  CreateDataInventoryRequest,
  UpdateDataInventoryRequest,
} from "../../domain/entities/InventoryItem";
import { SYSTEM_PERMISSIONS } from "@core/common/types/permissions";
import { usePermissions } from "@core/hooks/use-permissions";
import { useAppStore } from "@core/store/useAppStore";

/**
 * React hook/ViewModel orchestrating state and data flows for inventory view model.
 * Handles active states updates, form fields validations, and browser navigation controllers.
 */
export function useInventoryViewModel() {
  const { inventoryRepository } = complianceContainer;
  const { t } = useI18n();
  const { success } = useEnhancedToast();
  const { hasPermission } = usePermissions();
  const tenantCode = useAppStore((state) => state.tenantCode);

  const queryKey = ["compliance", "inventory", tenantCode];

  // deferSuccessEffects: true -- this screen sets entityTypeKey (see
  // getConfigBase below), so GenericCrudView also saves custom-field values
  // after the inventory item itself is created/updated. Without this option,
  // useCrudViewModel's onCreateSuccess/onUpdateSuccess fired the toast and
  // closed the modal the instant createItem's own promise resolved -- before
  // the custom-field save even started. Same pattern as
  // useAdminsViewModel/useUsersViewModel/useWorkItemViewModel (W0-1).
  const vm = useCrudViewModel<
    InventoryItem,
    CreateDataInventoryRequest,
    UpdateDataInventoryRequest
  >(
    queryKey,
    {
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
        const id = await inventoryRepository.create(data);
        // No manual success() here on purpose -- deferSuccessEffects (above)
        // holds the toast until GenericCrudView confirms the custom-field
        // save (if any) also succeeded; firing it here unconditionally would
        // defeat that (same reasoning as useUsersViewModel's update).
        return { id } as unknown as InventoryItem;
      },
      update: async (id, data) => {
        await inventoryRepository.update(id, data);
        return { id } as unknown as InventoryItem;
      },
      delete: async (id) => {
        await inventoryRepository.delete(id);
        success({
          title: t("compliance.inventoryDeleted"),
        });
      },
    },
    { deferSuccessEffects: true }
  );

  const getConfigBase = useCallback((): Partial<CrudConfig<InventoryItem>> => {
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
          { value: "Contact", label: t("compliance.categories.Contact") },
          { value: "Profile", label: t("compliance.categories.Profile") },
          { value: "Financial", label: t("compliance.categories.Financial") },
          { value: "Security", label: t("compliance.categories.Security") },
          { value: "Organisation", label: t("compliance.categories.Organisation") },
          { value: "Content", label: t("compliance.categories.Content") },
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
      deleteService: async (id: string) => {
        await inventoryRepository.delete(id);
      },
      getActions: (vm, t, handleDelete) => [
        {
          label: t("common.edit"),
          onClick: (item) => vm.openEditModal(item),
          show: () =>
            !!tenantCode && hasPermission(SYSTEM_PERMISSIONS.COMPLIANCE_DATA_INVENTORY_MANAGE),
        },
        {
          label: t("common.delete"),
          variant: "destructive",
          onClick: handleDelete,
          show: () =>
            !!tenantCode && hasPermission(SYSTEM_PERMISSIONS.COMPLIANCE_DATA_INVENTORY_MANAGE),
        },
      ],
      permissions: {
        canCreate:
          !!tenantCode && hasPermission(SYSTEM_PERMISSIONS.COMPLIANCE_DATA_INVENTORY_MANAGE),
        canUpdate:
          !!tenantCode && hasPermission(SYSTEM_PERMISSIONS.COMPLIANCE_DATA_INVENTORY_MANAGE),
        canDelete:
          !!tenantCode && hasPermission(SYSTEM_PERMISSIONS.COMPLIANCE_DATA_INVENTORY_MANAGE),
      },
    };
  }, [t, tenantCode, hasPermission, inventoryRepository]);

  return {
    vm,
    getConfigBase,
    t,
  };
}
