/**
 * Admin Role Dialogs
 * 
 * Components for managing admin role assignments:
 * - AssignRoleDialog: Assign a new role to an admin (with optional tenant scope)
 * - ViewRolesDialog: View and manage current admin roles
 */
"use client";

import { useState, useEffect } from "react";
import { Button } from "@core/ui/button";
import { Label } from "@core/ui/label";
import { Switch } from "@core/ui/switch";
import { Badge } from "@core/ui/badge";
import {
      Dialog,
      DialogContent,
      DialogHeader,
      DialogTitle,
      DialogDescription,
      DialogFooter,
} from "@core/ui/dialog";
import { GenericSelect, GenericSelectOption } from "@core/crud/components/generic-select";
import { useQuery } from "@tanstack/react-query";
import { systemContainer } from "@modules/system/di";
import { Loader2, Shield, Trash2, Building2 } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import type { Admin, AdminRoleData } from "../../domain/entities/Admin";
import type { AssignRoleRequest } from "../../domain/entities/AdminRequests";

// ========== Assign Role Dialog ==========

interface AssignRoleDialogProps {
      open: boolean;
      onOpenChange: (open: boolean) => void;
      admin: Admin | null;
      onAssign: (request: AssignRoleRequest) => Promise<void>;
      isLoading: boolean;
      /** If provided, roles will be filtered by this tenant and tenant selector will be hidden */
      tenantId?: string;
}

export function AssignRoleDialog({
      open,
      onOpenChange,
      admin,
      onAssign,
      isLoading,
      tenantId,
}: AssignRoleDialogProps) {
      const { t } = useI18n();
      const { roleRepository, tenantRepository } = systemContainer;

      // Form state
      const [selectedRoleId, setSelectedRoleId] = useState<string>("");
      const [selectedTenantId, setSelectedTenantId] = useState<string>("");
      const [inheritToChildren, setInheritToChildren] = useState(false);

      // Fetch roles for dropdown - filter by tenant if in tenant context
      const { data: rolesData, isLoading: isLoadingRoles } = useQuery({
            queryKey: ["roles-for-select", tenantId],
            queryFn: () => roleRepository.getAll({
                  page: 1,
                  pageSize: 100,
                  tenantId: tenantId || undefined
            }),
            enabled: open,
      });

      // Fetch tenants for dropdown (only needed if not in tenant context)
      const { data: tenantsTree, isLoading: isLoadingTenants } = useQuery({
            queryKey: ["tenants-tree-for-select"],
            queryFn: () => tenantRepository.getTree(),
            enabled: open && !tenantId, // Only fetch if no tenant context
      });

      // Transform roles to select options
      const roleOptions: GenericSelectOption[] = (rolesData?.items ?? []).map((role) => ({
            value: role.id,
            label: role.name,
            description: role.description,
      }));

      // Transform tenants tree to select options
      const flattenTenants = (
            nodes: any[],
            level = 0
      ): GenericSelectOption[] => {
            return nodes.flatMap((node) => [
                  {
                        value: node.id,
                        label: node.name,
                        level,
                        children: node.children?.length > 0
                              ? flattenTenants(node.children, level + 1)
                              : undefined,
                  },
                  ...(node.children ? flattenTenants(node.children, level + 1) : []),
            ]);
      };

      const tenantOptions: GenericSelectOption[] = [
            { value: "", label: t("admin.role.globalScope") || "Global (All Tenants)" },
            ...(Array.isArray(tenantsTree) ? flattenTenants(tenantsTree) : []),
      ];

      // Reset form when dialog opens
      useEffect(() => {
            if (open) {
                  setSelectedRoleId("");
                  // Auto-select tenant if in tenant context
                  setSelectedTenantId(tenantId || "");
                  setInheritToChildren(false);
            }
      }, [open, tenantId]);

      const handleSubmit = async () => {
            if (!selectedRoleId) return;

            const request: AssignRoleRequest = {
                  roleId: selectedRoleId,
                  tenantId: selectedTenantId || undefined,
                  inheritToChildren: selectedTenantId ? inheritToChildren : undefined,
            };

            await onAssign(request);
            onOpenChange(false);
      };

      return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                  <DialogContent className="max-w-md">
                        <DialogHeader>
                              <DialogTitle>{t("admin.role.assignTitle") || "Assign Role"}</DialogTitle>
                              <DialogDescription>
                                    {t("admin.role.assignDescription") || "Assign a role to"}{" "}
                                    <strong>{admin?.displayName}</strong>
                              </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                              {/* Role Selection */}
                              <div className="space-y-2">
                                    <Label>{t("admin.role.selectRole") || "Role"} *</Label>
                                    <GenericSelect
                                          options={roleOptions}
                                          value={selectedRoleId}
                                          onValueChange={(val: string | string[]) => setSelectedRoleId(val as string)}
                                          placeholder={t("admin.role.selectRolePlaceholder") || "Select a role..."}
                                          type="searchable"
                                          loading={isLoadingRoles}
                                    />
                              </div>

                              {/* Tenant Selection (optional) - Hidden when in tenant context */}
                              {!tenantId && (
                                    <div className="space-y-2">
                                          <Label>{t("admin.role.tenantScope") || "Tenant Scope"}</Label>
                                          <GenericSelect
                                                options={tenantOptions}
                                                value={selectedTenantId}
                                                onValueChange={(val: string | string[]) => setSelectedTenantId(val as string)}
                                                placeholder={t("admin.role.selectTenantPlaceholder") || "Global (applies to all)"}
                                                type="tree"
                                                loading={isLoadingTenants}
                                          />
                                          <p className="text-xs text-muted-foreground">
                                                {t("admin.role.tenantScopeHelp") ||
                                                      "Leave empty for global access, or select a tenant to limit scope."}
                                          </p>
                                    </div>
                              )}

                              {/* Inherit to Children (only if tenant selected) */}
                              {selectedTenantId && (
                                    <div className="flex items-center justify-between">
                                          <div className="space-y-0.5">
                                                <Label htmlFor="inherit">{t("admin.role.inheritToChildren") || "Inherit to Sub-tenants"}</Label>
                                                <p className="text-xs text-muted-foreground">
                                                      {t("admin.role.inheritHelp") ||
                                                            "Role applies to all child tenants as well."}
                                                </p>
                                          </div>
                                          <Switch
                                                id="inherit"
                                                checked={inheritToChildren}
                                                onCheckedChange={setInheritToChildren}
                                          />
                                    </div>
                              )}
                        </div>

                        <DialogFooter>
                              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                                    {t("common.cancel") || "Cancel"}
                              </Button>
                              <Button onClick={handleSubmit} disabled={!selectedRoleId || isLoading}>
                                    {isLoading ? (
                                          <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                {t("common.assigning") || "Assigning..."}
                                          </>
                                    ) : (
                                          t("admin.role.assign") || "Assign Role"
                                    )}
                              </Button>
                        </DialogFooter>
                  </DialogContent>
            </Dialog>
      );
}

