/**
 * Tenant Tabs Component
 *
 * Tabbed navigation for managing tenant resources.
 * Uses GenericCrudView for consistent table display with proper RTL/LTR support.
 *
 * @module tenants
 */
"use client";

import { useState, useMemo, useCallback } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@core/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { Users, Shield, Building2, Settings, UserCheck, Trash2, Pencil, Eye } from "lucide-react";
import { cn } from "@core/common/utils";
import { format } from "date-fns";

// Generic CRUD imports
import { GenericCrudView } from "@core/crud/components/generic-crud-view";
import type { CrudConfig, CrudAction } from "@core/crud/components/generic-crud-view";
import { GenericTreeView } from "@core/crud/components/generic-tree-view";
import { useTreeViewModel } from "@core/hooks/use-tree-view-model";

// Admin imports
import { Admin } from "@modules/system/admin/src/domain/entities/Admin";
import { useAdminsViewModel } from "@modules/system/admin/src/presentation/viewmodels/useAdminsViewModel";
import { AssignRoleDialog, ViewRolesDialog } from "@modules/system/admin/src/presentation/components/AdminRoleDialogs";
import type { AssignRoleRequest } from "@modules/system/admin/src/domain/entities/AdminRequests";

// Role imports
import { Role } from "@modules/system/roles/src/domain/entities/Role";
import { useRolesViewModel } from "@modules/system/roles/src/presentation/viewmodels/useRolesViewModel";

// Tenant imports
import { systemContainer } from "@modules/system/di";
import { createTenantTreeService } from "../../data/services/TenantTreeService";
import type { TenantTreeNode } from "../../domain/entities/Tenant";

interface TenantTabsProps {
      tenantId: string;
      tenantName: string;
}

export function TenantTabs({ tenantId, tenantName }: TenantTabsProps) {
      const { t, direction } = useI18n();
      const [activeTab, setActiveTab] = useState("admins");

      const tabs = [
            {
                  value: "admins",
                  label: t("tenant.tabAdmins") || "Admins",
                  icon: Users,
            },
            {
                  value: "roles",
                  label: t("tenant.tabRoles") || "Roles",
                  icon: Shield,
            },
            {
                  value: "subtenants",
                  label: t("tenant.tabSubTenants") || "Sub-Tenants",
                  icon: Building2,
            },
            {
                  value: "settings",
                  label: t("tenant.tabSettings") || "Settings",
                  icon: Settings,
            },
      ];

      return (
            <Card className="border-border/50 shadow-lg" dir={direction}>
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                        {/* Tab Navigation */}
                        <CardHeader className="pb-0 border-b">
                              <TabsList className="grid w-full grid-cols-4 h-auto p-1 bg-muted/30">
                                    {tabs.map((tab) => (
                                          <TabsTrigger
                                                key={tab.value}
                                                value={tab.value}
                                                className={cn(
                                                      "flex items-center gap-2 py-3",
                                                      "data-[state=active]:bg-background",
                                                      "data-[state=active]:shadow-sm",
                                                      "data-[state=active]:border-b-2",
                                                      "data-[state=active]:border-b-primary",
                                                      "transition-all duration-200"
                                                )}
                                          >
                                                <tab.icon className="h-4 w-4" />
                                                <span className="hidden sm:inline">{tab.label}</span>
                                          </TabsTrigger>
                                    ))}
                              </TabsList>
                        </CardHeader>

                        <CardContent className="p-0">
                              {/* Admins Tab */}
                              <TabsContent value="admins" className="m-0 p-6">
                                    <TenantAdminsTab tenantId={tenantId} tenantName={tenantName} />
                              </TabsContent>

                              {/* Roles Tab */}
                              <TabsContent value="roles" className="m-0 p-6">
                                    <TenantRolesTab tenantId={tenantId} tenantName={tenantName} />
                              </TabsContent>

                              {/* Sub-Tenants Tab */}
                              <TabsContent value="subtenants" className="m-0 p-6">
                                    <SubTenantsTab parentId={tenantId} parentName={tenantName} />
                              </TabsContent>

                              {/* Settings Tab */}
                              <TabsContent value="settings" className="m-0 p-6">
                                    <TenantSettingsTab tenantId={tenantId} tenantName={tenantName} />
                              </TabsContent>
                        </CardContent>
                  </Tabs>
            </Card>
      );
}

