/**
 * SaveAsThemeModal — Save current draft customization as a reusable theme
 *
 * Opens from the PublishBar. Takes the current buildDraftJson() output
 * and creates a new theme in the marketplace via POST /api/v1/Themes.
 *
 * @module customization/presentation
 */
"use client";

import { useState, useCallback, useMemo } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogPortal,
  NonModalScrim,
} from "@core/ui/dialog";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Textarea } from "@core/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@core/ui/select";
import { Palette, Sparkles, Sliders } from "lucide-react";
import { getCustomFieldsExtension } from "@core/crud/customFieldsExtension";
import type { FieldConfig } from "@core/ui/forms/generic-form";
import { renderCustomFieldControl } from "@modules/custom-fields/custom-field";
import { THEME_ENTITY_TYPE_KEY } from "../viewmodels/useStudioViewModel";

interface SaveAsThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Returns the current draft branding JSON string */
  getDraftJson: () => string;
  onSaveTheme: (themeInput: {
    name: string;
    slug: string;
    description?: string;
    authorName?: string;
    category: string;
    accentColor: string;
    themeDataJson: string;
  }) => Promise<void>;
  customFieldConfigs: FieldConfig[];
  customFieldsLoading: boolean;
  customFieldValues: Record<string, unknown>;
  onCustomFieldChange: (name: string, value: unknown) => void;
  onCustomFieldsCreated: () => void;
}

/** Mirrors TemplateFormView.tsx's own private CustomFieldsAddTrigger wrapper. */
function ThemeCustomFieldsAddTrigger({
  entityDisplayName,
  onCreated,
}: {
  entityDisplayName: string;
  onCreated: () => void;
}) {
  const api = getCustomFieldsExtension();
  if (!api) return null;
  const Trigger = api.InlineAddTrigger;
  return (
    <Trigger
      entityTypeKey={THEME_ENTITY_TYPE_KEY}
      entityDisplayName={entityDisplayName}
      onCreated={onCreated}
    />
  );
}

const CATEGORIES = [
  "corporate",
  "creative",
  "minimal",
  "modern",
  "dark",
  "healthcare",
  "education",
  "finance",
  "technology",
  "government",
  "retail",
  "other",
];

function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

