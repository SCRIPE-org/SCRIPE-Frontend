"use client";

import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@core/ui/dialog";
import { Button } from "@core/ui/button";
import { Label } from "@core/ui/label";
import { useI18n } from "@core/providers/i18n-provider";
import type { Admin } from "../../domain/entities/Admin";
import { GenericSelect } from "@core/crud/components/generic-select";
import { systemContainer } from "@modules/identity/di";
import { appLogger } from "@/core/common/logger";
import { SYSTEM_TENANT_ID } from "@modules/identity/tenants/src/domain/entities/Tenant";

// Special value to represent "System" tenant (null ID = Super Admin)
const SYSTEM_TENANT_VALUE = SYSTEM_TENANT_ID;

interface AdminTransferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  admin: Admin | null;
  onTransfer: (
    adminId: string,
    request: import("../../domain/entities/AdminRequests").TransferAdminRequest
  ) => Promise<void>;
  isTransferring: boolean;
}

export function AdminTransferDialog({
  open,
  onOpenChange,
  admin,
  onTransfer,
  isTransferring,
}: AdminTransferDialogProps) {
  const { t, language } = useI18n();

  // targetTenantId can be:
  // - "" (no selection)
  // - "__SYSTEM__" (System tenant = promote to super admin)
  // - "actual-tenant-id" (regular tenant)
  const [targetTenantId, setTargetTenantId] = useState<string>("");
  const [targetRoleId, setTargetRoleId] = useState<string>("");

  // Helpers
  const isSystemTenantSelected = targetTenantId === SYSTEM_TENANT_VALUE;
  const hasTenantSelected = targetTenantId !== "";

  // Reset state when dialog opens
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setTargetTenantId("");
      setTargetRoleId("");
    }
  }

  // Reset role when tenant changes
  const [prevTargetTenantId, setPrevTargetTenantId] = useState(targetTenantId);
  if (targetTenantId !== prevTargetTenantId) {
    setPrevTargetTenantId(targetTenantId);
    setTargetRoleId("");
  }

  const handleTransfer = async () => {
    if (!admin || !targetRoleId || !hasTenantSelected) return;

    appLogger.info("[AdminTransferDialog] Transferring admin:", {
      adminId: admin.id,
      targetTenantId: isSystemTenantSelected ? null : targetTenantId,
      targetRoleId,
      isSystemTenant: isSystemTenantSelected,
    });

    await onTransfer(admin.id, {
      // null = System tenant = Super Admin
      targetTenantId: isSystemTenantSelected ? null : targetTenantId,
      targetRoleId,
    });
    onOpenChange(false);
  };

  const handleTenantSearch = useCallback(async (query: string) => {
    try {
      // Get tenants from backend - includes "System" pseudo-tenant for Super Admins
      const result = await systemContainer.tenantRepository.getMyTenantAndChildren(query);

      return result.map((tenant) => ({
        // Use special value for null ID (System tenant)
        value: tenant.id ?? SYSTEM_TENANT_VALUE,
        label: `${tenant.name} (${tenant.code})`,
      }));
    } catch (e) {
      appLogger.error("[AdminTransferDialog] Tenant search failed:", e);
      return [];
    }
  }, []);

  const handleRoleSearch = useCallback(
    async (query: string) => {
      try {
        // For System tenant, search roles with no tenantId (system-level roles)
        // For regular tenant, search roles for that specific tenant
        const searchTenantId = isSystemTenantSelected ? undefined : targetTenantId;

        // Don't search if we haven't selected a tenant yet
        if (!hasTenantSelected) return [];

        appLogger.info("[AdminTransferDialog] Searching roles:", {
          searchTenantId,
          isSystemTenant: isSystemTenantSelected,
          query,
        });

        const result = searchTenantId
          ? await systemContainer.roleRepository.getAll({
              search: query,
              page: 1,
              pageSize: 20,
              tenantId: searchTenantId,
              strict: true,
            })
          : await systemContainer.roleRepository.getMyTenantRoles({
              search: query,
              page: 1,
              pageSize: 20,
            });

        return result.items.map((role) => ({
          value: role.id,
          label: language === "ar" ? role.nameAr : role.nameEn,
        }));
      } catch (e) {
        appLogger.error("[AdminTransferDialog] Role search failed:", e);
        return [];
      }
    },
    [targetTenantId, isSystemTenantSelected, hasTenantSelected, language]
  );

  if (!admin) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("admin.transferTitle") || "Transfer Admin"}</DialogTitle>
          <DialogDescription>
            {t("admin.transferDesc") ||
              "Transfer this admin to another tenant. This will remove them from the current tenant."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Tenant Selection */}
          <div className="space-y-2">
            <Label>{t("admin.targetTenant") || "Target Tenant"}</Label>
            <GenericSelect
              options={[]}
              type="searchable"
              searchType="server"
              placeholder={t("admin.selectTenant") || "Select target tenant..."}
              searchPlaceholder={t("common.search") || "Search..."}
              onServerSearch={handleTenantSearch}
              onValueChange={(val: string | string[]) => {
                appLogger.info("[AdminTransferDialog] Tenant selected:", val);
                setTargetTenantId(val as string);
              }}
              value={targetTenantId}
              disabled={isTransferring}
            />
          </div>

          {/* Role Selection */}
          <div className="space-y-2">
            <Label>{t("admin.targetRole") || "Target Role"}</Label>
            <GenericSelect
              key={targetTenantId} // Force re-render/reset when tenant changes
              options={[]}
              type="searchable"
              searchType="server"
              placeholder={t("admin.selectRole") || "Select role..."}
              searchPlaceholder={t("common.search") || "Search roles..."}
              onServerSearch={handleRoleSearch}
              onValueChange={(val: string | string[]) => setTargetRoleId(val as string)}
              value={targetRoleId}
              disabled={isTransferring || !hasTenantSelected}
            />
            {!hasTenantSelected && (
              <p className="text-xs text-muted-foreground">
                {t("admin.selectTenantFirst") || "Please select a tenant first."}
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isTransferring}>
            {t("common.cancel")}
          </Button>
          <Button
            onClick={handleTransfer}
            disabled={isTransferring || !targetRoleId || !hasTenantSelected}
          >
            {t("admin.transferConfirm") || "Transfer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
