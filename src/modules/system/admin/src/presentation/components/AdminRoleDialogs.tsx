/**
 * Admin Role Dialogs
 * 
 * Components for managing admin role assignments:
 * - AssignRoleDialog: Assign a new role to an admin (with optional tenant scope)
 * - ViewRolesDialog: View and manage current admin roles
 */
"use client";

import { useEffect, useState } from "react";
import { Button } from "@core/ui/button";
import { Label } from "@core/ui/label";
import { Switch } from "@core/ui/switch";
import { Badge } from "@core/ui/badge";
import { GenericModal } from "@core/crud/components/generic-modal";
import { GenericSelect } from "@core/crud/components/generic-select";
import { Loader2, Shield, Trash2, Building2 } from "lucide-react";
import type { Admin, AdminRoleData } from "../../domain/entities/Admin";
import type { AssignRoleRequest } from "../../domain/entities/AdminRequests";
import { useAdminRolesViewModel } from "../viewmodels/useAdminRolesViewModel";
import { useI18n } from "@core/providers/i18n-provider"; // Keep simple hook for simple dialogs

// ========== Assign Role Dialog ==========

interface AssignRoleDialogProps {
      open: boolean;
      onOpenChange: (open: boolean) => void;
      admin: Admin | null;
      onAssign: (request: AssignRoleRequest) => Promise<void>;
      isLoading: boolean;
      tenantId?: string; // Restored prop for explicit scoping
}