// ============================================
// Admins Tab - Using GenericCrudView
// ============================================

function TenantAdminsTab({
      tenantId,
      tenantName,
}: {
      tenantId: string;
      tenantName: string;
}) {
      const { t } = useI18n();
      // Pass tenantId to filter admins for this specific tenant
      const {
            vm,
            getConfigBase,
            handleDelete,
            handleToggleActive,
            handleAssignRole,
            handleRemoveRole,
            isAssigningRole,
            isRemovingRole,
      } = useAdminsViewModel({ tenantId });

      const configBase = getConfigBase();

      // Role dialog state
      const [selectedAdminForRole, setSelectedAdminForRole] = useState<Admin | null>(null);
      const [assignRoleDialogOpen, setAssignRoleDialogOpen] = useState(false);
      const [viewRolesDialogOpen, setViewRolesDialogOpen] = useState(false);

      // Role dialog handlers
      const handleOpenAssignRole = useCallback((admin: Admin) => {
            setSelectedAdminForRole(admin);
            setAssignRoleDialogOpen(true);
      }, []);

      const handleOpenViewRoles = useCallback((admin: Admin) => {
            setSelectedAdminForRole(admin);
            setViewRolesDialogOpen(true);
      }, []);

      const onAssignRoleSubmit = useCallback(
            async (request: AssignRoleRequest) => {
                  if (!selectedAdminForRole) return;
                  await handleAssignRole(selectedAdminForRole.id, request);
                  setAssignRoleDialogOpen(false);
            },
            [handleAssignRole, selectedAdminForRole]
      );

      const onRemoveRole = useCallback(
            async (roleId: string, tenantId?: string) => {
                  if (!selectedAdminForRole) return;
                  await handleRemoveRole(selectedAdminForRole.id, roleId, tenantId);
            },
            [handleRemoveRole, selectedAdminForRole]
      );

      // Configuration for the generic view
      const config: CrudConfig<Admin> = useMemo(
            () => ({
                  titleKey: "",
                  subtitleKey: "",
                  columns: [
                        {
                              key: "username",
                              label: t("admin.username") || "Username",
                              sortable: true,
                        },
                        {
                              key: "name",
                              label: t("admin.name") || "Name",
                              render: (_val: unknown, admin: Admin) => (
                                    <span>{admin.displayName}</span>
                              ),
                        },
                        {
                              key: "roles",
                              label: t("admin.roles") || "Roles",
                              render: (_val: unknown, admin: Admin) => (
                                    <span className="text-sm text-muted-foreground">
                                          {admin.roleNames || t("admin.noRoles") || "No roles"}
                                    </span>
                              ),
                        },
                        {
                              key: "isActive",
                              label: t("admin.status") || "Status",
                              render: (value: boolean) => (
                                    <Badge variant={value ? "active" : "inactive"}>
                                          {value
                                                ? t("common.active") || "Active"
                                                : t("common.inactive") || "Inactive"}
                                    </Badge>
                              ),
                        },
                        {
                              key: "createdAt",
                              label: t("admin.createdAt") || "Created",
                              render: (value: string) =>
                                    value ? format(new Date(value), "MMM d, yyyy") : "-",
                        },
                  ],
                  createFields: configBase.createFields || [],
                  editFields: configBase.editFields || [],
                  createInitialValues: configBase.createInitialValues,
                  editInitialValues: configBase.editInitialValues,
                  getItemDisplayName: configBase.getItemDisplayName,
                  enableBulkActions: configBase.enableBulkActions,
                  permissions: configBase.permissions,
                  getActions: (
                        vmInstance: any,
                        tFn: any,
                        handleDeleteFn: any
                  ): CrudAction<Admin>[] => [
                              {
                                    label: tFn("common.view") || "View",
                                    onClick: (item: Admin) => vmInstance.openViewModal(item),
                                    variant: "ghost" as const,
                                    icon: <Eye className="h-4 w-4" />,
                              },
                              {
                                    label: tFn("common.edit") || "Edit",
                                    onClick: (item: Admin) => vmInstance.openEditModal(item),
                                    variant: "ghost" as const,
                                    icon: <Pencil className="h-4 w-4" />,
                              },
                              {
                                    label: tFn("admin.toggleStatus") || "Toggle Status",
                                    onClick: (item: Admin) =>
                                          handleToggleActive(item.id, !item.isActive),
                                    variant: "ghost" as const,
                                    icon: <UserCheck className="h-4 w-4" />,
                              },
                              {
                                    label: tFn("admin.role.viewTitle") || "View Roles",
                                    onClick: (item: Admin) => handleOpenViewRoles(item),
                                    variant: "ghost" as const,
                                    icon: <Shield className="h-4 w-4" />,
                              },
                              {
                                    label: tFn("admin.role.assign") || "Assign Role",
                                    onClick: (item: Admin) => handleOpenAssignRole(item),
                                    variant: "ghost" as const,
                                    icon: <Shield className="h-4 w-4" />,
                              },
                              {
                                    label: tFn("common.delete") || "Delete",
                                    onClick: (item: Admin) => handleDeleteFn?.(item),
                                    variant: "ghost" as const,
                                    className: "text-red-600 hover:text-red-700",
                                    icon: <Trash2 className="h-4 w-4" />,
                              },
                        ],
            }),
            [
                  t,
                  vm,
                  handleDelete,
                  configBase,
                  handleToggleActive,
                  handleOpenViewRoles,
                  handleOpenAssignRole,
            ]
      );

      return (
            <div className="space-y-4">
                  <div className="flex items-center justify-between">
                        <div>
                              <h3 className="text-lg font-semibold">{t("tenant.manageAdmins")}</h3>
                              <p className="text-sm text-muted-foreground">
                                    {t("tenant.adminsDescription") ||
                                          `Manage administrators for ${tenantName}`}
                              </p>
                        </div>
                  </div>

                  {/* GenericCrudView for Admins */}
                  <div className="border rounded-lg overflow-hidden">
                        <GenericCrudView viewModel={vm} config={config} />
                  </div>

                  {/* Role Management Dialogs */}
                  <AssignRoleDialog
                        open={assignRoleDialogOpen}
                        onOpenChange={setAssignRoleDialogOpen}
                        admin={selectedAdminForRole}
                        onAssign={onAssignRoleSubmit}
                        isLoading={isAssigningRole}
                  />

                  <ViewRolesDialog
                        open={viewRolesDialogOpen}
                        onOpenChange={setViewRolesDialogOpen}
                        admin={selectedAdminForRole}
                        onRemoveRole={onRemoveRole}
                        isRemoving={isRemovingRole}
                  />
            </div>
      );
}

