/**
 * Tenant Header Component
 *
 * The record's PageHeader: icon tile, title, status badge, description, a
 * ruled meta strip (code / edition / days left / end date) and the primary
 * actions. Status banners compose Alert; the destructive/confirming dialogs
 * compose ConfirmationDialog (delete) and TenantDeleteDialog (delete, with
 * cascade warning). Full RTL/LTR support by construction (logical
 * properties throughout, no directional class branching).
 *
 * @module tenants
 */
"use client";

import React, { useMemo } from "react";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { PageHeader, type PageHeaderMeta } from "@core/ui/page-header";
import { ConfirmationDialog } from "@core/ui/confirmation-dialog";
import { Building2, Pencil, Power, Trash2, LogIn, Pause, Ban, XCircle } from "lucide-react";
import type { Tenant } from "../../domain/entities/Tenant";
import { TenantDeleteDialog } from "./TenantDeleteDialog";
import { TenantEditDialog } from "./TenantEditDialog";
import { TenantHeaderStatusBanners } from "./TenantHeaderStatusBanners";
import { cn, formatDateUtc } from "@core/common/utils";
import { useTenantHeaderViewModel, TenantStatus } from "../viewmodels/useTenantHeaderViewModel";

interface TenantHeaderProps {
  tenant: Tenant;
  onUpdate?: () => void;
  onEnter?: () => void;
}

/**
 * Presentation UI component rendering the tenant header.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function TenantHeader({ tenant, onUpdate, onEnter }: TenantHeaderProps) {
  const {
    t,
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
  } = useTenantHeaderViewModel({ tenant, onUpdate });

  const suspensionReason = (tenant as { suspensionReason?: string }).suspensionReason;

  // Status badge
  const statusBadge = useMemo(() => {
    const labels: Record<TenantStatus, string> = {
      active: t("tenant.active"),
      suspended: t("tenant.suspended"),
      canceled: t("tenant.canceled"),
      expired: t("tenant.expired"),
      inactive: t("tenant.inactive"),
    };

    const variants: Record<TenantStatus, "success" | "warning" | "destructive" | "secondary"> = {
      active: "success",
      suspended: "warning",
      canceled: "destructive",
      expired: "destructive",
      inactive: "secondary",
    };

    const icons: Record<TenantStatus, typeof Pause | null> = {
      active: null,
      suspended: Pause,
      canceled: Ban,
      expired: XCircle,
      inactive: null,
    };

    const StatusIcon = icons[status];

    return (
      <Badge variant={variants[status]} className="gap-1 text-xs">
        {StatusIcon && <StatusIcon className="h-3 w-3" aria-hidden="true" />}
        {labels[status]}
      </Badge>
    );
  }, [status, t]);

  const meta: PageHeaderMeta[] = [
    { label: t("tenant.code"), value: tenant.code },
    ...(tenant.editionName ? [{ label: t("tenant.editionLabel"), value: tenant.editionName }] : []),
    ...(status === "active" && daysLeft !== null && daysLeft > 0
      ? [{ label: t("tenant.daysLeft"), value: daysLeft }]
      : []),
    ...(tenant.editionEndDate
      ? [{ label: t("tenant.endDate"), value: formatDateUtc(tenant.editionEndDate) }]
      : []),
  ];

  return (
    <>
      <PageHeader
        icon={Building2}
        title={tenant.name}
        badges={statusBadge}
        description={tenant.description}
        meta={meta}
        className={cn("mb-0", (status === "canceled" || status === "inactive") && "opacity-80")}
        actions={
          <>
            {onEnter && canDrillDown && status !== "canceled" && (
              <Button
                variant="default"
                size="sm"
                onClick={onEnter}
                disabled={status === "suspended"}
              >
                <LogIn className="me-1.5 h-4 w-4" aria-hidden="true" />
                {t("tenant.enterTenantWorld")}
              </Button>
            )}
            {canUpdate && (
              <Button variant="outline" size="sm" onClick={() => handleEditOpenChange(true)}>
                <Pencil className="me-1.5 h-4 w-4" aria-hidden="true" />
                {t("common.edit")}
              </Button>
            )}
            {canUpdate && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setStatusConfirmOpen(true)}
                loading={isUpdating}
              >
                {!isUpdating && <Power className="me-1.5 h-4 w-4" aria-hidden="true" />}
                {tenant.isActive ? t("common.deactivate") : t("common.activate")}
              </Button>
            )}
            {canDelete && (
              <Button variant="destructive" size="sm" onClick={() => setDeleteOpen(true)}>
                <Trash2 className="me-1.5 h-4 w-4" aria-hidden="true" />
                {t("common.delete")}
              </Button>
            )}
          </>
        }
      >
        <TenantHeaderStatusBanners
          status={status}
          suspensionReason={suspensionReason}
          editionName={tenant.editionName}
          editionEndDate={tenant.editionEndDate}
          daysLeft={daysLeft}
          progress={progress}
          progressColor={progressColor}
        />
      </PageHeader>

      {/* Edit Dialog */}
      <TenantEditDialog
        open={editOpen}
        onOpenChange={handleEditOpenChange}
        form={editForm}
        onSetName={handleSetFormName}
        onSetDescription={handleSetFormDescription}
        onSetActive={handleSetFormActive}
        onSubmit={handleEditSubmit}
        isUpdating={isUpdating}
      />

      {/* Delete Dialog */}
      <TenantDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        tenant={tenant}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />

      {/* Status Toggle Confirmation */}
      <ConfirmationDialog
        open={statusConfirmOpen}
        onOpenChange={setStatusConfirmOpen}
        variant={tenant.isActive ? "warning" : "info"}
        title={tenant.isActive ? t("tenant.deactivateTenant") : t("tenant.activateTenant")}
        description={
          tenant.isActive
            ? t("tenant.deactivateConfirmation", { name: tenant.name })
            : t("tenant.activateConfirmation", { name: tenant.name })
        }
        confirmText={tenant.isActive ? t("common.deactivate") : t("common.activate")}
        cancelText={t("common.cancel")}
        onConfirm={async () => {
          await handleToggleStatus();
          setStatusConfirmOpen(false);
        }}
        isLoading={isUpdating}
      />
    </>
  );
}
