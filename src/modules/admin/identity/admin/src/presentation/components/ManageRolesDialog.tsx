/* eslint-disable unused-imports/no-unused-vars */
/**
 * Manage Roles Dialog
 *
 * Unified dialog for assigning/removing roles using multi-select.
 * Uses "Nuke & Pave" pattern via syncRoles endpoint.
 * Enforces "Strict Context" (no dropdown) and fixes ID mismatch via Code matching.
 */
"use client";

import { useState, useMemo } from "react";
import { Button } from "@core/ui/button";
import { Label } from "@core/ui/label";
import { Switch } from "@core/ui/switch";
import { GenericModal } from "@core/crud/components/generic-modal";
import { GenericSelect, type GenericSelectOption } from "@core/crud/components/generic-select";
import { ConfirmationDialog } from "@core/ui/confirmation-dialog";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { Shield } from "lucide-react";
import type { Admin } from "../../domain/entities/Admin";
import { useManageRolesViewModel } from "../viewmodels/useManageRolesViewModel";

interface ManageRolesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  admin: Admin | null;
  tenantId?: string; // Explicit tenant context (e.g., from drill-down)
}

/**
 * Presentation UI component rendering the manage roles dialog.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function ManageRolesDialog({ open, onOpenChange, admin, tenantId }: ManageRolesDialogProps) {
  // Strict Scope Calculation
  const scopeTenantId = tenantId || admin?.tenantId || "";

  const vm = useManageRolesViewModel({ adminId: admin?.id, scopeTenantId, open });
  const { t, rolesData, currentRoles, resolvedExtraRoles, isLoading, isSubmitting } = vm;

  // Form state
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);
  const [inheritToChildren, setInheritToChildren] = useState(false);
  // Assigning/removing roles takes effect immediately on Save (nuke & pave) —
  // gate it behind the same confirmation step as "Transfer Protection" and
  // "Resend setup email" elsewhere in this view (F-69).
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Transform available roles to options. Merges in roles resolved by code
  // (see useManageRolesViewModel) that fell outside the first fetched page —
  // otherwise a role the admin already has beyond page 1 would render as a
  // raw, unlabelled id, or be missing entirely (F-68).
  const roleOptions: GenericSelectOption[] = useMemo(() => {
    type RoleOptionSource = NonNullable<typeof rolesData>["items"][number];
    const byId = new Map<string, RoleOptionSource>();
    (rolesData?.items ?? [])
      .filter((role) => (role.tenantId || "") === scopeTenantId) // Double check strict scope
      .forEach((role) => byId.set(role.id, role));
    resolvedExtraRoles.forEach((role) => {
      if (!byId.has(role.id)) byId.set(role.id, role);
    });
    return Array.from(byId.values())
      .sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0))
      .map((role) => vm.mapRoleOption(role));
  }, [rolesData, resolvedExtraRoles, scopeTenantId, vm]);

  // Logic: Map Current Roles to Available Options using ROLE CODE — hydrate once per open + target scope so background refetches never wipe unsaved role picks.
  const targetHydrationKey =
    open && currentRoles && rolesData?.items ? `${admin?.id ?? ""}:${scopeTenantId}` : null;
  const [hydratedScopeKey, setHydratedScopeKey] = useState<string | null>(null);

  if (!open && hydratedScopeKey !== null) {
    setHydratedScopeKey(null);
    setSelectedRoleIds([]);
    setInheritToChildren(false);
  } else if (open && targetHydrationKey && hydratedScopeKey !== targetHydrationKey && !isLoading) {
    setHydratedScopeKey(targetHydrationKey);
    const scopedCurrentRoles = (currentRoles ?? []).filter((r) => (r.tenantId || "") === scopeTenantId);
    const matchedIds: string[] = [];
    scopedCurrentRoles.forEach((cr) => {
      const match = rolesData?.items.find((ar) => ar.code === cr.roleCode);
      if (match) matchedIds.push(match.id);
    });
    resolvedExtraRoles.forEach((role) => matchedIds.push(role.id));
    setSelectedRoleIds(matchedIds);
    setInheritToChildren(scopedCurrentRoles.some((r) => r.inheritToChildren));
  }

  const handleSave = () => {
    setConfirmOpen(true);
  };

  const handleConfirmSave = async () => {
    try {
      await vm.syncRoles(selectedRoleIds, inheritToChildren, onOpenChange);
    } finally {
      setConfirmOpen(false);
    }
  };

  return (
    <GenericModal
      open={open}
      onOpenChange={onOpenChange}
      title={t("admin.role.manageTitle")}
      description={`${t("admin.role.manageDescription")} ${admin?.displayName || ""}`}
      size="md"
    >
      <div className="space-y-4 py-2">
        {isLoading ? (
          <LoadingSpinner size="md" />
        ) : (
          <>
            {/* Scope Indicator (Informational Only) */}
            <div className="flex justify-between rounded-nx-sm bg-nx-raised p-2 text-xs text-nx-ink-2">
              <span>{t("admin.role.currentScope")}:</span>
              <span className="font-medium text-nx-ink">
                {scopeTenantId ? t("admin.role.tenantWrapper") : t("admin.role.systemScope")}
              </span>
            </div>

            {/* Role Multi-Selection */}
            <div className="space-y-2">
              <Label id="manage-roles-select-label" className="flex items-center gap-2">
                <Shield className="h-4 w-4" aria-hidden="true" />
                {t("admin.role.selectRoles")} *
              </Label>
              <GenericSelect
                options={roleOptions}
                value={selectedRoleIds}
                onValueChange={(val: string | string[]) =>
                  setSelectedRoleIds(Array.isArray(val) ? val : [val])
                }
                placeholder={t("admin.role.selectRolePlaceholder")}
                aria-labelledby="manage-roles-select-label"
                type="multi"
                // Server-side search so a role beyond the first fetched page
                // can actually be found (and kept or removed) instead of
                // being invisible in the picker (F-68).
                searchType="server"
                onServerSearch={vm.searchRoles}
              />
              <p className="text-xs text-nx-ink-3">{t("admin.role.selectRolesHelp")}</p>
              <p className="text-xs text-nx-ink-3">{t("roles.priorityHint")}</p>
            </div>

            {/* Inherit Toggle (only if tenant context) */}
            {scopeTenantId && (
              <div className="flex items-center justify-between rounded-nx-lg border border-nx-line p-3">
                <div className="space-y-0.5">
                  <Label htmlFor="inherit" className="cursor-pointer">
                    {t("admin.role.inheritToChildren")}
                  </Label>
                  <p className="text-xs text-nx-ink-3">{t("admin.role.inheritToChildrenHelp")}</p>
                </div>
                <Switch
                  id="inherit"
                  checked={inheritToChildren}
                  onCheckedChange={setInheritToChildren}
                />
              </div>
            )}
          </>
        )}

        <div className="mt-4 flex justify-end gap-2 border-t border-nx-line pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            {t("common.cancel")}
          </Button>
          <Button onClick={handleSave} loading={isSubmitting} disabled={isLoading}>
            {t("admin.role.saveRoles")}
          </Button>
        </div>
      </div>

      <ConfirmationDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        variant="warning"
        title={t("admin.role.saveRoles")}
        description={`${t("admin.role.manageDescription")} ${admin?.displayName || ""}`}
        confirmText={t("admin.role.saveRoles")}
        cancelText={t("common.cancel")}
        onConfirm={handleConfirmSave}
        isLoading={isSubmitting}
        preventAutoClose={true}
      />
    </GenericModal>
  );
}