// ============================================
// Roles Tab - Using GenericCrudView
// ============================================

function TenantRolesTab({
      tenantId,
      tenantName,
}: {
      tenantId: string;
      tenantName: string;
}) {
      const { t } = useI18n();
      // Pass tenantId to filter roles for this specific tenant
      const vm = useRolesViewModel({ tenantId });

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
                                    onClick: (item: Role) => {
                                          // TODO: Open permissions dialog
                                          console.log("Manage permissions for:", item.name);
                                    },
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
            [t]
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
            </div>
      );
}

// ============================================
// Sub-Tenants Tab Content
// ============================================

function SubTenantsTab({
      parentId,
      parentName,
}: {
      parentId: string;
      parentName: string;
}) {
      const { t } = useI18n();

      // Create tree service filtered by parent
      const treeService = useMemo(
            () => createTenantTreeService(systemContainer.tenantRepository),
            []
      );

      // Tree view model
      const viewModel = useTreeViewModel(treeService, {
            queryKey: ["tenants", "tree", parentId],
            itemTypeName: t("tenant.title"),
            itemTypeNamePlural: "tenants",
            getItemDisplayName: (node) => node.name,
            getFormFieldName: (node) => node.name,
            getInitialFormValues: (item, parent) => ({
                  name: item?.name || "",
                  code: item?.code || "",
                  description: item?.description || "",
                  isActive: item?.isActive ?? true,
                  parentId: parent?.id || item?.parentId || parentId,
            }),
            createFormData: (values) => ({
                  name: values.name,
                  code: values.code,
                  description: values.description || undefined,
                  parentId: values.parentId || parentId,
            }),
            updateFormData: (values) => ({
                  name: values.name,
                  description: values.description || undefined,
                  isActive: values.isActive,
            }),
      });

      return (
            <div className="space-y-4">
                  <div className="flex items-center justify-between">
                        <div>
                              <h3 className="text-lg font-semibold">
                                    {t("tenant.manageSubTenants")}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                    {t("tenant.subTenantsDescription") ||
                                          `Child tenants under ${parentName}`}
                              </p>
                        </div>
                  </div>
                  <div className="border rounded-lg p-4">
                        <GenericTreeView
                              viewModel={viewModel}
                              title=""
                              subtitle=""
                              getId={(node) => node.id}
                              getLabel={(node) => (
                                    <>
                                          {node.name}
                                          <span className="text-muted-foreground text-xs ms-2">
                                                ({node.code})
                                          </span>
                                          <Badge
                                                variant={node.isActive ? "success" : "secondary"}
                                                className="ms-2"
                                          >
                                                {node.isActive ? t("tenant.active") : t("tenant.inactive")}
                                          </Badge>
                                    </>
                              )}
                              getChildren={(node) => node.children}
                              renderFormFields={(formValues, setFormValues, editing) => [
                                    {
                                          name: "name",
                                          label: t("tenant.name"),
                                          type: "text",
                                          placeholder: t("tenant.namePlaceholder"),
                                          required: true,
                                    },
                                    ...(!editing
                                          ? [
                                                {
                                                      name: "code",
                                                      label: t("tenant.code"),
                                                      type: "text",
                                                      placeholder: t("tenant.codePlaceholder"),
                                                      required: true,
                                                },
                                          ]
                                          : []),
                                    {
                                          name: "description",
                                          label: t("tenant.descriptionLabel"),
                                          type: "textarea",
                                          placeholder: t("tenant.descriptionPlaceholder"),
                                          required: false,
                                    },
                              ]}
                              resource="tenants"
                        />
                  </div>
            </div>
      );
}

