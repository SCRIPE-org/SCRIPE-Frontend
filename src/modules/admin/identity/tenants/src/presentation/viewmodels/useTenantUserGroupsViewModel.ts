/**
 * Tenant User Groups ViewModel
 *
 * Orchestrator ViewModel for managing user groups within a tenant.
 * Follows SOLID principles: composes existing ViewModels and provides
 * all data/operations for the TenantUserGroupsTab View.
 *
 * Architecture: View → ViewModel → Repository → Service → API
 *
 * @module tenants/presentation/viewmodels
 */
"use client";

import { useMemo, useCallback } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import type { FieldConfig } from "@core/ui/forms/generic-form";
import { useRouter } from "next/navigation";

// User Groups module imports
import type { UserGroupListItem } from "@modules/identity/core";
import { useUserGroupsViewModel } from "@modules/identity/core";

interface UseTenantUserGroupsViewModelParams {
  tenantId: string;
  tenantName: string;
}

/**
 * Result interface for the ViewModel
 * Defines exactly what the View receives - Interface Segregation Principle
 */
export interface TenantUserGroupsViewModelResult {
  // Core CRUD ViewModel (delegated)
  groupsVm: ReturnType<typeof useUserGroupsViewModel>["vm"];

  // Form Fields (Dynamic based on create/edit)
  createFields: FieldConfig[];
  editFields: FieldConfig[];

  // Initial Values
  createInitialValues: Record<string, unknown>;
  getEditInitialValues: (item: UserGroupListItem) => Record<string, unknown>;

  // Table Columns Config
  columns: Array<{
    key: string;
    label: string;
    sortable?: boolean;
    render?: (value: any, item?: UserGroupListItem) => React.ReactNode;
  }>;

  // Actions
  onViewGroup: (groupId: string) => void;

  // Labels & Metadata
  title: string;
  subtitle: string;
  tenantId: string;

  // Delete service
  deleteService: (id: string) => Promise<void>;

  // Cascade Dialogs and actions
  triggerDelete: (ids: string[]) => void;
  triggerStatus: (ids: string[], isActive: boolean) => void;
  deleteDialog: { open: boolean; ids: string[]; isPending: boolean };
  setDeleteDialog: React.Dispatch<
    React.SetStateAction<{ open: boolean; ids: string[]; isPending: boolean }>
  >;
  statusDialog: { open: boolean; ids: string[]; isActive: boolean; isPending: boolean };
  setStatusDialog: React.Dispatch<
    React.SetStateAction<{ open: boolean; ids: string[]; isActive: boolean; isPending: boolean }>
  >;
  confirmDelete: (cascadeAdmins: boolean) => Promise<void>;
  confirmStatus: (cascadeAdmins: boolean) => Promise<void>;
}

/**
 * React hook/ViewModel orchestrating state and data flows for tenant user groups view model.
 * Handles active states updates, form fields validations, and browser navigation controllers.
 */
export function useTenantUserGroupsViewModel({
  tenantId,
  tenantName,
}: UseTenantUserGroupsViewModelParams): TenantUserGroupsViewModelResult {
  const { t, language } = useI18n();
  const router = useRouter();

  // Delegate to core user groups ViewModel - Dependency Inversion Principle
  const {
    vm: groupsVm,
    getConfigBase,
    triggerDelete,
    triggerStatus,
    deleteDialog,
    setDeleteDialog,
    statusDialog,
    setStatusDialog,
    confirmDelete,
    confirmStatus,
  } = useUserGroupsViewModel({ tenantId });

  // ─────────────────────────────────────────────────────────────────
  // Navigation Actions
  // ─────────────────────────────────────────────────────────────────
  const onViewGroup = useCallback(
    (groupId: string) => {
      router.push(`/user-groups/${groupId}`);
    },
    [router]
  );

  // ─────────────────────────────────────────────────────────────────
  // Configuration Base (From Core UserGroups module)
  // ─────────────────────────────────────────────────────────────────
  const configBase = getConfigBase(t);

  const createFields = useMemo(() => configBase.createFields, [configBase]);
  const editFields = useMemo(() => configBase.editFields, [configBase]);
  const createInitialValues = useMemo(
    () => ({ ...configBase.createInitialValues, tenantId }),
    [configBase, tenantId]
  );
  const getEditInitialValues = useCallback(
    (item: UserGroupListItem) => configBase.editInitialValues(item),
    [configBase]
  );

  // ─────────────────────────────────────────────────────────────────
  // Table Columns Configuration
  // ─────────────────────────────────────────────────────────────────
  const columns = useMemo(
    () => [
      {
        key: "name",
        label: t("userGroups.name"),
        sortable: true,
      },
      {
        key: "code",
        label: t("userGroups.code"),
      },
      {
        key: "description",
        label: t("userGroups.descriptionCol"),
      },
      {
        key: "memberCount",
        label: t("userGroups.members"),
      },
      {
        key: "roleCount",
        label: t("userGroups.roles"),
      },
      {
        key: "createdAt",
        label: t("common.createdAt"),
      },
    ],
    [t]
  );

  // ─────────────────────────────────────────────────────────────────
  // Labels
  // ─────────────────────────────────────────────────────────────────
  const title = t("tenant.manageGroups");
  const subtitle = t("tenant.groupsDescription").replace("{tenant}", tenantName);

  return {
    groupsVm,
    createFields,
    editFields,
    createInitialValues,
    getEditInitialValues,
    columns,
    onViewGroup,
    title,
    subtitle,
    tenantId,
    deleteService: configBase.deleteService,
    triggerDelete,
    triggerStatus,
    deleteDialog,
    setDeleteDialog,
    statusDialog,
    setStatusDialog,
    confirmDelete,
    confirmStatus,
  };
}
