/**
 * Add Members Dialog
 *
 * Multi-select dialog to add admins to a user group.
 * Fetches available admins, filters out existing members, and calls addMembers.
 */
"use client";

import { useState, useMemo } from "react";
import { Button } from "@core/ui/button";
import { Label } from "@core/ui/label";
import { GenericModal } from "@core/crud/components/generic-modal";
import { GenericSelect, type GenericSelectOption } from "@core/crud/components/generic-select";
import { Loader2, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { systemContainer } from "@modules/identity/di";
import { useI18n } from "@core/providers/i18n-provider";

interface AddMembersDialogProps {
      open: boolean;
      onOpenChange: (open: boolean) => void;
      groupId: string;
      existingMemberIds: string[];
      onSubmit: (adminIds: string[]) => void;
      isSubmitting?: boolean;
      tenantId?: string;
}

export function AddMembersDialog({
      open, onOpenChange, groupId, existingMemberIds, onSubmit, isSubmitting, tenantId
}: AddMembersDialogProps) {
      const { t, language } = useI18n();
      const [selectedIds, setSelectedIds] = useState<string[]>([]);

      // Fetch all admins (scoped to tenant if specified)
      const { data: adminsData, isLoading } = useQuery({
            queryKey: ["admins-for-group", groupId, tenantId],
            queryFn: () => tenantId
                  ? systemContainer.adminRepository.getByTenantId(tenantId, {
                        page: 1,
                        pageSize: 100,
                        isActive: true,
                  })
                  : systemContainer.adminRepository.getAll({
                        page: 1,
                        pageSize: 100,
                        isActive: true,
                  }),
            enabled: open,
      });

      // Filter out existing members
      const adminOptions: GenericSelectOption[] = useMemo(() => {
            const existingSet = new Set(existingMemberIds);
            return (adminsData?.items ?? [])
                  .filter((admin) => !existingSet.has(admin.id))
                  .map((admin) => ({
                        value: admin.id,
                        label: `${admin.firstName} ${admin.lastName}`,
                        description: admin.email || admin.username,
                  }));
      }, [adminsData, existingMemberIds]);

      const handleSave = () => {
            if (selectedIds.length > 0) {
                  onSubmit(selectedIds);
                  setSelectedIds([]);
            }
      };

      const handleClose = (v: boolean) => {
            if (!v) setSelectedIds([]);
            onOpenChange(v);
      };

      return (
            <GenericModal
                  open={open}
                  onOpenChange={handleClose}
                  title={t("userGroups.membersTab.addMembers") || "Add Members"}
                  description={t("userGroups.membersTab.addMembersDesc") || "Select admins to add to this group."}
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
                                          {t("userGroups.membersTab.selectMembers") || "Select Admins"} *
                                    </Label>
                                    <GenericSelect
                                          options={adminOptions}
                                          value={selectedIds}
                                          onValueChange={(val: string | string[]) =>
                                                setSelectedIds(Array.isArray(val) ? val : [val])
                                          }
                                          placeholder={t("userGroups.membersTab.selectMembersPlaceholder") || "Search and select admins..."}
                                          type="multi"
                                    />
                                    {adminOptions.length === 0 && (
                                          <p className="text-xs text-muted-foreground">
                                                {t("userGroups.membersTab.allAdminsAssigned") || "All available admins are already members."}
                                          </p>
                                    )}
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
                                    disabled={isLoading || selectedIds.length === 0}
                              >
                                    {t("userGroups.membersTab.addSelected") || "Add Selected"}
                              </Button>
                        </div>
                  </div>
            </GenericModal>
      );
}
