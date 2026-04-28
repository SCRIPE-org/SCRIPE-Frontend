/**
 * Set Roles Dialog
 *
 * Checkbox multi-select dialog for assigning roles to a user group.
 * Uses "nuke-and-pave" SetRoles endpoint.
 * Pre-checks currently assigned roles.
 */
"use client";

import { useRef, useState, useMemo } from "react";
import { Button } from "@core/ui/button";
import { Label } from "@core/ui/label";
import { GenericModal } from "@core/crud/components/generic-modal";
import { GenericSelect, type GenericSelectOption } from "@core/crud/components/generic-select";
import { Loader2, Shield } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { systemContainer } from "@modules/identity/di";
import { useI18n } from "@core/providers/i18n-provider";

interface SetRolesDialogProps {
      open: boolean;
      onOpenChange: (open: boolean) => void;
      currentRoles: Array<{ roleId: string; nameEn: string; nameAr: string; code: string }>;
      onSubmit: (roleIds: string[]) => void;
      isSubmitting?: boolean;
      tenantId?: string;
}

export function SetRolesDialog({
      open, onOpenChange, currentRoles, onSubmit, isSubmitting, tenantId
}: SetRolesDialogProps) {
      const { t, language } = useI18n();
      const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);

      // Fetch all available roles
      const { data: rolesData, isLoading } = useQuery({
            queryKey: ["roles-for-group-assign", tenantId],
            queryFn: () => tenantId
                  ? systemContainer.roleRepository.getAll({
                        page: 1,
                        pageSize: 100,
                        tenantId,
                        strict: true,
                  })
                  : systemContainer.roleRepository.getMyTenantRoles({
                        page: 1,
                        pageSize: 100,
                  }),
            enabled: open,
      });

      // Transform to options
      const roleOptions: GenericSelectOption[] = useMemo(() =>
            (rolesData?.items ?? []).map((role) => ({
                  value: role.id,
                  label: language === "ar" ? role.nameAr : role.nameEn,
                  description: role.code,
            })),
            [rolesData, language]
      );

      // Pre-select current roles by matching code (render-time)
      const prevRolesDataRef = useRef<{ open: boolean; rolesLen: number }>({ open: false, rolesLen: 0 });
      const rolesLen = rolesData?.items?.length ?? 0;
      const dataChanged = open !== prevRolesDataRef.current.open || rolesLen !== prevRolesDataRef.current.rolesLen;
      if (dataChanged) {
            prevRolesDataRef.current = { open, rolesLen };
            if (open && currentRoles && rolesData?.items) {
                  const currentCodes = new Set(currentRoles.map((r) => r.code));
                  const matchedIds = rolesData.items
                        .filter((r) => currentCodes.has(r.code))
                        .map((r) => r.id);
                  setSelectedRoleIds(matchedIds);
            } else if (open && !rolesData) {
                  setSelectedRoleIds([]);
            }
      }

      const handleSave = () => {
            onSubmit(selectedRoleIds);
      };

      const handleClose = (v: boolean) => {
            onOpenChange(v);
      };

      return (
            <GenericModal
                  open={open}
                  onOpenChange={handleClose}
                  title={t("userGroups.rolesTab.manageRoles") || "Manage Roles"}
                  description={t("userGroups.rolesTab.manageRolesDesc") || "Select roles for this group. All members will inherit the selected roles."}
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
                                          <Shield className="h-4 w-4" />
                                          {t("userGroups.rolesTab.selectRoles") || "Select Roles"}
                                    </Label>
                                    <GenericSelect
                                          options={roleOptions}
                                          value={selectedRoleIds}
                                          onValueChange={(val: string | string[]) =>
                                                setSelectedRoleIds(Array.isArray(val) ? val : [val])
                                          }
                                          placeholder={t("userGroups.rolesTab.selectRolesPlaceholder") || "Search and select roles..."}
                                          type="multi"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                          {t("userGroups.rolesTab.rolesHelp") || "Saving replaces all current role assignments for this group."}
                                    </p>
                              </div>
                        )}

                        <div className="mt-4 flex justify-end gap-2 border-t pt-4">
                              <Button
                                    variant="outline"
                                    onClick={() => handleClose(false)}
                                    disabled={isSubmitting}
                              >
                                    {t("common.cancel") || "Cancel"}
                              </Button>
                              <Button
                                    onClick={handleSave}
                                    loading={isSubmitting}
                                    disabled={isLoading}
                              >
                                    {t("common.save") || "Save Roles"}
                              </Button>
                        </div>
                  </div>
            </GenericModal>
      );
}
