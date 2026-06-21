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
import { Loader2, Shield } from "lucide-react";
import type { Admin } from "../../domain/entities/Admin";
import { useManageRolesViewModel } from "../viewmodels/useManageRolesViewModel";

interface ManageRolesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  admin: Admin | null;
  tenantId?: string; // Explicit tenant context (e.g., from drill-down)
}

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
          label: language === "ar" ? role.nameAr : role.nameEn,
          description: language === "ar" ? role.descriptionAr : role.descriptionEn,
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
      title={t("admin.role.manageTitle") || "Manage Roles"}
      description={`${t("admin.role.manageDescription") || "Manage roles for"} ${admin?.displayName || ""}`}
      size="md"
    >
      <div className="space-y-4 py-2">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
            <Loader2 className="mb-2 h-8 w-8 animate-spin" />
            <p>{t("common.loading") || "Loading..."}</p>
          </div>
        ) : (
          <>
            {/* Scope Indicator (Informational Only) */}
            <div className="flex justify-between rounded bg-muted/50 p-2 text-xs text-muted-foreground">
              <span>{t("admin.role.currentScope") || "Current Scope"}:</span>
              <span className="font-medium text-foreground">
                {scopeTenantId
                  ? t("admin.role.tenantWrapper") || "Tenant"
                  : t("admin.role.systemScope") || "System / Global"}
              </span>
            </div>

            {/* Role Multi-Selection */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                {t("admin.role.selectRoles") || "Roles"} *
              </Label>
              <GenericSelect
                options={roleOptions}
                value={selectedRoleIds}
                onValueChange={(val: string | string[]) =>
                  setSelectedRoleIds(Array.isArray(val) ? val : [val])
                }
                placeholder={t("admin.role.selectRolePlaceholder") || "Select roles..."}
                type="multi"
              />
              <p className="text-xs text-muted-foreground">
                {t("admin.role.selectRolesHelp") ||
                  "Selection replaces existing roles in this scope."}
              </p>
            </div>

            {/* Inherit Toggle (only if tenant context) */}
            {scopeTenantId && (
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <Label htmlFor="inherit" className="cursor-pointer">
                    {t("admin.role.inheritToChildren") || "Inherit to Sub-tenants"}
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {t("admin.role.inheritToChildrenHelp") || "Apply roles to child tenants too."}
                  </p>
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

        <div className="mt-4 flex justify-end gap-2 border-t pt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            {t("common.cancel") || "Cancel"}
          </Button>
          <Button onClick={handleSave} loading={isSubmitting} disabled={isLoading}>
            {t("admin.role.saveRoles") || "Save Roles"}
          </Button>
        </div>
      </div>
    </GenericModal>
  );
}
