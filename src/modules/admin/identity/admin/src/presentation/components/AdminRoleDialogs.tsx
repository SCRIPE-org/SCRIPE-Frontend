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
import { Alert, AlertDescription, AlertTitle } from "@core/ui/alert";
import { Button } from "@core/ui/button";
import { Label } from "@core/ui/label";
import { Switch } from "@core/ui/switch";
import { Badge } from "@core/ui/badge";
import { Textarea } from "@core/ui/textarea";
import { GenericModal } from "@core/crud/components/generic-modal";
import { GenericSelect } from "@core/crud/components/generic-select";
import { ConfirmationDialog } from "@core/ui/confirmation-dialog";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { EmptyState } from "@core/ui/empty-state";
import { Shield, Trash2, Building2, MailCheck, AlertTriangle } from "lucide-react";
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

  const { resetAssignForm } = vm;

  // Reset form only when transitioning to open (avoids resetting on every render because `vm` is a new literal)
  useEffect(() => {
    if (open) {
      resetAssignForm();
    }
  }, [open, resetAssignForm]);

  // Assigning a role takes effect immediately — same as ManageRolesDialog and
  // ViewRolesDialog's removal, this now goes through a confirmation step
  // rather than committing on the first click (matches "Transfer Protection"
  // and "Resend setup email" elsewhere in the admin view).
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleConfirmAssign = async () => {
    try {
      await vm.handleAssignSubmit();
      setConfirmOpen(false);
      onOpenChange(false);
    } catch {
      setConfirmOpen(false);
    }
  };

  return (
    <GenericModal
      open={open}
      onOpenChange={onOpenChange}
      title={vm.t("admin.role.assignTitle")}
      description={`${vm.t("admin.role.assignDescription")} ${admin?.displayName || ""}`}
      size="md"
    >
      <div className="space-y-4 py-2">
        {/* Tenant Selection - Moved up to contextually filter roles */}
        {/* Only show if we don't have a forced effective tenant context */}
        {!vm.effectiveTenantId && (
          <div className="space-y-2">
            <Label>{vm.t("admin.role.tenantScope")}</Label>
            <GenericSelect
              options={vm.tenantOptions}
              value={vm.assignTenantId}
              onValueChange={(val: string | string[]) => vm.setAssignTenantId(val as string)}
              placeholder={vm.t("admin.role.selectTenantPlaceholder")}
              type="tree"
              loading={vm.isLoadingTenants}
            />
            <p className="text-xs text-nx-ink-3">{vm.t("admin.role.tenantScopeHelp")}</p>
          </div>
        )}

        {/* Role Selection */}
        <div className="space-y-2">
          <Label>{vm.t("admin.role.selectRole")} *</Label>
          <GenericSelect
            options={vm.roleOptions}
            value={vm.assignRoleIds}
            onValueChange={(val: string | string[]) =>
              vm.setAssignRoleIds(Array.isArray(val) ? val : [val])
            }
            placeholder={vm.t("admin.role.selectRolePlaceholder")}
            type="multi"
            loading={vm.isLoadingRoles}
          />
          <p className="text-xs text-nx-ink-3">{vm.t("roles.priorityHint")}</p>
        </div>

        {/* Inherit Toggle - Show if tenant selected */}
        {vm.assignTenantId && (
          <div className="flex items-center justify-between rounded-nx-lg border border-nx-line p-3">
            <div className="space-y-0.5">
              <Label htmlFor="inherit" className="cursor-pointer">
                {vm.t("admin.role.inheritToChildren")}
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
            {vm.t("common.cancel")}
          </Button>
          <Button
            onClick={() => setConfirmOpen(true)}
            loading={isLoading}
            disabled={vm.assignRoleIds.length === 0}
          >
            {vm.t("admin.role.assign")}
          </Button>
        </div>
      </div>

      <ConfirmationDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        variant="warning"
        title={vm.t("admin.role.assignTitle")}
        description={`${vm.t("admin.role.assignDescription")} ${admin?.displayName || ""}`}
        confirmText={vm.t("admin.role.assign")}
        cancelText={vm.t("common.cancel")}
        onConfirm={handleConfirmAssign}
        isLoading={isLoading}
        preventAutoClose={true}
      />
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
  // Removal used to fire on the first Trash2 click — the same missing
  // confirmation step as AssignRoleDialog/ManageRolesDialog, now closed with
  // the same ConfirmationDialog pattern.
  const [roleToRemove, setRoleToRemove] = useState<AdminRoleData | null>(null);

  const handleRemove = async (role: AdminRoleData) => {
    setRemovingId(role.roleId);
    try {
      await onRemoveRole(role.roleId, role.tenantId);
      await vm.refetchRoles();
      setRoleToRemove(null);
    } catch {
      // Error / Sudo cancellation handled by caller mutation
    } finally {
      setRemovingId(null);
    }
  };

  const handleConfirmRemove = async () => {
    if (!roleToRemove) return;
    await handleRemove(roleToRemove);
  };

  return (
    <GenericModal
      open={open}
      onOpenChange={onOpenChange}
      title={vm.t("admin.role.viewTitle")}
      description={`${vm.t("admin.role.viewDescription")} ${admin?.displayName || ""}`}
      size="lg"
    >
      <div className="min-h-[200px] py-2">
        {vm.isLoadingCurrentRoles ? (
          <LoadingSpinner size="md" />
        ) : vm.currentRoles.length === 0 ? (
          <EmptyState bare icon={Shield} title={vm.t("admin.role.noRoles")} size="sm" />
        ) : (
          <div className="max-h-[400px] space-y-2 overflow-y-auto pe-2">
            {vm.currentRoles.map((role, idx) => (
              <div
                key={`${role.roleId}-${role.tenantId}-${idx}`}
                className="flex items-center justify-between rounded-nx-lg border border-nx-line bg-nx-raised p-3"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-nx-accent-wash"
                    aria-hidden="true"
                  >
                    <Shield className="h-4 w-4 text-nx-accent" />
                  </div>
                  <div>
                    <div className="font-medium">{role.roleNameEn}</div>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-nx-ink-3">
                      {role.tenantName ? (
                        <Badge variant="outline" className="gap-1">
                          <Building2 className="h-3 w-3" aria-hidden="true" />
                          {role.tenantName}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="h-5 text-[10px]">
                          {vm.t("admin.role.global")}
                        </Badge>
                      )}
                      {role.inheritToChildren && (
                        <Badge variant="secondary" className="h-5 text-[10px]">
                          {vm.t("admin.role.plusChildren")}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-nx-ink-3 hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => setRoleToRemove(role)}
                  loading={removingId === role.roleId}
                  disabled={isRemoving && removingId !== role.roleId}
                  aria-label={vm.t("common.delete")}
                >
                  {removingId !== role.roleId && <Trash2 className="h-4 w-4" aria-hidden="true" />}
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-2 flex justify-end border-t border-nx-line pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {vm.t("common.close")}
          </Button>
        </div>
      </div>

      <ConfirmationDialog
        open={!!roleToRemove}
        onOpenChange={(open) => {
          if (!open) setRoleToRemove(null);
        }}
        variant="destructive"
        title={vm.t("admin.role.removeConfirmTitle")}
        description={vm.t("admin.role.removeConfirmDescription", {
          role: roleToRemove?.roleNameEn ?? "",
          admin: admin?.displayName ?? "",
        })}
        confirmText={vm.t("common.delete")}
        cancelText={vm.t("common.cancel")}
        onConfirm={handleConfirmRemove}
        isLoading={isRemoving}
        preventAutoClose={true}
      />
    </GenericModal>
  );
}

// ========== Send Password Reset Link Dialog ==========

interface ResetPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  admin: Admin | null;
  onResetPassword: (reason?: string) => Promise<void>;
  isLoading: boolean;
}

/**
 * Presentation UI component rendering the "Send Password Reset Link" confirmation dialog.
 * Administrators never set, view, or generate another user's password; this triggers
 * a time-limited, single-use email recovery link and revokes all active sessions.
 */
export function ResetPasswordDialog({
  open,
  onOpenChange,
  admin,
  onResetPassword,
  isLoading,
}: ResetPasswordDialogProps) {
  const { t } = useI18n();
  const [reason, setReason] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setReason("");
      setSubmitError(null);
    }
  }

  const trimmedReason = reason.trim();
  const isReasonTooLong = trimmedReason.length > 500;
  const hasEmail = Boolean(admin?.email && admin.email.trim().length > 0);

  const handleSubmit = async () => {
    if (isReasonTooLong) {
      setSubmitError(t("admin.validation.reasonMax"));
      return;
    }
    setSubmitError(null);
    try {
      await onResetPassword(trimmedReason || undefined);
      onOpenChange(false);
    } catch {
      // Keep dialog open on error or Sudo step-up cancellation (handled by caller mutation)
    }
  };

  return (
    <GenericModal
      open={open}
      onOpenChange={onOpenChange}
      title={t("admin.sendPasswordResetLink")}
      description={`${t("admin.sendPasswordResetLinkDesc")} ${admin?.displayName || admin?.username || ""}`}
      size="md"
    >
      <div className="space-y-4 py-2">
        {submitError && (
          <Alert variant="destructive">
            <AlertTriangle aria-hidden="true" />
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        )}

        <Alert variant="warning">
          <MailCheck aria-hidden="true" />
          <AlertTitle>{t("admin.sendPasswordResetLinkImpactTitle")}</AlertTitle>
          <AlertDescription className="space-y-1.5">
            <p>{t("admin.sendPasswordResetLinkImpactDesc")}</p>
            {hasEmail ? (
              <p className="font-medium text-nx-ink">
                {t("admin.sendPasswordResetLinkTargetEmail", { email: admin?.email ?? "" })}
              </p>
            ) : (
              <p className="font-medium text-destructive">
                {t("admin.sendPasswordResetLinkNoEmailWarning")}
              </p>
            )}
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <Label htmlFor="admin-reset-password-reason">{t("admin.auditReasonLabel")}</Label>
          <Textarea
            id="admin-reset-password-reason"
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              setSubmitError(null);
            }}
            maxLength={500}
            rows={3}
            disabled={isLoading}
            placeholder={t("admin.auditReasonPlaceholder")}
          />
          <p className="text-xs text-nx-ink-3">{t("admin.auditReasonHint")}</p>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            {t("common.cancel")}
          </Button>
          <Button
            onClick={handleSubmit}
            loading={isLoading}
            disabled={isLoading || isReasonTooLong || !hasEmail}
            variant="destructive"
          >
            {t("admin.sendPasswordResetLinkCta")}
          </Button>
        </div>
      </div>
    </GenericModal>
  );
}
