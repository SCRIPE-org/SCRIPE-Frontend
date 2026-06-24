// FILE-EXCEPTION: file length
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@core/ui/select";
import { useI18n } from "@core/providers/i18n-provider";
import type { CreateDefinitionRequest } from "../../domain/interfaces/IDefinitionsRepository";
import type { PluginDefinition, PluginTierValue, PluginScopeValue } from "@modules/plugins/core";

// ── Types ────────────────────────────────────────────────────────────────────

interface DefinitionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateDefinitionRequest) => void;
  isSubmitting: boolean;
  /** When set, the dialog is in edit mode. */
  editingDefinition?: PluginDefinition | null;
}

// ── Defaults ─────────────────────────────────────────────────────────────────

const EMPTY_FORM: CreateDefinitionRequest = {
  key: "",
  name: "",
  nameAr: "",
  description: "",
  descriptionAr: "",
  tier: "Tier2",
  scope: "Tenant",
  manifestJson: "{}",
  iconUrl: "",
  baseUrl: "",
  frontendUrl: "",
};

// ── Component ────────────────────────────────────────────────────────────────

/**
 * React presentation component representing the definition form dialog UI element.
 */
export function DefinitionFormDialog({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
  editingDefinition,
}: DefinitionFormDialogProps) {
  const { t } = useI18n();
  const isEditMode = !!editingDefinition;

  const [form, setForm] = useState<CreateDefinitionRequest>(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ── Sync form when editing ──────────────────────────────────────────────────
  useEffect(() => {
    if (editingDefinition) {
      setForm({
        key: editingDefinition.key,
        name: editingDefinition.name,
        nameAr: editingDefinition.nameAr,
        description: editingDefinition.description,
        descriptionAr: editingDefinition.descriptionAr,
        tier: editingDefinition.tier,
        scope: editingDefinition.scope,
        manifestJson: editingDefinition.manifestJson,
        iconUrl: editingDefinition.iconUrl ?? "",
        baseUrl: editingDefinition.baseUrl ?? "",
        frontendUrl: editingDefinition.frontendUrl ?? "",
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setErrors({});
  }, [editingDefinition, open]);

  // ── Field update ────────────────────────────────────────────────────────────
  const updateField = <K extends keyof CreateDefinitionRequest>(
    field: K,
    value: CreateDefinitionRequest[K]
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  // ── Validation ──────────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.key.trim()) errs.key = t("common.required") || "Required";
    if (!form.name.trim()) errs.name = t("common.required") || "Required";
    // Validate key format: lowercase letters, numbers, hyphens, dots
    if (form.key.trim() && !/^[a-z0-9][a-z0-9\-\.]*$/.test(form.key.trim())) {
      errs.key =
        t("plugins.defErrKeyFormat") || "Key must be lowercase alphanumeric (a-z, 0-9, -, .)";
    }
    // Validate manifestJson is valid JSON
    if (form.manifestJson.trim()) {
      try {
        JSON.parse(form.manifestJson);
      } catch {
        errs.manifestJson = t("plugins.defErrInvalidJson") || "Invalid JSON";
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = () => {
    if (!validate()) return;
    onSubmit(form);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode
              ? t("plugins.defEdit") || "Edit Definition"
              : t("plugins.defCreate") || "New Definition"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? t("plugins.defEditDesc") || "Update the plugin definition details."
              : t("plugins.defCreateDesc") || "Register a new plugin definition on the platform."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Row: Key + Name */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="def-key">{t("plugins.defColKey") || "Plugin Key"} *</Label>
              <Input
                id="def-key"
                dir="ltr"
                placeholder="com.acme.my-plugin"
                value={form.key}
                onChange={(e) => updateField("key", e.target.value)}
                disabled={isEditMode}
                className={errors.key ? "border-destructive" : ""}
              />
              {errors.key && <p className="text-xs text-destructive">{errors.key}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="def-name">{t("plugins.defColName") || "Name"} *</Label>
              <Input
                id="def-name"
                placeholder={t("plugins.defPlaceholderName") || "My Plugin"}
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>
          </div>

          {/* Name AR */}
          <div className="space-y-2">
            <Label htmlFor="def-name-ar">{t("common.nameAr") || "Name (Arabic)"}</Label>
            <Input
              id="def-name-ar"
              dir="rtl"
              placeholder="إضافتي"
              value={form.nameAr}
              onChange={(e) => updateField("nameAr", e.target.value)}
            />
          </div>

          {/* Description EN */}
          <div className="space-y-2">
            <Label htmlFor="def-desc">{t("common.description") || "Description"}</Label>
            <Textarea
              id="def-desc"
              rows={2}
              placeholder={
                t("plugins.defPlaceholderDesc") || "A brief description of the plugin..."
              }
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
            />
          </div>

          {/* Description AR */}
          <div className="space-y-2">
            <Label htmlFor="def-desc-ar">
              {t("common.descriptionAr") || "Description (Arabic)"}
            </Label>
            <Textarea
              id="def-desc-ar"
              dir="rtl"
              rows={2}
              placeholder={t("plugins.defPlaceholderDescAr") || "وصف موجز..."}
              value={form.descriptionAr}
              onChange={(e) => updateField("descriptionAr", e.target.value)}
            />
          </div>

          {/* Row: Tier + Scope */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("plugins.defColTier") || "Tier"}</Label>
              <Select
                value={form.tier}
                onValueChange={(v) => updateField("tier", v as PluginTierValue)}
              >
                <SelectTrigger id="def-tier">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Tier1">
                    {t("plugins.tier1") || "Tier 1 (Certified)"}
                  </SelectItem>
                  <SelectItem value="Tier2">
                    {t("plugins.tier2") || "Tier 2 (Sandboxed)"}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("plugins.defColScope") || "Scope"}</Label>
              <Select
                value={form.scope}
                onValueChange={(v) => updateField("scope", v as PluginScopeValue)}
              >
                <SelectTrigger id="def-scope">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Tenant">{t("plugins.defScopeTenant") || "Tenant"}</SelectItem>
                  <SelectItem value="Global">{t("plugins.defScopeGlobal") || "Global"}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* URLs */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="def-base-url">{t("plugins.defColBaseUrl") || "Base URL"}</Label>
              <Input
                id="def-base-url"
                dir="ltr"
                type="url"
                placeholder="https://plugin.example.com/api"
                value={form.baseUrl ?? ""}
                onChange={(e) => updateField("baseUrl", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="def-frontend-url">
                {t("plugins.defColFrontendUrl") || "Frontend URL"}
              </Label>
              <Input
                id="def-frontend-url"
                dir="ltr"
                type="url"
                placeholder="https://plugin.example.com/ui"
                value={form.frontendUrl ?? ""}
                onChange={(e) => updateField("frontendUrl", e.target.value)}
              />
            </div>
          </div>

          {/* Icon URL */}
          <div className="space-y-2">
            <Label htmlFor="def-icon-url">{t("plugins.defColIconUrl") || "Icon URL"}</Label>
            <Input
              id="def-icon-url"
              dir="ltr"
              type="url"
              placeholder="https://cdn.example.com/icon.png"
              value={form.iconUrl ?? ""}
              onChange={(e) => updateField("iconUrl", e.target.value)}
            />
          </div>

          {/* Manifest JSON */}
          <div className="space-y-2">
            <Label htmlFor="def-manifest">{t("plugins.defColManifest") || "Manifest JSON"}</Label>
            <Textarea
              id="def-manifest"
              dir="ltr"
              rows={4}
              className={`text-left font-mono text-xs ${errors.manifestJson ? "border-destructive" : ""}`}
              placeholder='{"entryPoints": [], "permissions": []}'
              value={form.manifestJson}
              onChange={(e) => updateField("manifestJson", e.target.value)}
            />
            {errors.manifestJson && (
              <p className="text-xs text-destructive">{errors.manifestJson}</p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            {t("common.cancel") || "Cancel"}
          </Button>
          <Button id="def-form-submit" onClick={handleSubmit} disabled={isSubmitting}>
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
