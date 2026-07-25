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
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { Users } from "lucide-react";
import { useAddMembersViewModel } from "../viewmodels/useAddMembersViewModel";

interface AddMembersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupId: string;
  existingMemberIds: string[];
  onSubmit: (adminIds: string[]) => void;
  isSubmitting?: boolean;
  tenantId?: string;
}

/**
 * Presentation UI component rendering the add members dialog.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function AddMembersDialog({
  open,
  onOpenChange,
  groupId,
  existingMemberIds,
  onSubmit,
  isSubmitting,
  tenantId,
}: AddMembersDialogProps) {
  const { t, language, adminsData, isLoading } = useAddMembersViewModel({
    groupId,
    tenantId,
    open,
  });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

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
      title={t("userGroups.membersTab.addMembers")}
      description={t("userGroups.membersTab.addMembersDesc")}
      size="md"
    >
      <div className="space-y-4 py-2">
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Users className="h-4 w-4" aria-hidden="true" />
              {t("userGroups.membersTab.selectMembers")} *
            </Label>
            <GenericSelect
              options={adminOptions}
              value={selectedIds}
              onValueChange={(val: string | string[]) =>
                setSelectedIds(Array.isArray(val) ? val : [val])
              }
              placeholder={t("userGroups.membersTab.selectMembersPlaceholder")}
              type="multi"
            />
            {adminOptions.length === 0 && (
              <p className="text-xs text-nx-ink-3">
                {t("userGroups.membersTab.allAdminsAssigned")}
              </p>
            )}
          </div>
        )}

        <div className="mt-4 flex justify-end gap-2 border-t border-nx-line pt-4">
          <Button variant="outline" onClick={() => handleClose(false)} disabled={isSubmitting}>
            {t("common.cancel")}
          </Button>
          <Button
            onClick={handleSave}
            loading={isSubmitting}
            disabled={isLoading || selectedIds.length === 0}
          >
            {t("userGroups.membersTab.addSelected")}
          </Button>
        </div>
      </div>
    </GenericModal>
  );
}
