"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@core/ui/dialog";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Textarea } from "@core/ui/textarea";
import { useI18n } from "@core/providers/i18n-provider";
import type { AppCategory } from "../../domain/entities/AppCategory";

// ── Types ────────────────────────────────────────────────────────────────────

export interface CategoryFormData {
  nameEn: string;
  nameAr: string;
  slug: string;
  icon: string;
  description: string;
  sortOrder: number;
}

interface CategoryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CategoryFormData) => void;
  isSubmitting: boolean;
  editingCategory?: AppCategory | null;
}

// ── Defaults ─────────────────────────────────────────────────────────────────

const EMPTY_FORM: CategoryFormData = {
  nameEn: "",
  nameAr: "",
  slug: "",
  icon: "",
  description: "",
  sortOrder: 0,
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// ── Component ────────────────────────────────────────────────────────────────

export function CategoryFormDialog({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
  editingCategory,
}: CategoryFormDialogProps) {
  const { t } = useI18n();
  const isEditMode = !!editingCategory;

  const [form, setForm] = useState<CategoryFormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editingCategory) {
      setForm({
        nameEn: editingCategory.name,
        nameAr: editingCategory.nameAr,
        slug: editingCategory.slug,
        icon: editingCategory.iconUrl ?? "",
        description: editingCategory.description,
        sortOrder: editingCategory.sortOrder,
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setErrors({});
  }, [editingCategory, open]);

  const updateField = <K extends keyof CategoryFormData>(field: K, value: CategoryFormData[K]) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      // Auto-generate slug from English name
      if (field === "nameEn" && !isEditMode) {
        next.slug = slugify(value as string);
      }
      return next;
    });
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.nameEn.trim()) errs.nameEn = t("common.required") || "Required";
    if (!form.slug.trim()) errs.slug = t("common.required") || "Required";
    if (form.slug.trim() && !/^[a-z0-9][a-z0-9\-]*$/.test(form.slug.trim())) {
      errs.slug =
        t("marketplace.categorySlugErr") || "Slug must be lowercase alphanumeric with hyphens";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSubmit(form);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditMode
              ? t("marketplace.categoryEdit") || "Edit Category"
              : t("marketplace.categoryCreate") || "New Category"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? t("marketplace.categoryEditDesc") || "Update the marketplace category details."
              : t("marketplace.categoryCreateDesc") ||
                "Create a new app category for the marketplace."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Name EN */}
          <div className="space-y-2">
            <Label htmlFor="cat-name-en">{t("common.nameEn") || "Name (English)"} *</Label>
            <Input
              id="cat-name-en"
              placeholder={t("marketplace.categoryPlaceholderNameEn") || "Productivity"}
              value={form.nameEn}
              onChange={(e) => updateField("nameEn", e.target.value)}
              className={errors.nameEn ? "border-destructive" : ""}
            />
            {errors.nameEn && <p className="text-xs text-destructive">{errors.nameEn}</p>}
          </div>

          {/* Name AR */}
          <div className="space-y-2">
            <Label htmlFor="cat-name-ar">{t("common.nameAr") || "Name (Arabic)"}</Label>
            <Input
              id="cat-name-ar"
              dir="rtl"
              placeholder={t("marketplace.categoryPlaceholderNameAr") || "إنتاجية"}
              value={form.nameAr}
              onChange={(e) => updateField("nameAr", e.target.value)}
            />
          </div>

          {/* Slug */}
          <div className="space-y-2">
            <Label htmlFor="cat-slug">{t("marketplace.categorySlug") || "Slug"} *</Label>
            <Input
              id="cat-slug"
              placeholder={
                t("marketplace.categorySlug")
                  ? t("marketplace.categorySlug").toLowerCase()
                  : "productivity"
              }
              value={form.slug}
              onChange={(e) => updateField("slug", e.target.value)}
              className={errors.slug ? "border-destructive" : ""}
            />
            {errors.slug && <p className="text-xs text-destructive">{errors.slug}</p>}
          </div>

          {/* Icon */}
          <div className="space-y-2">
            <Label htmlFor="cat-icon">{t("common.icon") || "Icon Name"}</Label>
            <Input
              id="cat-icon"
              placeholder={t("marketplace.categoryPlaceholderIcon") || "briefcase"}
              value={form.icon}
              onChange={(e) => updateField("icon", e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="cat-desc">{t("common.description") || "Description"}</Label>
            <Textarea
              id="cat-desc"
              rows={2}
              placeholder={
                t("marketplace.categoryPlaceholderDesc") ||
                "A brief description of this category..."
              }
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
            />
          </div>

          {/* Sort Order */}
          <div className="space-y-2">
            <Label htmlFor="cat-sort">{t("common.sortOrder") || "Sort Order"}</Label>
            <Input
              id="cat-sort"
              type="number"
              min={0}
              value={form.sortOrder}
              onChange={(e) => updateField("sortOrder", parseInt(e.target.value) || 0)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            {t("common.cancel") || "Cancel"}
          </Button>
          <Button id="cat-form-submit" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting
              ? t("common.saving") || "Saving..."
              : isEditMode
                ? t("common.save") || "Save"
                : t("common.create") || "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
