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
          <ShieldCheck className="h-5 w-5 text-info" aria-hidden="true" />
          {t("oauthApps.samlSection")}
        </CardTitle>
        <CardDescription>{t("oauthApps.samlSectionDesc")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* ACS URL */}
        <div className="space-y-2">
          <Label htmlFor="saml-acs-url">{t("oauthApps.samlAcsUrl")}</Label>
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
          <Label htmlFor="saml-sp-entity-id">{t("oauthApps.samlSpEntityId")}</Label>
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
          <Label htmlFor="saml-sp-cert">{t("oauthApps.samlSpCertificate")}</Label>
          <Textarea
            id="saml-sp-cert"
            value={form.samlSpCertificate ?? ""}
            onChange={(e) => updateField("samlSpCertificate", e.target.value)}
            placeholder={"-----BEGIN CERTIFICATE-----\n...\n-----END CERTIFICATE-----"}
            className="min-h-[100px] resize-y font-mono text-xs"
          />
          <p className="text-xs text-nx-ink-3">{t("oauthApps.samlSpCertificateHelp")}</p>
        </div>
      </CardContent>
    </Card>
  );
}
