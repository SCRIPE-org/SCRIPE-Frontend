/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { usePermissions } from "@core/hooks/use-permissions";
import { isSudoCancelledError, useSudoStore } from "@core/store/useSudoStore";
import { SYSTEM_PERMISSIONS } from "@core/common/types/permissions";
import { identityContainer } from "@modules/identity/di";
import type { Tenant } from "../../domain/entities/Tenant";
import { appLogger } from "@/core/common/logger";

/**
 * Exported type defining parameters and fields for tenant status configurations.
 */
export type TenantStatus = "active" | "suspended" | "canceled" | "expired" | "inactive";

interface UseTenantHeaderViewModelProps {
  tenant: Tenant;
  onUpdate?: () => void;
}

/**
 * React hook/ViewModel orchestrating state and data flows for tenant header view model.
 * Handles active states updates, form fields validations, and browser navigation controllers.
 */
export function useTenantHeaderViewModel({ tenant, onUpdate }: UseTenantHeaderViewModelProps) {
  const { t, direction } = useI18n();
  const { success: toastSuccess, error: toastError, info: toastInfo } = useEnhancedToast();
  const { hasPermission } = usePermissions();
  const isRtl = direction === "rtl";

  // Compute status
  const status: TenantStatus = (() => {
    const raw = tenant as any;
    if (raw.isSuspended && raw.suspensionType === "Canceled") return "canceled";
    if (raw.isSuspended) return "suspended";
    if (!tenant.isActive) return "inactive";
    if (tenant.editionEndDate) {
      const endDate = new Date(tenant.editionEndDate);
      if (endDate < new Date()) return "expired";
    }
    return "active";
  })();

  const daysLeft = (() => {
    if (!tenant.editionEndDate) return null;
    const end = new Date(tenant.editionEndDate);
    const now = new Date();
    return Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  })();

  const progress = (() => {
    if (!tenant.editionEndDate) return 100;
    if (daysLeft === null || daysLeft <= 0) return 0;
    if (daysLeft >= 365) return 100;
    return Math.min(100, Math.round((daysLeft / 365) * 100));
  })();

  const progressColor = (() => {
    if (daysLeft === null) return "bg-primary";
    if (daysLeft <= 0) return "bg-destructive";
    if (daysLeft <= 7) return "bg-destructive";
    if (daysLeft <= 30) return "bg-warning";
    return "bg-success";
  })();

  // Permissions
  const canUpdate = hasPermission(SYSTEM_PERMISSIONS.TENANTS_UPDATE);
  const canDelete = hasPermission(SYSTEM_PERMISSIONS.TENANTS_DELETE);
  const canDrillDown = hasPermission(SYSTEM_PERMISSIONS.TENANTS_DRILL_DOWN);

  // Dialog states
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [statusConfirmOpen, setStatusConfirmOpen] = useState(false);

  // Edit form
  const [editForm, setEditForm] = useState({
    name: tenant.name,
    description: tenant.description || "",
    isActive: tenant.isInternal ? true : tenant.isActive,
  });

  const notifyMutationError = (error: unknown) => {
    if (isSudoCancelledError(error)) {
      toastInfo?.({
        title: t("profile.sudo.cancelledTitle"),
        description: t("profile.sudo.cancelledDescription"),
      });
      return;
    }
    const err = error as { message?: string };
    toastError({
      title: t("common.error"),
      description: err?.message || t("common.error"),
    });
  };

  const handleEditSubmit = async () => {
    try {
      setIsUpdating(true);
      await identityContainer.tenantRepository.update(tenant.id, {
        name: editForm.name,
        description: editForm.description || undefined,
        isActive: tenant.isInternal ? true : editForm.isActive,
      });
      toastSuccess({
        title: t("tenant.updated"),
        description: t("tenant.updatedDescription"),
      });
      setEditOpen(false);
      onUpdate?.();
    } catch (error) {
      appLogger.error("Failed to update tenant:", error);
      notifyMutationError(error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleStatus = async () => {
    try {
      setIsUpdating(true);
      await identityContainer.tenantRepository.toggleStatus(tenant.id, !tenant.isActive);
      toastSuccess({
        title: t("tenant.updated"),
        description: t("tenant.updatedDescription"),
      });
      onUpdate?.();
    } catch (error) {
      appLogger.error("Failed to toggle tenant status:", error);
      notifyMutationError(error);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (cascadeChildren: boolean) => {
    try {
      setIsDeleting(true);
      await identityContainer.tenantRepository.delete(tenant.id, { cascadeChildren });
      toastSuccess({
        title: t("tenant.deleted"),
        description: t("tenant.deletedDescription"),
      });
      window.location.href = "/tenants";
    } catch (error) {
      appLogger.error("Failed to delete tenant:", error);
      notifyMutationError(error);
      setIsDeleting(false);
      throw error;
    }
  };

  const handleEditOpenChange = (open: boolean) => {
    if (!open && useSudoStore.getState().modalOpen) return;
    setEditOpen(open);
    if (open) {
      setEditForm({
        name: tenant.name,
        description: tenant.description || "",
        isActive: tenant.isInternal ? true : tenant.isActive,
      });
    }
  };

  const handleSetFormName = (name: string) => {
    setEditForm((prev) => ({ ...prev, name }));
  };

  const handleSetFormDescription = (description: string) => {
    setEditForm((prev) => ({ ...prev, description }));
  };

  const handleSetFormActive = (isActive: boolean) => {
    setEditForm((prev) => ({ ...prev, isActive }));
  };

  return {
    t,
    direction,
    isRtl,
    status,
    daysLeft,
    progress,
    progressColor,
    canUpdate,
    canDelete,
    canDrillDown,
    editOpen,
    deleteOpen,
    isUpdating,
    isDeleting,
    statusConfirmOpen,
    setStatusConfirmOpen,
    setDeleteOpen,
    editForm,
    handleEditSubmit,
    handleToggleStatus,
    handleDelete,
    handleEditOpenChange,
    handleSetFormName,
    handleSetFormDescription,
    handleSetFormActive,
  };
}
