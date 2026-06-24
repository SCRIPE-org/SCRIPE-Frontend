/**
 * User Groups List View
 *
 * Main list page for user group management.
 * Uses GenericCrudView for standard CRUD + custom columns.
 */
"use client";

import { useMemo } from "react";
import { GenericCrudView } from "@core/crud/components/generic-crud-view";
import type { CrudConfig, CrudAction } from "@core/crud/components/generic-crud-view";
import { useUserGroupsViewModel } from "../viewmodels/useUserGroupsViewModel";
import { useI18n } from "@core/providers/i18n-provider";
import { Badge } from "@core/ui/badge";
import {
  Eye,
  Pencil,
  Trash2,
  Users,
  Shield,
  ShieldCheck,
  ShieldAlert,
  UserCheck,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { CascadeDeleteDialog } from "../components/CascadeDeleteDialog";
import { CascadeStatusDialog } from "../components/CascadeStatusDialog";
import { useModuleLocales } from "@core/hooks/use-module-locales";

interface UserGroupListItem {
  id: string;
  nameEn: string;
  nameAr: string;
  code: string;
  descriptionEn?: string;
  descriptionAr?: string;
  tenantId: string;
  tenantName?: string;
  isActive: boolean;
  memberCount: number;
  roleCount: number;
  createdAt: string;
}

/**
 * Presentation UI component rendering the user groups view.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function UserGroupsView() {
  useModuleLocales(() => import("../../../locales"), "user-groups");

  const { t, language } = useI18n();
  const router = useRouter();
  const {
    vm,
    getConfigBase,
    handleToggleActive,
    handleBulkActivate,
    handleBulkDeactivate,
    handleBulkDelete,
    triggerDelete,
    triggerStatus,
    deleteDialog,
    setDeleteDialog,
    statusDialog,
    setStatusDialog,
    confirmDelete,
    confirmStatus,
  } = useUserGroupsViewModel({ useMyTenant: true });
  const configBase = getConfigBase(t);

  const config: CrudConfig<UserGroupListItem> = useMemo(
    () => ({
      titleKey: "userGroups.title",
      subtitleKey: "userGroups.description",
      resource: "user_groups",
      columns: [
        {
          key: "nameEn",
          label: t("common.name") || "Name",
          sortable: true,
          render: (_val: unknown, item: UserGroupListItem) => (
            <div className="flex flex-col">
              <span className="font-medium">{language === "ar" ? item.nameAr : item.nameEn}</span>
              <span className="font-mono text-xs text-muted-foreground">{item.code}</span>
            </div>
          ),
        },
        {
          key: "tenantName",
          label: t("common.tenant") || "Tenant",
          render: (_val: unknown, item: UserGroupListItem) => (
            <span className="text-sm text-muted-foreground">{item.tenantName || "—"}</span>
          ),
        },
        {
          key: "memberCount",
          label: t("userGroups.members") || "Members",
          render: (_val: unknown, item: UserGroupListItem) => (
            <div className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-blue-500" />
              <Badge variant="outline" className="text-xs">
                {item.memberCount}
              </Badge>
            </div>
          ),
        },
        {
          key: "roleCount",
          label: t("userGroups.roles") || "Roles",
          render: (_val: unknown, item: UserGroupListItem) => (
            <div className="flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-purple-500" />
              <Badge variant="outline" className="text-xs">
                {item.roleCount}
              </Badge>
            </div>
          ),
        },
        {
          key: "isActive",
          label: t("common.status") || "Status",
          render: (_val: unknown, item: UserGroupListItem) => (
            <Badge variant={item.isActive ? "default" : "secondary"}>
              {item.isActive ? t("common.active") || "Active" : t("common.inactive") || "Inactive"}
            </Badge>
          ),
        },
      ],
      createFields: configBase.createFields,
      editFields: configBase.editFields,
      createInitialValues: configBase.createInitialValues,
      editInitialValues: configBase.editInitialValues,
      getItemDisplayName: configBase.getItemDisplayName,
      deleteService: configBase.deleteService,
      permissions: configBase.permissions,
      getActions: (
        _vmInstance: any,
        tFn: any,
        handleDeleteFn: any
      ): CrudAction<UserGroupListItem>[] => [
        {
          label: tFn("common.view") || "View Details",
          onClick: (item: UserGroupListItem) => router.push(`/user-groups/${item.id}`),
          variant: "ghost" as const,
          icon: <Eye className="h-4 w-4" />,
        },
        {
          label: tFn("common.edit") || "Edit",
          onClick: (item: UserGroupListItem) => vm.openEditModal(item),
          variant: "ghost" as const,
          icon: <Pencil className="h-4 w-4" />,
          requiredPermission: "user_groups.update",
        },
        {
          label: tFn("admin.toggleStatus") || "Toggle Status",
          onClick: (item: UserGroupListItem) => triggerStatus([item.id], !item.isActive),
          variant: "ghost" as const,
          icon: <UserCheck className="h-4 w-4" />,
          requiredPermission: "user_groups.update",
        },
        {
          label: tFn("common.delete") || "Delete",
          onClick: (item: UserGroupListItem) => triggerDelete([item.id]),
          variant: "ghost" as const,
          className: "text-red-600 hover:text-red-700",
          icon: <Trash2 className="h-4 w-4" />,
          requiredPermission: "user_groups.delete",
        },
      ],
      enableBulkActions: true,
      bulkActions: [
        {
          label: t("common.activate") || "Activate",
          icon: <ShieldCheck className="h-4 w-4" />,
          onClick: async (ids: string[]) => {
            triggerStatus(ids, true);
          },
          variant: "outline" as const,
        },
        {
          label: t("common.deactivate") || "Deactivate",
          icon: <ShieldAlert className="h-4 w-4" />,
          onClick: async (ids: string[]) => {
            triggerStatus(ids, false);
          },
          variant: "outline" as const,
        },
        {
          label: t("common.delete") || "Delete",
          icon: <Trash2 className="h-4 w-4" />,
          onClick: async (ids: string[]) => {
            triggerDelete(ids);
          },
          variant: "destructive" as const,
        },
      ],
    }),
    [t, language, configBase, router, vm, triggerStatus, triggerDelete]
  );

  return (
    <>
      <GenericCrudView viewModel={vm} config={config} />

      <CascadeDeleteDialog
        open={deleteDialog.open}
        onOpenChange={(v) => setDeleteDialog((s) => ({ ...s, open: v }))}
        onConfirm={confirmDelete}
        isPending={deleteDialog.isPending}
        itemName={
          deleteDialog.ids.length > 1 ? `${deleteDialog.ids.length} groups` : "the selected group"
        }
      />

      <CascadeStatusDialog
        open={statusDialog.open}
        onOpenChange={(v) => setStatusDialog((s) => ({ ...s, open: v }))}
        onConfirm={confirmStatus}
        isPending={statusDialog.isPending}
        isActive={statusDialog.isActive}
        itemName={
          statusDialog.ids.length > 1 ? `${statusDialog.ids.length} groups` : "the selected group"
        }
      />
    </>
  );
}
