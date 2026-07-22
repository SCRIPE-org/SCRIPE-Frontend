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

/**
 * Presentation UI component rendering the o auth app wizard.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
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

  const steps =
    vm.form.protocol === "saml"
      ? [
          { id: 1, label: t("oauthApps.stepProtocol") || "Protocol" },
          { id: 2, label: t("oauthApps.stepBasicInfo") || "Basic Info" },
          { id: 3, label: t("oauthApps.stepSamlConfig") || "SAML Config" },
          { id: 4, label: t("oauthApps.stepBranding") || "Branding" },
        ]
      : [
          { id: 1, label: t("oauthApps.stepProtocol") || "Protocol" },
          { id: 2, label: t("oauthApps.stepBasicInfo") || "Basic Info" },
          { id: 3, label: t("oauthApps.stepEndpoints") || "Endpoints & Scopes" },
          { id: 4, label: t("oauthApps.stepSecurity") || "Security & Tokens" },
          { id: 5, label: t("oauthApps.stepBranding") || "Branding" },
        ];

  const totalSteps = vm.form.protocol === "saml" ? 4 : 5;

  return (
    <div className="mx-auto max-w-4xl space-y-8 rounded-xl border bg-card p-6 shadow-sm duration-300 animate-in fade-in">
      {/* Progress Indicators */}
      <div className="mx-auto mb-4 flex max-w-2xl items-center justify-between px-4 text-xs font-semibold">
        {steps.map((s, i) => (
          <Fragment key={s.id}>
            {i > 0 && (
              <div
                className={`mx-2 h-0.5 flex-1 ${
                  currentStep >= s.id ? "bg-primary" : "bg-muted"
                }`}
              />
            )}
            <div className="flex shrink-0 cursor-default select-none flex-col items-center gap-1.5">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full border font-mono transition-all duration-200 ${
                  currentStep === s.id
                    ? "border-primary bg-primary text-primary-foreground shadow-[0_0_10px_hsl(var(--primary)/0.3)]"
                    : currentStep > s.id
                      ? "border-primary/30 bg-primary/10 text-primary"
                      : "border-transparent bg-muted text-muted-foreground"
                }`}
              >
                {currentStep > s.id ? "✓" : s.id}
              </div>
              <span
                className={
                  currentStep === s.id
                    ? "font-bold text-primary"
                    : "font-normal text-muted-foreground"
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
          <div className="duration-300 animate-in fade-in slide-in-from-bottom-4">
            <ProtocolSelectionSection
              protocol={vm.form.protocol}
              onChange={(p) => vm.updateField("protocol", p)}
            />
          </div>
        )}

        {/* Step 2: Basic Info */}
        {currentStep === 2 && (
          <div className="mx-auto max-w-2xl space-y-4 duration-300 animate-in fade-in slide-in-from-bottom-4">
            <GeneralSection {...sectionProps} />
          </div>
        )}

        {/* Step 3: Endpoints & Scopes (OIDC) OR SAML Configuration (SAML) */}
        {currentStep === 3 && (
          <div className="mx-auto max-w-2xl space-y-6 duration-300 animate-in fade-in slide-in-from-bottom-4">
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
          <div className="mx-auto max-w-2xl space-y-6 duration-300 animate-in fade-in slide-in-from-bottom-4">
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
          <div className="mx-auto max-w-2xl space-y-4 duration-300 animate-in fade-in slide-in-from-bottom-4">
            <BrandingSection {...sectionProps} />
          </div>
        )}
      </div>

      {/* Navigation Controls */}
      <div className="mx-auto mt-8 flex max-w-2xl items-center justify-between border-t pt-6">
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
            className="bg-primary text-primary-foreground hover:bg-primary/90"
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
            className="bg-gradient-to-r from-primary to-info font-semibold text-primary-foreground shadow hover:opacity-95"
          >
            {!vm.isSaving && <Save className="me-1.5 h-4 w-4" />}
            {t("oauthApps.createButton") || "Create Application"}
          </Button>
        )}
      </div>
    </div>
  );
}
