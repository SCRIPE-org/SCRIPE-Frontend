/**
 * SaveAsThemeModal — Save current draft customization as a reusable theme
 *
 * Opens from the PublishBar. Takes the current buildDraftJson() output
 * and creates a new theme in the marketplace via POST /api/v1/Themes.
 *
 * @module customization/presentation
 */
"use client";

import React, { useState, useCallback, useMemo } from "react";
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
import { Palette, Sliders } from "lucide-react";
import { CustomFieldsSection } from "@core/components/custom-fields";
import { THEME_ENTITY_TYPE_KEY } from "../viewmodels/useStudioViewModel";
import { ThemeBasicFields } from "./ThemeBasicFields";
import {
  type SaveAsThemeModalProps,
  type SaveThemeInput,
  slugifyThemeName,
} from "./themeModalTypes";

/**
 * Documentation for module export
 */
export type { SaveAsThemeModalProps, SaveThemeInput };

/**
 * Presentation UI component rendering the save as theme modal.
 * Coordinates theme metadata fields, accent swatch previews, and dynamic custom field sections.
 *
 * @param props Modal control flags, persistence callbacks, and custom field configurations.
 * @returns An accessible dialog for authoring and saving new marketplace themes.
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
}: SaveAsThemeModalProps): React.JSX.Element {
  const { t } = useI18n();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("corporate");
  const [authorName, setAuthorName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const slug = useMemo(() => slugifyThemeName(name), [name]);
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
      // Error notifications are handled by the calling view model; preserve user input
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
          {/* Theme Core Metadata Input Controls */}
          <ThemeBasicFields
            name={name}
            onNameChange={setName}
            slug={slug}
            description={description}
            onDescriptionChange={setDescription}
            category={category}
            onCategoryChange={setCategory}
            authorName={authorName}
            onAuthorNameChange={setAuthorName}
            accentColor={accentColor}
          />

          {/* Dynamic Custom Fields Integration Section */}
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

            <CustomFieldsSection
              configs={customFieldConfigs}
              values={customFieldValues}
              onChange={onCustomFieldChange}
              isLoading={customFieldsLoading}
              emptyMessage={t("studio.saveTheme.noCustomFields")}
              entityTypeKey={THEME_ENTITY_TYPE_KEY}
              entityDisplayName={t("studio.saveTheme.title")}
              onFieldCreated={onCustomFieldsCreated}
              className="space-y-3"
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
