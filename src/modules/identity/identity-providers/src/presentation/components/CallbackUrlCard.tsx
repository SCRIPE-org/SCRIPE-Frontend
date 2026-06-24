/**
 * Callback URL Card
 *
 * Displays read-only redirect/callback URLs for OIDC and SAML protocols.
 * Includes copy-to-clipboard functionality with dynamic success indicators.
 */
"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@core/providers/i18n-provider";
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

/**
 * Presentation UI component rendering the callback url card.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function CallbackUrlCard({ protocol, providerId }: Props) {
  const { t } = useI18n();
  const { success } = useEnhancedToast();
  const [origin, setOrigin] = useState("https://app.scripe.com");
  const [apiOrigin, setApiOrigin] = useState("https://api.scripe.com/api");
  const [copiedType, setCopiedType] = useState<"standard" | "saml" | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOrigin(window.location.origin);

      let apiVal = process.env.NEXT_PUBLIC_API_URL || "/api";
      if (apiVal.startsWith("/")) {
        apiVal = `${window.location.origin}${apiVal}`;
      }
      setApiOrigin(apiVal);
    }
  }, []);

  const standardCallback = `${origin}/sso/callback`;
  const providerToken = providerId || "{providerId}";
  const samlCallback = `${apiOrigin}/v1/auth/saml/acs/${providerToken}`;

  const handleCopy = (text: string, type: "standard" | "saml") => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    success({
      title: t("common.copied") || "Copied to Clipboard",
      description: t("identityProviders.callbackCopiedDesc") || "Redirect URL copied successfully.",
    });
    setTimeout(() => setCopiedType(null), 2000);
  };

  const isSaml = protocol === "saml";

  return (
    <Card className="border border-indigo-500/20 bg-indigo-500/5 shadow-sm dark:bg-indigo-950/10">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-1.5 text-sm font-semibold tracking-tight text-indigo-700 dark:text-indigo-400">
          <Link2 className="h-4.5 w-4.5" />
          {t("identityProviders.callbackUrlTitle") || "Redirect Settings"}
        </CardTitle>
        <CardDescription className="text-xs">
          {t("identityProviders.callbackUrlDesc") ||
            "Register these endpoints in your Identity Provider (IdP) dashboard to allow secure auth flows."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* OIDC/OAuth2 Redirect URL */}
        {!isSaml && (
          <div className="space-y-1.5">
            <Label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {t("identityProviders.standardRedirectUri") || "OAuth2 / OIDC Redirect URI"}
            </Label>
            <div className="flex items-center gap-2">
              <Input
                type="text"
                readOnly
                value={standardCallback}
                className="flex-1 select-all bg-muted/40 font-mono text-xs"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleCopy(standardCallback, "standard")}
                className="h-8 w-8 p-0"
              >
                {copiedType === "standard" ? (
                  <Check className="h-4 w-4 text-emerald-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        )}

        {/* SAML ACS URL */}
        {isSaml && (
          <div className="space-y-1.5">
            <Label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {t("identityProviders.samlAcsUrl") || "SAML Assertion Consumer Service (ACS) URL"}
            </Label>
            <div className="flex items-center gap-2">
              <Input
                type="text"
                readOnly
                value={samlCallback}
                className="flex-1 select-all bg-muted/40 font-mono text-xs"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleCopy(samlCallback, "saml")}
                className="h-8 w-8 p-0"
              >
                {copiedType === "saml" ? (
                  <Check className="h-4 w-4 text-emerald-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        )}

        <div className="flex items-start gap-1.5 text-[10px] text-muted-foreground">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-indigo-500" />
          <p className="leading-relaxed">
            {t("identityProviders.callbackUrlHelp") ||
              "Most identity providers require this URL to exactly match. Make sure the protocol (http/https) matches your deployment environment."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
