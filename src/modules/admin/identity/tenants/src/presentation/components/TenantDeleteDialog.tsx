/**
 * Tenant Delete Dialog
 *
 * Uses ConfirmationDialog with cascade warning for descendants.
 * Cascade checkbox is gated behind tenants.cascade_delete permission.
 */
"use client";

import { ConfirmationDialog } from "@core/ui/confirmation-dialog";
import { Checkbox } from "@core/ui/checkbox";
import { Loader2, ShieldAlert } from "lucide-react";
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
  const {
    t,
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
      title={t("common.confirmDelete") || "Confirm Delete"}
      description={
        t("tenant.deleteConfirm") || `Are you sure you want to delete "${tenant?.name}"?`
      }
      confirmText={t("common.delete") || "Delete"}
      cancelText={t("common.cancel") || "Cancel"}
      onConfirm={handleConfirm}
      isLoading={isDeleting || isLoading}
      disableConfirm={isConfirmDisabled}
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : hasDescendants ? (
        canCascadeDelete ? (
          <div className="rounded-lg border border-warning/30 bg-warning/10 p-4">
            <p className="text-sm font-medium text-warning">
              {t("tenant.hasDescendants") || `This tenant has ${descendantCount} descendant(s).`}
            </p>
            <div className="mt-3 flex items-center gap-2">
              <Checkbox
                id="cascade"
                checked={cascadeChildren}
                onCheckedChange={(checked) => setCascadeChildren(checked === true)}
              />
              <label htmlFor="cascade" className="text-sm text-warning">
                {t("tenant.cascadeDelete") ||
                  "Delete all descendants (admins and roles will also be deleted)"}
              </label>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-destructive" />
              <p className="text-sm font-medium text-destructive">
                {t("tenant.cascadeDeleteNotPermitted") ||
                  `This tenant has ${descendantCount} descendant(s). You do not have permission to cascade delete.`}
              </p>
            </div>
          </div>
        )
      ) : (
        <p className="text-sm text-muted-foreground">
          {t("common.deleteWarning") || "This action cannot be undone."}
        </p>
      )}
    </ConfirmationDialog>
  );
}