export function AssignRoleDialog({
      open,
      onOpenChange,
      admin,
      onAssign,
      isLoading,
      tenantId,
}: AssignRoleDialogProps) {
      // Use the new ViewModel to handle all logic
      const vm = useAdminRolesViewModel(admin, onAssign, async () => { }, tenantId);

      // Reset form when opening
      useEffect(() => {
            if (open) vm.resetAssignForm();
      }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

      const handleSave = async () => {
            await vm.handleAssignSubmit();
            onOpenChange(false);
      };

      return (
            <GenericModal
                  open={open}
                  onOpenChange={onOpenChange}
                  title={vm.t("admin.role.assignTitle") || "Assign Role"}
                  description={(vm.t("admin.role.assignDescription") || "Assign a role to") + " " + (admin?.displayName || "")}
                  size="md"
            >
                  <div className="space-y-4 py-2">
                        {/* Tenant Selection - Moved up to contextually filter roles */}
                        {/* Only show if we don't have a forced effective tenant context */}
                        {!vm.effectiveTenantId && (
                              <div className="space-y-2">
                                    <Label>{vm.t("admin.role.tenantScope") || "Tenant Scope"}</Label>
                                    <GenericSelect
                                          options={vm.tenantOptions}
                                          value={vm.assignTenantId}
                                          onValueChange={(val: string | string[]) => vm.setAssignTenantId(val as string)}
                                          placeholder={vm.t("admin.role.selectTenantPlaceholder") || "Global (All Tenants)"}
                                          type="tree"
                                          loading={vm.isLoadingTenants}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                          {vm.t("admin.role.tenantScopeHelp") || "Determines where this role applies and which roles are available."}
                                    </p>
                              </div>
                        )}

                        {/* Role Selection */}
                        <div className="space-y-2">
                              <Label>{vm.t("admin.role.selectRole") || "Roles"} *</Label>
                              <GenericSelect
                                    options={vm.roleOptions}
                                    value={vm.assignRoleIds}
                                    onValueChange={(val: string | string[]) => vm.setAssignRoleIds(Array.isArray(val) ? val : [val])}
                                    placeholder={vm.t("admin.role.selectRolePlaceholder") || "Select roles..."}
                                    type="multi"
                                    loading={vm.isLoadingRoles}
                              />
                        </div>

                        {/* Inherit Toggle - Show if tenant selected */}
                        {vm.assignTenantId && (
                              <div className="flex items-center justify-between border p-3 rounded-lg">
                                    <div className="space-y-0.5">
                                          <Label htmlFor="inherit" className="cursor-pointer">{vm.t("admin.role.inheritToChildren") || "Inherit to Sub-tenants"}</Label>
                                    </div>
                                    <Switch
                                          id="inherit"
                                          checked={vm.inheritToChildren}
                                          onCheckedChange={vm.setInheritToChildren}
                                    />
                              </div>
                        )}

                        <div className="flex justify-end pt-4 gap-2">
                              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                                    {vm.t("common.cancel") || "Cancel"}
                              </Button>
                              <Button onClick={handleSave} disabled={vm.assignRoleIds.length === 0 || isLoading}>
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {vm.t("admin.role.assign") || "Assign Roles"}
                              </Button>
                        </div>
                  </div>
            </GenericModal>
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
      // ViewModel handles fetching roles
      const vm = useAdminRolesViewModel(admin, async () => { }, onRemoveRole);
      const [removingId, setRemovingId] = useState<string | null>(null);

      const handleRemove = async (role: AdminRoleData) => {
            setRemovingId(role.roleId);
            await onRemoveRole(role.roleId, role.tenantId);
            await vm.refetchRoles();
            setRemovingId(null);
      };

      return (
            <GenericModal
                  open={open}
                  onOpenChange={onOpenChange}
                  title={vm.t("admin.role.viewTitle") || "Assigned Roles"}
                  description={(vm.t("admin.role.viewDescription") || "Start managing roles for") + " " + (admin?.displayName || "")}
                  size="lg"
            >
                  <div className="py-2 min-h-[200px]">
                        {vm.isLoadingCurrentRoles ? (
                              <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                                    <Loader2 className="h-8 w-8 animate-spin mb-2" />
                                    <p>{vm.t("common.loading") || "Loading..."}</p>
                              </div>
                        ) : vm.currentRoles.length === 0 ? (
                              <div className="flex flex-col items-center justify-center py-10 text-muted-foreground border-2 border-dashed rounded-lg">
                                    <Shield className="h-10 w-10 opacity-20 mb-2" />
                                    <p>{vm.t("admin.role.noRoles") || "No roles assigned yet."}</p>
                              </div>
                        ) : (
                              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                                    {vm.currentRoles.map((role, idx) => (
                                          <div key={`${role.roleId}-${role.tenantId}-${idx}`} className="flex items-center justify-between p-3 bg-muted/40 rounded-lg border">
                                                <div className="flex items-center gap-3">
                                                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                            <Shield className="h-4 w-4 text-primary" />
                                                      </div>
                                                      <div>
                                                            <div className="font-medium">{role.roleName}</div>
                                                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                                                  {role.tenantName ? (
                                                                        <span className="flex items-center gap-1 bg-background px-1.5 py-0.5 rounded border shadow-sm">
                                                                              <Building2 className="h-3 w-3" />
                                                                              {role.tenantName}
                                                                        </span>
                                                                  ) : (
                                                                        <Badge variant="outline" className="text-[10px] h-5">Global</Badge>
                                                                  )}
                                                                  {role.inheritToChildren && (
                                                                        <Badge variant="secondary" className="text-[10px] h-5">+ children</Badge>
                                                                  )}
                                                            </div>
                                                      </div>
                                                </div>
                                                <Button
                                                      variant="ghost"
                                                      size="icon"
                                                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                      onClick={() => handleRemove(role)}
                                                      disabled={isRemoving}
                                                >
                                                      {removingId === role.roleId ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                                </Button>
                                          </div>
                                    ))}
                              </div>
                        )}

                        <div className="flex justify-end pt-4 mt-2 border-t">
                              <Button variant="outline" onClick={() => onOpenChange(false)}>
                                    {vm.t("common.close") || "Close"}
                              </Button>
                        </div>
                  </div>
            </GenericModal>
      );
}

// ========== Reset Password Dialog ==========

// This one is simple enough to keep self-contained or could be moved to VM too.
// For consistency, we'll keep state local as it doesn't fetch data, but use GenericModal.
interface ResetPasswordDialogProps {
      open: boolean;
      onOpenChange: (open: boolean) => void;
      admin: Admin | null;
      onResetPassword: (newPassword: string) => Promise<void>;
      isLoading: boolean;
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
            <GenericModal
                  open={open}
                  onOpenChange={onOpenChange}
                  title={t("admin.resetPassword") || "Reset Password"}
                  description={(t("admin.resetPasswordDescription") || "Reset password for") + " " + (admin?.displayName || "")}
                  size="sm"
            >
                  <div className="space-y-4 py-2">
                        <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/40">
                              <div className="space-y-0.5">
                                    <Label htmlFor="useDefault" className="text-sm font-medium">{t("admin.useDefaultPassword") || "Use Default Password"}</Label>
                                    <p className="text-xs text-muted-foreground font-mono bg-background px-1.5 py-0.5 rounded border w-fit">
                                          {defaultPassword}
                                    </p>
                              </div>
                              <Switch
                                    id="useDefault"
                                    checked={useDefault}
                                    onCheckedChange={setUseDefault}
                              />
                        </div>

                        {!useDefault && (
                              <div className="space-y-2">
                                    <Label htmlFor="password">{t("admin.newPassword") || "New Password"} *</Label>
                                    <input
                                          id="password"
                                          type="password"
                                          value={password}
                                          onChange={(e) => setPassword(e.target.value)}
                                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                          minLength={6}
                                          placeholder="Minimum 6 characters"
                                    />
                              </div>
                        )}

                        <div className="flex justify-end pt-2 gap-2">
                              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                                    {t("common.cancel") || "Cancel"}
                              </Button>
                              <Button onClick={handleSubmit} disabled={!isValid || isLoading} variant="destructive">
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {t("admin.resetPassword") || "Reset Password"}
                              </Button>
                        </div>
                  </div>
            </GenericModal>
      );
}
