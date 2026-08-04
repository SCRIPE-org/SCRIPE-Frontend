"use client";

import { useState } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Button } from "@core/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { Info, Copy, Check } from "lucide-react";

/**
 * Presentation UI component rendering the idp metadata section.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function IdpMetadataSection() {
  const { t } = useI18n();
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Compute the absolute paths based on window location (client-side only)
  const apiOrigin =
    typeof window !== "undefined"
      ? process.env.NEXT_PUBLIC_API_URL ||
        `${window.location.protocol}//${window.location.hostname}:5035`
      : "https://api.example.com";

  // apiOrigin (from NEXT_PUBLIC_API_URL) already ends in "/api" — see
  // CallbackUrlCard.tsx's samlCallback for the same convention. Appending
  // another "/api/..." segment here doubled the path to "/api/api/v1/...".
  const ssoUrl = `${apiOrigin}/v1/auth/saml/sso`;
  const metadataUrl = `${apiOrigin}/v1/auth/saml/metadata`;
  const idpEntityId = `${apiOrigin}/v1/auth/saml/metadata`;

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Info className="h-5 w-5 text-info" aria-hidden="true" />
          {t("oauthApps.idpMetadataTitle")}
        </CardTitle>
        <CardDescription>{t("oauthApps.idpMetadataDesc")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* IdP Entity ID / Issuer */}
        <div className="space-y-1.5">
          <Label className="text-xs text-nx-ink-3">{t("oauthApps.idpEntityId")}</Label>
          <div className="flex gap-2">
            <Input readOnly value={idpEntityId} className="font-mono text-xs" />
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleCopy(idpEntityId, "idpEntityId")}
              className="shrink-0"
              aria-label={t("oauthApps.copyIdpEntityId")}
            >
              {copiedField === "idpEntityId" ? (
                <Check className="h-3.5 w-3.5 text-success" aria-hidden="true" />
              ) : (
                <Copy className="h-3.5 w-3.5" aria-hidden="true" />
              )}
            </Button>
          </div>
        </div>

        {/* SSO Service URL */}
        <div className="space-y-1.5">
          <Label className="text-xs text-nx-ink-3">{t("oauthApps.idpSsoUrl")}</Label>
          <div className="flex gap-2">
            <Input readOnly value={ssoUrl} className="font-mono text-xs" />
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleCopy(ssoUrl, "ssoUrl")}
              className="shrink-0"
              aria-label={t("oauthApps.copySsoUrl")}
            >
              {copiedField === "ssoUrl" ? (
                <Check className="h-3.5 w-3.5 text-success" aria-hidden="true" />
              ) : (
                <Copy className="h-3.5 w-3.5" aria-hidden="true" />
              )}
            </Button>
          </div>
        </div>

        {/* XML Metadata URL */}
        <div className="space-y-1.5">
          <Label className="text-xs text-nx-ink-3">{t("oauthApps.idpXmlMetadataUrl")}</Label>
          <div className="flex gap-2">
            <Input readOnly value={metadataUrl} className="font-mono text-xs" />
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleCopy(metadataUrl, "metadataUrl")}
              className="shrink-0"
              aria-label={t("oauthApps.copyMetadataUrl")}
            >
              {copiedField === "metadataUrl" ? (
                <Check className="h-3.5 w-3.5 text-success" aria-hidden="true" />
              ) : (
                <Copy className="h-3.5 w-3.5" aria-hidden="true" />
              )}
            </Button>
          </div>
          <p className="mt-1 text-xs text-nx-ink-3">{t("oauthApps.idpXmlHelp")}</p>
        </div>
      </CardContent>
    </Card>
  );
}
