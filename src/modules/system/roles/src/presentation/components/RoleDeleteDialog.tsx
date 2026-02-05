/**
 * Role Delete Dialog
 *
 * Uses ConfirmationDialog with fallback role selection for roles with admins.
 */
"use client";

import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useI18n } from "@core/providers/i18n-provider";
import { ConfirmationDialog } from "@core/ui/confirmation-dialog";
import { Loader2, Users } from "lucide-react";
import GenericSelect, { type GenericSelectOption } from "@core/crud/components/generic-select";
import { systemContainer } from "@modules/system/di";
import type { Role } from "../../domain/entities/Role";

interface RoleDeleteDialogProps {
      open: boolean;
      onOpenChange: (open: boolean) => void;
      role: Role | null;
      tenantId?: string;
      onConfirm: (fallbackRoleId?: string) => Promise<void>;
      isDeleting?: boolean;
}

export function RoleDeleteDialog({
      open,
      onOpenChange,
      role,
      tenantId,
      onConfirm,
      isDeleting,
}: RoleDeleteDialogProps) {
      const { t, language } = useI18n();
      const [fallbackRoleId, setFallbackRoleId] = useState<string>("");

      // Reset fallback selection when dialog opens
      useEffect(() => {
            if (open) {
                  setFallbackRoleId("");
            }
      }, [open]);

      // Fetch admin count for this role
      const { data: adminCount = 0, isLoading: isLoadingCount } = useQuery({
            queryKey: ["role-admin-count", role?.id],
            queryFn: async () => {
                  if (!role?.id) return 0;
                  return systemContainer.roleRepository.getAdminCount(role.id);
            },
            enabled: open && !!role?.id,
      });

      // Fetch other roles in the same tenant for fallback selection
      const { data: availableRoles = [], isLoading: isLoadingRoles } = useQuery({
            queryKey: ["roles-for-fallback", tenantId, role?.id],
            queryFn: async () => {
                  const result = await systemContainer.roleRepository.getAll({
                        page: 1,
                        pageSize: 100,
                        tenantId: tenantId,
                  });
                  // Filter out the current role being deleted
                  return result.items.filter((r) => r.id !== role?.id);
            },
            enabled: open && !!role?.id && adminCount > 0,
      });

      // Convert roles to GenericSelect options
      const roleOptions: GenericSelectOption[] = useMemo(() => {
            return availableRoles.map((r) => ({
                  value: r.id,
                  label: language === 'ar' ? r.nameAr : r.nameEn,
            }));
      }, [availableRoles]);

      const hasAdmins = adminCount > 0;
      const isLoading = isLoadingCount || (hasAdmins && isLoadingRoles);

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
                        `Are you sure you want to delete the role "${language === 'ar' ? role?.nameAr : role?.nameEn}"?`
                  }
                  confirmText={t("common.delete") || "Delete"}
                  cancelText={t("common.cancel") || "Cancel"}
                  onConfirm={handleConfirm}
                  isLoading={isDeleting || isLoading}
                  disableConfirm={hasAdmins && !fallbackRoleId}
            >
                  {isLoading ? (
                        <div className="flex items-center justify-center py-4">
                              <Loader2 className="h-6 w-6 animate-spin" />
                        </div>
                  ) : hasAdmins ? (
                        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900 dark:bg-yellow-950">
                              <div className="flex items-center gap-2 text-sm font-medium text-yellow-800 dark:text-yellow-200">
                                    <Users className="h-4 w-4" />
                                    {t("role.hasAdmins") ||
                                          `This role is assigned to ${adminCount} admin(s).`}
                              </div>
                              <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
                                    {t("role.selectFallback") ||
                                          "Select a fallback role to transfer these admins before deletion:"}
                              </p>

                              <div className="mt-3">
                                    <GenericSelect
                                          options={roleOptions}
                                          value={fallbackRoleId}
                                          onChange={(value: string | string[] | null) =>
                                                setFallbackRoleId(value as string)
                                          }
                                          placeholder={
                                                t("role.selectFallbackPlaceholder") || "Select a role..."
                                          }
                                          searchable
                                    />
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
