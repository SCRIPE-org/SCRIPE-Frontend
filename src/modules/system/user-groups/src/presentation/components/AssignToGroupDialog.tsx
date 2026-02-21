/**
 * Assign to Group Dialog
 * 
 * Reusable dialog for assigning an admin to a user group,
 * or assigning a role to a user group.
 * Used cross-module from Admins and Roles pages.
 */
"use client";

import { useState, useMemo } from "react";
import { Button } from "@core/ui/button";
import { Label } from "@core/ui/label";
import { GenericModal } from "@core/crud/components/generic-modal";
import { GenericSelect, type GenericSelectOption } from "@core/crud/components/generic-select";
import { Loader2, Users } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { systemContainer } from "@modules/system/di";
import { useI18n } from "@core/providers/i18n-provider";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { userGroupKeys } from "../viewmodels/useUserGroupsViewModel";
import { useCurrentTenantId } from "@core/providers/tenant-context-provider";

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
      /** For scoping groups to a tenant */
      tenantId?: string;
      /** If true, scopes strictly to current logged in user's tenant */
      useMyTenant?: boolean;
}

export function AssignToGroupDialog({
      open, onOpenChange, adminId, adminIds, adminName, roleId, roleIds, roleName, mode, tenantId, useMyTenant
}: AssignToGroupDialogProps) {
      const { t, language } = useI18n();
      const { operationSuccess, operationError } = useEnhancedToast();
      const queryClient = useQueryClient();
      const [selectedGroupId, setSelectedGroupId] = useState<string>("");
      const [searchOptions, setSearchOptions] = useState<GenericSelectOption[]>([]);
      const [isSearching, setIsSearching] = useState(false);

      // Current User Tenant checks
      const currentUserTenantId = useCurrentTenantId();
      const effectiveTenantId = useMyTenant ? currentUserTenantId : tenantId;

      // Handle server search
      const handleSearch = async (term: string): Promise<GenericSelectOption[]> => {
            setIsSearching(true);
            try {
                  let result;
                  if (useMyTenant) {
                        result = await systemContainer.userGroupRepository.getMyTenantGroups({
                              page: 1,
                              pageSize: 50,
                              search: term,
                              isActive: true,
                        });
                  } else {
                        result = await systemContainer.userGroupRepository.getAll({
                              page: 1,
                              pageSize: 50,
                              search: term,
                              tenantId: effectiveTenantId || undefined,
                              isActive: true,
                        });
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

      // Initial load when dialog opens
      useMemo(() => {
            if (open) {
                  handleSearch("");
            } else {
                  setSearchOptions([]);
                  setSelectedGroupId("");
            }
            // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [open, effectiveTenantId, useMyTenant]);

      // Admin → addMembers on group
      const addMemberMutation = useMutation({
            mutationFn: async () => {
                  const targetAdminIds = adminIds ?? (adminId ? [adminId] : []);
                  if (targetAdminIds.length === 0 || !selectedGroupId) throw new Error("Missing data");
                  await systemContainer.userGroupRepository.addMembers(selectedGroupId, {
                        adminIds: targetAdminIds,
                  });
            },
            onSuccess: () => {
                  const count = adminIds ? adminIds.length : 1;
                  operationSuccess("Added", `${count} ${mode === "admin" ? "Admin(s)" : "Role(s)"}`);
                  queryClient.invalidateQueries({ queryKey: userGroupKeys.all });
                  onOpenChange(false);
                  setSelectedGroupId("");
            },
            onError: (err: Error) => operationError("Add to Group", undefined, err.message),
      });

      // Role → setRoles on group (appends by fetching current + adding)
      const addRoleMutation = useMutation({
            mutationFn: async () => {
                  const targetRoleIds = roleIds ?? (roleId ? [roleId] : []);
                  if (targetRoleIds.length === 0 || !selectedGroupId) throw new Error("Missing data");

                  // Fetch current group detail to get existing roles
                  const group = await systemContainer.userGroupRepository.getById(selectedGroupId);
                  const currentRoleIds = group.roles.map((r: any) => r.roleId);

                  // Add all new roles
                  for (const tId of targetRoleIds) {
                        if (!currentRoleIds.includes(tId)) {
                              currentRoleIds.push(tId);
                        }
                  }

                  await systemContainer.userGroupRepository.setRoles(selectedGroupId, { roleIds: currentRoleIds });
            },
            onSuccess: () => {
                  const count = roleIds ? roleIds.length : 1;
                  operationSuccess("Added", `${count} ${mode === "admin" ? "Admin(s)" : "Role(s)"}`);
                  queryClient.invalidateQueries({ queryKey: userGroupKeys.all });
                  onOpenChange(false);
                  setSelectedGroupId("");
            },
            onError: (err: Error) => operationError("Add to Group", undefined, err.message),
      });

      const isPending = addMemberMutation.isPending || addRoleMutation.isPending;

      const handleSave = () => {
            if (mode === "admin") addMemberMutation.mutate();
            else addRoleMutation.mutate();
      };

      const handleClose = (v: boolean) => {
            if (!v) setSelectedGroupId("");
            onOpenChange(v);
      };

      const entityName = mode === "admin" ? (adminName || "") : (roleName || "");

      return (
            <GenericModal
                  open={open}
                  onOpenChange={handleClose}
                  title={t("userGroups.assignToGroup") || "Assign to Group"}
                  description={`${t("userGroups.assignToGroupDesc") || "Select a user group for"} ${entityName}`}
                  size="md"
            >
                  <div className="space-y-4 py-2">
                        <div className="space-y-2">
                              <Label className="flex items-center gap-2">
                                    <Users className="h-4 w-4" />
                                    {t("userGroups.selectGroup") || "Select Group"} *
                              </Label>
                              <GenericSelect
                                    options={searchOptions}
                                    value={selectedGroupId}
                                    onValueChange={(val: string | string[]) =>
                                          setSelectedGroupId(Array.isArray(val) ? val[0] : val)
                                    }
                                    placeholder={t("userGroups.selectGroupPlaceholder") || "Choose a user group..."}
                                    type="single"
                                    searchType="server"
                                    onSearch={handleSearch}
                                    loading={isSearching}
                              />
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
                                    disabled={isSearching || isPending || !selectedGroupId}
                              >
                                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {t("userGroups.assignAction") || "Assign"}
                              </Button>
                        </div>
                  </div>
            </GenericModal>
      );
}