// ========== View Roles Dialog ==========

interface ViewRolesDialogProps {
      open: boolean;
      onOpenChange: (open: boolean) => void;
      admin: Admin | null;
      onRemoveRole: (roleId: string, tenantId?: string) => Promise<void>;
      isRemoving: boolean;
}

export function ViewRolesDialog({
      open,
      onOpenChange,
      admin,
      onRemoveRole,
      isRemoving,
}: ViewRolesDialogProps) {
      const { t } = useI18n();
      const { adminRepository } = systemContainer;
      const [removingRoleId, setRemovingRoleId] = useState<string | null>(null);

      // Fetch admin roles from API when dialog opens
      const { data: roles = [], isLoading, refetch } = useQuery({
            queryKey: ["admin-roles", admin?.id],
            queryFn: async (): Promise<AdminRoleData[]> => {
                  if (!admin?.id) return [];
                  return adminRepository.getRoles(admin.id);
            },
            enabled: open && !!admin?.id,
      });

      const handleRemove = async (role: AdminRoleData) => {
            setRemovingRoleId(role.roleId);
            try {
                  await onRemoveRole(role.roleId, role.tenantId);
                  // Refetch roles after removal
                  await refetch();
            } finally {
                  setRemovingRoleId(null);
            }
      };

      return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                  <DialogContent className="max-w-lg">
                        <DialogHeader>
                              <DialogTitle>{t("admin.role.viewTitle") || "Assigned Roles"}</DialogTitle>
                              <DialogDescription>
                                    {t("admin.role.viewDescription") || "Roles assigned to"}{" "}
                                    <strong>{admin?.displayName}</strong>
                              </DialogDescription>
                        </DialogHeader>

                        <div className="py-4">
                              {isLoading ? (
                                    <div className="text-center py-8">
                                          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                                          <p className="mt-2 text-muted-foreground">{t("common.loading") || "Loading..."}</p>
                                    </div>
                              ) : roles.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                          <Shield className="mx-auto h-12 w-12 opacity-50 mb-2" />
                                          <p>{t("admin.role.noRoles") || "No roles assigned yet."}</p>
                                    </div>
                              ) : (
                                    <div className="space-y-2">
                                          {roles.map((role, index) => (
                                                <div
                                                      key={`${role.roleId}-${role.tenantId || "global"}-${index}`}
                                                      className="flex items-center justify-between p-3 border rounded-lg bg-muted/30"
                                                >
                                                      <div className="flex items-center gap-3">
                                                            <Shield className="h-5 w-5 text-primary" />
                                                            <div>
                                                                  <div className="font-medium">{role.roleName}</div>
                                                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                                        {role.tenantName ? (
                                                                              <span className="flex items-center gap-1">
                                                                                    <Building2 className="h-3 w-3" />
                                                                                    {role.tenantName}
                                                                                    {role.inheritToChildren && (
                                                                                          <Badge variant="outline" className="text-[10px] px-1">
                                                                                                + children
                                                                                          </Badge>
                                                                                    )}
                                                                              </span>
                                                                        ) : (
                                                                              <Badge variant="secondary" className="text-[10px]">
                                                                                    {t("admin.role.global") || "Global"}
                                                                              </Badge>
                                                                        )}
                                                                        {role.expiresAt && (
                                                                              <span>
                                                                                    Expires: {new Date(role.expiresAt).toLocaleDateString()}
                                                                              </span>
                                                                        )}
                                                                  </div>
                                                            </div>
                                                      </div>
                                                      <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-destructive hover:text-destructive"
                                                            onClick={() => handleRemove(role)}
                                                            disabled={isRemoving}
                                                      >
                                                            {removingRoleId === role.roleId ? (
                                                                  <Loader2 className="h-4 w-4 animate-spin" />
                                                            ) : (
                                                                  <Trash2 className="h-4 w-4" />
                                                            )}
                                                      </Button>
                                                </div>
                                          ))}
                                    </div>
                              )}
                        </div>

                        <DialogFooter>
                              <Button variant="outline" onClick={() => onOpenChange(false)}>
                                    {t("common.close") || "Close"}
                              </Button>
                        </DialogFooter>
                  </DialogContent>
            </Dialog>
      );
}

