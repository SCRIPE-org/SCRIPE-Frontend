/**
 * Menu Form Dialog
 *
 * Bilingual create / edit form for menu items.
 * Handles slug, names (EN/AR), href (page picker), icon, and resource fields.
 */
"use client";

import { useState, useCallback, useEffect } from "react";
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
import {
      Select,
      SelectContent,
      SelectGroup,
      SelectItem,
      SelectLabel,
      SelectSeparator,
      SelectTrigger,
      SelectValue,
} from "@core/ui/select";
import type { MenuTreeNode } from "../../domain/entities/MenuItem";
import type { CreateMenuItemRequest, UpdateMenuItemRequest } from "../../domain/entities/MenuItemRequests";
import { PAGE_REGISTRY, type PageDefinition } from "@core/common/pageRegistry";

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
/*  Constants                                                                   */
/* -------------------------------------------------------------------------- */

const CUSTOM_HREF_VALUE = "__custom__";

const CATEGORY_LABELS: Record<string, { en: string; ar: string }> = {
      general: { en: "General", ar: "عام" },
      system: { en: "System", ar: "النظام" },
      settings: { en: "Settings", ar: "الإعدادات" },
};

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
      const { t, language } = useI18n();

      const [slug, setSlug] = useState("");
      const [nameEn, setNameEn] = useState("");
      const [nameAr, setNameAr] = useState("");
      const [href, setHref] = useState("");
      const [useCustomHref, setUseCustomHref] = useState(false);
      const [icon, setIcon] = useState("");
      const [resource, setResource] = useState("");

      // ── Group pages by category ──────────────────────────────────────
      const pagesByCategory = PAGE_REGISTRY.reduce<Record<string, PageDefinition[]>>(
            (acc, page) => {
                  if (!acc[page.category]) acc[page.category] = [];
                  acc[page.category].push(page);
                  return acc;
            },
            {}
      );

      // ── Check if href matches a registered page ─────────────────────
      const isRegisteredPage = (h: string) => PAGE_REGISTRY.some((p) => p.href === h);

      // ── Reset form when dialog opens ─────────────────────────────────
      useEffect(() => {
            if (open) {
                  if (mode === "edit" && editNode) {
                        setSlug(editNode.slug);
                        setNameEn(editNode.nameEn);
                        setNameAr(editNode.nameAr);
                        setHref(editNode.href ?? "");
                        setUseCustomHref(!!editNode.href && !isRegisteredPage(editNode.href));
                        setIcon(editNode.icon ?? "");
                        setResource(editNode.resource ?? "");
                  } else {
                        setSlug("");
                        setNameEn("");
                        setNameAr("");
                        setHref("");
                        setUseCustomHref(false);
                        setIcon("");
                        setResource("");
                  }
            }
      }, [open, mode, editNode]);

      // ── When a page is selected, auto-fill slug, icon, resource ─────
      const handlePageSelect = useCallback((value: string) => {
            if (value === CUSTOM_HREF_VALUE) {
                  setUseCustomHref(true);
                  setHref("");
                  return;
            }

            setUseCustomHref(false);
            setHref(value);

            const page = PAGE_REGISTRY.find((p) => p.href === value);
            if (page) {
                  // Auto-fill empty fields from page definition
                  if (!slug.trim()) setSlug(page.href.replace(/^\//, "").replace(/\//g, "-"));
                  if (!nameEn.trim()) setNameEn(page.labelEn);
                  if (!nameAr.trim()) setNameAr(page.labelAr);
                  if (!icon.trim() && page.icon) setIcon(page.icon);
                  if (!resource.trim() && page.resource) setResource(page.resource);
            }
      }, [slug, nameEn, nameAr, icon, resource]);

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

      // Current select value for the page picker
      const selectValue = useCustomHref ? CUSTOM_HREF_VALUE : href || undefined;

      return (
            <Dialog open={open} onOpenChange={onOpenChange}>
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
                              {/* Page Picker (href) */}
                              <div className="space-y-2">
                                    <Label>{t("menus.href") || "Page"}</Label>
                                    <Select
                                          value={selectValue}
                                          onValueChange={handlePageSelect}
                                    >
                                          <SelectTrigger>
                                                <SelectValue placeholder={t("menus.selectPage") || "Select a page..."} />
                                          </SelectTrigger>
                                          <SelectContent>
                                                {Object.entries(pagesByCategory).map(([category, pages], idx) => (
                                                      <SelectGroup key={category}>
                                                            <SelectLabel>
                                                                  {language === "ar"
                                                                        ? CATEGORY_LABELS[category]?.ar ?? category
                                                                        : CATEGORY_LABELS[category]?.en ?? category
                                                                  }
                                                            </SelectLabel>
                                                            {pages.map((page) => (
                                                                  <SelectItem key={page.href} value={page.href}>
                                                                        <span className="flex items-center gap-2">
                                                                              <span>{language === "ar" ? page.labelAr : page.labelEn}</span>
                                                                              <span className="text-xs text-muted-foreground font-mono">{page.href}</span>
                                                                        </span>
                                                                  </SelectItem>
                                                            ))}
                                                            {idx < Object.keys(pagesByCategory).length - 1 && <SelectSeparator />}
                                                      </SelectGroup>
                                                ))}
                                                <SelectSeparator />
                                                <SelectItem value={CUSTOM_HREF_VALUE}>
                                                      <span className="text-muted-foreground italic">
                                                            {t("menus.customHref") || "Custom URL..."}
                                                      </span>
                                                </SelectItem>
                                          </SelectContent>
                                    </Select>

                                    {/* Custom href input — shown when "Custom URL" is selected */}
                                    {useCustomHref && (
                                          <Input
                                                value={href}
                                                onChange={(e) => setHref(e.target.value)}
                                                placeholder="/custom-page"
                                                className="font-mono text-sm mt-2"
                                          />
                                    )}
                              </div>

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

                              {/* Icon & Resource */}
                              <div className="grid grid-cols-2 gap-4">
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
