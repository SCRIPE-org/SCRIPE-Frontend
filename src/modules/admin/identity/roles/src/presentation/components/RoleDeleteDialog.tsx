/**
 * Role Delete Dialog
 *
 * Uses ConfirmationDialog with fallback role selection for roles with admins.
 */
"use client";

import { useState, useMemo } from "react";
import { ConfirmationDialog } from "@core/ui/confirmation-dialog";
import { Loader2, Users } from "lucide-react";
import GenericSelect, { type GenericSelectOption } from "@core/crud/components/generic-select";
import type { Role } from "../../domain/entities/Role";
import { useRoleDeleteViewModel } from "../viewmodels/useRoleDeleteViewModel";

interface RoleDeleteDialogProps {
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
      label: language === "ar" ? r.nameAr : r.nameEn,
    }));
  }, [availableRoles, language]);

  const hasAdmins = adminCount > 0;

  const handleConfirm = async () => {
    await onConfirm(hasAdmins ? fallbackRoleId : undefined);
    onOpenChange(false);
  };

  return (
    <ConfirmationDialog
      open={open}
      onOpenChange={onOpenChange}
      variant="destructive"
      title={t("common.confirmDelete") || "Confirm Delete"}
      description={
        t("role.deleteConfirm") ||
        `Are you sure you want to delete the role "${language === "ar" ? role?.nameAr : role?.nameEn}"?`
      }
      confirmText={t("common.delete") || "Delete"}
      cancelText={t("common.cancel") || "Cancel"}
      onConfirm={handleConfirm}
      isLoading={isDeleting || isLoading}
      disableConfirm={hasAdmins && !fallbackRoleId}
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-4" role="status">
          <Loader2
            className="h-5 w-5 animate-spin text-nx-ink-3 motion-reduce:animate-none"
            aria-label={t("common.loading")}
          />
        </div>
      ) : hasAdmins ? (
        <div className="rounded-nx-md border border-warning/30 bg-warning/10 p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-warning">
            <Users className="h-4 w-4 shrink-0" aria-hidden="true" />
            {t("role.hasAdmins") || `This role is assigned to ${adminCount} admin(s).`}
          </div>
          <p className="mt-1 text-sm text-warning">
            {t("role.selectFallback") ||
              "Select a fallback role to transfer these admins before deletion:"}
          </p>

          <div className="mt-3">
            <GenericSelect
              options={roleOptions}
              value={fallbackRoleId}
              // GenericSelect emits `onValueChange`; the old `onChange` was spread
              // onto the wrapper div, so picking a fallback never reached state and
              // the confirm button stayed disabled forever.
              onValueChange={(value: string | string[]) => setFallbackRoleId(value as string)}
              placeholder={t("role.selectFallbackPlaceholder") || "Select a role..."}
              searchable
            />
          </div>
        </div>
      ) : (
        <p className="text-sm text-nx-ink-2">
          {t("common.deleteWarning") || "This action cannot be undone."}
        </p>
      )}
    </ConfirmationDialog>
  );
}
