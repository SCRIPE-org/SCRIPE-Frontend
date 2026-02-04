/**
 * Tenant Delete Dialog
 *
 * Uses ConfirmationDialog with cascade warning for descendants.
 */
"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useI18n } from "@core/providers/i18n-provider";
import { ConfirmationDialog } from "@core/ui/confirmation-dialog";
import { Checkbox } from "@core/ui/checkbox";
import { Loader2 } from "lucide-react";
import { systemContainer } from "@modules/system/di";
import type { Tenant } from "../../domain/entities/Tenant";

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
      const { t } = useI18n();
      const [cascadeChildren, setCascadeChildren] = useState(false);

      // Reset cascade checkbox when dialog opens
      useEffect(() => {
            if (open) {
                  setCascadeChildren(false);
            }
      }, [open]);

      // Fetch descendant count when dialog opens
      const { data: descendantCount = 0, isLoading } = useQuery({
            queryKey: ["tenant-descendant-count", tenant?.id],
            queryFn: async () => {
                  if (!tenant?.id) return 0;
                  return systemContainer.tenantRepository.getDescendantCount(tenant.id);
            },
            enabled: open && !!tenant?.id,
      });

      const hasDescendants = descendantCount > 0;

      const handleConfirm = async () => {
            await onConfirm(cascadeChildren);
            onOpenChange(false);
      };

      return (
            <ConfirmationDialog
                  open={open}
                  onOpenChange={onOpenChange}
                  variant="destructive"
                  title={t("common.confirmDelete") || "Confirm Delete"}
                  description={
                        t("tenant.deleteConfirm") ||
                        `Are you sure you want to delete "${tenant?.name}"?`
                  }
                  confirmText={t("common.delete") || "Delete"}
                  cancelText={t("common.cancel") || "Cancel"}
                  onConfirm={handleConfirm}
                  isLoading={isDeleting || isLoading}
                  disableConfirm={hasDescendants && !cascadeChildren}
            >
                  {isLoading ? (
                        <div className="flex items-center justify-center py-4">
                              <Loader2 className="h-6 w-6 animate-spin" />
                        </div>
                  ) : hasDescendants ? (
                        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900 dark:bg-yellow-950">
                              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                                    {t("tenant.hasDescendants") ||
                                          `This tenant has ${descendantCount} descendant(s).`}
                              </p>
                              <div className="mt-3 flex items-center space-x-2">
                                    <Checkbox
                                          id="cascade"
                                          checked={cascadeChildren}
                                          onCheckedChange={(checked) =>
                                                setCascadeChildren(checked === true)
                                          }
                                    />
                                    <label
                                          htmlFor="cascade"
                                          className="text-sm text-yellow-700 dark:text-yellow-300"
                                    >
                                          {t("tenant.cascadeDelete") ||
                                                "Delete all descendants (admins and roles will also be deleted)"}
                                    </label>
                              </div>
                        </div>
                  ) : (
                        <p className="text-sm text-muted-foreground">
                              {t("common.deleteWarning") || "This action cannot be undone."}
                        </p>
                  )}
            </ConfirmationDialog>
      );
}
