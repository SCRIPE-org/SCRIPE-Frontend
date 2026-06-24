"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Badge } from "@core/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { Tag } from "lucide-react";
import type { OAuthAppFormState } from "../viewmodels/useOAuthAppDetailViewModel";

interface ScopesGrantsSectionProps {
  form: OAuthAppFormState;
  updateField: <K extends keyof OAuthAppFormState>(field: K, value: OAuthAppFormState[K]) => void;
  standardScopes: string[];
  standardGrantTypes: string[];
}

/**
 * Presentation UI component rendering the scopes grants section.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function ScopesGrantsSection({
  form,
  updateField,
  standardScopes,
  standardGrantTypes,
}: ScopesGrantsSectionProps) {
  const { t } = useI18n();

  const currentScopes = form.allowedScopes.split(" ").filter(Boolean);
  const currentGrants = form.allowedGrantTypes.split(" ").filter(Boolean);

  const toggleScope = (scope: string) => {
    const updated = currentScopes.includes(scope)
      ? currentScopes.filter((s) => s !== scope)
      : [...currentScopes, scope];
    updateField("allowedScopes", updated.join(" "));
  };

  const toggleGrant = (grant: string) => {
    const updated = currentGrants.includes(grant)
      ? currentGrants.filter((g) => g !== grant)
      : [...currentGrants, grant];
    updateField("allowedGrantTypes", updated.join(" "));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Tag className="h-5 w-5 text-purple-500" />
          {t("oauthApps.scopesGrantsSection") || "Scopes & Grant Types"}
        </CardTitle>
        <CardDescription>
          {t("oauthApps.scopesGrantsSectionDesc") ||
            "Configure allowed OIDC scopes and OAuth grant types"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Scopes */}
        <div className="space-y-2">
          <Label>{t("oauthApps.allowedScopes") || "Allowed Scopes"}</Label>
          <div className="flex flex-wrap gap-2">
            {standardScopes.map((scope) => (
              <Badge
                key={scope}
                variant={currentScopes.includes(scope) ? "default" : "outline"}
                className={`cursor-pointer text-xs transition-all ${
                  currentScopes.includes(scope)
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "hover:bg-blue-50 dark:hover:bg-blue-950/30"
                }`}
                onClick={() => toggleScope(scope)}
              >
                {scope}
              </Badge>
            ))}
          </div>
          <Input
            value={form.allowedScopes}
            onChange={(e) => updateField("allowedScopes", e.target.value)}
            placeholder="openid profile email"
            className="mt-2 font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            {t("oauthApps.scopesHelp") ||
              "Click badges to toggle, or type custom scopes separated by spaces"}
          </p>
        </div>

        {/* Grant Types */}
        <div className="space-y-2">
          <Label>{t("oauthApps.allowedGrantTypes") || "Allowed Grant Types"}</Label>
          <div className="flex flex-wrap gap-2">
            {standardGrantTypes.map((grant) => (
              <Badge
                key={grant}
                variant={currentGrants.includes(grant) ? "default" : "outline"}
                className={`cursor-pointer text-xs transition-all ${
                  currentGrants.includes(grant)
                    ? "bg-emerald-600 text-white hover:bg-emerald-700"
                    : "hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                }`}
                onClick={() => toggleGrant(grant)}
              >
                {grant}
              </Badge>
            ))}
          </div>
          <Input
            value={form.allowedGrantTypes}
            onChange={(e) => updateField("allowedGrantTypes", e.target.value)}
            placeholder="authorization_code refresh_token"
            className="mt-2 font-mono text-sm"
          />
        </div>
      </CardContent>
    </Card>
  );
}
