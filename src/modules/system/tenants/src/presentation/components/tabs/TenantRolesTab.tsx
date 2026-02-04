/**
 * Tenant Roles Tab Component
 *
 * Manages roles for a specific tenant using GenericCrudView.
 *
 * @module tenants
 */
"use client";

import { useState, useMemo, useCallback } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Badge } from "@core/ui/badge";
import { Shield, Trash2, Pencil, Eye } from "lucide-react";
import { format } from "date-fns";

// Generic CRUD imports
import { GenericCrudView } from "@core/crud/components/generic-crud-view";
import type { CrudConfig, CrudAction } from "@core/crud/components/generic-crud-view";

// Role imports
import { Role } from "@modules/system/roles/src/domain/entities/Role";
import { useRolesViewModel } from "@modules/system/roles/src/presentation/viewmodels/useRolesViewModel";
import { RolePermissionsDialog } from "@modules/system/roles/src/presentation/components/RolePermissionsDialog";

interface TenantRolesTabProps {
      tenantId: string;
      tenantName: string;
}

export function TenantRolesTab({ tenantId, tenantName }: TenantRolesTabProps) {
      const { t } = useI18n();
      // Pass tenantId to filter roles for this specific tenant
      const vm = useRolesViewModel({ tenantId });

      // Role permissions dialog state
      const [selectedRoleForPermissions, setSelectedRoleForPermissions] = useState<Role | null>(null);
      const [permissionsDialogOpen, setPermissionsDialogOpen] = useState(false);

      // Handler for opening permissions dialog
      const handleOpenPermissions = useCallback((role: Role) => {
            setSelectedRoleForPermissions(role);
            setPermissionsDialogOpen(true);
      }, []);

      // Configuration for the generic view
      const config: CrudConfig<Role> = useMemo(
            () => ({
                  titleKey: "",
                  subtitleKey: "",
                  columns: [
                        {
                              key: "name",
                              label: t("role.name") || "Name",
                              sortable: true,
                        },
                        {
                              key: "code",
                              label: t("role.code") || "Code",
                              render: (value: string) => (
                                    <code className="text-xs bg-muted px-2 py-0.5 rounded">
                                          {value}
                                    </code>
                              ),
                        },
                        {
                              key: "description",
                              label: t("role.description") || "Description",
                              render: (value: string) => (
                                    <span className="text-sm text-muted-foreground truncate max-w-[200px] block">
                                          {value || "-"}
                                    </span>
                              ),
                        },
                        {
                              key: "priority",
                              label: t("role.priority") || "Priority",
                              sortable: true,
                              render: (value: number) => (
                                    <Badge variant="outline">{value}</Badge>
                              ),
                        },
                        {
                              key: "createdAt",
                              label: t("role.createdAt") || "Created",
                              render: (value: string) =>
                                    value ? format(new Date(value), "MMM d, yyyy") : "-",
                        },
                  ],
                  createFields: [
                        {
                              name: "name",
                              label: t("role.name") || "Name",
                              type: "text",
                              placeholder: t("role.namePlaceholder") || "Enter role name",
                              required: true,
                        },
                        {
                              name: "code",
                              label: t("role.code") || "Code",
                              type: "text",
                              placeholder: t("role.codePlaceholder") || "ROLE_CODE",
                              required: true,
                        },
                        {
                              name: "description",
                              label: t("role.description") || "Description",
                              type: "textarea",
                              placeholder: t("role.descriptionPlaceholder") || "Optional description...",
                              required: false,
                        },
                        {
                              name: "priority",
                              label: t("role.priority") || "Priority",
                              type: "number",
                              placeholder: "100",
                              required: false,
                        },
                  ],
                  editFields: [
                        {
                              name: "name",
                              label: t("role.name") || "Name",
                              type: "text",
                              placeholder: t("role.namePlaceholder") || "Enter role name",
                              required: true,
                        },
                        {
                              name: "description",
                              label: t("role.description") || "Description",
                              type: "textarea",
                              placeholder: t("role.descriptionPlaceholder") || "Optional description...",
                              required: false,
                        },
                        {
                              name: "priority",
                              label: t("role.priority") || "Priority",
                              type: "number",
                              placeholder: "100",
                              required: false,
                        },
                  ],
                  createInitialValues: {
                        name: "",
                        code: "",
                        description: "",
                        priority: 100,
                  },
                  editInitialValues: (item: Role) => ({
                        name: item.name,
                        description: item.description || "",
                        priority: item.priority,
                  }),
                  getItemDisplayName: (item: Role) => item.name,
                  permissions: {
                        canView: "roles.view",
                        canCreate: "roles.create",
                        canUpdate: "roles.update",
                        canDelete: "roles.delete",
                  },
                  getActions: (
                        vmInstance: any,
                        tFn: any,
                        handleDeleteFn: any
                  ): CrudAction<Role>[] => [
                              {
                                    label: tFn("common.view") || "View",
                                    onClick: (item: Role) => vmInstance.openViewModal(item),
                                    variant: "ghost" as const,
                                    icon: <Eye className="h-4 w-4" />,
                              },
                              {
                                    label: tFn("common.edit") || "Edit",
                                    onClick: (item: Role) => vmInstance.openEditModal(item),
                                    variant: "ghost" as const,
                                    icon: <Pencil className="h-4 w-4" />,
                              },
                              {
                                    label: tFn("role.managePermissions") || "Permissions",
                                    onClick: (item: Role) => handleOpenPermissions(item),
                                    variant: "ghost" as const,
                                    icon: <Shield className="h-4 w-4" />,
                              },
                              {
                                    label: tFn("common.delete") || "Delete",
                                    onClick: (item: Role) => handleDeleteFn?.(item),
                                    variant: "ghost" as const,
                                    className: "text-red-600 hover:text-red-700",
                                    icon: <Trash2 className="h-4 w-4" />,
                              },
                        ],
            }),
            [t, handleOpenPermissions]
      );

      return (
            <div className="space-y-4">
                  <div className="flex items-center justify-between">
                        <div>
                              <h3 className="text-lg font-semibold">{t("tenant.manageRoles")}</h3>
                              <p className="text-sm text-muted-foreground">
                                    {t("tenant.rolesDescription") ||
                                          `Manage roles for ${tenantName}`}
                              </p>
                        </div>
                  </div>

                  {/* GenericCrudView for Roles */}
                  <div className="border rounded-lg overflow-hidden">
                        <GenericCrudView viewModel={vm} config={config} />
                  </div>

                  {/* Role Permissions Dialog */}
                  <RolePermissionsDialog
                        open={permissionsDialogOpen}
                        onOpenChange={setPermissionsDialogOpen}
                        role={selectedRoleForPermissions}
                        tenantId={tenantId}
                  />
            </div>
      );
}
