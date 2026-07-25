/**
 * Set Roles Dialog
 *
 * Checkbox multi-select dialog for assigning roles to a user group.
 * Uses "nuke-and-pave" SetRoles endpoint.
 * Pre-checks currently assigned roles.
 */
"use client";

import { useState, useMemo } from "react";
import { Button } from "@core/ui/button";
import { Label } from "@core/ui/label";
import { GenericModal } from "@core/crud/components/generic-modal";
import { GenericSelect, type GenericSelectOption } from "@core/crud/components/generic-select";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { Shield } from "lucide-react";
import { useSetRolesViewModel } from "../viewmodels/useSetRolesViewModel";

interface SetRolesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRoles: Array<{ roleId: string; nameEn: string; nameAr: string; code: string }>;
  onSubmit: (roleIds: string[]) => void;
  isSubmitting?: boolean;
  tenantId?: string;
}

/**
 * Presentation UI component rendering the set roles dialog.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function SetRolesDialog({
  open,
  onOpenChange,
  currentRoles,
  onSubmit,
  isSubmitting,
  tenantId,
}: SetRolesDialogProps) {
  const { t, language, rolesData, isLoading } = useSetRolesViewModel({ tenantId, open });
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);

  // Transform to options
  const roleOptions: GenericSelectOption[] = useMemo(
    () =>
      (rolesData?.items ?? []).map((role) => ({
        value: role.id,
        label: language === "ar" ? role.nameAr : role.nameEn,
        description: role.code,
      })),
    [rolesData, language]
  );

  // Pre-select current roles by matching code
  const [prevOpen, setPrevOpen] = useState(open);
  const [prevRolesData, setPrevRolesData] = useState(rolesData);

  if (open !== prevOpen || rolesData !== prevRolesData) {
    setPrevOpen(open);
    setPrevRolesData(rolesData);
    if (open && currentRoles && rolesData?.items) {
      const currentCodes = new Set(currentRoles.map((r) => r.code));
      const matchedIds = rolesData.items.filter((r) => currentCodes.has(r.code)).map((r) => r.id);
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
      title={t("userGroups.rolesTab.manageRoles")}
      description={t("userGroups.rolesTab.manageRolesDesc")}
      size="md"
    >
      <div className="space-y-4 py-2">
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Shield className="h-4 w-4" aria-hidden="true" />
              {t("userGroups.rolesTab.selectRoles")}
            </Label>
            <GenericSelect
              options={roleOptions}
              value={selectedRoleIds}
              onValueChange={(val: string | string[]) =>
                setSelectedRoleIds(Array.isArray(val) ? val : [val])
              }
              placeholder={t("userGroups.rolesTab.selectRolesPlaceholder")}
              type="multi"
            />
            <p className="text-xs text-nx-ink-3">{t("userGroups.rolesTab.rolesHelp")}</p>
          </div>
        )}

        <div className="mt-4 flex justify-end gap-2 border-t border-nx-line pt-4">
          <Button variant="outline" onClick={() => handleClose(false)} disabled={isSubmitting}>
            {t("common.cancel")}
          </Button>
          <Button onClick={handleSave} loading={isSubmitting} disabled={isLoading}>
            {t("userGroups.rolesTab.saveRoles")}
          </Button>
        </div>
      </div>
    </GenericModal>
  );
}
