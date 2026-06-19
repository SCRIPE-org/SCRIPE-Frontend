"use client";

import { useState, Fragment } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { ArrowRight, Save } from "lucide-react";
import { GeneralSection } from "./GeneralSection";
import { EndpointsSection } from "./EndpointsSection";
import { ScopesGrantsSection } from "./ScopesGrantsSection";
import { SecuritySection } from "./SecuritySection";
import { TokenConfigSection } from "./TokenConfigSection";
import { BrandingSection } from "./BrandingSection";
import { ProtocolSelectionSection } from "./ProtocolSelectionSection";
import { SamlSection } from "./SamlSection";

import { OAuthAppFormState } from "../viewmodels/useOAuthAppDetailViewModel";

interface OAuthAppWizardProps {
  vm: {
    form: OAuthAppFormState;
    updateField: <K extends keyof OAuthAppFormState>(field: K, value: OAuthAppFormState[K]) => void;
    clientTypeOptions: any[];
    isCreateMode: boolean;
    standardScopes: string[];
    standardGrantTypes: string[];
    addRedirectUri: () => void;
    removeRedirectUri: (index: number) => void;
    updateRedirectUri: (index: number, value: string) => void;
    addPostLogoutUri: () => void;
    removePostLogoutUri: (index: number) => void;
    updatePostLogoutUri: (index: number, value: string) => void;
    save: () => void;
    isSaving: boolean;
  };
}

export function OAuthAppWizard({ vm }: OAuthAppWizardProps) {
  const { t } = useI18n();
  const [currentStep, setCurrentStep] = useState(1);

  const sectionProps = {
    form: vm.form,
    updateField: vm.updateField,
    clientTypeOptions: vm.clientTypeOptions,
    isCreateMode: true,
    standardScopes: vm.standardScopes,
    standardGrantTypes: vm.standardGrantTypes,
    addRedirectUri: vm.addRedirectUri,
    removeRedirectUri: vm.removeRedirectUri,
    updateRedirectUri: vm.updateRedirectUri,
    addPostLogoutUri: vm.addPostLogoutUri,
    removePostLogoutUri: vm.removePostLogoutUri,
    updatePostLogoutUri: vm.updatePostLogoutUri,
  };

  const steps = vm.form.protocol === "saml"
    ? [
        { id: 1, label: t("oauthApps.stepProtocol") || "Protocol" },
        { id: 2, label: t("oauthApps.stepBasicInfo") || "Basic Info" },
        { id: 3, label: t("oauthApps.stepSamlConfig") || "SAML Config" },
        { id: 4, label: t("oauthApps.stepBranding") || "Branding" }
      ]
    : [
        { id: 1, label: t("oauthApps.stepProtocol") || "Protocol" },
        { id: 2, label: t("oauthApps.stepBasicInfo") || "Basic Info" },
        { id: 3, label: t("oauthApps.stepEndpoints") || "Endpoints & Scopes" },
        { id: 4, label: t("oauthApps.stepSecurity") || "Security & Tokens" },
        { id: 5, label: t("oauthApps.stepBranding") || "Branding" }
      ];

  const totalSteps = vm.form.protocol === "saml" ? 4 : 5;

  return (
    <div className="max-w-4xl mx-auto bg-card border rounded-xl p-6 shadow-sm space-y-8 duration-300 animate-in fade-in">
      {/* Progress Indicators */}
      <div className="flex justify-between items-center max-w-2xl mx-auto mb-4 text-xs font-semibold px-4">
        {steps.map((s, i) => (
          <Fragment key={s.id}>
            {i > 0 && (
              <div
                className={`flex-1 h-0.5 mx-2 ${
                  currentStep >= s.id ? "bg-purple-600 dark:bg-purple-500" : "bg-muted"
                }`}
              />
            )}
            <div className="flex flex-col items-center gap-1.5 cursor-default select-none shrink-0">
              <div
                className={`h-7 w-7 rounded-full flex items-center justify-center font-mono border transition-all duration-200 ${
                  currentStep === s.id
                    ? "bg-purple-600 text-white border-purple-600 dark:bg-purple-500 dark:border-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.3)]"
                    : currentStep > s.id
                    ? "bg-purple-600/10 text-purple-600 border-purple-600/30 dark:bg-purple-500/10 dark:text-purple-400"
                    : "bg-muted text-muted-foreground border-transparent"
                }`}
              >
                {currentStep > s.id ? "✓" : s.id}
              </div>
              <span
                className={
                  currentStep === s.id
                    ? "text-purple-600 dark:text-purple-400 font-bold"
                    : "text-muted-foreground font-normal"
                }
              >
                {s.label}
              </span>
            </div>
          </Fragment>
        ))}
      </div>

      <div className="border-t pt-6">
        {/* Step 1: Select Protocol */}
        {currentStep === 1 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <ProtocolSelectionSection
              protocol={vm.form.protocol}
              onChange={(p) => vm.updateField("protocol", p)}
            />
          </div>
        )}

        {/* Step 2: Basic Info */}
        {currentStep === 2 && (
          <div className="max-w-2xl mx-auto space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <GeneralSection {...sectionProps} />
          </div>
        )}

        {/* Step 3: Endpoints & Scopes (OIDC) OR SAML Configuration (SAML) */}
        {currentStep === 3 && (
          <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {vm.form.protocol === "saml" ? (
              <SamlSection {...sectionProps} />
            ) : (
              <>
                <EndpointsSection {...sectionProps} />
                <ScopesGrantsSection {...sectionProps} />
              </>
            )}
          </div>
        )}

        {/* Step 4: Security & Tokens (OIDC) OR Branding (SAML) */}
        {currentStep === 4 && (
          <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {vm.form.protocol === "saml" ? (
              <BrandingSection {...sectionProps} />
            ) : (
              <>
                <SecuritySection {...sectionProps} />
                <TokenConfigSection {...sectionProps} />
              </>
            )}
          </div>
        )}

        {/* Step 5: Branding (OIDC only) */}
        {currentStep === 5 && vm.form.protocol !== "saml" && (
          <div className="max-w-2xl mx-auto space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <BrandingSection {...sectionProps} />
          </div>
        )}
      </div>

      {/* Navigation Controls */}
      <div className="flex justify-between items-center max-w-2xl mx-auto pt-6 border-t mt-8">
        <Button
          variant="outline"
          onClick={() => setCurrentStep((prev) => prev - 1)}
          disabled={currentStep === 1}
          size="sm"
        >
          {t("common.back") || "Back"}
        </Button>

        {currentStep < totalSteps ? (
          <Button
            onClick={() => setCurrentStep((prev) => prev + 1)}
            disabled={currentStep === 2 && !vm.form.displayName.trim()}
            size="sm"
            className="bg-purple-600 hover:bg-purple-700 text-white dark:bg-purple-500 dark:hover:bg-purple-600"
          >
            {t("common.next") || "Next"}
            <ArrowRight className="ms-1.5 h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={vm.save}
            loading={vm.isSaving}
            disabled={!vm.form.displayName.trim()}
            size="sm"
            className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold shadow hover:opacity-95"
          >
            {!vm.isSaving && <Save className="me-1.5 h-4 w-4" />}
            {t("oauthApps.createButton") || "Create Application"}
          </Button>
        )}
      </div>
    </div>
  );
}
