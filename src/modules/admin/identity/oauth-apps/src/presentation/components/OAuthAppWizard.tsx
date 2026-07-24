"use client";

import { useState, Fragment } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { ArrowRight, Save } from "lucide-react";
import { cn } from "@core/common/utils";
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

// One transition per step change: a crossfade only. A positional slide belongs
// to an edge-attached panel (Sheet/drawer), not a step of in-place content.
const STEP_TRANSITION = "duration-nx-standard animate-in fade-in motion-reduce:transition-none";

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
          { id: 1, label: t("oauthApps.stepProtocol") },
          { id: 2, label: t("oauthApps.stepBasicInfo") },
          { id: 3, label: t("oauthApps.stepSamlConfig") },
          { id: 4, label: t("oauthApps.stepBranding") },
        ]
      : [
          { id: 1, label: t("oauthApps.stepProtocol") },
          { id: 2, label: t("oauthApps.stepBasicInfo") },
          { id: 3, label: t("oauthApps.stepEndpoints") },
          { id: 4, label: t("oauthApps.stepSecurity") },
          { id: 5, label: t("oauthApps.stepBranding") },
        ];

  const totalSteps = vm.form.protocol === "saml" ? 4 : 5;

  return (
    <div className="mx-auto max-w-4xl space-y-8 rounded-nx-lg border border-nx-line bg-nx-surface p-6 duration-nx-standard animate-in fade-in">
      {/* Progress Indicators */}
      <div className="mx-auto mb-4 flex max-w-2xl items-center justify-between px-4 text-xs font-semibold">
        {steps.map((s, i) => (
          <Fragment key={s.id}>
            {i > 0 && (
              <div
                className={cn(
                  "mx-2 h-0.5 flex-1",
                  currentStep >= s.id ? "bg-nx-accent" : "bg-nx-raised-2"
                )}
              />
            )}
            <div className="flex shrink-0 cursor-default select-none flex-col items-center gap-1.5">
              <div
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full border font-mono transition-[color,background-color,border-color] duration-nx-standard ease-nx-enter motion-reduce:transition-none",
                  currentStep === s.id
                    ? "border-nx-accent-fill bg-nx-accent-fill text-nx-on-fill"
                    : currentStep > s.id
                      ? "border-nx-accent/30 bg-nx-accent-wash text-nx-accent"
                      : "border-transparent bg-nx-raised text-nx-ink-3"
                )}
              >
                {currentStep > s.id ? "✓" : s.id}
              </div>
              <span className={currentStep === s.id ? "font-bold text-nx-accent" : "font-normal text-nx-ink-3"}>
                {s.label}
              </span>
            </div>
          </Fragment>
        ))}
      </div>

      <div className="border-t border-nx-line pt-6">
        {/* Step 1: Select Protocol */}
        {currentStep === 1 && (
          <div className={STEP_TRANSITION}>
            <ProtocolSelectionSection
              protocol={vm.form.protocol}
              onChange={(p) => vm.updateField("protocol", p)}
            />
          </div>
        )}

        {/* Step 2: Basic Info */}
        {currentStep === 2 && (
          <div className={cn("mx-auto max-w-2xl space-y-4", STEP_TRANSITION)}>
            <GeneralSection {...sectionProps} />
          </div>
        )}

        {/* Step 3: Endpoints & Scopes (OIDC) OR SAML Configuration (SAML) */}
        {currentStep === 3 && (
          <div className={cn("mx-auto max-w-2xl space-y-6", STEP_TRANSITION)}>
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
          <div className={cn("mx-auto max-w-2xl space-y-6", STEP_TRANSITION)}>
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
          <div className={cn("mx-auto max-w-2xl space-y-4", STEP_TRANSITION)}>
            <BrandingSection {...sectionProps} />
          </div>
        )}
      </div>

      {/* Navigation Controls */}
      <div className="mx-auto mt-8 flex max-w-2xl items-center justify-between border-t border-nx-line pt-6">
        <Button
          variant="outline"
          onClick={() => setCurrentStep((prev) => prev - 1)}
          disabled={currentStep === 1}
          size="sm"
        >
          {t("common.back")}
        </Button>

        {currentStep < totalSteps ? (
          <Button
            onClick={() => setCurrentStep((prev) => prev + 1)}
            disabled={currentStep === 2 && !vm.form.displayName.trim()}
            size="sm"
          >
            {t("common.next")}
            <ArrowRight className="ms-1.5 h-4 w-4 rtl:rotate-180" aria-hidden="true" />
          </Button>
        ) : (
          <Button
            onClick={vm.save}
            loading={vm.isSaving}
            disabled={!vm.form.displayName.trim()}
            size="sm"
          >
            {!vm.isSaving && <Save className="me-1.5 h-4 w-4" aria-hidden="true" />}
            {t("oauthApps.createButton")}
          </Button>
        )}
      </div>
    </div>
  );
}
