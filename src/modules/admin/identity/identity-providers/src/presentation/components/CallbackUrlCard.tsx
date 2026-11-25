/**
 * Callback URL Card
 *
 * Displays canonical central OIDC/OAuth2 redirect URIs and SAML ACS URLs derived from
 * `NEXT_PUBLIC_API_URL` (defaulting to `https://api.scripe.org/api` whenever unset or relative),
 * and shows a clear informative note for SAML during Create mode before a provider ID exists.
 */
"use client";

import { useState } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Alert, AlertDescription } from "@core/ui/alert";
import { Label } from "@core/ui/label";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { Copy, Check, Info, Link2 } from "lucide-react";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";

interface Props {
  protocol: "oidc" | "oauth2" | "saml" | string;
  providerId?: string;
}

const CANONICAL_CENTRAL_API_URL = "https://api.scripe.org/api";

function resolveApiOrigin(): string {
  const configured = (process.env.NEXT_PUBLIC_API_URL || "").trim().replace(/\/+$/, "");
  if (/^https?:\/\//i.test(configured)) {
    return configured;
  }
  return CANONICAL_CENTRAL_API_URL;
}

/**
 * Displays copyable central OIDC/OAuth2 redirect URIs and SAML Assertion Consumer Service URLs.
 */
export function CallbackUrlCard({ protocol, providerId }: Props) {
  const { t } = useI18n();
  const { success } = useEnhancedToast();
  const [copiedType, setCopiedType] = useState<"standard" | "saml" | null>(null);

  const apiOrigin = resolveApiOrigin();
  const standardCallback = `${apiOrigin}/v1/auth/oidc/callback`;
  const samlCallback = providerId ? `${apiOrigin}/v1/auth/saml/acs/${providerId}` : null;

  const handleCopy = async (text: string, type: "standard" | "saml") => {
    try {
      await navigator.clipboard?.writeText(text);
      setCopiedType(type);
      success({
        title: t("identityProviders.copiedTitle"),
        description: t("identityProviders.callbackCopiedDesc"),
      });
      setTimeout(() => setCopiedType(null), 2000);
    } catch {
      // Clipboard API unavailable in restricted contexts
    }
  };

  const isSaml = protocol === "saml";

  return (
    <Card className="border border-info/20 bg-info/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-1.5 text-sm font-semibold tracking-tight text-info">
          <Link2 className="h-4 w-4" aria-hidden="true" />
          {t("identityProviders.callbackUrlTitle")}
        </CardTitle>
        <CardDescription className="text-xs">
          {t("identityProviders.callbackUrlDesc")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isSaml && (
          <div className="space-y-1.5">
            <Label className="text-[10px] font-semibold uppercase tracking-wider text-nx-ink-3">
              {t("identityProviders.standardRedirectUri")}
            </Label>
            <div className="flex items-center gap-2">
              <Input
                type="text"
                readOnly
                dir="ltr"
                value={standardCallback}
                data-testid="standard-callback-url-input"
                className="flex-1 select-all bg-nx-raised font-mono text-xs"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => void handleCopy(standardCallback, "standard")}
                className="h-8 w-8 p-0"
                aria-label={t("common.copy")}
              >
                {copiedType === "standard" ? (
                  <Check className="h-4 w-4 text-success" aria-hidden="true" />
                ) : (
                  <Copy className="h-4 w-4" aria-hidden="true" />
                )}
              </Button>
            </div>
          </div>
        )}

        {isSaml && samlCallback && (
          <div className="space-y-1.5">
            <Label className="text-[10px] font-semibold uppercase tracking-wider text-nx-ink-3">
              {t("identityProviders.samlAcsUrl")}
            </Label>
            <div className="flex items-center gap-2">
              <Input
                type="text"
                readOnly
                dir="ltr"
                value={samlCallback}
                data-testid="saml-acs-url-input"
                className="flex-1 select-all bg-nx-raised font-mono text-xs"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => void handleCopy(samlCallback, "saml")}
                className="h-8 w-8 p-0"
                aria-label={t("common.copy")}
              >
                {copiedType === "saml" ? (
                  <Check className="h-4 w-4 text-success" aria-hidden="true" />
                ) : (
                  <Copy className="h-4 w-4" aria-hidden="true" />
                )}
              </Button>
            </div>
          </div>
        )}

        {isSaml && !providerId && (
          <Alert
            data-testid="callback-create-mode-note"
            className="border-info/30 bg-info/10 text-info"
          >
            <Info className="h-4 w-4 shrink-0" aria-hidden="true" />
            <AlertDescription className="text-xs leading-relaxed">
              {t("identityProviders.saveProviderFirstAcsNote")}
            </AlertDescription>
          </Alert>
        )}

        <div className="flex items-start gap-1.5 text-[10px] text-nx-ink-3">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-info" aria-hidden="true" />
          <p className="leading-relaxed">{t("identityProviders.callbackUrlHelp")}</p>
        </div>
      </CardContent>
    </Card>
  );
}