// ========== Reset Password Dialog ==========

interface ResetPasswordDialogProps {
      open: boolean;
      onOpenChange: (open: boolean) => void;
      admin: Admin | null;
      onResetPassword: (newPassword: string) => Promise<void>;
      isLoading: boolean;
      /** Default password to use - displayed as placeholder */
      defaultPassword?: string;
}

export function ResetPasswordDialog({
      open,
      onOpenChange,
      admin,
      onResetPassword,
      isLoading,
      defaultPassword = "P@ssw0rd",
}: ResetPasswordDialogProps) {
      const { t } = useI18n();
      const [password, setPassword] = useState("");
      const [useDefault, setUseDefault] = useState(true);

      // Reset form when dialog opens
      useEffect(() => {
            if (open) {
                  setPassword("");
                  setUseDefault(true);
            }
      }, [open]);

      const handleSubmit = async () => {
            const newPassword = useDefault ? defaultPassword : password;
            if (!newPassword) return;

            await onResetPassword(newPassword);
            onOpenChange(false);
      };

      const isValid = useDefault || password.length >= 6;

      return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                  <DialogContent className="max-w-md">
                        <DialogHeader>
                              <DialogTitle>{t("admin.resetPassword") || "Reset Password"}</DialogTitle>
                              <DialogDescription>
                                    {t("admin.resetPasswordDescription") || "Reset password for"}{" "}
                                    <strong>{admin?.displayName}</strong>
                              </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                              {/* Default Password Toggle */}
                              <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
                                    <div className="space-y-0.5">
                                          <Label htmlFor="useDefault">{t("admin.useDefaultPassword") || "Use Default Password"}</Label>
                                          <p className="text-xs text-muted-foreground">
                                                {t("admin.defaultPasswordHint") || `Set password to "${defaultPassword}"`}
                                          </p>
                                    </div>
                                    <Switch
                                          id="useDefault"
                                          checked={useDefault}
                                          onCheckedChange={setUseDefault}
                                    />
                              </div>

                              {/* Custom Password Input */}
                              {!useDefault && (
                                    <div className="space-y-2">
                                          <Label htmlFor="password">{t("admin.newPassword") || "New Password"} *</Label>
                                          <input
                                                id="password"
                                                type="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder={t("admin.enterNewPassword") || "Enter new password..."}
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                                minLength={6}
                                          />
                                          {password && password.length < 6 && (
                                                <p className="text-xs text-destructive">
                                                      {t("admin.passwordMinLength") || "Password must be at least 6 characters"}
                                                </p>
                                          )}
                                    </div>
                              )}
                        </div>

                        <DialogFooter>
                              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                                    {t("common.cancel") || "Cancel"}
                              </Button>
                              <Button onClick={handleSubmit} disabled={!isValid || isLoading} variant="destructive">
                                    {isLoading ? (
                                          <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                {t("common.resetting") || "Resetting..."}
                                          </>
                                    ) : (
                                          t("admin.resetPassword") || "Reset Password"
                                    )}
                              </Button>
                        </DialogFooter>
                  </DialogContent>
            </Dialog>
      );
}
