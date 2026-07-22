"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { Check, Globe, Lock } from "lucide-react";

interface ProtocolSelectionSectionProps {
  protocol: string;
  onChange: (protocol: string) => void;
}

/**
 * Presentation UI component rendering the protocol selection section.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function ProtocolSelectionSection({ protocol, onChange }: ProtocolSelectionSectionProps) {
  const { t } = useI18n();

  return (
    <div className="space-y-4">
      <div className="mx-auto mb-6 max-w-lg text-center">
        <h3 className="text-lg font-bold text-foreground">
          {t("oauthApps.selectProtocolTitle") || "Select Authentication Protocol"}
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          {t("oauthApps.selectProtocolDesc") ||
            "Choose the standard that fits your integration. This cannot be changed once created."}
        </p>
      </div>

      <div className="mx-auto grid max-w-2xl grid-cols-1 gap-4 md:grid-cols-2">
        {/* OIDC Option */}
        <div
          onClick={() => onChange("oidc")}
          className={`group relative cursor-pointer rounded-xl border p-5 transition-all duration-200 hover:shadow-md ${
            protocol === "oidc"
              ? "border-primary bg-primary/5 shadow-[0_0_15px_hsl(var(--primary)/0.08)]"
              : "border-border bg-card hover:border-primary/40"
          }`}
        >
          {protocol === "oidc" && (
            <div className="scale-in absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground duration-200 animate-in">
              <Check className="h-3.5 w-3.5 stroke-[3]" />
            </div>
          )}
          <div
            className={`mb-3.5 w-fit rounded-lg p-2.5 ${
              protocol === "oidc"
                ? "bg-primary/20 text-primary"
                : "bg-muted text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary"
            }`}
          >
            <Globe className="h-6 w-6" />
          </div>
          <h4 className="text-sm font-bold text-foreground">OIDC / OAuth 2.0</h4>
          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
            {t("oauthApps.oidcChoiceDesc") ||
              "Modern identity standard using JWT tokens. Recommended for web applications, Single Page Apps (SPA), and mobile apps."}
          </p>
        </div>

        {/* SAML Option */}
        <div
          onClick={() => onChange("saml")}
          className={`group relative cursor-pointer rounded-xl border p-5 transition-all duration-200 hover:shadow-md ${
            protocol === "saml"
              ? "border-info bg-info/5 shadow-[0_0_15px_hsl(var(--info)/0.08)]"
              : "border-border bg-card hover:border-info/40"
          }`}
        >
          {protocol === "saml" && (
            <div className="scale-in absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-info text-info-foreground duration-200 animate-in">
              <Check className="h-3.5 w-3.5 stroke-[3]" />
            </div>
          )}
          <div
            className={`mb-3.5 w-fit rounded-lg p-2.5 ${
              protocol === "saml"
                ? "bg-info/20 text-info"
                : "bg-muted text-muted-foreground transition-colors group-hover:bg-info/10 group-hover:text-info"
            }`}
          >
            <Lock className="h-6 w-6" />
          </div>
          <h4 className="text-sm font-bold text-foreground">SAML 2.0</h4>
          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
            {t("oauthApps.samlChoiceDesc") ||
              "Enterprise federation protocol using XML. Best for corporate SSO integrations with Salesforce, Zendesk, or Okta."}
          </p>
        </div>
      </div>
    </div>
  );
}
