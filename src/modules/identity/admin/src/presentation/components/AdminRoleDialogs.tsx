// FILE-EXCEPTION: file length
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
import { PasswordInput } from "@core/ui/password-input";
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

/**
 * Presentation UI component rendering the assign role dialog.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function AssignRoleDialog({
  open,
  onOpenChange,
  admin,
  onAssign,
  isLoading,
  tenantId,
}: AssignRoleDialogProps) {
  // Use the new ViewModel to handle all logic
  const vm = useAdminRolesViewModel(admin, onAssign, async () => {}, tenantId);

  // Reset form when opening
  useEffect(() => {
    if (open) {
      vm.resetAssignForm();
    }
  }, [open, vm]);

  const handleSave = async () => {
    await vm.handleAssignSubmit();
    onOpenChange(false);
  };

  return (
    <GenericModal
      open={open}
      onOpenChange={onOpenChange}
      title={vm.t("admin.role.assignTitle") || "Assign Role"}
      description={
        (vm.t("admin.role.assignDescription") || "Assign a role to") +
        " " +
        (admin?.displayName || "")
      }
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
              {vm.t("admin.role.tenantScopeHelp") ||
                "Determines where this role applies and which roles are available."}
            </p>
          </div>
        )}

        {/* Role Selection */}
        <div className="space-y-2">
          <Label>{vm.t("admin.role.selectRole") || "Roles"} *</Label>
          <GenericSelect
            options={vm.roleOptions}
            value={vm.assignRoleIds}
            onValueChange={(val: string | string[]) =>
              vm.setAssignRoleIds(Array.isArray(val) ? val : [val])
            }
            placeholder={vm.t("admin.role.selectRolePlaceholder") || "Select roles..."}
            type="multi"
            loading={vm.isLoadingRoles}
          />
        </div>

        {/* Inherit Toggle - Show if tenant selected */}
        {vm.assignTenantId && (
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="space-y-0.5">
              <Label htmlFor="inherit" className="cursor-pointer">
                {vm.t("admin.role.inheritToChildren") || "Inherit to Sub-tenants"}
              </Label>
            </div>
            <Switch
              id="inherit"
              checked={vm.inheritToChildren}
              onCheckedChange={vm.setInheritToChildren}
            />
          </div>
        )}

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            {vm.t("common.cancel") || "Cancel"}
          </Button>
          <Button onClick={handleSave} loading={isLoading} disabled={vm.assignRoleIds.length === 0}>
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

/**
 * Presentation UI component rendering the view roles dialog.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function ViewRolesDialog({
  open,
  onOpenChange,
  admin,
  onRemoveRole,
  isRemoving,
}: ViewRolesDialogProps) {
  // ViewModel handles fetching roles
  const vm = useAdminRolesViewModel(admin, async () => {}, onRemoveRole);
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
      description={
        (vm.t("admin.role.viewDescription") || "Start managing roles for") +
        " " +
        (admin?.displayName || "")
      }
      size="lg"
    >
      <div className="min-h-[200px] py-2">
        {vm.isLoadingCurrentRoles ? (
          <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
            <Loader2 className="mb-2 h-8 w-8 animate-spin" />
            <p>{vm.t("common.loading") || "Loading..."}</p>
          </div>
        ) : vm.currentRoles.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed py-10 text-muted-foreground">
            <Shield className="mb-2 h-10 w-10 opacity-20" />
            <p>{vm.t("admin.role.noRoles") || "No roles assigned yet."}</p>
          </div>
        ) : (
          <div className="max-h-[400px] space-y-2 overflow-y-auto pr-2">
            {vm.currentRoles.map((role, idx) => (
              <div
                key={`${role.roleId}-${role.tenantId}-${idx}`}
                className="flex items-center justify-between rounded-lg border bg-muted/40 p-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                    <Shield className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium">{role.roleNameEn}</div>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                      {role.tenantName ? (
                        <span className="flex items-center gap-1 rounded border bg-background px-1.5 py-0.5 shadow-sm">
                          <Building2 className="h-3 w-3" />
                          {role.tenantName}
                        </span>
                      ) : (
                        <Badge variant="outline" className="h-5 text-[10px]">
                          Global
                        </Badge>
                      )}
                      {role.inheritToChildren && (
                        <Badge variant="secondary" className="h-5 text-[10px]">
                          + children
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => handleRemove(role)}
                  loading={removingId === role.roleId}
                  disabled={isRemoving && removingId !== role.roleId}
                >
                  {removingId !== role.roleId && <Trash2 className="h-4 w-4" />}
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-2 flex justify-end border-t pt-4">
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

/**
 * Presentation UI component rendering the reset password dialog.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
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

  // Reset form when opening
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setPassword("");
      setUseDefault(true);
    }
  }

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
      description={
        (t("admin.resetPasswordDescription") || "Reset password for") +
        " " +
        (admin?.displayName || "")
      }
      size="sm"
    >
      <div className="space-y-4 py-2">
        <div className="flex items-center justify-between rounded-lg border bg-muted/40 p-3">
          <div className="space-y-0.5">
            <Label htmlFor="useDefault" className="text-sm font-medium">
              {t("admin.useDefaultPassword") || "Use Default Password"}
            </Label>
            <p className="w-fit rounded border bg-background px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
              {defaultPassword}
            </p>
          </div>
          <Switch id="useDefault" checked={useDefault} onCheckedChange={setUseDefault} />
        </div>

        {!useDefault && (
          <div className="space-y-2">
            <Label htmlFor="password">{t("admin.writePassword") || "Write Password"} *</Label>
            <PasswordInput
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              placeholder={t("admin.writePassword") || "Write Password"}
              showStrengthIndicator={true}
            />
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            {t("common.cancel") || "Cancel"}
          </Button>
          <Button
            onClick={handleSubmit}
            loading={isLoading}
            disabled={!isValid}
            variant="destructive"
          >
            {t("admin.resetPassword") || "Reset Password"}
          </Button>
        </div>
      </div>
    </GenericModal>
  );
}
