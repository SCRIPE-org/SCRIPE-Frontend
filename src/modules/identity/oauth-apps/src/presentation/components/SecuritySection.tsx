"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { Label } from "@core/ui/label";
import { Switch } from "@core/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { ShieldCheck } from "lucide-react";
import type { OAuthAppFormState } from "../viewmodels/useOAuthAppDetailViewModel";

interface SecuritySectionProps {
  form: OAuthAppFormState;
  updateField: <K extends keyof OAuthAppFormState>(field: K, value: OAuthAppFormState[K]) => void;
}

/**
 * React presentation component representing the security section UI element.
 */
export function SecuritySection({ form, updateField }: SecuritySectionProps) {
  const { t } = useI18n();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <ShieldCheck className="h-5 w-5 text-amber-500" />
          {t("oauthApps.securitySection") || "Security"}
        </CardTitle>
        <CardDescription>
          {t("oauthApps.securitySectionDesc") || "PKCE and consent screen requirements"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between rounded-lg border p-3">
          <div>
            <Label className="text-sm font-medium">
              {t("oauthApps.requirePkce") || "Require PKCE"}
            </Label>
            <p className="text-xs text-muted-foreground">
              {t("oauthApps.requirePkceHelp") ||
                "Proof Key for Code Exchange — recommended for all clients, mandatory for public clients"}
            </p>
          </div>
          <Switch
            checked={form.requirePkce}
            onCheckedChange={(v) => updateField("requirePkce", v)}
          />
        </div>

        <div className="flex items-center justify-between rounded-lg border p-3">
          <div>
            <Label className="text-sm font-medium">
              {t("oauthApps.requireConsent") || "Require Consent Screen"}
            </Label>
            <p className="text-xs text-muted-foreground">
              {t("oauthApps.requireConsentHelp") ||
                "Show a consent dialog to users before granting access to this app"}
            </p>
          </div>
          <Switch
            checked={form.requireConsent}
            onCheckedChange={(v) => updateField("requireConsent", v)}
          />
        </div>
      </CardContent>
    </Card>
  );
}
