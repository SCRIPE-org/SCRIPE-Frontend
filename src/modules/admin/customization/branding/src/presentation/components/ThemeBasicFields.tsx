"use client";

import React from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Textarea } from "@core/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@core/ui/select";
import { Sparkles } from "lucide-react";
import { THEME_CATEGORIES } from "./themeModalTypes";

/**
 * Props for the ThemeBasicFields form component.
 */
export interface ThemeBasicFieldsProps {
  /** Current theme display name value. */
  name: string;
  /** Callback fired when theme name changes. */
  onNameChange: (value: string) => void;
  /** Derived URL slug for the theme. */
  slug: string;
  /** Narrative description text value. */
  description: string;
  /** Callback fired when description text changes. */
  onDescriptionChange: (value: string) => void;
  /** Selected marketplace category identifier. */
  category: string;
  /** Callback fired when marketplace category changes. */
  onCategoryChange: (value: string) => void;
  /** Author name value for theme attribution. */
  authorName: string;
  /** Callback fired when author name changes. */
  onAuthorNameChange: (value: string) => void;
  /** Primary accent color token in hex format for preview swatch. */
  accentColor: string;
}

/**
 * Renders the basic metadata input fields (name, slug, description, category,
 * author, and color swatch preview) for the Save As Theme modal.
 *
 * @param props The theme metadata input and event handling properties.
 * @returns An accessible layout section containing theme input controls.
 */
export function ThemeBasicFields({
  name,
  onNameChange,
  slug,
  description,
  onDescriptionChange,
  category,
  onCategoryChange,
  authorName,
  onAuthorNameChange,
  accentColor,
}: ThemeBasicFieldsProps): React.JSX.Element {
  const { t } = useI18n();

  return (
    <>
      {/* Theme Name and Derived Slug */}
      <div className="space-y-1.5">
        <Label htmlFor="theme-name">
          {t("studio.saveTheme.name")} <span className="text-destructive">*</span>
        </Label>
        <Input
          id="theme-name"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
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

      {/* Description Textarea */}
      <div className="space-y-1.5">
        <Label htmlFor="theme-desc">{t("studio.saveTheme.description")}</Label>
        <Textarea
          id="theme-desc"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder={t("studio.saveTheme.descPlaceholder")}
          rows={2}
          maxLength={500}
        />
      </div>

      {/* Classification Category Select */}
      <div className="space-y-1.5">
        <Label>{t("studio.saveTheme.category")}</Label>
        <Select value={category} onValueChange={onCategoryChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {THEME_CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>
                <span className="capitalize">{cat}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Author Name */}
      <div className="space-y-1.5">
        <Label htmlFor="theme-author">{t("studio.saveTheme.author")}</Label>
        <Input
          id="theme-author"
          value={authorName}
          onChange={(e) => onAuthorNameChange(e.target.value)}
          placeholder={t("studio.saveTheme.authorPlaceholder")}
          maxLength={100}
        />
      </div>

      {/* Preview Swatch Banner */}
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
    </>
  );
}
