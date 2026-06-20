"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { Check, Globe, Lock } from "lucide-react";

interface ProtocolSelectionSectionProps {
  protocol: string;
  onChange: (protocol: string) => void;
}

export function ProtocolSelectionSection({ protocol, onChange }: ProtocolSelectionSectionProps) {
  const { t } = useI18n();

  return (
    <div className="space-y-4">
      <div className="text-center max-w-lg mx-auto mb-6">
        <h3 className="text-lg font-bold text-foreground">
          {t("oauthApps.selectProtocolTitle") || "Select Authentication Protocol"}
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          {t("oauthApps.selectProtocolDesc") ||
            "Choose the standard that fits your integration. This cannot be changed once created."}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
        {/* OIDC Option */}
        <div
          onClick={() => onChange("oidc")}
          className={`group relative rounded-xl border p-5 cursor-pointer transition-all duration-200 hover:shadow-md ${
            protocol === "oidc"
              ? "border-purple-500 bg-purple-500/5 shadow-[0_0_15px_rgba(168,85,247,0.08)] dark:bg-purple-950/10"
              : "border-border bg-card hover:border-purple-500/40"
          }`}
        >
          {protocol === "oidc" && (
            <div className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-purple-600 text-white animate-in scale-in duration-200">
              <Check className="h-3.5 w-3.5 stroke-[3]" />
            </div>
          )}
          <div className={`p-2.5 rounded-lg w-fit mb-3.5 ${
            protocol === "oidc"
              ? "bg-purple-500/20 text-purple-600 dark:text-purple-400"
              : "bg-muted text-muted-foreground group-hover:bg-purple-500/10 group-hover:text-purple-500 transition-colors"
          }`}>
            <Globe className="h-6 w-6" />
          </div>
          <h4 className="font-bold text-sm text-foreground">OIDC / OAuth 2.0</h4>
          <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
            {t("oauthApps.oidcChoiceDesc") ||
              "Modern identity standard using JWT tokens. Recommended for web applications, Single Page Apps (SPA), and mobile apps."}
          </p>
        </div>

        {/* SAML Option */}
        <div
          onClick={() => onChange("saml")}
          className={`group relative rounded-xl border p-5 cursor-pointer transition-all duration-200 hover:shadow-md ${
            protocol === "saml"
              ? "border-indigo-500 bg-indigo-500/5 shadow-[0_0_15px_rgba(99,102,241,0.08)] dark:bg-indigo-950/10"
              : "border-border bg-card hover:border-indigo-500/40"
          }`}
        >
          {protocol === "saml" && (
            <div className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-white animate-in scale-in duration-200">
              <Check className="h-3.5 w-3.5 stroke-[3]" />
            </div>
          )}
          <div className={`p-2.5 rounded-lg w-fit mb-3.5 ${
            protocol === "saml"
              ? "bg-indigo-500/20 text-indigo-600 dark:text-indigo-400"
              : "bg-muted text-muted-foreground group-hover:bg-indigo-500/10 group-hover:text-indigo-500 transition-colors"
          }`}>
            <Lock className="h-6 w-6" />
          </div>
          <h4 className="font-bold text-sm text-foreground">SAML 2.0</h4>
          <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
            {t("oauthApps.samlChoiceDesc") ||
              "Enterprise federation protocol using XML. Best for corporate SSO integrations with Salesforce, Zendesk, or Okta."}
          </p>
        </div>
      </div>
    </div>
  );
}
