"use client";

import { useState, useCallback, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@core/ui/dialog";
import { Button } from "@core/ui/button";
import { Label } from "@core/ui/label";
import { useI18n } from "@core/providers/i18n-provider";
import type { Admin } from "../../domain/entities/Admin";
import { GenericSelect } from "@core/crud/components/generic-select";
import { systemContainer } from "@modules/system/di";
import { usePermissions } from "@core/providers/permission-provider";
import { Switch } from "@core/ui/switch";

interface AdminTransferDialogProps {
      open: boolean;
      onOpenChange: (open: boolean) => void;
      admin: Admin | null;
      onTransfer: (adminId: string, request: import("../../domain/entities/AdminRequests").TransferAdminRequest) => Promise<void>;
      isTransferring: boolean;
}

export function AdminTransferDialog({
      open,
      onOpenChange,
      admin,
      onTransfer,
      isTransferring
}: AdminTransferDialogProps) {
      const { t, language } = useI18n();
      const { isSuperAdmin } = usePermissions();

      const [targetTenantId, setTargetTenantId] = useState<string>("");
      const [targetRoleId, setTargetRoleId] = useState<string>("");
      const [isSystemAdmin, setIsSystemAdmin] = useState(false);

      // Reset state when dialog opens
      useEffect(() => {
            if (open) {
                  setTargetTenantId("");
                  setTargetRoleId("");
                  setIsSystemAdmin(false);
            }
      }, [open]);

      // Reset role when tenant changes
      useEffect(() => {
            setTargetRoleId("");
      }, [targetTenantId, isSystemAdmin]);

      const handleTransfer = async () => {
            if (!admin || !targetRoleId) return;
            if (!isSystemAdmin && !targetTenantId) return;

            await onTransfer(admin.id, {
                  targetTenantId: isSystemAdmin ? null : targetTenantId,
                  targetRoleId
            });
            onOpenChange(false);
      };

      const handleTenantSearch = useCallback(async (query: string) => {
            try {
                  if (isSuperAdmin) {
                        const result = await systemContainer.tenantRepository.getAll({
                              search: query,
                              page: 1,
                              pageSize: 20
                        });
                        return result.items.map(tenant => ({
                              value: tenant.id,
                              label: `${tenant.name} (${tenant.code})`
                        }));
                  } else {
                        // For Tenant Admins, use myChildren (as requested)
                        // This endpoint returns all accessible children, so we filter locally
                        const result = await systemContainer.tenantRepository.getMyChildren();

                        const filtered = query
                              ? result.filter(t =>
                                    t.name.toLowerCase().includes(query.toLowerCase()) ||
                                    t.code.toLowerCase().includes(query.toLowerCase())
                              )
                              : result;

                        return filtered.map(tenant => ({
                              value: tenant.id,
                              label: `${tenant.name} (${tenant.code})`
                        }));
                  }
            } catch (e) {
                  return [];
            }
      }, [isSuperAdmin]);

      const handleRoleSearch = useCallback(async (query: string) => {
            try {
                  // If System Admin is selected, search global roles (no tenantId)
                  // If Tenant is selected, search roles for that tenant
                  const searchTenantId = isSystemAdmin ? undefined : targetTenantId;

                  // Don't search if we need a tenant but don't have one
                  if (!isSystemAdmin && !searchTenantId) return [];

                  const result = await systemContainer.roleRepository.getAll({
                        search: query,
                        page: 1,
                        pageSize: 20,
                        tenantId: searchTenantId
                  });

                  return result.items.map(role => ({
                        value: role.id,
                        label: language === 'ar' ? role.nameAr : role.nameEn
                  }));
            } catch (e) {
                  return [];
            }
      }, [targetTenantId, isSystemAdmin, language]);

      if (!admin) return null;

      return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                  <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                              <DialogTitle>{t("admin.transferTitle") || "Transfer Admin"}</DialogTitle>
                              <DialogDescription>
                                    {t("admin.transferDesc") || "Transfer this admin to another tenant. This will remove them from the current tenant."}
                              </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-4 py-4">
                              {/* System Admin Toggle (Super Admins Only) */}
                              {isSuperAdmin && (
                                    <div className="flex items-center justify-between space-x-2 border p-3 rounded-md">
                                          <div className="space-y-0.5">
                                                <Label htmlFor="system-admin-mode">{t("admin.transferToSystem") || "Promote to System Admin"}</Label>
                                                <p className="text-xs text-muted-foreground">
                                                      {t("admin.transferToSystemDesc") || "Transfer to system level (no tenant)."}
                                                </p>
                                          </div>
                                          <Switch
                                                id="system-admin-mode"
                                                checked={isSystemAdmin}
                                                onCheckedChange={setIsSystemAdmin}
                                          />
                                    </div>
                              )}

                              {/* Tenant Selection */}
                              {!isSystemAdmin && (
                                    <div className="space-y-2">
                                          <Label>{t("admin.targetTenant") || "Target Tenant"}</Label>
                                          <GenericSelect
                                                type="searchable"
                                                searchType="server"
                                                placeholder={t("admin.selectTenant") || "Select target tenant..."}
                                                searchPlaceholder={t("common.search") || "Search..."}
                                                onServerSearch={handleTenantSearch}
                                                onValueChange={(val: string | string[]) => setTargetTenantId(val as string)}
                                                value={targetTenantId}
                                                disabled={isTransferring}
                                          />
                                    </div>
                              )}

                              {/* Role Selection */}
                              <div className="space-y-2">
                                    <Label>{t("admin.targetRole") || "Target Role"}</Label>
                                    <GenericSelect
                                          key={isSystemAdmin ? 'system' : targetTenantId} // Force re-render/reset when context changes
                                          type="searchable"
                                          searchType="server"
                                          placeholder={t("admin.selectRole") || "Select role..."}
                                          searchPlaceholder={t("common.search") || "Search roles..."}
                                          onServerSearch={handleRoleSearch}
                                          onValueChange={(val: string | string[]) => setTargetRoleId(val as string)}
                                          value={targetRoleId}
                                          disabled={isTransferring || (!isSystemAdmin && !targetTenantId)}
                                    />
                                    {!isSystemAdmin && !targetTenantId && (
                                          <p className="text-xs text-muted-foreground">
                                                {t("admin.selectTenantFirst") || "Please select a tenant first."}
                                          </p>
                                    )}
                              </div>
                        </div>

                        <DialogFooter>
                              <Button
                                    variant="outline"
                                    onClick={() => onOpenChange(false)}
                                    disabled={isTransferring}
                              >
                                    {t("common.cancel")}
                              </Button>
                              <Button
                                    onClick={handleTransfer}
                                    disabled={isTransferring || !targetRoleId || (!isSystemAdmin && !targetTenantId)}
                              >
                                    {t("admin.transferConfirm") || "Transfer"}
                              </Button>
                        </DialogFooter>
                  </DialogContent>
            </Dialog>
      );
}
