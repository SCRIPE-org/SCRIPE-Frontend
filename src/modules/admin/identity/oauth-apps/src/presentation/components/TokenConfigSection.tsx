"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { Timer } from "lucide-react";
import type { OAuthAppFormState } from "../viewmodels/useOAuthAppDetailViewModel";

interface TokenConfigSectionProps {
  form: OAuthAppFormState;
  updateField: <K extends keyof OAuthAppFormState>(field: K, value: OAuthAppFormState[K]) => void;
}

/**
 * Presentation UI component rendering the token config section.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function TokenConfigSection({ form, updateField }: TokenConfigSectionProps) {
  const { t } = useI18n();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Timer className="h-5 w-5 text-cyan-500" />
          {t("oauthApps.tokenSection") || "Token Configuration"}
        </CardTitle>
        <CardDescription>
          {t("oauthApps.tokenSectionDesc") || "Configure access and refresh token lifetimes"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Access Token Lifetime */}
          <div className="space-y-2">
            <Label htmlFor="oauth-access-ttl">
              {t("oauthApps.accessTokenLifetime") || "Access Token Lifetime"}
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="oauth-access-ttl"
                type="number"
                min={1}
                max={1440}
                value={form.accessTokenLifetimeMinutes}
                onChange={(e) =>
                  updateField("accessTokenLifetimeMinutes", parseInt(e.target.value) || 60)
                }
                className="w-24"
              />
              <span className="text-sm text-muted-foreground">
                {t("common.minutes") || "minutes"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {t("oauthApps.accessTokenHelp") || "Typical: 15–60 min. Shorter = more secure."}
            </p>
          </div>

          {/* Refresh Token Lifetime */}
          <div className="space-y-2">
            <Label htmlFor="oauth-refresh-ttl">
              {t("oauthApps.refreshTokenLifetime") || "Refresh Token Lifetime"}
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="oauth-refresh-ttl"
                type="number"
                min={1}
                max={365}
                value={form.refreshTokenLifetimeDays}
                onChange={(e) =>
                  updateField("refreshTokenLifetimeDays", parseInt(e.target.value) || 14)
                }
                className="w-24"
              />
              <span className="text-sm text-muted-foreground">{t("common.days") || "days"}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {t("oauthApps.refreshTokenHelp") ||
                "Typical: 7–30 days. Set based on session requirements."}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
