/**
 * DesignVariablesPanel — Customizer panel for template colors, typography, layout, and branding.
 *
 * @module templates/presentation
 */
"use client";

import React from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Label } from "@core/ui/label";
import { Input } from "@core/ui/input";
import { Button } from "@core/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { Separator } from "@core/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@core/ui/select";
import { Paintbrush, RotateCcw } from "lucide-react";
import { ColorPickerField } from "@core/ui/rich-text-editor/ColorPickerField";
import {
  type DesignVariables,
  type DesignVariablesPanelProps,
  DEFAULT_DESIGN,
  FONT_OPTIONS,
} from "./designVariablesTypes";
import { DesignVariablesPreviewSwatch } from "./DesignVariablesPreviewSwatch";

/**
 * Documentation for module export
 */
export type { DesignVariables, DesignVariablesPanelProps };
export { DEFAULT_DESIGN, FONT_OPTIONS };

/**
 * Presentation UI component rendering the design variables customization panel.
 * Arranges color pickers, typography selects, geometry fields, and live preview swatch.
 *
 * @param props Component properties.
 * @returns Card JSX element containing design variables configuration controls.
 */
export function DesignVariablesPanel({ value, onChange }: DesignVariablesPanelProps) {
  const { t } = useI18n();

  const update = (key: keyof DesignVariables, val: string) => {
    onChange({ ...value, [key]: val });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Paintbrush className="h-4 w-4" aria-hidden="true" />
            {t("messaging.templates.design.title")}
          </CardTitle>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 gap-1 text-xs"
            onClick={() => onChange({ ...DEFAULT_DESIGN })}
          >
            <RotateCcw className="h-3 w-3" aria-hidden="true" />
            {t("messaging.templates.design.reset")}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* ── Colors ────────────────────────────────────── */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-nx-ink-3">
            {t("messaging.templates.design.colors")}
          </h4>
          <div className="grid grid-cols-2 gap-2">
            <ColorPickerField
              label={t("messaging.templates.design.primaryColor")}
              value={value.primaryColor}
              onChange={(c: string) => update("primaryColor", c)}
            />
            <ColorPickerField
              label={t("messaging.templates.design.secondaryColor")}
              value={value.secondaryColor}
              onChange={(c: string) => update("secondaryColor", c)}
            />
            <ColorPickerField
              label={t("messaging.templates.design.backgroundColor")}
              value={value.backgroundColor}
              onChange={(c: string) => update("backgroundColor", c)}
            />
            <ColorPickerField
              label={t("messaging.templates.design.textColor")}
              value={value.textColor}
              onChange={(c: string) => update("textColor", c)}
            />
          </div>
        </div>

        <Separator />

        {/* ── Typography ─────────────────────────────────── */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-nx-ink-3">
            {t("messaging.templates.design.typography")}
          </h4>
          <div className="space-y-2">
            <Label className="text-xs">{t("messaging.templates.design.fontFamily")}</Label>
            <Select value={value.fontFamily} onValueChange={(v) => update("fontFamily", v)}>
              <SelectTrigger className="text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FONT_OPTIONS.map((f) => (
                  <SelectItem key={f.value} value={f.value}>
                    <span style={{ fontFamily: f.value }}>{f.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">{t("messaging.templates.design.headerSize")}</Label>
              <Input
                type="number"
                min={16}
                max={48}
                value={value.headerFontSize}
                onChange={(e) => update("headerFontSize", e.target.value)}
                className="text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">{t("messaging.templates.design.bodySize")}</Label>
              <Input
                type="number"
                min={10}
                max={24}
                value={value.bodyFontSize}
                onChange={(e) => update("bodyFontSize", e.target.value)}
                className="text-sm"
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* ── Layout ─────────────────────────────────────── */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-nx-ink-3">
            {t("messaging.templates.design.layout")}
          </h4>
          <div className="space-y-2">
            <Label className="text-xs">{t("messaging.templates.design.borderRadius")}</Label>
            <Input
              type="number"
              min={0}
              max={32}
              value={value.borderRadius}
              onChange={(e) => update("borderRadius", e.target.value)}
              className="text-sm"
            />
          </div>
        </div>

        <Separator />

        {/* ── Branding ───────────────────────────────────── */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-nx-ink-3">
            {t("messaging.templates.design.branding")}
          </h4>
          <div className="space-y-2">
            <Label className="text-xs">{t("messaging.templates.design.logoUrl")}</Label>
            <Input
              value={value.logoUrl}
              onChange={(e) => update("logoUrl", e.target.value)}
              placeholder="https://example.com/logo.png"
              className="text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">{t("messaging.templates.design.footerText")}</Label>
            <Input
              value={value.footerText}
              onChange={(e) => update("footerText", e.target.value)}
              placeholder="© {{currentYear}} Company"
              className="text-sm"
            />
          </div>
        </div>

        {/* ── Live Preview Swatch ───────────────────────── */}
        <Separator />
        <DesignVariablesPreviewSwatch value={value} />
      </CardContent>
    </Card>
  );
}

export default DesignVariablesPanel;
