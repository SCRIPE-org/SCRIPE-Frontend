/**
 * Branding Section Component
 *
 * Section for tenant branding settings (company name, logo, colors, login page).
 * Supports dual mode for logo/favicon: file upload OR manual URL entry.
 * Pure UI - receives all data and handlers from parent view via props.
 */
"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Button } from "@core/ui/button";
import { Palette, Upload, Link2, Image as ImageIcon } from "lucide-react";
import type { TenantSettings } from "../../domain/entities/TenantSettings";
import { resolveFileUrl } from "@core/common/utils";

interface BrandingSectionProps {
  settings: TenantSettings;
  updateField: <K extends keyof TenantSettings>(field: K, value: TenantSettings[K]) => void;
  t: (key: string) => string;
  onUploadLogo?: (file: File) => Promise<string>;
}

export function BrandingSection({ settings, updateField, t, onUploadLogo }: BrandingSectionProps) {
  const [logoMode, setLogoMode] = useState<"upload" | "url">(settings.logoUrl ? "url" : "upload");
  const [faviconMode, setFaviconMode] = useState<"upload" | "url">(settings.faviconUrl ? "url" : "upload");
  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
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
          <p className="text-xs text-muted-foreground">{t("tenantSettings.companyNameHelp")}</p>
        </div>

        {/* Row 2: Logo — Dual Mode (Upload / URL) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>{t("tenantSettings.logoUrl")}</Label>
            <div className="flex items-center gap-1 rounded-lg border bg-muted/30 p-0.5">
              <Button
                type="button"
                variant={logoMode === "upload" ? "default" : "ghost"}
                size="sm"
                className="h-7 gap-1.5 px-2.5 text-xs"
                onClick={() => setLogoMode("upload")}
              >
                <Upload className="h-3 w-3" />
                {t("tenantSettings.uploadFile")}
              </Button>
              <Button
                type="button"
                variant={logoMode === "url" ? "default" : "ghost"}
                size="sm"
                className="h-7 gap-1.5 px-2.5 text-xs"
                onClick={() => setLogoMode("url")}
              >
                <Link2 className="h-3 w-3" />
                {t("tenantSettings.orEnterUrl")}
              </Button>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="flex-1">
              {logoMode === "upload" ? (
                <Input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file && onUploadLogo) {
                      try {
                        const url = await onUploadLogo(file);
                        updateField("logoUrl", url);
                      } catch {
                        // Error handled by parent
                      }
                    }
                  }}
                  disabled={!onUploadLogo}
                />
              ) : (
                <Input
                  value={settings.logoUrl ?? ""}
                  onChange={(e) => updateField("logoUrl", e.target.value || null)}
                  placeholder="/uploads/tenants/logo.png"
                />
              )}
              <p className="mt-1.5 text-xs text-muted-foreground">{t("tenantSettings.logoUrlHelp")}</p>
            </div>
            {/* Logo preview */}
            {settings.logoUrl && (
              <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted/20 p-1">
                <img
                  src={settings.logoUrl.startsWith("http") ? settings.logoUrl : resolveFileUrl(settings.logoUrl)}
                  alt={t("tenantSettings.logoUrl")}
                  className="max-h-full max-w-full object-contain"
                  onError={(e) => { e.currentTarget.style.display = "none"; }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Row 3: Primary Color + Secondary Color */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="primaryColor">{t("tenantSettings.primaryColor")}</Label>
            <div className="flex gap-2">
              <Input
                type="color"
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
            <p className="text-xs text-muted-foreground">{t("tenantSettings.primaryColorHelp")}</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="secondaryColor">{t("tenantSettings.secondaryColor")}</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={settings.secondaryColor || "#6366f1"}
                onChange={(e) => updateField("secondaryColor", e.target.value || null)}
                className="h-9 w-12 cursor-pointer p-1"
              />
              <Input
                id="secondaryColor"
                value={settings.secondaryColor ?? ""}
                onChange={(e) => updateField("secondaryColor", e.target.value || null)}
                placeholder="#6366f1"
              />
            </div>
            <p className="text-xs text-muted-foreground">{t("tenantSettings.secondaryColorHelp")}</p>
          </div>
        </div>

        {/* Row 4: Favicon — Dual Mode (Upload / URL) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>{t("tenantSettings.faviconUrl")}</Label>
            <div className="flex items-center gap-1 rounded-lg border bg-muted/30 p-0.5">
              <Button
                type="button"
                variant={faviconMode === "upload" ? "default" : "ghost"}
                size="sm"
                className="h-7 gap-1.5 px-2.5 text-xs"
                onClick={() => setFaviconMode("upload")}
              >
                <Upload className="h-3 w-3" />
                {t("tenantSettings.uploadFile")}
              </Button>
              <Button
                type="button"
                variant={faviconMode === "url" ? "default" : "ghost"}
                size="sm"
                className="h-7 gap-1.5 px-2.5 text-xs"
                onClick={() => setFaviconMode("url")}
              >
                <Link2 className="h-3 w-3" />
                {t("tenantSettings.orEnterUrl")}
              </Button>
            </div>
          </div>
          {faviconMode === "upload" ? (
            <Input
              ref={faviconInputRef}
              type="file"
              accept="image/x-icon,image/png,image/svg+xml"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file && onUploadLogo) {
                  try {
                    const url = await onUploadLogo(file);
                    updateField("faviconUrl", url);
                  } catch {
                    // Error handled by parent
                  }
                }
              }}
              disabled={!onUploadLogo}
            />
          ) : (
            <Input
              value={settings.faviconUrl ?? ""}
              onChange={(e) => updateField("faviconUrl", e.target.value || null)}
              placeholder="/uploads/tenants/favicon.ico"
            />
          )}
          <p className="text-xs text-muted-foreground">{t("tenantSettings.faviconUrlHelp")}</p>
        </div>

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
            <p className="text-xs text-muted-foreground">{t("tenantSettings.loginHeadlineHelp")}</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="loginSubtitle">{t("tenantSettings.loginSubtitle")}</Label>
            <Input
              id="loginSubtitle"
              value={settings.loginSubtitle ?? ""}
              onChange={(e) => updateField("loginSubtitle", e.target.value || null)}
              placeholder={t("tenantSettings.loginSubtitlePlaceholder")}
            />
            <p className="text-xs text-muted-foreground">{t("tenantSettings.loginSubtitleHelp")}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
