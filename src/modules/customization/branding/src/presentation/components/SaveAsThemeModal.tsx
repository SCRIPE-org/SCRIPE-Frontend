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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@core/ui/dialog";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Textarea } from "@core/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@core/ui/select";
import { Palette, Sparkles } from "lucide-react";
import { useToast } from "@core/ui/use-toast";

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
 * React presentation component representing the save as theme modal UI element.
 */
export function SaveAsThemeModal({
  isOpen,
  onClose,
  getDraftJson,
  onSaveTheme,
}: SaveAsThemeModalProps) {
  const { t } = useI18n();
  const { toast } = useToast();

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
    } catch (err: any) {
      const msg = err?.message || err?.response?.data?.error || "Failed to save theme";
      toast({ title: msg, variant: "destructive" });
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
    toast,
    onClose,
  ]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg"
              style={{
                background: `linear-gradient(135deg, ${accentColor}, color-mix(in srgb, ${accentColor} 60%, black))`,
              }}
            >
              <Palette className="h-4 w-4 text-white" />
            </div>
            {t("studio.saveTheme.title") || "Save as Theme"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="theme-name">
              {t("studio.saveTheme.name") || "Theme Name"}{" "}
              <span className="text-destructive">*</span>
            </Label>
            <Input
              id="theme-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("studio.saveTheme.namePlaceholder") || "e.g. Corporate Blue"}
              maxLength={100}
              autoFocus
            />
            {name.trim() && (
              <p className="text-[10px] text-muted-foreground">
                {t("studio.saveTheme.slug") || "Slug"}: {slug}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="theme-desc">{t("studio.saveTheme.description") || "Description"}</Label>
            <Textarea
              id="theme-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={
                t("studio.saveTheme.descPlaceholder") || "Short description of this theme..."
              }
              rows={2}
              maxLength={500}
            />
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <Label>{t("studio.saveTheme.category") || "Category"}</Label>
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
            <Label htmlFor="theme-author">{t("studio.saveTheme.author") || "Author Name"}</Label>
            <Input
              id="theme-author"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder={t("studio.saveTheme.authorPlaceholder") || "Your name"}
              maxLength={100}
            />
          </div>

          {/* Preview swatch */}
          <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-3">
            <div
              className="h-10 w-10 shrink-0 rounded-lg border border-white/20 shadow-sm"
              style={{
                background: `linear-gradient(135deg, ${accentColor}, color-mix(in srgb, ${accentColor} 50%, black))`,
              }}
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                {name || t("studio.saveTheme.preview") || "Theme Preview"}
              </p>
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <Sparkles className="h-3 w-3" />
                {t("studio.saveTheme.previewDesc") || "Saves current tokens, layout, and styling"}
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            {t("common.cancel") || "Cancel"}
          </Button>
          <Button onClick={handleSave} disabled={!isValid} loading={isSaving}>
            {!isSaving && <Palette className="mr-2 h-4 w-4" />}
            {isSaving
              ? t("common.saving") || "Saving..."
              : t("studio.saveTheme.save") || "Save Theme"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
