"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Switch } from "@core/ui/switch";
import { Textarea } from "@core/ui/textarea";
import { Badge } from "@core/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { Settings2 } from "lucide-react";
import GenericSelect from "@core/crud/components/generic-select";
import type { OAuthAppFormState } from "../viewmodels/useOAuthAppDetailViewModel";

interface GeneralSectionProps {
  form: OAuthAppFormState;
  updateField: <K extends keyof OAuthAppFormState>(field: K, value: OAuthAppFormState[K]) => void;
  clientTypeOptions: { value: string; label: string; description: string }[];
  isCreateMode: boolean;
}

/**
 * Presentation UI component rendering the general section.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function GeneralSection({
  form,
  updateField,
  clientTypeOptions,
  isCreateMode,
}: GeneralSectionProps) {
  const { t } = useI18n();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Settings2 className="h-5 w-5 text-info" aria-hidden="true" />
          {t("oauthApps.generalSection")}
        </CardTitle>
        <CardDescription>{t("oauthApps.generalSectionDesc")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Display Name */}
        <div className="space-y-2">
          <Label htmlFor="oauth-name">
            {t("oauthApps.displayName")} <span className="text-destructive">*</span>
          </Label>
          <Input
            id="oauth-name"
            value={form.displayName}
            onChange={(e) => updateField("displayName", e.target.value)}
            placeholder={t("oauthApps.displayNamePlaceholder")}
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="oauth-desc">{t("oauthApps.descriptionLabel")}</Label>
          <Textarea
            id="oauth-desc"
            value={form.description}
            onChange={(e) => updateField("description", e.target.value)}
            placeholder={t("oauthApps.descriptionPlaceholder")}
            className="min-h-[80px] resize-y"
          />
        </div>

        {/* Client Type */}
        {isCreateMode && (
          <div className="space-y-2">
            <Label>
              {t("oauthApps.clientType")} <span className="text-destructive">*</span>
            </Label>
            <GenericSelect
              value={form.clientType}
              onValueChange={(v: string | string[]) => updateField("clientType", v as string)}
              options={clientTypeOptions}
              placeholder={t("oauthApps.selectClientType")}
            />
            <p className="text-xs text-nx-ink-3">
              {form.clientType === "confidential"
                ? t("oauthApps.confidentialHelp")
                : t("oauthApps.publicHelp")}
            </p>
          </div>
        )}

        {/* Client Type badge (edit mode — read only) */}
        {!isCreateMode && (
          <div className="flex items-center gap-2">
            <Label className="text-sm">{t("oauthApps.clientType")}:</Label>
            <Badge variant="outline" className="text-sm">
              {form.clientType === "confidential"
                ? t("oauthApps.clientTypeConfidential")
                : t("oauthApps.clientTypePublic")}
            </Badge>
          </div>
        )}

        {/* Active Toggle */}
        <div className="flex items-center justify-between rounded-nx-md border border-nx-line p-3">
          <div>
            <Label htmlFor="oauth-active" className="text-sm font-medium">
              {t("common.active")}
            </Label>
            <p className="text-xs text-nx-ink-3">{t("oauthApps.activeHelp")}</p>
          </div>
          <Switch
            id="oauth-active"
            checked={form.isActive}
            onCheckedChange={(v) => updateField("isActive", v)}
          />
        </div>
      </CardContent>
    </Card>
  );
}
