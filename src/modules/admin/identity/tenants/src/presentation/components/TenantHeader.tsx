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
import { Alert, AlertDescription } from "@core/ui/alert";
import { ConfirmationDialog } from "@core/ui/confirmation-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@core/ui/dialog";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Textarea } from "@core/ui/textarea";
import { Switch } from "@core/ui/switch";
import { Building2, Pencil, Power, Trash2, LogIn, Pause, Ban, XCircle, AlertTriangle } from "lucide-react";
import type { Tenant } from "../../domain/entities/Tenant";
import { TenantDeleteDialog } from "./TenantDeleteDialog";
import { cn, formatDateUtc } from "@core/common/utils";
import { useTenantHeaderViewModel, TenantStatus } from "../viewmodels/useTenantHeaderViewModel";

// ============================================
// Component
// ============================================

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

  // The domain entity has no typed suspension fields yet (see
  // domain/entities/Tenant.ts — TenantProps does not declare them even
  // though the tree-node shape does); preserved as-is, not this package's
  // file to fix.
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
              <Button variant="default" size="sm" onClick={onEnter} disabled={status === "suspended"}>
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
        {/* Status-specific banners */}
        {status === "suspended" && (
          <Alert variant="warning">
            <AlertTriangle aria-hidden="true" />
            <AlertDescription>
              <p className="font-medium text-nx-ink">{t("tenant.suspendedBanner")}</p>
              {suspensionReason && <p className="mt-0.5">{suspensionReason}</p>}
            </AlertDescription>
          </Alert>
        )}
        {status === "canceled" && (
          <Alert variant="destructive">
            <Ban aria-hidden="true" />
            <AlertDescription>
              <p className="font-medium text-nx-ink">{t("tenant.canceledBanner")}</p>
              {suspensionReason && <p className="mt-0.5">{suspensionReason}</p>}
            </AlertDescription>
          </Alert>
        )}
        {status === "expired" && (
          <Alert variant="warning">
            <XCircle aria-hidden="true" />
            <AlertDescription>
              <p className="font-medium text-nx-ink">{t("tenant.expiredBanner")}</p>
            </AlertDescription>
          </Alert>
        )}

        {/* Inline subscription progress bar */}
        {status === "active" && tenant.editionName && (
          <div className="rounded-nx-md border border-nx-line bg-nx-surface p-3">
            <div className="mb-1.5 flex items-center justify-between text-xs text-nx-ink-2">
              <span className="font-medium">
                {tenant.editionName}
                {daysLeft !== null
                  ? ` • ${daysLeft} ${t("tenant.daysLeft")}`
                  : ` • ${t("tenant.lifetime")}`}
              </span>
              {tenant.editionEndDate && (
                <span>
                  {t("tenant.endDate")}: {formatDateUtc(tenant.editionEndDate)}
                </span>
              )}
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-nx-raised">
              <div
                className={cn(
                  "h-full rounded-full transition-[width] duration-nx-standard ease-nx-enter motion-reduce:transition-none",
                  progressColor
                )}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Depleted bar for expired */}
        {status === "expired" && (
          <div className="rounded-nx-md border border-nx-line bg-nx-surface p-3">
            <p className="mb-1.5 text-xs font-medium text-destructive">
              {t("tenant.expired")} • {tenant.editionName}
            </p>
            <div className="h-2 w-full overflow-hidden rounded-full bg-nx-raised">
              <div className="h-full w-0 rounded-full bg-destructive" />
            </div>
          </div>
        )}
      </PageHeader>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={handleEditOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("tenant.editTenant")}</DialogTitle>
            <DialogDescription>{t("tenant.editDialogDescription")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="tenant-edit-name">{t("tenant.name")}</Label>
              <Input
                id="tenant-edit-name"
                value={editForm.name}
                onChange={(e) => handleSetFormName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tenant-edit-description">{t("tenant.descriptionLabel")}</Label>
              <Textarea
                id="tenant-edit-description"
                value={editForm.description}
                onChange={(e) => handleSetFormDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="tenant-edit-active">{t("tenant.activeStatus")}</Label>
              <Switch
                id="tenant-edit-active"
                checked={editForm.isActive}
                onCheckedChange={handleSetFormActive}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => handleEditOpenChange(false)}>
              {t("common.cancel")}
            </Button>
            <Button onClick={handleEditSubmit} loading={isUpdating}>
              {t("common.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
