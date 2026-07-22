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
          <Settings2 className="h-5 w-5 text-info" />
          {t("oauthApps.generalSection") || "General"}
        </CardTitle>
        <CardDescription>
          {t("oauthApps.generalSectionDesc") || "Basic application configuration"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Display Name */}
        <div className="space-y-2">
          <Label htmlFor="oauth-name">
            {t("oauthApps.displayName") || "Application Name"}{" "}
            <span className="text-destructive">*</span>
          </Label>
          <Input
            id="oauth-name"
            value={form.displayName}
            onChange={(e) => updateField("displayName", e.target.value)}
            placeholder={t("oauthApps.displayNamePlaceholder") || "e.g. Mobile App, Partner Portal"}
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="oauth-desc">{t("oauthApps.descriptionLabel") || "Description"}</Label>
          <Textarea
            id="oauth-desc"
            value={form.description}
            onChange={(e) => updateField("description", e.target.value)}
            placeholder={t("oauthApps.descriptionPlaceholder") || "What does this application do?"}
            className="min-h-[80px] resize-y"
          />
        </div>

        {/* Client Type */}
        {isCreateMode && (
          <div className="space-y-2">
            <Label>
              {t("oauthApps.clientType") || "Client Type"} <span className="text-destructive">*</span>
            </Label>
            <GenericSelect
              value={form.clientType}
              onValueChange={(v: string | string[]) => updateField("clientType", v as string)}
              options={clientTypeOptions}
              placeholder={t("oauthApps.selectClientType") || "Select type..."}
            />
            <p className="text-xs text-muted-foreground">
              {form.clientType === "confidential"
                ? t("oauthApps.confidentialHelp") ||
                  "Server-side apps that can securely store client secrets"
                : t("oauthApps.publicHelp") ||
                  "SPA or mobile apps that cannot securely store secrets — PKCE required"}
            </p>
          </div>
        )}

        {/* Client Type badge (edit mode — read only) */}
        {!isCreateMode && (
          <div className="flex items-center gap-2">
            <Label className="text-sm">{t("oauthApps.clientType") || "Client Type"}:</Label>
            <Badge variant="outline" className="text-sm">
              {form.clientType === "confidential" ? "Confidential" : "Public"}
            </Badge>
          </div>
        )}

        {/* Active Toggle */}
        <div className="flex items-center justify-between rounded-lg border p-3">
          <div>
            <Label className="text-sm font-medium">{t("common.active") || "Active"}</Label>
            <p className="text-xs text-muted-foreground">
              {t("oauthApps.activeHelp") || "Disabled apps cannot authenticate"}
            </p>
          </div>
          <Switch checked={form.isActive} onCheckedChange={(v) => updateField("isActive", v)} />
        </div>
      </CardContent>
    </Card>
  );
}
