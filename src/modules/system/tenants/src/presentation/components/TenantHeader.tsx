/**
 * Tenant Header Component
 *
 * Hero section with tenant info and quick actions.
 * Features glassmorphism design with proper RTL/LTR support.
 *
 * @module tenants
 */
"use client";

import React, { useState } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { usePermissions } from "@core/hooks/use-permissions";
import { SYSTEM_PERMISSIONS } from "@core/common/types/permissions";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { Card, CardContent } from "@core/ui/card";
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
import { Building2, Pencil, Power, Trash2, Loader2, LogIn, Crown, CalendarClock, ArrowRight } from "lucide-react";
import { systemContainer } from "@modules/system/di";
import type { Tenant } from "../../domain/entities/Tenant";
import { TenantDeleteDialog } from "./TenantDeleteDialog";
import { cn } from "@core/common/utils";
import { appLogger } from "@/core/common/logger";

interface TenantHeaderProps {
  tenant: Tenant;
  onUpdate?: () => void;
  onEnter?: () => void;
}

export function TenantHeader({ tenant, onUpdate, onEnter }: TenantHeaderProps) {
  const { t, direction } = useI18n();
  const { hasPermission } = usePermissions();
  const isRtl = direction === "rtl";

  // Permission checks using constants
  const canUpdate = hasPermission(SYSTEM_PERMISSIONS.TENANTS_UPDATE);
  const canDelete = hasPermission(SYSTEM_PERMISSIONS.TENANTS_DELETE);
  const canDrillDown = hasPermission(SYSTEM_PERMISSIONS.TENANTS_DRILL_DOWN);

  // Dialog states
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [statusConfirmOpen, setStatusConfirmOpen] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState({
    name: tenant.name,
    description: tenant.description || "",
    isActive: tenant.isActive,
  });

  // Handle edit submit
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

  // Handle status toggle
  const handleToggleStatus = async () => {
    try {
      setIsUpdating(true);
      // Use Service's toggleStatus to handle Fetch -> Update pattern
      // This is required because backend's UpdateTenant requires Name/Description/Address
      await systemContainer.tenantService.toggleStatus(tenant.id, !tenant.isActive);
      onUpdate?.();
    } catch (error) {
      appLogger.error("Failed to toggle tenant status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle delete
  const handleDelete = async (cascadeChildren: boolean) => {
    try {
      setIsDeleting(true);
      await systemContainer.tenantRepository.delete(tenant.id, { cascadeChildren });
      // Navigate away after delete
      window.location.href = "/tenants";
    } catch (error) {
      appLogger.error("Failed to delete tenant:", error);
      setIsDeleting(false);
    }
  };

  return (
    <>
      {/* Main Header Card */}
      <div
        dir={direction}
        className={cn(
          "relative overflow-hidden rounded-2xl",
          "bg-gradient-to-br from-background via-background to-muted/50",
          "border border-border/50",
          "shadow-xl shadow-primary/5",
          "backdrop-blur-sm"
        )}
      >
        {/* Gradient Accent Line */}
        <div
          className={cn(
            "absolute top-0 h-1",
            isRtl
              ? "left-0 right-0 bg-gradient-to-l from-primary via-primary/70 to-primary/40"
              : "left-0 right-0 bg-gradient-to-r from-primary via-primary/70 to-primary/40"
          )}
        />

        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div
            className={cn(
              "absolute inset-0",
              isRtl
                ? "bg-[radial-gradient(circle_at_70%_20%,_var(--primary)_0%,_transparent_50%)]"
                : "bg-[radial-gradient(circle_at_30%_20%,_var(--primary)_0%,_transparent_50%)]"
            )}
          />
          <div
            className={cn(
              "absolute inset-0",
              isRtl
                ? "bg-[radial-gradient(circle_at_30%_80%,_var(--primary)_0%,_transparent_40%)]"
                : "bg-[radial-gradient(circle_at_70%_80%,_var(--primary)_0%,_transparent_40%)]"
            )}
          />
        </div>

        <div className="relative p-6">
          {/* Main Content */}
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            {/* Tenant Info */}
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div
                className={cn(
                  "flex items-center justify-center",
                  "h-16 w-16 shrink-0 rounded-xl",
                  "bg-gradient-to-br from-primary/20 to-primary/5",
                  "border border-primary/20",
                  "shadow-lg shadow-primary/10"
                )}
              >
                <Building2 className="h-8 w-8 text-primary" />
              </div>

              {/* Text Info */}
              <div className="min-w-0 flex-1">
                <div className="mb-2 flex flex-wrap items-center gap-3">
                  <h1 className="break-words text-2xl font-bold tracking-tight">{tenant.name}</h1>
                  <Badge
                    variant={tenant.isActive ? "success" : "secondary"}
                    className="shrink-0 text-xs"
                  >
                    {tenant.isActive ? t("common.active") : t("common.inactive")}
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span className="shrink-0 rounded bg-muted px-2 py-0.5 font-mono">
                    {tenant.code}
                  </span>
                  {tenant.description && (
                    <span className="max-w-md truncate">{tenant.description}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-2">
              {onEnter && canDrillDown && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={onEnter}
                  className="bg-primary hover:bg-primary/90"
                >
                  <LogIn className="h-4 w-4" />
                  <span className="ms-2">{t("tenant.enterTenantWorld")}</span>
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
                  <Pencil className="h-4 w-4" />
                  <span className="ms-2">{t("common.edit")}</span>
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
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Power className="h-4 w-4" />
                  )}
                  <span className="ms-2">
                    {tenant.isActive ? t("common.deactivate") : t("common.activate")}
                  </span>
                </Button>
              )}
              {canDelete && (
                <Button variant="destructive" size="sm" onClick={() => setDeleteOpen(true)}>
                  <Trash2 className="h-4 w-4" />
                  <span className="ms-2">{t("common.delete")}</span>
                </Button>
              )}
            </div>
          </div>

          {/* Subscription Card Section (Only if EditionName is present) */}
          <div className="mt-6 border-t border-border/50 pt-6">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              {t("tenant.subscriptionOverview") || "Subscription Overview"}
            </h3>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
                  <Crown className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-semibold">
                      {tenant.editionName || "Custom / Direct"}
                    </p>
                    <Badge variant="outline" className={cn(
                      "border-amber-500/30",
                      tenant.editionEndDate && new Date(tenant.editionEndDate) < new Date()
                        ? "text-red-500 bg-red-500/10 hover:bg-red-500/20"
                        : "text-amber-600 bg-amber-500/10 hover:bg-amber-500/20"
                    )}>
                      {tenant.editionEndDate && new Date(tenant.editionEndDate) < new Date() ? "Expired" : "Active"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <CalendarClock className="h-4 w-4" />
                    {tenant.editionEndDate ? (
                      <span>
                        Expires on: <span className="font-medium text-foreground">{new Date(tenant.editionEndDate).toLocaleDateString()}</span>
                      </span>
                    ) : (
                      <span>Lifetime Access</span>
                    )}
                  </div>
                </div>
              </div>

              {canUpdate && (
                <Button variant="outline" className="shrink-0 w-full md:w-auto" onClick={() => window.location.href = `/settings/tenant`}>
                  Change Plan <ArrowRight className="ms-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
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

      {/* Delete Confirmation Dialog */}
      <TenantDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        tenant={tenant}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />

      {/* Status Change Confirmation Dialog */}
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
