/**
 * BrandingPanel — Logo (ImageUploadField), company name, headline, subtitle, favicon, copyright
 * LAYOUT-AWARE: Shows only relevant fields for the current layout.
 * - Split layouts: headline, subtitle (rendered in LoginBranding panel)
 * - Non-split layouts: only logo, company name, favicon (no branding panel)
 * - Copyright: ALWAYS shown (all layouts)
 */
"use client";

import { Building2, Heading, FileText, Copyright, Info } from "lucide-react";
import { ImageUploadField } from "@core/ui/image-upload-field";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Textarea } from "@core/ui/textarea";
import type { StudioDraftProps as StudioDraft } from "../../domain/entities/StudioDraft";
import { useI18n } from "@core/providers/i18n-provider";

interface BrandingPanelProps {
  draft: StudioDraft;
  updateDraft: <K extends keyof StudioDraft>(field: K, value: StudioDraft[K]) => void;
}

const SPLIT_LAYOUTS = [
  "vault",
  "split-right",
  "split-left",
  "asymmetric",
  "sidebar-compact",
  "magazine",
  "stacked",
  "dual-panel",
  "vertical-split",
  "split-diagonal",
  "carousel",
];

export function BrandingPanel({ draft, updateDraft }: BrandingPanelProps) {
  const { t } = useI18n();
  const hasBrandingPanel = SPLIT_LAYOUTS.includes(draft.layout);

  return (
    <div className="space-y-4">
      {/* Logo — Upload + URL (all layouts) */}
      <ImageUploadField
        value={draft.logoUrl}
        onChange={(url) => updateDraft("logoUrl", url)}
        label={t("studio.branding.logo")}
        description={t("studio.branding.logoDesc")}
        maxSizeBytes={2 * 1024 * 1024}
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
      />

      {/* Company Name (all layouts) */}
      <div className="space-y-1">
        <Label className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
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

      {/* ─── Split-layout-only fields ─── */}
      {hasBrandingPanel ? (
        <>
          {/* Headline (branding panel only) */}
          <div className="space-y-1">
            <Label className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              <Heading className="h-3 w-3" />
              {t("studio.branding.headline")}
            </Label>
            <Input
              value={draft.headline}
              onChange={(e) => updateDraft("headline", e.target.value)}
              placeholder={t("studio.branding.headlinePlaceholder")}
              className="h-8 text-xs"
            />
            <p className="text-end text-[10px] tabular-nums text-muted-foreground/60">
              {draft.headline.length}/100
            </p>
          </div>

          {/* Subtitle (branding panel only) */}
          <div className="space-y-1">
            <Label className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              <FileText className="h-3 w-3" />
              {t("studio.branding.subtitle")}
            </Label>
            <Textarea
              value={draft.subtitle}
              onChange={(e) => updateDraft("subtitle", e.target.value)}
              placeholder={t("studio.branding.subtitlePlaceholder")}
              rows={2}
              className="resize-none text-xs"
            />
          </div>
        </>
      ) : (
        /* Info note for non-split layouts */
        <div className="flex items-start gap-2 rounded-lg border border-border/50 bg-muted/30 p-3">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-500" />
          <p className="text-[10px] leading-relaxed text-muted-foreground">
            {t("studio.branding.noPanelNote")}
          </p>
        </div>
      )}

      {/* Copyright — ALL layouts */}
      <div className="space-y-1">
        <Label className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
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

      {/* Favicon — Upload + URL (all layouts) */}
      <ImageUploadField
        value={draft.faviconUrl}
        onChange={(url) => updateDraft("faviconUrl", url)}
        label={t("studio.branding.favicon")}
        description={t("studio.branding.faviconDesc")}
        maxSizeBytes={512 * 1024}
        accept="image/x-icon,image/png,image/svg+xml,image/webp"
      />
    </div>
  );
}
