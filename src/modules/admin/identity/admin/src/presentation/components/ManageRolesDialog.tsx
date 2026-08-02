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
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { Shield } from "lucide-react";
import { resolveBilingualLabel } from "@core/common/utils";
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
  const { t, language, rolesData, currentRoles, isLoading, isSubmitting } = vm;

  // Form state
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);
  const [inheritToChildren, setInheritToChildren] = useState(false);

  // Transform available roles to options
  const roleOptions: GenericSelectOption[] = useMemo(
    () =>
      (rolesData?.items ?? [])
        .filter((role) => (role.tenantId || "") === scopeTenantId) // Double check strict scope
        .map((role) => ({
          value: role.id,
          label: resolveBilingualLabel(role.nameEn, role.nameAr, language),
          description: resolveBilingualLabel(
            role.descriptionEn ?? "",
            role.descriptionAr ?? "",
            language
          ),
        })),
    [rolesData, language, scopeTenantId]
  );

  // Logic: Map Current Roles to Available Options using ROLE CODE
  const rolesLen = rolesData?.items?.length ?? 0;
  const currentLen = currentRoles?.length ?? -1;

  const [prevOpen, setPrevOpen] = useState(open);
  const [prevCurrentRoles, setPrevCurrentRoles] = useState(currentRoles);
  const [prevRolesData, setPrevRolesData] = useState(rolesData);
  const [prevScopeTenantId, setPrevScopeTenantId] = useState(scopeTenantId);

  if (
    open !== prevOpen ||
    currentRoles !== prevCurrentRoles ||
    rolesData !== prevRolesData ||
    scopeTenantId !== prevScopeTenantId
  ) {
    setPrevOpen(open);
    setPrevCurrentRoles(currentRoles);
    setPrevRolesData(rolesData);
    setPrevScopeTenantId(scopeTenantId);

    if (open && currentRoles && rolesData?.items) {
      const scopedCurrentRoles = currentRoles.filter((r) => (r.tenantId || "") === scopeTenantId);
      const matchedIds: string[] = [];
      scopedCurrentRoles.forEach((cr) => {
        const match = rolesData.items.find((ar) => ar.code === cr.roleCode);
        if (match) matchedIds.push(match.id);
      });
      setSelectedRoleIds(matchedIds);
      setInheritToChildren(scopedCurrentRoles.some((r) => r.inheritToChildren));
    } else if (open && !currentRoles && !rolesData) {
      setSelectedRoleIds([]);
      setInheritToChildren(false);
    }
  }

  const handleSave = () => {
    vm.syncRoles(selectedRoleIds, inheritToChildren, onOpenChange);
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
              <Label className="flex items-center gap-2">
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
                type="multi"
              />
              <p className="text-xs text-nx-ink-3">{t("admin.role.selectRolesHelp")}</p>
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
    </GenericModal>
  );
}
