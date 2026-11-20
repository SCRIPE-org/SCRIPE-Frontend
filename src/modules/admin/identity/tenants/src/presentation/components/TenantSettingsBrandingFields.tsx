/**
 * TenantSettingsBrandingFields — Branding tab fields for {@link TenantSettingsEditDialog}.
 *
 * @module tenants/presentation/components
 */
"use client";

import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { ImageUploadField } from "@core/ui/image-upload-field";
import { useI18n } from "@core/providers/i18n-provider";

/** Branding subset edited inside the Branding tab. */
export interface TenantBrandingFormValues {
  companyName: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  logoUrl: string | null;
  faviconUrl: string | null;
  loginHeadline: string | null;
  loginSubtitle: string | null;
}

interface TenantSettingsBrandingFieldsProps {
  formData: TenantBrandingFormValues;
  onPatch: (patch: Partial<TenantBrandingFormValues>) => void;
}

/**
 * Pure presentation fields for editing tenant branding (company name, colors, logo, favicon, login text).
 */
export function TenantSettingsBrandingFields({
  formData,
  onPatch,
}: TenantSettingsBrandingFieldsProps) {
  const { t } = useI18n();

  return (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label>{t("tenant.companyName")}</Label>
        <Input
          value={formData.companyName || ""}
          onChange={(e) => onPatch({ companyName: e.target.value })}
          placeholder={t("tenant.companyNamePlaceholder")}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{t("tenant.primaryColor")}</Label>
          <div className="flex gap-2">
            <Input
              type="color"
              value={formData.primaryColor || "#000000"}
              onChange={(e) => onPatch({ primaryColor: e.target.value })}
              className="h-10 w-12 p-1"
            />
            <Input
              value={formData.primaryColor || ""}
              onChange={(e) => onPatch({ primaryColor: e.target.value })}
              placeholder="#000000"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label>{t("tenant.secondaryColor")}</Label>
          <div className="flex gap-2">
            <Input
              type="color"
              value={formData.secondaryColor || "#3F4347"}
              onChange={(e) => onPatch({ secondaryColor: e.target.value })}
              className="h-10 w-12 p-1"
            />
            <Input
              value={formData.secondaryColor || ""}
              onChange={(e) => onPatch({ secondaryColor: e.target.value })}
              placeholder="#3F4347"
            />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <ImageUploadField
          value={formData.logoUrl || ""}
          onChange={(url) => onPatch({ logoUrl: url })}
          label={t("tenant.logoUrl")}
          maxSizeBytes={2 * 1024 * 1024}
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
        />
        <ImageUploadField
          value={formData.faviconUrl || ""}
          onChange={(url) => onPatch({ faviconUrl: url })}
          label={t("tenant.faviconUrl")}
          description={t("tenant.faviconUrlHelp")}
          maxSizeBytes={512 * 1024}
          accept="image/x-icon,image/png,image/svg+xml,image/webp"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{t("tenant.loginHeadline")}</Label>
          <Input
            value={formData.loginHeadline || ""}
            onChange={(e) => onPatch({ loginHeadline: e.target.value })}
            placeholder={t("tenant.loginHeadlinePlaceholder")}
          />
        </div>
        <div className="space-y-2">
          <Label>{t("tenant.loginSubtitle")}</Label>
          <Input
            value={formData.loginSubtitle || ""}
            onChange={(e) => onPatch({ loginSubtitle: e.target.value })}
            placeholder={t("tenant.loginSubtitlePlaceholder")}
          />
        </div>
      </div>
    </div>
  );
}
