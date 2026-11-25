/**
 * Set Roles Dialog
 *
 * Checkbox multi-select dialog for assigning roles to a user group.
 * Uses "nuke-and-pave" SetRoles endpoint.
 * Pre-checks currently assigned roles.
 */
"use client";

import { useId, useState, useMemo } from "react";
import { useSudoStore } from "@core/store/useSudoStore";
import { Button } from "@core/ui/button";
import { Label } from "@core/ui/label";
import { GenericModal } from "@core/crud/components/generic-modal";
import { GenericSelect, type GenericSelectOption } from "@core/crud/components/generic-select";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { resolveBilingualLabel } from "@core/common/utils";
import { Shield } from "lucide-react";
import { useSetRolesViewModel } from "../viewmodels/useSetRolesViewModel";

interface SetRolesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRoles: Array<{ roleId: string; nameEn: string; nameAr: string; code: string }>;
  onSubmit: (roleIds: string[]) => Promise<unknown> | void;
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
  const { t, language, rolesData, isLoading, searchRoles } = useSetRolesViewModel({
    tenantId,
    open,
    currentRoles,
  });
  const selectRolesLabelId = useId();
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);

  // Transform to options
  const roleOptions: GenericSelectOption[] = useMemo(
    () =>
      (rolesData?.items ?? []).map((role) => ({
        value: role.id,
        label: resolveBilingualLabel(role.nameEn, role.nameAr, language),
        description: role.code,
      })),
    [rolesData, language]
  );

  // Pre-select current roles by matching code once per open transition
  const [prevOpen, setPrevOpen] = useState(open);
  const [initializedForOpen, setInitializedForOpen] = useState(false);

  if (open !== prevOpen) {
    setPrevOpen(open);
    if (!open) {
      setInitializedForOpen(false);
    }
  }

  if (open && !initializedForOpen && !isLoading && rolesData?.items) {
    setInitializedForOpen(true);
    const currentCodes = new Set(currentRoles.map((r) => r.code));
    const matchedIds = rolesData.items.filter((r) => currentCodes.has(r.code)).map((r) => r.id);
    setSelectedRoleIds(matchedIds);
  } else if (open && !initializedForOpen && !rolesData && selectedRoleIds.length > 0) {
    setSelectedRoleIds([]);
  }

  const handleSave = async () => {
    try {
      await onSubmit(selectedRoleIds);
    } catch {
      // ViewModel surfaces error or Sudo cancellation feedback; keep dialog & selections open.
    }
  };

  const handleClose = (v: boolean) => {
    if (!v && useSudoStore.getState().modalOpen) {
      return;
    }
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
            <Label id={selectRolesLabelId} className="flex items-center gap-2">
              <Shield className="h-4 w-4" aria-hidden="true" />
              {t("userGroups.rolesTab.selectRoles")}
            </Label>
            <GenericSelect
              aria-labelledby={selectRolesLabelId}
              options={roleOptions}
              value={selectedRoleIds}
              onValueChange={(val: string | string[]) =>
                setSelectedRoleIds(Array.isArray(val) ? val : [val])
              }
              placeholder={t("userGroups.rolesTab.selectRolesPlaceholder")}
              type="multi"
              {...(searchRoles ? { searchType: "server" as const, onServerSearch: searchRoles } : {})}
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
