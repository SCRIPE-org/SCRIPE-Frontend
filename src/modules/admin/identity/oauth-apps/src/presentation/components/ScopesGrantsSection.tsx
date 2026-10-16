"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { Input } from "@core/ui/input";
import { Button } from "@core/ui/button";
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
          <Tag className="h-5 w-5 text-nx-accent" aria-hidden="true" />
          {t("oauthApps.scopesGrantsSection")}
        </CardTitle>
        <CardDescription>{t("oauthApps.scopesGrantsSectionDesc")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Scopes */}
        <div className="space-y-2">
          <Label>{t("oauthApps.allowedScopes")}</Label>
          <div className="flex flex-wrap gap-2">
            {standardScopes.map((scope) => {
              const selected = currentScopes.includes(scope);
              return (
                <Button
                  key={scope}
                  type="button"
                  variant="ghost"
                  aria-pressed={selected}
                  onClick={() => toggleScope(scope)}
                  className="h-auto cursor-pointer rounded-full p-0 hover:bg-transparent focus-visible:shadow-nx-focus focus-visible:outline-none"
                >
                  <Badge variant={selected ? "info" : "outline"}>{scope}</Badge>
                </Button>
              );
            })}
          </div>
          <Input
            value={form.allowedScopes}
            onChange={(e) => updateField("allowedScopes", e.target.value)}
            placeholder="openid profile email"
            className="mt-2 font-mono text-sm"
          />
          <p className="text-xs text-nx-ink-3">{t("oauthApps.scopesHelp")}</p>
        </div>

        {/* Grant Types */}
        <div className="space-y-2">
          <Label>{t("oauthApps.allowedGrantTypes")}</Label>
          <div className="flex flex-wrap gap-2">
            {standardGrantTypes.map((grant) => {
              const selected = currentGrants.includes(grant);
              return (
                <Button
                  key={grant}
                  type="button"
                  variant="ghost"
                  aria-pressed={selected}
                  onClick={() => toggleGrant(grant)}
                  className="h-auto cursor-pointer rounded-full p-0 hover:bg-transparent focus-visible:shadow-nx-focus focus-visible:outline-none"
                >
                  <Badge variant={selected ? "success" : "outline"}>{grant}</Badge>
                </Button>
              );
            })}
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
