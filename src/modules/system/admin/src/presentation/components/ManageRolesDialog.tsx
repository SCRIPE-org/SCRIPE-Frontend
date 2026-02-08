/**
 * Manage Roles Dialog
 *
 * Unified dialog for assigning/removing roles using multi-select.
 * Uses "Nuke & Pave" pattern via syncRoles endpoint.
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
import { systemContainer } from "@modules/system/di";
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

export function ManageRolesDialog({
      open,
      onOpenChange,
      admin,
      tenantId,
}: ManageRolesDialogProps) {
      const { t, language } = useI18n();
      const toast = useEnhancedToast();
      const queryClient = useQueryClient();
      const { roleRepository, tenantRepository, adminRepository } = systemContainer;

      // Form state
      const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);
      const [selectedTenantId, setSelectedTenantId] = useState<string>("");
      const [inheritToChildren, setInheritToChildren] = useState(false);

      // Effective tenant: explicit prop > admin's tenant
      const effectiveTenantId = tenantId || admin?.tenantId;
      const targetTenantId = effectiveTenantId || selectedTenantId;

      // Fetch available roles
      const { data: rolesData, isLoading: isLoadingRoles } = useQuery({
            queryKey: ["roles-for-manage", targetTenantId],
            queryFn: () => roleRepository.getAll({
                  page: 1,
                  pageSize: 100,
                  tenantId: targetTenantId || undefined
            }),
            enabled: open && !!admin,
      });

      // Fetch current roles for pre-selection
      const { data: currentRoles, isLoading: isLoadingCurrentRoles } = useQuery({
            queryKey: ["admin-roles", admin?.id],
            queryFn: async () => {
                  if (!admin?.id) return [];
                  return adminRepository.getRoles(admin.id);
            },
            enabled: open && !!admin?.id,
      });

      // Fetch tenants tree (only if no forced context)
      const { data: tenantsTree, isLoading: isLoadingTenants } = useQuery({
            queryKey: ["tenants-tree-for-select"],
            queryFn: () => tenantRepository.getTree(),
            enabled: open && !!admin && !effectiveTenantId,
      });

      // Transform roles to options
      // Transform roles to options
      // Transform available roles from API
      // CRITICAL: Filter available roles to match the selected scope
      const availableRoleOptions: GenericSelectOption[] = useMemo(() =>
            (rolesData?.items ?? [])
                  // Backend getAll might return mixed roles if user is super admin?
                  // Ensure we only show roles valid for the current scope.
                  // Global Scope (selectedTenantId="") -> Role.TenantId must be null
                  // Tenant Scope (selectedTenantId="...") -> Role.TenantId must match
                  .filter(role => (role.tenantId || "") === selectedTenantId)
                  .map((role) => ({
                        value: role.id,
                        label: language === 'ar' ? role.nameAr : role.nameEn,
                        description: language === 'ar' ? role.descriptionAr : role.descriptionEn,
                  })),
            [rolesData, language, selectedTenantId]
      );

      // Transform current roles to options (to ensure selected roles are always visible)
      // FILTER BY SCOPE: Only include roles that belong to the selected scope (Global or Specific Tenant)
      const currentRoleOptions: GenericSelectOption[] = useMemo(() =>
            (currentRoles ?? [])
                  .filter(r => (r.tenantId || "") === selectedTenantId) // Only match exact scope
                  .map((role) => ({
                        value: role.roleId,
                        label: language === 'ar' ? role.roleNameAr : role.roleNameEn,
                  })),
            [currentRoles, language, selectedTenantId]
      );

      // Merge options: available + current (if missing)
      const roleOptions: GenericSelectOption[] = useMemo(() => {
            const optionsMap = new Map<string, GenericSelectOption>();

            // 1. Add available roles
            availableRoleOptions.forEach(opt => optionsMap.set(opt.value, opt));

            // 2. Add current roles if missing from available list
            currentRoleOptions.forEach(opt => {
                  if (!optionsMap.has(opt.value)) {
                        optionsMap.set(opt.value, opt);
                  }
            });

            return Array.from(optionsMap.values());
      }, [availableRoleOptions, currentRoleOptions]);

      // Transform tenants tree
      const transformTenants = (nodes: any[]): GenericSelectOption[] => {
            return nodes.map((node) => ({
                  value: node.id,
                  label: node.name,
                  children: node.children?.length > 0 ? transformTenants(node.children) : undefined,
            }));
      };

      const tenantOptions: GenericSelectOption[] = useMemo(() => [
            { value: "", label: t("admin.role.systemScope") || "System Level (Global Access)" },
            ...(Array.isArray(tenantsTree) ? transformTenants(tenantsTree) : []),
      ], [tenantsTree, t]);

      // Pre-populate selected roles when dialog opens
      useEffect(() => {
            if (open && currentRoles && currentRoles.length > 0) {
                  // Map current roles to their IDs for pre-selection
                  setSelectedRoleIds(currentRoles.map((r) => r.roleId));
                  // Default inherit from first role if any
                  setInheritToChildren(currentRoles.some((r) => r.inheritToChildren));
            } else if (open) {
                  setSelectedRoleIds([]);
                  setInheritToChildren(false);
            }
            // Set tenant scope from first role or effective
            if (open) {
                  const firstRoleTenant = currentRoles?.[0]?.tenantId;
                  // Only set default if not already set (or if logic demands it)
                  // But careful not to override user choice if re-opening?
                  // For now, respect effectiveTenantId or fallback
                  if (!selectedTenantId && !effectiveTenantId) {
                        setSelectedTenantId(firstRoleTenant || "");
                  } else if (effectiveTenantId) {
                        setSelectedTenantId(effectiveTenantId);
                  }
            }
      }, [open, currentRoles, effectiveTenantId]); // Remove selectedTenantId from dependency to avoid loop

      // Sync roles mutation
      const syncMutation = useMutation({
            mutationFn: async () => {
                  if (!admin?.id) throw new Error("No admin selected");

                  const scopeTenantId = selectedTenantId || undefined;

                  // CRITICAL: Filter selected IDs to ensure we only send roles valid for this scope
                  // (e.g. exclude Tenant A roles when syncing Global Scope)
                  const validRoleIds = new Set(roleOptions.map(o => o.value));
                  const filteredSelectedIds = selectedRoleIds.filter(id => validRoleIds.has(id));

                  const assignments: SyncRoleAssignment[] = filteredSelectedIds.map((roleId) => ({
                        roleId,
                        tenantId: scopeTenantId,
                        inheritToChildren: scopeTenantId ? inheritToChildren : undefined,
                  }));

                  await adminRepository.syncRoles(admin.id, assignments, scopeTenantId);
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

      const isLoading = isLoadingRoles || isLoadingCurrentRoles || isLoadingTenants;

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
                                    <Loader2 className="h-8 w-8 animate-spin mb-2" />
                                    <p>{t("common.loading") || "Loading..."}</p>
                              </div>
                        ) : (
                              <>
                                    {/* Tenant Scope Selection (only show if not in forced context) */}
                                    {!effectiveTenantId && (
                                          <div className="space-y-2">
                                                <Label>{t("admin.role.tenantScope") || "Tenant Scope"}</Label>
                                                <GenericSelect
                                                      options={tenantOptions}
                                                      value={selectedTenantId}
                                                      onValueChange={(val: string | string[]) => setSelectedTenantId(val as string)}
                                                      placeholder={t("admin.role.selectTenantPlaceholder") || "Global (All Tenants)"}
                                                      type="tree"
                                                />
                                                <p className="text-xs text-muted-foreground">
                                                      {t("admin.role.tenantScopeHelp") || "Determines role scope and available roles."}
                                                </p>
                                          </div>
                                    )}

                                    {/* Role Multi-Selection */}
                                    <div className="space-y-2">
                                          <Label className="flex items-center gap-2">
                                                <Shield className="h-4 w-4" />
                                                {t("admin.role.selectRoles") || "Roles"} *
                                          </Label>
                                          <GenericSelect
                                                options={roleOptions}
                                                value={selectedRoleIds}
                                                onValueChange={(val: string | string[]) => setSelectedRoleIds(Array.isArray(val) ? val : [val])}
                                                placeholder={t("admin.role.selectRolePlaceholder") || "Select roles..."}
                                                type="multi"
                                          />
                                          <p className="text-xs text-muted-foreground">
                                                {t("admin.role.selectRolesHelp") || "All existing roles will be replaced with selection."}
                                          </p>
                                    </div>

                                    {/* Inherit Toggle (only if tenant selected) */}
                                    {selectedTenantId && (
                                          <div className="flex items-center justify-between border p-3 rounded-lg">
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

                        <div className="flex justify-end pt-4 gap-2 border-t mt-4">
                              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={syncMutation.isPending}>
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
