/**
 * Tenant Header Component — Redesigned
 *
 * Premium hero section with glassmorphism card, status-specific banners,
 * inline subscription progress bar, and action buttons.
 * Full RTL/LTR support.
 *
 * @module tenants
 */
"use client";

import React, { useState, useMemo } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { usePermissions } from "@core/hooks/use-permissions";
import { SYSTEM_PERMISSIONS } from "@core/common/types/permissions";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
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
import {
  Building2,
  Pencil,
  Power,
  Trash2,
  Loader2,
  LogIn,
  Pause,
  Ban,
  XCircle,
  AlertTriangle,
  Clock,
  Play,
} from "lucide-react";
import { systemContainer } from "@modules/system/di";
import type { Tenant } from "../../domain/entities/Tenant";
import { TenantDeleteDialog } from "./TenantDeleteDialog";
import { cn } from "@core/common/utils";
import { appLogger } from "@/core/common/logger";

// ============================================
// Helpers
// ============================================

type TenantStatus = "active" | "suspended" | "canceled" | "expired" | "inactive";

function getTenantDetailStatus(tenant: Tenant): TenantStatus {
  // Suspension fields exist at runtime (from API) but TenantProps type doesn't declare them.
  // Safe access via any cast — these come from the same backend DTO.
  const raw = tenant as any;
  if (raw.isSuspended && raw.suspensionType === "Canceled") return "canceled";
  if (raw.isSuspended) return "suspended";
  if (!tenant.isActive) return "inactive";
  if (tenant.editionEndDate) {
    const endDate = new Date(tenant.editionEndDate);
    if (endDate < new Date()) return "expired";
  }
  return "active";
}

