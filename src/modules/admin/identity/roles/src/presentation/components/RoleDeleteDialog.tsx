/**
 * Role Delete Dialog
 *
 * Uses ConfirmationDialog with fallback role selection for roles with admins.
 *
 * The "this role still has admins" block used to hand-roll the warning skin
 * (`border-warning/30 bg-warning/10`) and paint its body copy warning-coloured
 * too. It is the Alert primitive now: severity speaks through the glyph, the
 * hairline and the wash, and the sentence the operator has to read stays on
 * neutral ink.
 */
"use client";

import { useState, useMemo } from "react";
import { ConfirmationDialog } from "@core/ui/confirmation-dialog";
import { Alert, AlertDescription, AlertTitle } from "@core/ui/alert";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { Users } from "lucide-react";
import GenericSelect, { type GenericSelectOption } from "@core/crud/components/generic-select";
import { resolveBilingualLabel } from "@core/common/utils";
import type { Role } from "../../domain/entities/Role";
import { useRoleDeleteViewModel } from "../viewmodels/useRoleDeleteViewModel";

/**
 * Interface defining property specifications, keys types, and structural contract rules for role delete dialog props.
 */
export interface RoleDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: Role | null;
  tenantId?: string;
  onConfirm: (fallbackRoleId?: string) => Promise<void>;
  isDeleting?: boolean;
}

/**
 * Presentation UI component rendering the role delete dialog.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function RoleDeleteDialog({
  open,
  onOpenChange,
  role,
  tenantId,
  onConfirm,
  isDeleting,
}: RoleDeleteDialogProps) {
  const vm = useRoleDeleteViewModel({ roleId: role?.id, tenantId, open });
  const { t, language, adminCount, availableRoles, isLoading } = vm;
  const [fallbackRoleId, setFallbackRoleId] = useState<string>("");

  // Reset fallback selection when dialog opens
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setFallbackRoleId("");
    }
  }

  // Convert roles to GenericSelect options
  const roleOptions: GenericSelectOption[] = useMemo(() => {
    return availableRoles.map((r) => ({
      value: r.id,
      label: resolveBilingualLabel(r.nameEn, r.nameAr, language),
    }));
  }, [availableRoles, language]);

  const hasAdmins = adminCount > 0;
  const roleName = resolveBilingualLabel(role?.nameEn ?? "", role?.nameAr ?? "", language);

  const handleConfirm = async () => {
    await onConfirm(hasAdmins ? fallbackRoleId : undefined);
    onOpenChange(false);
  };

  return (
    <ConfirmationDialog
      open={open}
      onOpenChange={onOpenChange}
      variant="destructive"
      title={t("common.confirmDelete")}
      // Naming the record is the whole point of a confirmation — the operator
      // has to recognise what they are about to delete, not just that it is "a
      // role".
      description={t("role.deleteConfirm", { name: roleName })}
      confirmText={t("common.delete")}
      cancelText={t("common.cancel")}
      onConfirm={handleConfirm}
      isLoading={isDeleting || isLoading}
      disableConfirm={hasAdmins && !fallbackRoleId}
    >
      {isLoading ? (
        <LoadingSpinner size="sm" showText={false} />
      ) : hasAdmins ? (
        // The banner states the blocking condition; the control that resolves it
        // sits below rather than inside, because Alert is an assertive live
        // region and a combobox nested in one gets re-announced on every pick.
        <div className="space-y-3">
          <Alert variant="warning">
            <Users className="h-4 w-4" aria-hidden="true" />
            <AlertTitle>{t("role.hasAdmins", { count: adminCount })}</AlertTitle>
            <AlertDescription>{t("role.selectFallback")}</AlertDescription>
          </Alert>

          <GenericSelect
            options={roleOptions}
            value={fallbackRoleId}
            // GenericSelect emits `onValueChange`; the old `onChange` was spread
            // onto the wrapper div, so picking a fallback never reached state and
            // the confirm button stayed disabled forever.
            onValueChange={(value: string | string[]) => setFallbackRoleId(value as string)}
            placeholder={t("role.selectFallbackPlaceholder")}
            searchable
          />
        </div>
      ) : (
        <p className="text-sm text-nx-ink-2">{t("common.deleteWarning")}</p>
      )}
    </ConfirmationDialog>
  );
}
