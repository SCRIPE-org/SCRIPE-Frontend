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
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900 dark:bg-yellow-950">
            <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              {t("tenant.hasDescendants") || `This tenant has ${descendantCount} descendant(s).`}
            </p>
            <div className="mt-3 flex items-center gap-2">
              <Checkbox
                id="cascade"
                checked={cascadeChildren}
                onCheckedChange={(checked) => setCascadeChildren(checked === true)}
              />
              <label htmlFor="cascade" className="text-sm text-yellow-700 dark:text-yellow-300">
                {t("tenant.cascadeDelete") ||
                  "Delete all descendants (admins and roles will also be deleted)"}
              </label>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-red-600 dark:text-red-400" />
              <p className="text-sm font-medium text-red-800 dark:text-red-200">
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
