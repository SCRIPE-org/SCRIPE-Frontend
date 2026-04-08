/**
 * Manage Roles Dialog
 *
 * Unified dialog for assigning/removing roles using multi-select.
 * Uses "Nuke & Pave" pattern via syncRoles endpoint.
 * Enforces "Strict Context" (no dropdown) and fixes ID mismatch via Code matching.
 */
"use client";

import { useEffect, useState, useMemo } from "react";
import { Button } from "@core/ui/button";
import { Label } from "@core/ui/label";
import { Switch } from "@core/ui/switch";
import { GenericModal } from "@core/crud/components/generic-modal";
import { GenericSelect, type GenericSelectOption } from "@core/crud/components/generic-select";
import { Loader2, Shield } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { systemContainer } from "@/modules/identity/di";
import { useI18n } from "@core/providers/i18n-provider";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import type { Admin } from "../../domain/entities/Admin";
import type { SyncRoleAssignment } from "../../domain/interfaces/IAdminRepository";

interface ManageRolesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  admin: Admin | null;
  tenantId?: string; // Explicit tenant context (e.g., from drill-down)
}

export function ManageRolesDialog({ open, onOpenChange, admin, tenantId }: ManageRolesDialogProps) {
  const { t, language } = useI18n();
  const toast = useEnhancedToast();
  const queryClient = useQueryClient();
  const { roleRepository, adminRepository } = systemContainer;

  // Form state
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);
  const [inheritToChildren, setInheritToChildren] = useState(false);

  // Strict Scope Calculation
  // If tenantId is passed (Drill-Down), use it.
  // Else if admin has a tenantId (Tenant Admin), use it.
  // Else (Global Admin in Global Context), use empty string (Global Scope).
  const scopeTenantId = tenantId || admin?.tenantId || "";

  // Fetch available roles for the VALID scope
  const { data: rolesData, isLoading: isLoadingRoles } = useQuery({
    queryKey: ["roles-for-manage", scopeTenantId],
    queryFn: () => scopeTenantId
      ? roleRepository.getAll({
        page: 1,
        pageSize: 100,
        tenantId: scopeTenantId,
        strict: true,
      })
      : roleRepository.getMyTenantRoles({
        page: 1,
        pageSize: 100,
      }),
    enabled: open && !!admin,
  });

  // Fetch current roles
  const { data: currentRoles, isLoading: isLoadingCurrentRoles } = useQuery({
    queryKey: ["admin-roles", admin?.id],
    queryFn: async () => {
      if (!admin?.id) return [];
      return adminRepository.getRoles(admin.id);
    },
    enabled: open && !!admin?.id,
  });

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
  // This fixes the validation/duplication bug caused by randomized ID encryption
  useEffect(() => {
    if (open && currentRoles && rolesData?.items) {
      // 1. Filter current roles to only those in current scope
      const scopedCurrentRoles = currentRoles.filter((r) => (r.tenantId || "") === scopeTenantId);

      // 2. Find matching Available Role ID by comparing CODES
      const matchedIds: string[] = [];
      scopedCurrentRoles.forEach((cr) => {
        const match = rolesData.items.find((ar) => ar.code === cr.roleCode);
        if (match) {
          matchedIds.push(match.id);
        }
      });

      setSelectedRoleIds(matchedIds);
      setInheritToChildren(scopedCurrentRoles.some((r) => r.inheritToChildren));
    } else if (open) {
      // Reset if no data yet (or empty)
      // But wait for data to load to avoid clearing briefly?
      // No, React Query handles loading state.
      // Also reset for a fresh open
      if (!currentRoles && !rolesData) {
        setSelectedRoleIds([]);
        setInheritToChildren(false);
      }
    }
  }, [open, currentRoles, rolesData, scopeTenantId]);

  // Sync roles mutation
  const syncMutation = useMutation({
    mutationFn: async () => {
      if (!admin?.id) throw new Error("No admin selected");

      // We only send assignments for the CURRENT SCOPE.
      // The backend "RemoveRolesByScopeAsync" handles preserving other scopes.
      const assignments: SyncRoleAssignment[] = selectedRoleIds.map((roleId) => ({
        roleId,
        tenantId: scopeTenantId || undefined,
        inheritToChildren: scopeTenantId ? inheritToChildren : undefined,
      }));

      await adminRepository.syncRoles(admin.id, assignments, scopeTenantId || undefined);
    },
    onSuccess: () => {
      toast.success({ title: t("admin.role.syncSuccess") || "Roles updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["admin-roles", admin?.id] });
      queryClient.invalidateQueries({ queryKey: ["admins"] });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error({ title: error?.message || t("common.error") || "Failed to update roles" });
    },
  });

  const handleSave = () => {
    syncMutation.mutate();
  };

  const isLoading = isLoadingRoles || isLoadingCurrentRoles;

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
            disabled={syncMutation.isPending}
          >
            {t("common.cancel") || "Cancel"}
          </Button>
          <Button onClick={handleSave} disabled={isLoading || syncMutation.isPending}>
            {syncMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t("admin.role.saveRoles") || "Save Roles"}
          </Button>
        </div>
      </div>
    </GenericModal>
  );
}
