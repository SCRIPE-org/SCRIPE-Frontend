/**
 * Menu Form Dialog
 *
 * Bilingual create / edit form for menu items.
 * Handles slug, names (EN/AR), href, icon, and resource fields.
 */
"use client";

import { useState, useCallback } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import {
      Dialog,
      DialogContent,
      DialogHeader,
      DialogTitle,
      DialogDescription,
      DialogFooter,
} from "@core/ui/dialog";
import type { MenuTreeNode } from "../../domain/entities/MenuItem";
import type { CreateMenuItemRequest, UpdateMenuItemRequest } from "../../domain/entities/MenuItemRequests";

/* -------------------------------------------------------------------------- */
/*  Props                                                                      */
/* -------------------------------------------------------------------------- */

export interface MenuFormDialogProps {
      open: boolean;
      onOpenChange: (open: boolean) => void;
      mode: "create" | "edit";
      parentNode?: MenuTreeNode | null;
      editNode?: MenuTreeNode | null;
      onSubmit: (data: CreateMenuItemRequest | { id: string; request: UpdateMenuItemRequest }) => Promise<void>;
      isPending: boolean;
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                  */
/* -------------------------------------------------------------------------- */

export function MenuFormDialog({
      open,
      onOpenChange,
      mode,
      parentNode,
      editNode,
      onSubmit,
      isPending,
}: MenuFormDialogProps) {
      const { t } = useI18n();

      const [slug, setSlug] = useState(editNode?.slug ?? "");
      const [nameEn, setNameEn] = useState(editNode?.nameEn ?? "");
      const [nameAr, setNameAr] = useState(editNode?.nameAr ?? "");
      const [href, setHref] = useState(editNode?.href ?? "");
      const [icon, setIcon] = useState(editNode?.icon ?? "");
      const [resource, setResource] = useState(editNode?.resource ?? "");

      // Reset form when dialog opens with new data
      const resetForm = useCallback(() => {
            setSlug(editNode?.slug ?? "");
            setNameEn(editNode?.nameEn ?? "");
            setNameAr(editNode?.nameAr ?? "");
            setHref(editNode?.href ?? "");
            setIcon(editNode?.icon ?? "");
            setResource(editNode?.resource ?? "");
      }, [editNode]);

      const handleOpenChange = (isOpen: boolean) => {
            if (isOpen) resetForm();
            onOpenChange(isOpen);
      };

      const handleSubmit = async (e: React.FormEvent) => {
            e.preventDefault();
            if (!nameEn.trim() || !slug.trim()) return;

            if (mode === "create") {
                  await onSubmit({
                        slug: slug.trim(),
                        nameEn: nameEn.trim(),
                        nameAr: nameAr.trim() || nameEn.trim(),
                        href: href.trim() || undefined,
                        icon: icon.trim() || undefined,
                        parentMenuItemId: parentNode?.id,
                        resource: resource.trim() || undefined,
                  } as CreateMenuItemRequest);
            } else if (editNode) {
                  await onSubmit({
                        id: editNode.id,
                        request: {
                              slug: slug.trim(),
                              nameEn: nameEn.trim(),
                              nameAr: nameAr.trim() || nameEn.trim(),
                              href: href.trim() || undefined,
                              icon: icon.trim() || undefined,
                              resource: resource.trim() || undefined,
                        },
                  });
            }
            onOpenChange(false);
      };

      return (
            <Dialog open={open} onOpenChange={handleOpenChange}>
                  <DialogContent className="max-w-lg">
                        <DialogHeader>
                              <DialogTitle>
                                    {mode === "create"
                                          ? parentNode
                                                ? t("menus.addChildTitle")
                                                : t("menus.createTitle")
                                          : t("menus.editTitle")}
                              </DialogTitle>
                              <DialogDescription>
                                    {mode === "create" && parentNode
                                          ? `${t("menus.addChildDesc")} "${parentNode.nameEn}"`
                                          : mode === "create"
                                                ? t("menus.createDesc")
                                                : t("menus.editDesc")}
                              </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleSubmit} className="space-y-4 py-2">
                              {/* Slug */}
                              <div className="space-y-2">
                                    <Label htmlFor="slug">{t("menus.slug")}</Label>
                                    <Input
                                          id="slug"
                                          value={slug}
                                          onChange={(e) => setSlug(e.target.value)}
                                          placeholder="dashboard"
                                          required
                                          className="font-mono text-sm"
                                    />
                              </div>

                              {/* Bilingual Names */}
                              <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                          <Label htmlFor="nameEn">{t("menus.nameEn")}</Label>
                                          <Input
                                                id="nameEn"
                                                value={nameEn}
                                                onChange={(e) => setNameEn(e.target.value)}
                                                placeholder="Dashboard"
                                                required
                                          />
                                    </div>
                                    <div className="space-y-2">
                                          <Label htmlFor="nameAr">{t("menus.nameAr")}</Label>
                                          <Input
                                                id="nameAr"
                                                value={nameAr}
                                                onChange={(e) => setNameAr(e.target.value)}
                                                placeholder="لوحة التحكم"
                                                dir="rtl"
                                          />
                                    </div>
                              </div>

                              {/* Href & Icon */}
                              <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                          <Label htmlFor="href">{t("menus.href")}</Label>
                                          <Input
                                                id="href"
                                                value={href}
                                                onChange={(e) => setHref(e.target.value)}
                                                placeholder="/dashboard"
                                                className="font-mono text-sm"
                                          />
                                    </div>
                                    <div className="space-y-2">
                                          <Label htmlFor="icon">{t("menus.icon")}</Label>
                                          <Input
                                                id="icon"
                                                value={icon}
                                                onChange={(e) => setIcon(e.target.value)}
                                                placeholder="LayoutDashboard"
                                                className="font-mono text-sm"
                                          />
                                    </div>
                              </div>

                              {/* Resource (Permission) */}
                              <div className="space-y-2">
                                    <Label htmlFor="resource">{t("menus.resource")}</Label>
                                    <Input
                                          id="resource"
                                          value={resource}
                                          onChange={(e) => setResource(e.target.value)}
                                          placeholder="users"
                                          className="font-mono text-sm"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                          {t("menus.resourceHint")}
                                    </p>
                              </div>

                              <DialogFooter>
                                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                          {t("common.cancel")}
                                    </Button>
                                    <Button type="submit" disabled={isPending || !nameEn.trim() || !slug.trim()}>
                                          {isPending ? t("common.saving") : mode === "create" ? t("common.create") : t("common.save")}
                                    </Button>
                              </DialogFooter>
                        </form>
                  </DialogContent>
            </Dialog>
      );
}
