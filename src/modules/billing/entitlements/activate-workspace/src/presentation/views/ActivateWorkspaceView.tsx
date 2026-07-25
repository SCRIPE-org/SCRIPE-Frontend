/**
 * @file ActivateWorkspaceView.tsx
 * @description View component for workspace activation. Displayed when a tenant has no active
 * subscription or if the subscription has expired/failed. Decouples cross-module reference to auth
 * by dynamically resolving the SignupShell layout wrapper.
 */

"use client";

import { useActivateWorkspaceViewModel } from "../viewmodels/useActivateWorkspaceViewModel";
import { SubscriptionStatusBox } from "../components/SubscriptionStatusBox";
import { ChangePlanDialog } from "../components/ChangePlanDialog";
// The signup chrome comes from the core auth bridge, so activation always renders inside the real
// signup shell. The previous registry lookup was never populated on this route, so every user hit
// the bare `<div className="min-h-screen bg-background">` fallback instead of the branded shell.
import { CoreSignupShell as SignupShell } from "@core/components/auth-surfaces";

import { Button } from "@core/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@core/ui/card";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { CreditCard, LogOut, ShieldAlert } from "lucide-react";

/**
 * Presentation UI component rendering the activate workspace view.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export default function ActivateWorkspaceView() {
  const {
    subscription,
    isLoadingSub,
    editions,
    isLoadingEditions,
    isRetrying,
    selectedPlanId,
    setSelectedPlanId,
    selectedCycle,
    setSelectedCycle,
    isChangingPlan,
    isConfirmingFree,
    setIsConfirmingFree,
    handleSignOut,
    handleRetryPayment,
    handleChangePlanSubmit,
    t,
    language,
  } = useActivateWorkspaceViewModel();

  if (isLoadingSub) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-nx-ground">
        <div className="text-center">
          <LoadingSpinner showText={false} />
          <p className="mt-4 text-nx-ink-2">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <SignupShell>
      <div className="flex flex-1 items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-xl">
          <Card className="relative overflow-hidden">
            {/* The one signature accent this screen wears — a flat token fill, never a
                decorative gradient built from the frozen signup palette. */}
            <div className="absolute inset-x-0 top-0 h-1 bg-nx-accent-fill" aria-hidden="true" />

            <CardHeader className="space-y-4 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <ShieldAlert className="h-8 w-8" aria-hidden="true" />
              </div>
              <div className="space-y-2">
                <CardTitle>{t("entitlements.activateWorkspace.title")}</CardTitle>
                <CardDescription>{t("entitlements.activateWorkspace.subtitle")}</CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Current Status Box */}
              <SubscriptionStatusBox subscription={subscription} />

              {/* Main CTAs */}
              <div className="flex flex-col gap-3">
                <Button
                  onClick={handleRetryPayment}
                  loading={isRetrying}
                  size="lg"
                  className="w-full"
                >
                  <CreditCard className="me-2 h-5 w-5" aria-hidden="true" />
                  {t("entitlements.activateWorkspace.retryCheckout")}
                </Button>

                {/* Dialog to Choose a new plan */}
                <ChangePlanDialog
                  editions={editions}
                  isLoadingEditions={isLoadingEditions}
                  selectedPlanId={selectedPlanId}
                  setSelectedPlanId={setSelectedPlanId}
                  selectedCycle={selectedCycle}
                  setSelectedCycle={setSelectedCycle}
                  isChangingPlan={isChangingPlan}
                  isConfirmingFree={isConfirmingFree}
                  setIsConfirmingFree={setIsConfirmingFree}
                  handleChangePlanSubmit={handleChangePlanSubmit}
                  t={t}
                  language={language}
                />

                <div className="relative my-3 flex items-center justify-center">
                  <div className="absolute inset-x-0 h-px bg-nx-line" />
                  <span className="relative bg-nx-surface px-3 text-xs uppercase tracking-wider text-nx-ink-3">
                    {t("entitlements.activateWorkspace.or")}
                  </span>
                </div>

                <Button
                  onClick={handleSignOut}
                  variant="ghost"
                  className="w-full hover:bg-destructive/10 hover:text-destructive"
                >
                  <LogOut className="me-2 h-4 w-4" aria-hidden="true" />
                  {t("entitlements.activateWorkspace.signOut")}
                </Button>
              </div>

              {/* Quiet Footer Note */}
              <p className="mx-auto max-w-sm text-center text-[11px] leading-normal text-nx-ink-3">
                {t("entitlements.activateWorkspace.contactSupport")}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </SignupShell>
  );
}
