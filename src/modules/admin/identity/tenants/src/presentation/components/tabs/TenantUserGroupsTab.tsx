/**
 * Tenant User Groups Tab Component
 *
 * Pure View component for managing user groups within a tenant.
 * Follows SOLID - View is ~60 lines, all logic in ViewModel.
 *
 * Architecture: View (pure UI) → ViewModel (all logic)
 *
 * @module tenants/presentation/components
 */
"use client";

import {
  Eye,
  Users,
  Shield,
  Trash2,
  Pencil,
  UserCheck,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";

// Generic CRUD imports
import { GenericCrudView } from "@core/crud/components/generic-crud-view";
import type { CrudConfig, CrudAction } from "@core/crud/components/generic-crud-view";
import { formatUtc, resolveBilingualLabel } from "@core/common/utils";
import { Badge } from "@core/ui/badge";
import { useI18n } from "@core/providers/i18n-provider";

// User Groups imports
import type { UserGroupListItem } from "@modules/identity/core";
import { useTenantUserGroupsViewModel } from "../../viewmodels/useTenantUserGroupsViewModel";
import { CascadeDeleteDialog, CascadeStatusDialog } from "@modules/identity/core";

// ViewModel - all logic lives here

interface TenantUserGroupsTabProps {
  tenantId: string;
  tenantName: string;
}

/**
 * TenantUserGroupsTab - Pure View Component
 *
 * This component contains ZERO business logic.
 * All state, operations, and data transformations are in useTenantUserGroupsViewModel.
 */
export function TenantUserGroupsTab({ tenantId, tenantName }: TenantUserGroupsTabProps) {
  const { t, language } = useI18n();

  // All logic delegated to ViewModel
  const vm = useTenantUserGroupsViewModel({ tenantId, tenantName });

  // Build CrudConfig from ViewModel data
  const config: CrudConfig<UserGroupListItem> = {
    titleKey: "",
    subtitleKey: "",
    columns: vm.columns.map((col) => ({
      ...col,
      render:
        col.key === "code"
          ? (value: string) => (
              <code className="rounded-nx-sm bg-nx-raised px-2 py-0.5 text-xs">{value}</code>
            )
          : col.key === "name"
            ? (_: unknown, group: UserGroupListItem) => (
                <span className="font-medium">
                  {resolveBilingualLabel(group.nameEn, group.nameAr, language)}
                </span>
              )
            : col.key === "description"
              ? (_: unknown, group: UserGroupListItem) => (
                  <span className="block max-w-[200px] truncate text-sm text-nx-ink-2">
                    {resolveBilingualLabel(
                      group.descriptionEn ?? "",
                      group.descriptionAr ?? "",
                      language
                    )}
                  </span>
                )
              : col.key === "memberCount"
                ? (value: number) => (
                    <Badge variant="secondary" className="flex w-fit items-center gap-1">
                      <Users className="h-3 w-3" aria-hidden="true" />
                      {value}
                    </Badge>
                  )
                : col.key === "roleCount"
                  ? (value: number) => (
                      <Badge variant="default" className="flex w-fit items-center gap-1">
                        <Shield className="h-3 w-3" aria-hidden="true" />
                        {value}
                      </Badge>
                    )
                  : col.key === "createdAt"
                    ? (value: string) => (value ? formatUtc(value, "MMM d, yyyy") : "-")
                    : undefined,
    })),
    createFields: vm.createFields,
    editFields: vm.editFields,
    createInitialValues: vm.createInitialValues,
    editInitialValues: vm.getEditInitialValues,
    getItemDisplayName: (item: UserGroupListItem) =>
      resolveBilingualLabel(item.nameEn, item.nameAr, language),
    deleteService: vm.deleteService,
    permissions: {
      canView: "user_groups.view",
      canCreate: "user_groups.create",
      canUpdate: "user_groups.update",
      canDelete: "user_groups.delete",
    },
    getActions: (vmInstance, tFn, handleDeleteFn): CrudAction<UserGroupListItem>[] => [
      {
        label: tFn("common.view"),
        onClick: (item: UserGroupListItem) => vm.onViewGroup(item.id),
        variant: "ghost",
        icon: <Eye className="h-4 w-4" aria-hidden="true" />,
      },
      {
        label: tFn("common.edit"),
        onClick: (item: UserGroupListItem) => vmInstance.openEditModal(item),
        variant: "ghost",
        icon: <Pencil className="h-4 w-4" aria-hidden="true" />,
      },
      {
        label: tFn("admin.toggleStatus"),
        onClick: (item: UserGroupListItem) => vm.triggerStatus([item.id], !item.isActive),
        variant: "ghost",
        icon: <UserCheck className="h-4 w-4" aria-hidden="true" />,
        requiredPermission: "user_groups.update",
      },
      {
        label: tFn("common.delete"),
        onClick: (item: UserGroupListItem) => vm.triggerDelete([item.id]),
        variant: "ghost",
        className: "text-destructive hover:text-destructive/90",
        icon: <Trash2 className="h-4 w-4" aria-hidden="true" />,
        requiredPermission: "user_groups.delete",
      },
    ],
    enableBulkActions: true,
    bulkActions: [
      {
        label: t("common.activate"),
        icon: <ShieldCheck className="h-4 w-4" aria-hidden="true" />,
        onClick: async (ids: string[]) => {
          vm.triggerStatus(ids, true);
        },
        variant: "outline" as const,
      },
      {
        label: t("common.deactivate"),
        icon: <ShieldAlert className="h-4 w-4" aria-hidden="true" />,
        onClick: async (ids: string[]) => {
          vm.triggerStatus(ids, false);
        },
        variant: "outline" as const,
      },
      {
        label: t("common.delete"),
        icon: <Trash2 className="h-4 w-4" aria-hidden="true" />,
        onClick: async (ids: string[]) => {
          vm.triggerDelete(ids);
        },
        variant: "destructive" as const,
      },
    ],
  };

  return (
    <>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-nx-ink">{vm.title}</h3>
            <p className="text-sm text-nx-ink-2">{vm.subtitle}</p>
          </div>
        </div>

        {/* User Groups Table */}
        <div className="overflow-hidden rounded-nx-lg border border-nx-line">
          <GenericCrudView viewModel={vm.groupsVm} config={config} />
        </div>
      </div>

      <CascadeDeleteDialog
        open={vm.deleteDialog.open}
        onOpenChange={(v) => vm.setDeleteDialog((s) => ({ ...s, open: v }))}
        onConfirm={vm.confirmDelete}
        isPending={vm.deleteDialog.isPending}
        itemName={
          vm.deleteDialog.ids.length > 1
            ? t("tenant.selectedGroupsCount", { count: vm.deleteDialog.ids.length })
            : t("tenant.theSelectedGroup")
        }
      />

      <CascadeStatusDialog
        open={vm.statusDialog.open}
        onOpenChange={(v) => vm.setStatusDialog((s) => ({ ...s, open: v }))}
        onConfirm={vm.confirmStatus}
        isPending={vm.statusDialog.isPending}
        isActive={vm.statusDialog.isActive}
        itemName={
          vm.statusDialog.ids.length > 1
            ? t("tenant.selectedGroupsCount", { count: vm.statusDialog.ids.length })
            : t("tenant.theSelectedGroup")
        }
      />
    </>
  );
}