/**
 * Presentation UI component rendering the save as theme modal.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function SaveAsThemeModal({
  isOpen,
  onClose,
  getDraftJson,
  onSaveTheme,
  customFieldConfigs,
  customFieldsLoading,
  customFieldValues,
  onCustomFieldChange,
  onCustomFieldsCreated,
}: SaveAsThemeModalProps) {
  const { t } = useI18n();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("corporate");
  const [authorName, setAuthorName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const slug = useMemo(() => slugify(name), [name]);
  const isValid = name.trim().length >= 3 && slug.length >= 3;

  // Extract accent color from draft tokens
  const accentColor = useMemo(() => {
    try {
      const data = JSON.parse(getDraftJson());
      const tokens = data?.tokens || {};
      return tokens["color.primary"] || "#6366f1";
    } catch {
      return "#6366f1";
    }
  }, [getDraftJson]);

  const handleSave = useCallback(async () => {
    if (!isValid || isSaving) return;
    setIsSaving(true);

    try {
      const draftJson = getDraftJson();
      await onSaveTheme({
        name: name.trim(),
        slug,
        description: description.trim() || undefined,
        authorName: authorName.trim() || undefined,
        category,
        accentColor,
        themeDataJson: draftJson,
      });

      // Reset form and close
      setName("");
      setDescription("");
      setCategory("corporate");
      setAuthorName("");
      onClose();
    } catch {
      // useStudioViewModel's saveTheme already toasted the specific reason
      // (entity-create failure via the mutation's own onError, or a
      // custom-field save failure via its own explicit toast) -- stay open
      // with whatever the user typed rather than pretend it saved.
      return;
    } finally {
      setIsSaving(false);
    }
  }, [
    isValid,
    isSaving,
    getDraftJson,
    name,
    slug,
    description,
    authorName,
    category,
    accentColor,
    onSaveTheme,
    onClose,
  ]);

  return (
    // Wave 5 row 5.6 (design spec §5.4; pre-plan R2's "hand-rolled" shape):
    // hosts InlineAddCustomFieldDialog (a modal={false} Sheet) via
    // ThemeCustomFieldsAddTrigger above -- see WebhookForm.tsx's identical
    // comment for the full defect/remedy.
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()} modal={false}>
      <DialogPortal>
        <NonModalScrim open={isOpen} />
      </DialogPortal>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-nx-md"
              style={{
                background: `linear-gradient(135deg, ${accentColor}, color-mix(in srgb, ${accentColor} 60%, black))`,
              }}
              aria-hidden="true"
            >
              <Palette className="h-4 w-4 text-nx-on-fill" />
            </div>
            {t("studio.saveTheme.title")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="theme-name">
              {t("studio.saveTheme.name")} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="theme-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("studio.saveTheme.namePlaceholder")}
              maxLength={100}
              autoFocus
            />
            {name.trim() && (
              <p className="text-[10px] text-nx-ink-3">
                {t("studio.saveTheme.slug")}: {slug}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="theme-desc">{t("studio.saveTheme.description")}</Label>
            <Textarea
              id="theme-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("studio.saveTheme.descPlaceholder")}
              rows={2}
              maxLength={500}
            />
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <Label>{t("studio.saveTheme.category")}</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    <span className="capitalize">{cat}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Author */}
          <div className="space-y-1.5">
            <Label htmlFor="theme-author">{t("studio.saveTheme.author")}</Label>
            <Input
              id="theme-author"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder={t("studio.saveTheme.authorPlaceholder")}
              maxLength={100}
            />
          </div>

          {/* Preview swatch */}
          <div className="flex items-center gap-3 rounded-nx-md border border-nx-line bg-nx-raised p-3">
            <div
              className="h-10 w-10 shrink-0 rounded-nx-md shadow-nx-sm"
              style={{
                background: `linear-gradient(135deg, ${accentColor}, color-mix(in srgb, ${accentColor} 50%, black))`,
              }}
              aria-hidden="true"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-nx-ink">
                {name || t("studio.saveTheme.preview")}
              </p>
              <p className="flex items-center gap-1 text-xs text-nx-ink-2">
                <Sparkles className="h-3 w-3" aria-hidden="true" />
                {t("studio.saveTheme.previewDesc")}
              </p>
            </div>
          </div>

          {/* Custom Fields */}
          <div className="space-y-3 border-t border-nx-line pt-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-nx-md bg-nx-accent-wash text-nx-accent">
                <Sliders className="h-4 w-4" aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-nx-ink">
                  {t("studio.saveTheme.customFieldsSection")}
                </h3>
                <p className="text-xs text-nx-ink-2">
                  {t("studio.saveTheme.customFieldsSectionDesc")}
                </p>
              </div>
            </div>

            {customFieldConfigs.map((fc) => {
              const value = customFieldValues[fc.name] ?? fc.defaultValue ?? "";
              return renderCustomFieldControl({
                fc,
                value,
                onChange: (v) => onCustomFieldChange(fc.name, v),
              });
            })}

            {customFieldConfigs.length === 0 && !customFieldsLoading && (
              <p className="text-sm text-nx-ink-2">{t("studio.saveTheme.noCustomFields")}</p>
            )}

            <ThemeCustomFieldsAddTrigger
              entityDisplayName={t("studio.saveTheme.title")}
              onCreated={onCustomFieldsCreated}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            {t("common.cancel")}
          </Button>
          <Button onClick={handleSave} disabled={!isValid} loading={isSaving}>
            {!isSaving && <Palette className="me-2 h-4 w-4" aria-hidden="true" />}
            {isSaving ? t("common.saving") : t("studio.saveTheme.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
