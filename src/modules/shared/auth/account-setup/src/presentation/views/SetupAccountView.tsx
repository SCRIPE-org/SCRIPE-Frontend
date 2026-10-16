/**
 * SetupAccountView — Kinetic Split-Screen Operator Onboarding & Activation Portal.
 *
 * Implements SCRIPE Enterprise UX Standards:
 * - Desktop Kinetic Split-Screen (lg:col-span-5 Hero Sidebar + lg:col-span-7 Workstation Card)
 * - Clean Component Extraction (< 150 lines, single-responsibility architecture)
 * - Password Security with Shannon Entropy bits readout & requirement checklist
 * - Celebratory Stage 4 Launch summary with confetti blast
 * - Dynamic Multi-Tenant Custom Fields & full WCAG 2.1 AA accessibility compliance
 */

"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { useI18n } from "@core/providers/i18n-provider";
import { formatDateTimeUtc } from "@core/common/utils";
import {
  SetupLoadingView,
  SetupInvalidView,
  SetupErrorView,
} from "../components/SetupAccountStateViews";
import {
  PageWrapper,
  StepProgressIndicator,
  DesktopSetupSidebar,
  LaunchCelebrationCard,
} from "../components/SetupAccountControls";
import { SetupStep1Security, SetupStep2Profile, SetupStep3Attributes } from "../components/steps";
import { useAccountSetupViewModel } from "../viewmodels/useAccountSetupViewModel";

/**
 * Documentation for module export
 */
export function SetupAccountView() {
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const vm = useAccountSetupViewModel({
    token,
    missingTokenMessage: t("auth.accountSetup.missingToken"),
    invalidTokenMessage: t("auth.accountSetup.invalidToken"),
    validationFailedMessage: t("auth.accountSetup.validationFailed"),
    activationFailedMessage: t("auth.accountSetup.activationFailed"),
    activationUnexpectedMessage: t("auth.accountSetup.activationUnexpected"),
    passwordValidationMessages: {
      minLength: t("auth.accountSetup.passwordMinLength"),
      hasUpper: t("auth.accountSetup.passwordUpper"),
      hasLower: t("auth.accountSetup.passwordLower"),
      hasNumber: t("auth.accountSetup.passwordNumber"),
      hasSpecial: t("auth.accountSetup.passwordSpecial"),
      matches: t("auth.accountSetup.passwordsMatch"),
    },
  });

  // ── Lifecycle State Routing ──
  if (vm.pageState === "loading") {
    return (
      <PageWrapper>
        <SetupLoadingView />
      </PageWrapper>
    );
  }

  if (vm.pageState === "invalid") {
    return (
      <PageWrapper>
        <SetupInvalidView errorMessage={vm.errorMessage} />
      </PageWrapper>
    );
  }

  if (vm.pageState === "error") {
    return (
      <PageWrapper>
        <SetupErrorView errorMessage={vm.errorMessage} onRetry={vm.retry} />
      </PageWrapper>
    );
  }

  // ── Stage 4: Launch Celebration Screen ──
  if (vm.pageState === "success" || vm.currentStep === 4) {
    const adminFullName = [vm.firstName, vm.lastName].filter(Boolean).join(" ");
    return (
      <PageWrapper>
        <LaunchCelebrationCard
          tenantName={vm.tokenData?.tenantName}
          tenantCode={vm.tokenData?.tenantCode}
          adminUsername={vm.tokenData?.adminUsername}
          adminName={adminFullName || vm.tokenData?.adminUsername || ""}
          adminEmail={vm.tokenData?.adminEmail}
          profileImageUrl={vm.profileImageUrl}
        />
      </PageWrapper>
    );
  }

  const hasCustomFields = vm.customFields.length > 0;
  const adminNameInitials = [vm.firstName, vm.lastName].filter(Boolean).join(" ");

  return (
    <PageWrapper>
      <div className="grid w-full max-w-5xl grid-cols-1 items-stretch gap-6 lg:grid-cols-12">
        {/* Left Hero Sidebar (Desktop lg:col-span-5) */}
        <div className="hidden lg:col-span-5 lg:block">
          <DesktopSetupSidebar
            currentStep={vm.currentStep}
            hasCustomFields={hasCustomFields}
            tenantName={vm.tokenData?.tenantName}
            tenantCode={vm.tokenData?.tenantCode}
            adminUsername={vm.tokenData?.adminUsername}
            adminEmail={vm.tokenData?.adminEmail}
            onStepClick={vm.goToStep}
          />
        </div>

        {/* Right Active Stepper Workstation (Desktop lg:col-span-7, Mobile full width) */}
        <Card className="flex w-full flex-col justify-between overflow-hidden rounded-3xl border border-border bg-card shadow-lg lg:col-span-7">
          <div>
            <CardHeader className="space-y-4 pb-4">
              {/* Mobile / Tablet Stepper Header (< lg) */}
              <div className="lg:hidden">
                <StepProgressIndicator
                  currentStep={vm.currentStep}
                  hasCustomFields={hasCustomFields}
                  onStepClick={vm.goToStep}
                />
              </div>

              <div className="space-y-1 text-start">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-bold tracking-tight">
                    {vm.currentStep === 1 && t("auth.accountSetup.step1Security")}
                    {vm.currentStep === 2 && t("auth.accountSetup.step2Profile")}
                    {vm.currentStep === 3 && t("auth.accountSetup.step3Attributes")}
                  </CardTitle>
                  <Badge variant="secondary" className="px-2 py-0.5 text-[10px] font-medium">
                    Step {vm.currentStep} of {hasCustomFields ? 3 : 2}
                  </Badge>
                </div>
                <CardDescription className="text-xs sm:text-sm">
                  {vm.currentStep === 1 && t("auth.accountSetup.step1Desc")}
                  {vm.currentStep === 2 && t("auth.accountSetup.step2Desc")}
                  {vm.currentStep === 3 && t("auth.accountSetup.step3Desc")}
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {vm.currentStep === 1 && <SetupStep1Security vm={vm} />}
              {vm.currentStep === 2 && (
                <SetupStep2Profile
                  vm={vm}
                  hasCustomFields={hasCustomFields}
                  adminNameInitials={adminNameInitials}
                />
              )}
              {vm.currentStep === 3 && (
                <SetupStep3Attributes vm={vm} hasCustomFields={hasCustomFields} />
              )}

              {/* Expiration Note */}
              {vm.tokenData?.expiresAt && (
                <p className="pt-2 text-center text-[11px] text-muted-foreground/70">
                  {t("auth.accountSetup.expiresOn")} {formatDateTimeUtc(vm.tokenData.expiresAt)}
                </p>
              )}
            </CardContent>
          </div>
        </Card>
      </div>
    </PageWrapper>
  );
}
