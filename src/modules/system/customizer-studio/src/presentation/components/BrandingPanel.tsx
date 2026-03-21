/**
 * BrandingPanel — Logo (ImageUploadField), company name, headline, subtitle, favicon, copyright
 * Uses core ImageUploadField for upload/URL/drag-drop.
 * All labels localized via t()
 */
"use client";

import { Building2, Heading, FileText, Copyright } from "lucide-react";
import { ImageUploadField } from "@core/ui/image-upload-field";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import type { StudioDraft } from "../viewmodels/useStudioViewModel";

interface BrandingPanelProps {
  t: (key: string) => string;
  draft: StudioDraft;
  updateDraft: <K extends keyof StudioDraft>(field: K, value: StudioDraft[K]) => void;
}

export function BrandingPanel({ t, draft, updateDraft }: BrandingPanelProps) {
  return (
    <div className="space-y-5">
      {/* Logo — Upload + URL (matches tenant settings) */}
      <ImageUploadField
        value={draft.logoUrl}
        onChange={(url) => updateDraft("logoUrl", url)}
        label={t("studio.branding.logo")}
        description={t("studio.branding.logoDesc")}
        maxSizeBytes={2 * 1024 * 1024}
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
      />

      {/* Company Name */}
      <div className="space-y-1.5">
        <Label className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
          <Building2 className="h-3 w-3" />
          {t("studio.branding.companyName")}
        </Label>
        <Input
          value={draft.companyName}
          onChange={(e) => updateDraft("companyName", e.target.value)}
          placeholder={t("studio.branding.companyNamePlaceholder")}
          className="h-8 text-xs"
        />
      </div>

      {/* Headline */}
      <div className="space-y-1.5">
        <Label className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
          <Heading className="h-3 w-3" />
          {t("studio.branding.headline")}
        </Label>
        <Input
          value={draft.headline}
          onChange={(e) => updateDraft("headline", e.target.value)}
          placeholder={t("studio.branding.headlinePlaceholder")}
          className="h-8 text-xs"
        />
        <p className="text-[10px] text-muted-foreground/60 tabular-nums text-end">{draft.headline.length}/100</p>
      </div>

      {/* Subtitle */}
      <div className="space-y-1.5">
        <Label className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
          <FileText className="h-3 w-3" />
          {t("studio.branding.subtitle")}
        </Label>
        <textarea
          value={draft.subtitle}
          onChange={(e) => updateDraft("subtitle", e.target.value)}
          placeholder={t("studio.branding.subtitlePlaceholder")}
          rows={2}
          className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20 resize-none"
        />
      </div>

      {/* Favicon — Upload + URL */}
      <ImageUploadField
        value={draft.faviconUrl}
        onChange={(url) => updateDraft("faviconUrl", url)}
        label={t("studio.branding.favicon")}
        description={t("studio.branding.faviconDesc")}
        maxSizeBytes={512 * 1024}
        accept="image/x-icon,image/png,image/svg+xml,image/webp"
      />

      {/* Copyright Text */}
      <div className="space-y-1.5">
        <Label className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
          <Copyright className="h-3 w-3" />
          {t("studio.branding.copyright")}
        </Label>
        <Input
          value={draft.copyrightText}
          onChange={(e) => updateDraft("copyrightText", e.target.value)}
          placeholder={t("studio.branding.copyrightPlaceholder")}
          className="h-8 text-xs"
        />
      </div>
    </div>
  );
}
