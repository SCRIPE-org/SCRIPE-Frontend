"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Button } from "@core/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { Link2, Plus, X } from "lucide-react";
import type { OAuthAppFormState } from "../viewmodels/useOAuthAppDetailViewModel";

interface EndpointsSectionProps {
  form: OAuthAppFormState;
  addRedirectUri: () => void;
  removeRedirectUri: (index: number) => void;
  updateRedirectUri: (index: number, value: string) => void;
  addPostLogoutUri: () => void;
  removePostLogoutUri: (index: number) => void;
  updatePostLogoutUri: (index: number, value: string) => void;
}

/**
 * Presentation UI component rendering the endpoints section.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function EndpointsSection({
  form,
  addRedirectUri,
  removeRedirectUri,
  updateRedirectUri,
  addPostLogoutUri,
  removePostLogoutUri,
  updatePostLogoutUri,
}: EndpointsSectionProps) {
  const { t } = useI18n();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Link2 className="h-5 w-5 text-emerald-500" />
          {t("oauthApps.endpointsSection") || "Endpoints"}
        </CardTitle>
        <CardDescription>
          {t("oauthApps.endpointsSectionDesc") || "Configure redirect and post-logout URIs"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Redirect URIs */}
        <div className="space-y-2">
          <Label>
            {t("oauthApps.redirectUris") || "Redirect URIs"} <span className="text-red-500">*</span>
          </Label>
          <div className="space-y-2">
            {form.redirectUris.map((uri, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={uri}
                  onChange={(e) => updateRedirectUri(index, e.target.value)}
                  placeholder="https://app.example.com/callback"
                  className="flex-1 font-mono text-sm"
                />
                {form.redirectUris.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0 text-red-500 hover:text-red-600"
                    onClick={() => removeRedirectUri(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={addRedirectUri} className="gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            {t("oauthApps.addRedirectUri") || "Add URI"}
          </Button>
        </div>

        {/* Post-Logout Redirect URIs */}
        <div className="space-y-2">
          <Label>{t("oauthApps.postLogoutRedirectUris") || "Post-Logout Redirect URIs"}</Label>
          <div className="space-y-2">
            {form.postLogoutRedirectUris.map((uri, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={uri}
                  onChange={(e) => updatePostLogoutUri(index, e.target.value)}
                  placeholder="https://app.example.com/logged-out"
                  className="flex-1 font-mono text-sm"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 text-red-500 hover:text-red-600"
                  onClick={() => removePostLogoutUri(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={addPostLogoutUri} className="gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            {t("oauthApps.addPostLogoutUri") || "Add URI"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