function getDaysRemaining(endDate?: string): number | null {
  if (!endDate) return null;
  const end = new Date(endDate);
  const now = new Date();
  return Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function getProgressPercentage(endDate?: string): number {
  if (!endDate) return 100;
  const days = getDaysRemaining(endDate);
  if (days === null || days <= 0) return 0;
  if (days >= 365) return 100;
  return Math.min(100, Math.round((days / 365) * 100));
}

function getProgressColor(days: number | null): string {
  if (days === null) return "bg-primary";
  if (days <= 0) return "bg-destructive";
  if (days <= 7) return "bg-red-500";
  if (days <= 30) return "bg-amber-500";
  return "bg-emerald-500";
}

const statusBorderGradient: Record<TenantStatus, string> = {
  active: "from-emerald-500 via-primary to-emerald-500",
  suspended: "from-amber-500 via-amber-400 to-amber-500",
  canceled: "from-red-500 via-red-400 to-red-500",
  expired: "from-orange-500 via-orange-400 to-orange-500",
  inactive: "from-muted-foreground/40 via-muted-foreground/20 to-muted-foreground/40",
};

const statusIconBg: Record<TenantStatus, string> = {
  active: "from-primary/20 to-emerald-500/10 border-primary/20",
  suspended: "from-amber-500/20 to-amber-500/5 border-amber-500/20",
  canceled: "from-red-500/20 to-red-500/5 border-red-500/20",
  expired: "from-orange-500/20 to-orange-500/5 border-orange-500/20",
  inactive: "from-muted to-muted/50 border-border",
};

// ============================================
// Component
// ============================================

interface TenantHeaderProps {
  tenant: Tenant;
  onUpdate?: () => void;
  onEnter?: () => void;
}

export function TenantHeader({ tenant, onUpdate, onEnter }: TenantHeaderProps) {
  const { t, direction } = useI18n();
  const { hasPermission } = usePermissions();
  const isRtl = direction === "rtl";

  const status = getTenantDetailStatus(tenant);
  const daysLeft = getDaysRemaining(tenant.editionEndDate);
  const progress = getProgressPercentage(tenant.editionEndDate);
  const progressColor = getProgressColor(daysLeft);

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
    isActive: tenant.isActive,
  });

  // Handlers
  const handleEditSubmit = async () => {
    try {
      setIsUpdating(true);
      await systemContainer.tenantRepository.update(tenant.id, {
        name: editForm.name,
        description: editForm.description || undefined,
        isActive: editForm.isActive,
      });
      setEditOpen(false);
      onUpdate?.();
    } catch (error) {
      appLogger.error("Failed to update tenant:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleStatus = async () => {
    try {
      setIsUpdating(true);
      await systemContainer.tenantService.toggleStatus(tenant.id, !tenant.isActive);
      onUpdate?.();
    } catch (error) {
      appLogger.error("Failed to toggle tenant status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (cascadeChildren: boolean) => {
    try {
      setIsDeleting(true);
      await systemContainer.tenantRepository.delete(tenant.id, { cascadeChildren });
      window.location.href = "/tenants";
    } catch (error) {
      appLogger.error("Failed to delete tenant:", error);
      setIsDeleting(false);
    }
  };

  // Status badge
  const statusBadge = useMemo(() => {
    const labels: Record<TenantStatus, string> = {
      active: t("tenant.active") || "Active",
      suspended: t("tenant.suspended") || "Suspended",
      canceled: t("tenant.canceled") || "Canceled",
      expired: t("tenant.expired") || "Expired",
      inactive: t("tenant.inactive") || "Inactive",
    };

    const variants: Record<TenantStatus, "success" | "destructive" | "outline" | "secondary"> = {
      active: "success",
      suspended: "outline",
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
      <Badge
        variant={variants[status]}
        className={cn(
          "gap-1 text-xs",
          status === "suspended" &&
          "border-amber-500/50 bg-amber-500/10 text-amber-600 dark:text-amber-400"
        )}
      >
        {StatusIcon && <StatusIcon className="h-3 w-3" />}
        {labels[status]}
      </Badge>
    );
  }, [status, t]);

  return (
    <>
      {/* Status-specific top banner */}
      {status === "suspended" && (
        <div
          dir={direction}
          className={cn(
            "flex items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4",
            "mb-4"
          )}
        >
          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-500" />
          <div className="flex-1 text-sm">
            <p className="font-medium text-amber-500">
              {t("tenant.suspendedBanner")}
            </p>
            {(tenant as any).suspensionReason && (
              <p className="mt-0.5 text-muted-foreground">{(tenant as any).suspensionReason}</p>
            )}
          </div>
          {onEnter && (
            <Button size="sm" variant="outline" className="shrink-0 border-emerald-500/50 text-emerald-500 hover:bg-emerald-500/10" disabled>
              <Play className="h-4 w-4 me-1.5" />
              {t("tenant.resume")}
            </Button>
          )}
        </div>
      )}

      {status === "canceled" && (
        <div
          dir={direction}
          className="flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/5 p-4 mb-4"
        >
          <Ban className="h-5 w-5 shrink-0 text-red-500" />
          <div className="flex-1 text-sm">
            <p className="font-medium text-red-500">{t("tenant.canceledBanner")}</p>
            {(tenant as any).suspensionReason && (
              <p className="mt-0.5 text-muted-foreground">{(tenant as any).suspensionReason}</p>
            )}
          </div>
        </div>
      )}

      {status === "expired" && (
        <div
          dir={direction}
          className="flex items-center gap-3 rounded-xl border border-orange-500/30 bg-orange-500/5 p-4 mb-4"
        >
          <XCircle className="h-5 w-5 shrink-0 text-orange-500" />
          <div className="flex-1 text-sm">
            <p className="font-medium text-orange-500">{t("tenant.expiredBanner")}</p>
          </div>
        </div>
      )}

      {/* Hero Header Card */}
      <div
        dir={direction}
        className={cn(
          "relative overflow-hidden rounded-2xl",
          "bg-gradient-to-br from-background via-background to-muted/30",
          "border border-border/50",
          "shadow-xl shadow-primary/5",
          "backdrop-blur-sm",
          (status === "canceled" || status === "inactive") && "opacity-80"
        )}
      >
        {/* Top gradient accent line */}
        <div
          className={cn(
            "absolute top-0 inset-x-0 h-1 bg-gradient-to-r",
            statusBorderGradient[status]
          )}
        />

        {/* Background decorative radials */}
        <div className="absolute inset-0 opacity-[0.03]">
          <div
            className={cn(
              "absolute inset-0",
              isRtl
                ? "bg-[radial-gradient(circle_at_70%_20%,_hsl(var(--primary))_0%,_transparent_50%)]"
                : "bg-[radial-gradient(circle_at_30%_20%,_hsl(var(--primary))_0%,_transparent_50%)]"
            )}
          />
        </div>

        <div className="relative p-6">
          {/* Main row: Info + Actions */}
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            {/* Tenant Info */}
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div
                className={cn(
                  "flex items-center justify-center",
                  "h-16 w-16 shrink-0 rounded-xl",
                  "bg-gradient-to-br border",
                  "shadow-lg shadow-primary/10",
                  statusIconBg[status]
                )}
              >
                <Building2 className="h-8 w-8 text-primary" />
              </div>

              {/* Text */}
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex flex-wrap items-center gap-3">
                  <h1 className="break-words text-2xl font-bold tracking-tight">
                    {tenant.name}
                  </h1>
                  {statusBadge}
                </div>
                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  <span className="shrink-0 rounded bg-muted px-2 py-0.5 font-mono text-xs">
                    {tenant.code}
                  </span>
                  {tenant.editionName && (
                    <Badge variant="outline" className="text-xs">
                      {tenant.editionName}
                    </Badge>
                  )}
                  {daysLeft !== null && daysLeft > 0 && status === "active" && (
                    <Badge
                      variant="outline"
                      className={cn(
                        "gap-1 text-xs",
                        daysLeft <= 7
                          ? "border-red-500/50 text-red-500"
                          : daysLeft <= 30
                            ? "border-amber-500/50 text-amber-500"
                            : "border-muted-foreground/30 text-muted-foreground"
                      )}
                    >
                      <Clock className="h-3 w-3" />
                      {daysLeft} {t("tenant.daysLeft")}
                    </Badge>
                  )}
                </div>
                {tenant.description && (
                  <p className="mt-2 max-w-lg text-sm text-muted-foreground leading-relaxed">
                    {tenant.description}
                  </p>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              {onEnter && canDrillDown && status !== "canceled" && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={onEnter}
                  disabled={status === "suspended"}
                >
                  <LogIn className="h-4 w-4 me-1.5" />
                  {t("tenant.enterTenantWorld")}
                </Button>
              )}
              {canUpdate && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditForm({
                      name: tenant.name,
                      description: tenant.description || "",
                      isActive: tenant.isActive,
                    });
                    setEditOpen(true);
                  }}
                >
                  <Pencil className="h-4 w-4 me-1.5" />
                  {t("common.edit")}
                </Button>
              )}
              {canUpdate && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setStatusConfirmOpen(true)}
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <Loader2 className="h-4 w-4 animate-spin me-1.5" />
                  ) : (
                    <Power className="h-4 w-4 me-1.5" />
                  )}
                  {tenant.isActive ? t("common.deactivate") : t("common.activate")}
                </Button>
              )}
              {canDelete && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setDeleteOpen(true)}
                >
                  <Trash2 className="h-4 w-4 me-1.5" />
                  {t("common.delete")}
                </Button>
              )}
            </div>
          </div>

          {/* Inline subscription progress bar */}
          {status === "active" && tenant.editionName && (
            <div className="mt-5 pt-5 border-t border-border/30">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                <span className="font-medium">
                  {tenant.editionName}
                  {daysLeft !== null
                    ? ` • ${daysLeft} ${t("tenant.daysLeft")}`
                    : ` • ${t("tenant.lifetime") || "Lifetime"}`}
                </span>
                {tenant.editionEndDate && (
                  <span>
                    {t("tenant.endDate")}: {new Date(tenant.editionEndDate).toLocaleDateString()}
                  </span>
                )}
              </div>
              <div className="h-2 w-full rounded-full bg-muted/50 overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-all duration-700", progressColor)}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Depleted bar for expired */}
          {status === "expired" && (
            <div className="mt-5 pt-5 border-t border-border/30">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                <span className="font-medium text-destructive">
                  {t("tenant.expired")} • {tenant.editionName}
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted/50 overflow-hidden">
                <div className="h-full w-0 rounded-full bg-destructive" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent dir={direction}>
          <DialogHeader>
            <DialogTitle>{t("tenant.editTenant")}</DialogTitle>
            <DialogDescription>{t("tenant.editDialogDescription")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t("tenant.name")}</Label>
              <Input
                id="name"
                value={editForm.name}
                onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">{t("tenant.descriptionLabel")}</Label>
              <Textarea
                id="description"
                value={editForm.description}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                rows={3}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="isActive">{t("tenant.activeStatus")}</Label>
              <Switch
                id="isActive"
                checked={editForm.isActive}
                onCheckedChange={(checked) =>
                  setEditForm((prev) => ({ ...prev, isActive: checked }))
                }
              />
            </div>
          </div>
          <DialogFooter className={cn(isRtl && "flex-row-reverse sm:flex-row-reverse")}>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button onClick={handleEditSubmit} disabled={isUpdating}>
              {isUpdating && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
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

      {/* Status Toggle Dialog */}
      <Dialog open={statusConfirmOpen} onOpenChange={setStatusConfirmOpen}>
        <DialogContent dir={direction}>
          <DialogHeader>
            <DialogTitle>
              {tenant.isActive
                ? t("tenant.deactivateTenant") || "Deactivate Tenant"
                : t("tenant.activateTenant") || "Activate Tenant"}
            </DialogTitle>
            <DialogDescription>
              {tenant.isActive
                ? t("tenant.deactivateConfirmation", { name: tenant.name }) ||
                `Are you sure you want to deactivate ${tenant.name}?`
                : t("tenant.activateConfirmation", { name: tenant.name }) ||
                `Are you sure you want to activate ${tenant.name}?`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className={cn(isRtl && "flex-row-reverse sm:flex-row-reverse")}>
            <Button variant="outline" onClick={() => setStatusConfirmOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button
              onClick={() => {
                handleToggleStatus();
                setStatusConfirmOpen(false);
              }}
              disabled={isUpdating}
            >
              {isUpdating && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
              {tenant.isActive ? t("common.deactivate") : t("common.activate")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
