"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { Image as ImageIcon } from "lucide-react";
import { ImageUploadField } from "@core/ui/image-upload-field";
import type { OAuthAppFormState } from "../viewmodels/useOAuthAppDetailViewModel";

interface BrandingSectionProps {
  form: OAuthAppFormState;
  updateField: <K extends keyof OAuthAppFormState>(field: K, value: OAuthAppFormState[K]) => void;
}

/**
 * Presentation UI component rendering the branding section.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function BrandingSection({ form, updateField }: BrandingSectionProps) {
  const { t } = useI18n();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <ImageIcon className="h-5 w-5 text-nx-accent" aria-hidden="true" />
          {t("oauthApps.brandingSection")}
        </CardTitle>
        <CardDescription>{t("oauthApps.brandingSectionDesc")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <ImageUploadField
          label={t("oauthApps.logoUri")}
          description={t("oauthApps.brandingSectionDesc")}
          value={form.logoUri}
          onChange={(url) => updateField("logoUri", url)}
        />
      </CardContent>
    </Card>
  );
}
