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
} from "lucide-react";
import { systemContainer } from "@modules/system/di";
import type { Tenant } from "../../domain/entities/Tenant";
import { cn } from "@core/common/utils";

interface TenantHeaderProps {
      tenant: Tenant;
      onUpdate?: () => void;
}

export function TenantHeader({ tenant, onUpdate }: TenantHeaderProps) {
      const { t, direction } = useI18n();
      const isRtl = direction === "rtl";

      // Dialog states
      const [editOpen, setEditOpen] = useState(false);
      const [deleteOpen, setDeleteOpen] = useState(false);
      const [isUpdating, setIsUpdating] = useState(false);
      const [isDeleting, setIsDeleting] = useState(false);

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
                  console.error("Failed to update tenant:", error);
            } finally {
                  setIsUpdating(false);
            }
      };

      // Handle status toggle
      const handleToggleStatus = async () => {
            try {
                  setIsUpdating(true);
                  await systemContainer.tenantRepository.update(tenant.id, {
                        isActive: !tenant.isActive,
                  });
                  onUpdate?.();
            } catch (error) {
                  console.error("Failed to toggle tenant status:", error);
            } finally {
                  setIsUpdating(false);
            }
      };

      // Handle delete
      const handleDelete = async () => {
            try {
                  setIsDeleting(true);
                  await systemContainer.tenantRepository.delete(tenant.id);
                  // Navigate away after delete
                  window.location.href = "/tenants";
            } catch (error) {
                  console.error("Failed to delete tenant:", error);
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
                                          ? "right-0 left-0 bg-gradient-to-l from-primary via-primary/70 to-primary/40"
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
                              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                    {/* Tenant Info */}
                                    <div className="flex items-start gap-4">
                                          {/* Icon */}
                                          <div
                                                className={cn(
                                                      "flex items-center justify-center",
                                                      "h-16 w-16 rounded-xl shrink-0",
                                                      "bg-gradient-to-br from-primary/20 to-primary/5",
                                                      "border border-primary/20",
                                                      "shadow-lg shadow-primary/10"
                                                )}
                                          >
                                                <Building2 className="h-8 w-8 text-primary" />
                                          </div>

                                          {/* Text Info */}
                                          <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-3 mb-2">
                                                      <h1 className="text-2xl font-bold tracking-tight break-words">
                                                            {tenant.name}
                                                      </h1>
                                                      <Badge
                                                            variant={tenant.isActive ? "success" : "secondary"}
                                                            className="text-xs shrink-0"
                                                      >
                                                            {tenant.isActive
                                                                  ? t("common.active")
                                                                  : t("common.inactive")}
                                                      </Badge>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                                                      <span className="font-mono bg-muted px-2 py-0.5 rounded shrink-0">
                                                            {tenant.code}
                                                      </span>
                                                      {tenant.description && (
                                                            <span className="max-w-md truncate">
                                                                  {tenant.description}
                                                            </span>
                                                      )}
                                                </div>
                                          </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-wrap items-center gap-2 shrink-0">
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
                                          <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={handleToggleStatus}
                                                disabled={isUpdating}
                                          >
                                                {isUpdating ? (
                                                      <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                      <Power className="h-4 w-4" />
                                                )}
                                                <span className="ms-2">
                                                      {tenant.isActive
                                                            ? t("common.deactivate")
                                                            : t("common.activate")}
                                                </span>
                                          </Button>
                                          <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => setDeleteOpen(true)}
                                          >
                                                <Trash2 className="h-4 w-4" />
                                                <span className="ms-2">{t("common.delete")}</span>
                                          </Button>
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
                                                onChange={(e) =>
                                                      setEditForm((prev) => ({ ...prev, name: e.target.value }))
                                                }
                                          />
                                    </div>
                                    <div className="space-y-2">
                                          <Label htmlFor="description">
                                                {t("tenant.descriptionLabel")}
                                          </Label>
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
                                          {isUpdating && <Loader2 className="h-4 w-4 me-2 animate-spin" />}
                                          {t("common.save")}
                                    </Button>
                              </DialogFooter>
                        </DialogContent>
                  </Dialog>

                  {/* Delete Confirmation Dialog */}
                  <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                        <DialogContent dir={direction}>
                              <DialogHeader>
                                    <DialogTitle>{t("tenant.deleteTenant")}</DialogTitle>
                                    <DialogDescription>
                                          {t("tenant.deleteConfirmation", { name: tenant.name })}
                                    </DialogDescription>
                              </DialogHeader>
                              <DialogFooter className={cn(isRtl && "flex-row-reverse sm:flex-row-reverse")}>
                                    <Button variant="outline" onClick={() => setDeleteOpen(false)}>
                                          {t("common.cancel")}
                                    </Button>
                                    <Button
                                          variant="destructive"
                                          onClick={handleDelete}
                                          disabled={isDeleting}
                                    >
                                          {isDeleting && <Loader2 className="h-4 w-4 me-2 animate-spin" />}
                                          {t("common.delete")}
                                    </Button>
                              </DialogFooter>
                        </DialogContent>
                  </Dialog>
            </>
      );
}
