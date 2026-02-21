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

interface AssignToGroupDialogProps {
      open: boolean;
      onOpenChange: (open: boolean) => void;
      /** The admin to add to groups */
      adminId?: string;
      adminName?: string;
      /** The role to add to groups */
      roleId?: string;
      roleName?: string;
      /** Which mode */
      mode: "admin" | "role";
}

export function AssignToGroupDialog({
      open, onOpenChange, adminId, adminName, roleId, roleName, mode,
}: AssignToGroupDialogProps) {
      const { t, language } = useI18n();
      const { operationSuccess, operationError } = useEnhancedToast();
      const queryClient = useQueryClient();
      const [selectedGroupId, setSelectedGroupId] = useState<string>("");

      // Fetch available groups
      const { data: groupsData, isLoading } = useQuery({
            queryKey: ["groups-for-assign", mode],
            queryFn: () => systemContainer.userGroupRepository.getAll({
                  page: 1,
                  pageSize: 200,
                  isActive: true,
            }),
            enabled: open,
      });

      const groupOptions: GenericSelectOption[] = useMemo(() =>
            (groupsData?.items ?? []).map((g) => ({
                  value: g.id,
                  label: language === "ar" ? g.nameAr : g.nameEn,
                  description: g.code,
            })),
            [groupsData, language]
      );

      // Admin → addMembers to group
      const addMemberMutation = useMutation({
            mutationFn: async () => {
                  if (!adminId || !selectedGroupId) throw new Error("Missing data");
                  await systemContainer.userGroupRepository.addMembers(selectedGroupId, { adminIds: [adminId] });
            },
            onSuccess: () => {
                  operationSuccess("Added", adminName || "Admin");
                  queryClient.invalidateQueries({ queryKey: userGroupKeys.all });
                  onOpenChange(false);
                  setSelectedGroupId("");
            },
            onError: (err: Error) => operationError("Add to Group", undefined, err.message),
      });

      // Role → setRoles on group (appends by fetching current + adding)
      const addRoleMutation = useMutation({
            mutationFn: async () => {
                  if (!roleId || !selectedGroupId) throw new Error("Missing data");
                  // Fetch current group detail to get existing roles
                  const group = await systemContainer.userGroupRepository.getById(selectedGroupId);
                  const currentRoleIds = group.roles.map((r: any) => r.roleId);
                  if (!currentRoleIds.includes(roleId)) {
                        currentRoleIds.push(roleId);
                  }
                  await systemContainer.userGroupRepository.setRoles(selectedGroupId, { roleIds: currentRoleIds });
            },
            onSuccess: () => {
                  operationSuccess("Added", roleName || "Role");
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
                        {isLoading ? (
                              <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                                    <Loader2 className="mb-2 h-8 w-8 animate-spin" />
                                    <p>{t("common.loading") || "Loading..."}</p>
                              </div>
                        ) : (
                              <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                          <Users className="h-4 w-4" />
                                          {t("userGroups.selectGroup") || "Select Group"} *
                                    </Label>
                                    <GenericSelect
                                          options={groupOptions}
                                          value={selectedGroupId}
                                          onValueChange={(val: string | string[]) =>
                                                setSelectedGroupId(Array.isArray(val) ? val[0] : val)
                                          }
                                          placeholder={t("userGroups.selectGroupPlaceholder") || "Choose a user group..."}
                                          type="single"
                                    />
                              </div>
                        )}

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
                                    disabled={isLoading || isPending || !selectedGroupId}
                              >
                                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {t("userGroups.assignAction") || "Assign"}
                              </Button>
                        </div>
                  </div>
            </GenericModal>
      );
}
