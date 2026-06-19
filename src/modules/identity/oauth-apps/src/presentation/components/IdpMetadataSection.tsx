"use client";

import { useState } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Button } from "@core/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { Info, Copy, Check } from "lucide-react";

export function IdpMetadataSection() {
  const { t } = useI18n();
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Compute the absolute paths based on window location (client-side only)
  const apiOrigin = typeof window !== "undefined"
    ? (process.env.NEXT_PUBLIC_API_URL || `${window.location.protocol}//${window.location.hostname}:5001`)
    : "https://api.example.com";

  const ssoUrl = `${apiOrigin}/api/v1/auth/saml/sso`;
  const metadataUrl = `${apiOrigin}/api/v1/auth/saml/metadata`;
  const idpEntityId = `${apiOrigin}/api/v1/auth/saml/metadata`;

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Info className="h-5 w-5 text-indigo-500" />
          {t("oauthApps.idpMetadataTitle") || "Identity Provider (IdP) Metadata"}
        </CardTitle>
        <CardDescription>
          {t("oauthApps.idpMetadataDesc") ||
            "Use these details to configure trust on your Service Provider (SP) application."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* IdP Entity ID / Issuer */}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">
            {t("oauthApps.idpEntityId") || "IdP Entity ID (Issuer)"}
          </Label>
          <div className="flex gap-2">
            <Input
              readOnly
              value={idpEntityId}
              className="font-mono text-xs bg-muted/40 cursor-default"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleCopy(idpEntityId, "idpEntityId")}
              className="shrink-0"
            >
              {copiedField === "idpEntityId" ? (
                <Check className="h-3.5 w-3.5 text-green-500" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
        </div>

        {/* SSO Service URL */}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">
            {t("oauthApps.idpSsoUrl") || "Single Sign-On (SSO) URL"}
          </Label>
          <div className="flex gap-2">
            <Input
              readOnly
              value={ssoUrl}
              className="font-mono text-xs bg-muted/40 cursor-default"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleCopy(ssoUrl, "ssoUrl")}
              className="shrink-0"
            >
              {copiedField === "ssoUrl" ? (
                <Check className="h-3.5 w-3.5 text-green-500" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
        </div>

        {/* XML Metadata URL */}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">
            {t("oauthApps.idpXmlMetadataUrl") || "IdP Metadata XML URL"}
          </Label>
          <div className="flex gap-2">
            <Input
              readOnly
              value={metadataUrl}
              className="font-mono text-xs bg-muted/40 cursor-default"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleCopy(metadataUrl, "metadataUrl")}
              className="shrink-0"
            >
              {copiedField === "metadataUrl" ? (
                <Check className="h-3.5 w-3.5 text-green-500" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">
            {t("oauthApps.idpXmlHelp") ||
              "Most enterprise apps allow configuring SSO by simply pasting this XML metadata URL."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
