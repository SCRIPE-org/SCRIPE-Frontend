/**
 * Assign to Group Dialog
 * 
 * Reusable dialog for assigning an admin or role to one or more user groups.
 * Used cross-module from Admins and Roles pages.
 * 
 * Features:
 * - Multi-group selection (assign to multiple groups at once)
 * - Smart tenant endpoint selection (Super Admin vs Tenant Admin)
 * - Server-side search with debounce
 * - Progress feedback for multi-group assignment
 */
"use client";

import { useState, useEffect } from "react";
import { Button } from "@core/ui/button";
import { Label } from "@core/ui/label";
import { GenericModal } from "@core/crud/components/generic-modal";
import { GenericSelect, type GenericSelectOption } from "@core/crud/components/generic-select";
import { Loader2, Users } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { systemContainer } from "@/modules/identity/di";
import { useI18n } from "@core/providers/i18n-provider";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { userGroupKeys } from "../viewmodels/useUserGroupsViewModel";
import { useCurrentTenantId } from "@core/providers/tenant-context-provider";
import { usePermissions } from "@core/providers/permission-provider";

interface AssignToGroupDialogProps {
      open: boolean;
      onOpenChange: (open: boolean) => void;
      /** The admin to add to groups */
      adminId?: string;
      adminIds?: string[];
      adminName?: string;
      /** The role to add to groups */
      roleId?: string;
      roleIds?: string[];
      roleName?: string;
      /** Which mode */
      mode: "admin" | "role";
      /** For scoping groups to a specific tenant (e.g., from Tenant Detail) */
      tenantId?: string;
      /** If true, attempt to scope strictly to logged-in user's tenant (falls back to getAll for super admins) */
      useMyTenant?: boolean;
}

