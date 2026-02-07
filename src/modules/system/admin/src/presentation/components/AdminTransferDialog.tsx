"use client";

import { useState, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@core/ui/dialog";
import { Button } from "@core/ui/button";
import { Label } from "@core/ui/label";
import { useI18n } from "@core/providers/i18n-provider";
import type { Admin } from "../../domain/entities/Admin";
import { GenericSelect } from "@core/crud/components/generic-select";
import { systemContainer } from "@modules/system/di";

interface AdminTransferDialogProps {
      open: boolean;
      onOpenChange: (open: boolean) => void;
      admin: Admin | null;
      onTransfer: (adminId: string, targetTenantId: string) => Promise<void>;
      isTransferring: boolean;
}

export function AdminTransferDialog({
      open,
      onOpenChange,
      admin,
      onTransfer,
      isTransferring
}: AdminTransferDialogProps) {
      const { t } = useI18n();
      const [targetTenantId, setTargetTenantId] = useState<string>("");

      const handleTransfer = async () => {
            if (!admin || !targetTenantId) return;
            await onTransfer(admin.id, targetTenantId);
            onOpenChange(false);
            setTargetTenantId("");
      };

      const handleTenantSearch = useCallback(async (query: string) => {
            try {
                  const result = await systemContainer.tenantRepository.getAll({
                        search: query,
                        page: 1,
                        pageSize: 20
                  });
                  return result.items.map(tenant => ({
                        value: tenant.id,
                        label: `${tenant.name} (${tenant.code})`
                  }));
            } catch (e) {
                  return [];
            }
      }, []);

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
                              <div className="space-y-2">
                                    <Label>{t("admin.targetTenant") || "Target Tenant"}</Label>
                                    <GenericSelect
                                          type="server-select"
                                          placeholder={t("admin.selectTenant") || "Select target tenant..."}
                                          searchPlaceholder={t("common.search") || "Search..."}
                                          onServerSearch={handleTenantSearch}
                                          onValueChange={(val: string | string[]) => setTargetTenantId(val as string)}
                                          value={targetTenantId}
                                          disabled={isTransferring}
                                    />
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
                                    disabled={!targetTenantId || isTransferring}
                              >
                                    {t("admin.transferConfirm") || "Transfer"}
                              </Button>
                        </DialogFooter>
                  </DialogContent>
            </Dialog>
      );
}
