/**
 * Branding Section Component
 *
 * Section for tenant branding settings (company name, logo, colors, login page).
 * Uses ImageUploadField for logo/favicon with drag-drop, upload, and URL support.
 * Pure UI - receives all data and handlers from parent view via props.
 */
"use client";
import { useI18n } from "@core/providers/i18n-provider";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Palette } from "lucide-react";
import { ImageUploadField } from "@core/ui/image-upload-field";
import type { TenantSettings } from "../../domain/entities/TenantSettings";

interface BrandingSectionProps {
  settings: TenantSettings;
  updateField: <K extends keyof TenantSettings>(field: K, value: TenantSettings[K]) => void;
}

/**
 * Presentation UI component rendering the branding section.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function BrandingSection({ settings, updateField }: BrandingSectionProps) {
  const { t } = useI18n();
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" aria-hidden="true" />
          {t("tenantSettings.branding")}
        </CardTitle>
        <CardDescription>{t("tenantSettings.brandingDescription")}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        {/* Row 1: Company Name */}
        <div className="space-y-2">
          <Label htmlFor="companyName">{t("tenantSettings.companyName")}</Label>
          <Input
            id="companyName"
            value={settings.companyName ?? ""}
            onChange={(e) => updateField("companyName", e.target.value || null)}
          />
          <p className="text-xs text-nx-ink-3">{t("tenantSettings.companyNameHelp")}</p>
        </div>

        {/* Row 2: Logo — ImageUploadField (drag-drop + URL) */}
        <ImageUploadField
          value={settings.logoUrl ?? ""}
          onChange={(url) => updateField("logoUrl", url || null)}
          label={t("tenantSettings.logoUrl")}
          description={t("tenantSettings.logoUrlHelp")}
          maxSizeBytes={2 * 1024 * 1024}
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
        />

        {/* Row 3: Primary Color + Secondary Color */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="primaryColor">{t("tenantSettings.primaryColor")}</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                aria-label={t("tenantSettings.primaryColor")}
                value={settings.primaryColor || "#000000"}
                onChange={(e) => updateField("primaryColor", e.target.value || null)}
                className="h-9 w-12 cursor-pointer p-1"
              />
              <Input
                id="primaryColor"
                value={settings.primaryColor ?? ""}
                onChange={(e) => updateField("primaryColor", e.target.value || null)}
                placeholder="#3b82f6"
              />
            </div>
            <p className="text-xs text-nx-ink-3">{t("tenantSettings.primaryColorHelp")}</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="secondaryColor">{t("tenantSettings.secondaryColor")}</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                aria-label={t("tenantSettings.secondaryColor")}
                value={settings.secondaryColor || "#3F4347"}
                onChange={(e) => updateField("secondaryColor", e.target.value || null)}
                className="h-9 w-12 cursor-pointer p-1"
              />
              <Input
                id="secondaryColor"
                value={settings.secondaryColor ?? ""}
                onChange={(e) => updateField("secondaryColor", e.target.value || null)}
                placeholder="#3F4347"
              />
            </div>
            <p className="text-xs text-nx-ink-3">{t("tenantSettings.secondaryColorHelp")}</p>
          </div>
        </div>

        {/* Row 4: Favicon — ImageUploadField (drag-drop + URL) */}
        <ImageUploadField
          value={settings.faviconUrl ?? ""}
          onChange={(url) => updateField("faviconUrl", url || null)}
          label={t("tenantSettings.faviconUrl")}
          description={t("tenantSettings.faviconUrlHelp")}
          maxSizeBytes={512 * 1024}
          accept="image/x-icon,image/png,image/svg+xml,image/webp"
        />

        {/* Row 5: Login Headline + Login Subtitle */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="loginHeadline">{t("tenantSettings.loginHeadline")}</Label>
            <Input
              id="loginHeadline"
              value={settings.loginHeadline ?? ""}
              onChange={(e) => updateField("loginHeadline", e.target.value || null)}
              placeholder={t("tenantSettings.loginHeadlinePlaceholder")}
            />
            <p className="text-xs text-nx-ink-3">{t("tenantSettings.loginHeadlineHelp")}</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="loginSubtitle">{t("tenantSettings.loginSubtitle")}</Label>
            <Input
              id="loginSubtitle"
              value={settings.loginSubtitle ?? ""}
              onChange={(e) => updateField("loginSubtitle", e.target.value || null)}
              placeholder={t("tenantSettings.loginSubtitlePlaceholder")}
            />
            <p className="text-xs text-nx-ink-3">{t("tenantSettings.loginSubtitleHelp")}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
