"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Textarea } from "@core/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { ShieldCheck } from "lucide-react";
import type { OAuthAppFormState } from "../viewmodels/useOAuthAppDetailViewModel";

interface SamlSectionProps {
  form: OAuthAppFormState;
  updateField: <K extends keyof OAuthAppFormState>(field: K, value: OAuthAppFormState[K]) => void;
}

/**
 * Presentation UI component rendering the saml section.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function SamlSection({ form, updateField }: SamlSectionProps) {
  const { t } = useI18n();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <ShieldCheck className="h-5 w-5 text-indigo-500" />
          {t("oauthApps.samlSection") || "SAML Configuration"}
        </CardTitle>
        <CardDescription>
          {t("oauthApps.samlSectionDesc") ||
            "Optional: Configure SAML 2.0 properties if this is a SAML Service Provider."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* ACS URL */}
        <div className="space-y-2">
          <Label htmlFor="saml-acs-url">
            {t("oauthApps.samlAcsUrl") || "Assertion Consumer Service (ACS) URL"}
          </Label>
          <Input
            id="saml-acs-url"
            value={form.samlAcsUrl ?? ""}
            onChange={(e) => updateField("samlAcsUrl", e.target.value)}
            placeholder="https://sp.example.com/saml/acs"
            className="font-mono text-sm"
          />
        </div>

        {/* SP Entity ID */}
        <div className="space-y-2">
          <Label htmlFor="saml-sp-entity-id">
            {t("oauthApps.samlSpEntityId") || "SP Entity ID"}
          </Label>
          <Input
            id="saml-sp-entity-id"
            value={form.samlSpEntityId ?? ""}
            onChange={(e) => updateField("samlSpEntityId", e.target.value)}
            placeholder="https://sp.example.com/saml/metadata"
            className="font-mono text-sm"
          />
        </div>

        {/* SP Certificate */}
        <div className="space-y-2">
          <Label htmlFor="saml-sp-cert">
            {t("oauthApps.samlSpCertificate") || "SP Certificate (X.509 PEM)"}
          </Label>
          <Textarea
            id="saml-sp-cert"
            value={form.samlSpCertificate ?? ""}
            onChange={(e) => updateField("samlSpCertificate", e.target.value)}
            placeholder={"-----BEGIN CERTIFICATE-----\n...\n-----END CERTIFICATE-----"}
            className="min-h-[100px] resize-y font-mono text-xs"
          />
          <p className="text-xs text-muted-foreground">
            {t("oauthApps.samlSpCertificateHelp") ||
              "Optional: Public X.509 certificate for validating signed SAML requests from this SP."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