// ============================================
// Settings Tab Content (Placeholder)
// ============================================

function TenantSettingsTab({
      tenantId,
      tenantName,
}: {
      tenantId: string;
      tenantName: string;
}) {
      const { t } = useI18n();

      return (
            <div className="space-y-6">
                  <div>
                        <h3 className="text-lg font-semibold">{t("tenant.settings")}</h3>
                        <p className="text-sm text-muted-foreground">
                              {t("tenant.settingsDescription") ||
                                    `Configuration options for ${tenantName}`}
                        </p>
                  </div>

                  <div className="grid gap-4">
                        {/* Placeholder settings cards */}
                        <Card>
                              <CardHeader>
                                    <CardTitle className="text-base">
                                          {t("tenant.settingsGeneral") || "General Settings"}
                                    </CardTitle>
                                    <CardDescription>
                                          {t("tenant.settingsGeneralDesc") ||
                                                "Basic tenant configuration options"}
                                    </CardDescription>
                              </CardHeader>
                              <CardContent>
                                    <p className="text-sm text-muted-foreground">
                                          {t("tenant.settingsComingSoon") || "Settings coming soon..."}
                                    </p>
                              </CardContent>
                        </Card>

                        <Card>
                              <CardHeader>
                                    <CardTitle className="text-base">
                                          {t("tenant.settingsBranding") || "Branding"}
                                    </CardTitle>
                                    <CardDescription>
                                          {t("tenant.settingsBrandingDesc") ||
                                                "Customize tenant appearance and branding"}
                                    </CardDescription>
                              </CardHeader>
                              <CardContent>
                                    <p className="text-sm text-muted-foreground">
                                          {t("tenant.settingsComingSoon") || "Settings coming soon..."}
                                    </p>
                              </CardContent>
                        </Card>
                  </div>
            </div>
      );
}
