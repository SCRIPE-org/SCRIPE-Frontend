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

import { Eye, Users, Shield, Trash2, Pencil, UserCheck, ShieldCheck, ShieldAlert } from "lucide-react";
import { format } from "date-fns";

// Generic CRUD imports
import { GenericCrudView } from "@core/crud/components/generic-crud-view";
import type { CrudConfig, CrudAction } from "@core/crud/components/generic-crud-view";
import { Badge } from "@core/ui/badge";
import { useI18n } from "@core/providers/i18n-provider";

// User Groups imports
import type { UserGroupListItem } from "@modules/identity/user-groups/src/presentation/viewmodels/useUserGroupsViewModel";
import { useTenantUserGroupsViewModel } from "../../viewmodels/useTenantUserGroupsViewModel";
import { CascadeDeleteDialog } from "@modules/identity/user-groups/src/presentation/components/CascadeDeleteDialog";
import { CascadeStatusDialog } from "@modules/identity/user-groups/src/presentation/components/CascadeStatusDialog";

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
                              ? (value: string) => <code className="rounded bg-muted px-2 py-0.5 text-xs">{value}</code>
                              : col.key === "name"
                                    ? (_: unknown, group: UserGroupListItem) => (
                                          <span className="font-medium">{language === "ar" ? group.nameAr : group.nameEn}</span>
                                    )
                                    : col.key === "description"
                                          ? (_: unknown, group: UserGroupListItem) => (
                                                <span className="block max-w-[200px] truncate text-sm text-muted-foreground">
                                                      {language === "ar" ? group.descriptionAr : group.descriptionEn}
                                                </span>
                                          )
                                          : col.key === "memberCount"
                                                ? (value: number) => (
                                                      <Badge variant="secondary" className="gap-1 flex w-fit items-center">
                                                            <Users className="h-3 w-3" />
                                                            {value}
                                                      </Badge>
                                                )
                                                : col.key === "roleCount"
                                                      ? (value: number) => (
                                                            <Badge variant="outline" className="gap-1 bg-purple-500/10 text-purple-600 flex w-fit items-center border-purple-200">
                                                                  <Shield className="h-3 w-3" />
                                                                  {value}
                                                            </Badge>
                                                      )
                                                      : col.key === "createdAt"
                                                            ? (value: string) => (value ? format(new Date(value), "MMM d, yyyy") : "-")
                                                            : undefined,
            })),
            createFields: vm.createFields,
            editFields: vm.editFields,
            createInitialValues: vm.createInitialValues,
            editInitialValues: vm.getEditInitialValues,
            getItemDisplayName: (item: UserGroupListItem) => language === "ar" ? item.nameAr : item.nameEn,
            deleteService: vm.deleteService,
            permissions: {
                  canView: "user_groups.view",
                  canCreate: "user_groups.create",
                  canUpdate: "user_groups.update",
                  canDelete: "user_groups.delete",
            },
            getActions: (vmInstance, tFn, handleDeleteFn): CrudAction<UserGroupListItem>[] => [
                  {
                        label: tFn("common.view") || "View Details",
                        onClick: (item: UserGroupListItem) => vm.onViewGroup(item.id),
                        variant: "ghost",
                        icon: <Eye className="h-4 w-4" />,
                  },
                  {
                        label: tFn("common.edit") || "Edit",
                        onClick: (item: UserGroupListItem) => vmInstance.openEditModal(item),
                        variant: "ghost",
                        icon: <Pencil className="h-4 w-4" />,
                  },
                  {
                        label: tFn("admin.toggleStatus") || "Toggle Status",
                        onClick: (item: UserGroupListItem) => vm.triggerStatus([item.id], !item.isActive),
                        variant: "ghost",
                        icon: <UserCheck className="h-4 w-4" />,
                        requiredPermission: "user_groups.update",
                  },
                  {
                        label: tFn("common.delete") || "Delete",
                        onClick: (item: UserGroupListItem) => vm.triggerDelete([item.id]),
                        variant: "ghost",
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
                        onClick: async (ids: string[]) => { vm.triggerStatus(ids, true); },
                        variant: "outline" as const,
                  },
                  {
                        label: t("common.deactivate") || "Deactivate",
                        icon: <ShieldAlert className="h-4 w-4" />,
                        onClick: async (ids: string[]) => { vm.triggerStatus(ids, false); },
                        variant: "outline" as const,
                  },
                  {
                        label: t("common.delete") || "Delete",
                        icon: <Trash2 className="h-4 w-4" />,
                        onClick: async (ids: string[]) => { vm.triggerDelete(ids); },
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
                                    <h3 className="text-lg font-semibold">{vm.title}</h3>
                                    <p className="text-sm text-muted-foreground">{vm.subtitle}</p>
                              </div>
                        </div>

                        {/* User Groups Table */}
                        <div className="overflow-hidden rounded-lg border">
                              <GenericCrudView viewModel={vm.groupsVm} config={config} />
                        </div>
                  </div>

                  <CascadeDeleteDialog
                        open={vm.deleteDialog.open}
                        onOpenChange={(v) => vm.setDeleteDialog(s => ({ ...s, open: v }))}
                        onConfirm={vm.confirmDelete}
                        isPending={vm.deleteDialog.isPending}
                        itemName={vm.deleteDialog.ids.length > 1 ? `${vm.deleteDialog.ids.length} groups` : "the selected group"}
                  />

                  <CascadeStatusDialog
                        open={vm.statusDialog.open}
                        onOpenChange={(v) => vm.setStatusDialog(s => ({ ...s, open: v }))}
                        onConfirm={vm.confirmStatus}
                        isPending={vm.statusDialog.isPending}
                        isActive={vm.statusDialog.isActive}
                        itemName={vm.statusDialog.ids.length > 1 ? `${vm.statusDialog.ids.length} groups` : "the selected group"}
                  />
            </>
      );
}
