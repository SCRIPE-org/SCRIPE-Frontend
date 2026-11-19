/**
 * TenantSettingsBrandingCard — Flat Nexus Branding summary card for {@link TenantSettingsTab}.
 *
 * @module tenants/presentation/components/tabs
 */
"use client";

import Image from "next/image";
import { Palette, Pencil } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { useResolvedFileUrl } from "@core/hooks/use-resolved-file-url";
import { Button } from "@core/ui/button";
import { Card } from "@core/ui/card";
import type { TenantBrandingFormValues } from "../TenantSettingsBrandingFields";

interface TenantSettingsBrandingCardProps {
  settings: TenantBrandingFormValues;
  onEdit: () => void;
}

/**
 * Displays a tenant's visual branding summary (logo, colors, favicon, login copy)
 * inside a flat Nexus card slab.
 */
export function TenantSettingsBrandingCard({
  settings,
  onEdit,
}: TenantSettingsBrandingCardProps) {
  const { t } = useI18n();
  const resolvedLogoUrl = useResolvedFileUrl(settings.logoUrl);
  const resolvedFaviconUrl = useResolvedFileUrl(settings.faviconUrl);

  return (
    <Card className="border-nx-line bg-nx-surface p-5 transition-colors hover:border-nx-line-hi">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-nx-md bg-nx-accent-wash">
            <Palette className="h-4 w-4 text-nx-accent" aria-hidden="true" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-nx-ink">{t("tenant.settingsBranding")}</h4>
            <p className="text-xs text-nx-ink-2">{t("tenant.settingsBrandingDesc")}</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onEdit} aria-label={t("common.edit")}>
          <Pencil className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>

      <div className="flex items-center gap-6">
        {settings.logoUrl && resolvedLogoUrl ? (
          <Image
            src={resolvedLogoUrl}
            alt={t("tenant.logoPreview")}
            width={64}
            height={64}
            unoptimized
            className="h-16 w-16 rounded-nx-lg border border-nx-line bg-nx-raised object-contain p-1.5"
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-nx-lg border border-dashed border-nx-line bg-nx-raised text-xs text-nx-ink-2">
            {t("tenant.noLogo")}
          </div>
        )}
        <div className="space-y-1.5">
          <p className="font-semibold text-nx-ink">
            {settings.companyName || (
              <span className="italic text-nx-ink-2">{t("tenant.noCompanyName")}</span>
            )}
          </p>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div
                className="h-5 w-5 rounded-full border border-nx-line"
                style={{ backgroundColor: settings.primaryColor || "#000000" }}
              />
              <span className="font-mono text-xs text-nx-ink-2">
                {settings.primaryColor || "#000000"}
              </span>
            </div>
            {settings.secondaryColor && (
              <div className="flex items-center gap-1.5">
                <div
                  className="h-5 w-5 rounded-full border border-nx-line"
                  style={{ backgroundColor: settings.secondaryColor }}
                />
                <span className="font-mono text-xs text-nx-ink-2">
                  {settings.secondaryColor}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {settings.faviconUrl && resolvedFaviconUrl && (
          <div className="rounded-nx-md border border-nx-line bg-nx-raised p-2">
            <p className="text-xs text-nx-ink-2">{t("tenant.favicon")}</p>
            <div className="mt-1">
              <Image
                src={resolvedFaviconUrl}
                alt={t("tenant.favicon")}
                width={32}
                height={32}
                unoptimized
                className="h-8 w-8 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
          </div>
        )}
        {settings.loginHeadline && (
          <div className="rounded-nx-md border border-nx-line bg-nx-raised p-2">
            <p className="text-xs text-nx-ink-2">{t("tenant.loginHeadline")}</p>
            <p className="truncate text-sm font-medium text-nx-ink">{settings.loginHeadline}</p>
          </div>
        )}
        {settings.loginSubtitle && (
          <div className="rounded-nx-md border border-nx-line bg-nx-raised p-2">
            <p className="text-xs text-nx-ink-2">{t("tenant.loginSubtitle")}</p>
            <p className="truncate text-sm font-medium text-nx-ink">{settings.loginSubtitle}</p>
          </div>
        )}
      </div>
    </Card>
  );
}
