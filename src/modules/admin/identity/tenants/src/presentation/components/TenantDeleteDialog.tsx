/**
 * Tenant Delete Dialog
 *
 * Uses ConfirmationDialog with cascade warning for descendants.
 * Cascade checkbox is gated behind tenants.cascade_delete permission.
 *
 * ConfirmationDialog already provides the in-flight lock: while the confirmed
 * delete is running the panel stops being dismissable (Escape is swallowed),
 * so a slow cascade delete can never be orphaned mid-flight — see
 * confirmation-dialog.tsx's onEscapeKeyDown guard.
 */
"use client";

import { ConfirmationDialog } from "@core/ui/confirmation-dialog";
import { Checkbox } from "@core/ui/checkbox";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { ShieldAlert } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import type { Tenant } from "../../domain/entities/Tenant";
import { useTenantDeleteViewModel } from "../viewmodels/useTenantDeleteViewModel";

interface TenantDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenant: Tenant | null;
  onConfirm: (cascadeChildren: boolean) => Promise<void>;
  isDeleting?: boolean;
}

/**
 * Presentation UI component rendering the tenant delete dialog.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function TenantDeleteDialog({
  open,
  onOpenChange,
  tenant,
  onConfirm,
  isDeleting,
}: TenantDeleteDialogProps) {
  const { t } = useI18n();
  const {
    cascadeChildren,
    setCascadeChildren,
    canCascadeDelete,
    descendantCount,
    isLoading,
    hasDescendants,
    isConfirmDisabled,
    handleConfirm,
  } = useTenantDeleteViewModel({ open, tenant, onConfirm, onOpenChange });

  return (
    <ConfirmationDialog
      open={open}
      onOpenChange={onOpenChange}
      variant="destructive"
      title={t("common.confirmDelete")}
      description={t("tenant.deleteConfirmation", { name: tenant?.name ?? "" })}
      confirmText={t("common.delete")}
      cancelText={t("common.cancel")}
      onConfirm={handleConfirm}
      isLoading={isDeleting || isLoading}
      disableConfirm={isConfirmDisabled}
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-4">
          <LoadingSpinner size="sm" showText={false} />
        </div>
      ) : hasDescendants ? (
        canCascadeDelete ? (
          <div className="rounded-nx-md border border-warning/30 bg-warning/10 p-4">
            <p className="text-sm font-medium text-warning">
              {t("tenant.hasDescendants", { count: descendantCount })}
            </p>
            <div className="mt-3 flex items-center gap-2">
              <Checkbox
                id="cascade"
                checked={cascadeChildren}
                onCheckedChange={(checked) => setCascadeChildren(checked === true)}
              />
              <label htmlFor="cascade" className="text-sm text-warning">
                {t("tenant.cascadeDelete")}
              </label>
            </div>
          </div>
        ) : (
          <div className="rounded-nx-md border border-destructive/30 bg-destructive/10 p-4">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 shrink-0 text-destructive" aria-hidden="true" />
              <p className="text-sm font-medium text-destructive">
                {t("tenant.cascadeDeleteNotPermitted", { count: descendantCount })}
              </p>
            </div>
          </div>
        )
      ) : (
        <p className="text-sm text-nx-ink-2">{t("common.deleteWarning")}</p>
      )}
    </ConfirmationDialog>
  );
}