export function AssignToGroupDialog({
      open, onOpenChange, adminId, adminIds, adminName, roleId, roleIds, roleName, mode, tenantId, useMyTenant
}: AssignToGroupDialogProps) {
      const { t, language } = useI18n();
      const { operationSuccess, operationError } = useEnhancedToast();
      const queryClient = useQueryClient();
      const { isSuperAdmin } = usePermissions();

      // Multi-select state
      const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);
      const [searchOptions, setSearchOptions] = useState<GenericSelectOption[]>([]);
      const [isSearching, setIsSearching] = useState(false);

      // Tenant context
      const currentUserTenantId = useCurrentTenantId();

      /**
       * Smart endpoint selection:
       * 1. If explicit tenantId is passed → use getAll({ tenantId }) (e.g., from Tenant Detail page)
       * 2. If useMyTenant AND user has a tenant → use getMyTenantGroups()
       * 3. If useMyTenant AND user has NO tenant (Super Admin) → use getAll() (system-level groups)
       * 4. Otherwise → use getAll() with no filter
       */
      const fetchGroups = async (term: string): Promise<GenericSelectOption[]> => {
            setIsSearching(true);
            try {
                  let result;
                  const baseParams = {
                        page: 1,
                        pageSize: 50,
                        search: term,
                        isActive: true,
                  };

                  if (tenantId) {
                        // Explicit tenant scope (e.g., from Tenant Detail drill-down)
                        result = await systemContainer.userGroupRepository.getAll({
                              ...baseParams,
                              tenantId,
                        });
                  } else if (useMyTenant) {
                        // Tenant Admin (or Super Admin targeting system groups)
                        result = await systemContainer.userGroupRepository.getMyTenantGroups(baseParams);
                  } else {
                        // Super Admin (no tenant) or no scoping: get all system-level groups
                        result = await systemContainer.userGroupRepository.getAll(baseParams);
                  }

                  const options = result.items.map((g) => ({
                        value: g.id,
                        label: language === "ar" ? g.nameAr : g.nameEn,
                        description: g.code,
                  }));
                  setSearchOptions(options);
                  return options;
            } catch (err) {
                  console.error("Failed to search groups", err);
                  return [];
            } finally {
                  setIsSearching(false);
            }
      };

      // Initial load when dialog opens + reset on close
      useEffect(() => {
            if (open) {
                  fetchGroups("");
            } else {
                  setSearchOptions([]);
                  setSelectedGroupIds([]);
            }
            // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [open, tenantId, useMyTenant, currentUserTenantId]);

      // Admin → addMembers on each selected group
      const addMemberMutation = useMutation({
            mutationFn: async () => {
                  const targetAdminIds = adminIds ?? (adminId ? [adminId] : []);
                  if (targetAdminIds.length === 0 || selectedGroupIds.length === 0) throw new Error("Missing data");

                  // Add admins to each selected group
                  for (const groupId of selectedGroupIds) {
                        await systemContainer.userGroupRepository.addMembers(groupId, {
                              adminIds: targetAdminIds,
                        });
                  }
            },
            onSuccess: () => {
                  const adminCount = adminIds ? adminIds.length : 1;
                  operationSuccess(
                        t("userGroups.assignAction") || "Assigned",
                        t("userGroups.multiAssignSuccess")
                              ?.replace("{admins}", String(adminCount))
                              ?.replace("{groups}", String(selectedGroupIds.length))
                        || `${adminCount} admin(s) assigned to ${selectedGroupIds.length} group(s)`
                  );
                  queryClient.invalidateQueries({ queryKey: userGroupKeys.all });
                  queryClient.invalidateQueries({ queryKey: ["admins"] });
                  onOpenChange(false);
                  setSelectedGroupIds([]);
            },
            onError: (err: Error) => operationError(t("userGroups.assignToGroups") || "Assign to Groups", undefined, err.message),
      });

      // Role → setRoles on each selected group (appends by fetching current + adding)
      const addRoleMutation = useMutation({
            mutationFn: async () => {
                  const targetRoleIds = roleIds ?? (roleId ? [roleId] : []);
                  if (targetRoleIds.length === 0 || selectedGroupIds.length === 0) throw new Error("Missing data");

                  for (const groupId of selectedGroupIds) {
                        // Fetch current group detail to get existing roles
                        const group = await systemContainer.userGroupRepository.getById(groupId);
                        const currentRoleIds = group.roles.map((r: any) => r.roleId);

                        // Merge new roles (dedup)
                        for (const tId of targetRoleIds) {
                              if (!currentRoleIds.includes(tId)) {
                                    currentRoleIds.push(tId);
                              }
                        }

                        await systemContainer.userGroupRepository.setRoles(groupId, { roleIds: currentRoleIds });
                  }
            },
            onSuccess: () => {
                  const roleCount = roleIds ? roleIds.length : 1;
                  operationSuccess(
                        t("userGroups.assignAction") || "Assigned",
                        t("userGroups.multiAssignSuccess")
                              ?.replace("{admins}", String(roleCount))
                              ?.replace("{groups}", String(selectedGroupIds.length))
                        || `${roleCount} role(s) assigned to ${selectedGroupIds.length} group(s)`
                  );
                  queryClient.invalidateQueries({ queryKey: userGroupKeys.all });
                  queryClient.invalidateQueries({ queryKey: ["roles"] });
                  onOpenChange(false);
                  setSelectedGroupIds([]);
            },
            onError: (err: Error) => operationError(t("userGroups.assignToGroups") || "Assign to Groups", undefined, err.message),
      });

      const isPending = addMemberMutation.isPending || addRoleMutation.isPending;

      const handleSave = () => {
            if (mode === "admin") addMemberMutation.mutate();
            else addRoleMutation.mutate();
      };

      const handleClose = (v: boolean) => {
            if (!v) setSelectedGroupIds([]);
            onOpenChange(v);
      };

      const entityName = mode === "admin" ? (adminName || "") : (roleName || "");
      const isBulk = (mode === "admin" ? (adminIds?.length ?? 0) : (roleIds?.length ?? 0)) > 0;
      const bulkCount = mode === "admin" ? (adminIds?.length ?? 0) : (roleIds?.length ?? 0);

      return (
            <GenericModal
                  open={open}
                  onOpenChange={handleClose}
                  title={t("userGroups.assignToGroups") || "Assign to Groups"}
                  description={
                        isBulk
                              ? `${t("userGroups.assignBulkDesc") || "Select user groups for"} ${bulkCount} ${mode === "admin" ? t("admin.admins") || "admin(s)" : t("roles.roles") || "role(s)"}`
                              : `${t("userGroups.assignToGroupDesc") || "Select user groups for"} ${entityName}`
                  }
                  size="md"
            >
                  <div className="space-y-4 py-2">
                        <div className="space-y-2">
                              <Label className="flex items-center gap-2">
                                    <Users className="h-4 w-4" />
                                    {t("userGroups.selectGroups") || "Select Groups"} *
                              </Label>
                              <GenericSelect
                                    options={searchOptions}
                                    value={selectedGroupIds}
                                    onValueChange={(val: string | string[]) =>
                                          setSelectedGroupIds(Array.isArray(val) ? val : [val])
                                    }
                                    placeholder={t("userGroups.selectGroupsPlaceholder") || "Choose user groups..."}
                                    type="multi"
                                    searchType="server"
                                    onServerSearch={fetchGroups}
                                    loading={isSearching}
                              />
                              {selectedGroupIds.length > 0 && (
                                    <p className="text-xs text-muted-foreground">
                                          {t("userGroups.selectedCount")?.replace("{count}", String(selectedGroupIds.length)) || `${selectedGroupIds.length} group(s) selected`}
                                    </p>
                              )}
                        </div>

                        <div className="mt-4 flex justify-end gap-2 border-t pt-4">
                              <Button
                                    variant="outline"
                                    onClick={() => handleClose(false)}
                                    disabled={isPending}
                              >
                                    {t("common.cancel") || "Cancel"}
                              </Button>
                              <Button
                                    onClick={handleSave}
                                    disabled={isSearching || isPending || selectedGroupIds.length === 0}
                              >
                                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {t("userGroups.assignAction") || "Assign"}
                                    {selectedGroupIds.length > 0 && ` (${selectedGroupIds.length})`}
                              </Button>
                        </div>
                  </div>
            </GenericModal>
      );
}
