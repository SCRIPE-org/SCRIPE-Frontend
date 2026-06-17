"use client";

import { useActivateWorkspaceViewModel } from "../viewmodels/useActivateWorkspaceViewModel";
import { SubscriptionStatusBox } from "../components/SubscriptionStatusBox";
import { ChangePlanDialog } from "../components/ChangePlanDialog";
import { SignupShell } from "@modules/auth/signup/src/presentation/components/common/SignupShell";
import { Button } from "@core/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@core/ui/card";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { CreditCard, LogOut, ShieldAlert } from "lucide-react";

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
    tokens,
    t,
    language,
    isRtl,
  } = useActivateWorkspaceViewModel();

  if (isLoadingSub) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <LoadingSpinner showText={false} />
          <p className="text-muted-foreground mt-4">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <SignupShell>
      <div className="flex flex-1 items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-xl">
          <Card className="border-border/60 bg-background/80 backdrop-blur-xl shadow-2xl relative overflow-hidden transition-all duration-300">
            {/* Top glowing ambient effect */}
            <div
              className="absolute top-0 inset-x-0 h-1"
              style={{
                background: `linear-gradient(90deg, ${tokens.accent}, ${tokens.cyan})`,
              }}
            />

            <CardHeader className="space-y-4 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive animate-pulse">
                <ShieldAlert className="h-8 w-8" />
              </div>
              <div className="space-y-2">
                <CardTitle className="text-2xl font-bold tracking-tight" style={{ color: tokens.ink }}>
                  {t("entitlements.activateWorkspace.title")}
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground leading-relaxed">
                  {t("entitlements.activateWorkspace.subtitle")}
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Current Status Box */}
              <SubscriptionStatusBox subscription={subscription} tokens={tokens} isRtl={isRtl} />

              {/* Main CTAs */}
              <div className="flex flex-col gap-3">
                <Button
                  onClick={handleRetryPayment}
                  loading={isRetrying}
                  className="w-full h-11 text-base font-semibold shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    background: `linear-gradient(135deg, ${tokens.accent}, ${tokens.cyan})`,
                    color: "#ffffff",
                  }}
                >
                  <CreditCard className={`h-5 w-5 ${isRtl ? "ml-2" : "mr-2"}`} />
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
                  tokens={tokens}
                  t={t}
                  language={language}
                  isRtl={isRtl}
                />

                <div className="relative my-3 flex items-center justify-center">
                  <div className="absolute inset-x-0 h-px bg-border/40" />
                  <span className="relative bg-background px-3 text-xs text-muted-foreground uppercase tracking-wider">
                    {t("entitlements.activateWorkspace.or")}
                  </span>
                </div>

                <Button
                  onClick={handleSignOut}
                  variant="ghost"
                  className="w-full text-muted-foreground hover:bg-destructive/5 hover:text-destructive text-sm"
                >
                  <LogOut className={`h-4 w-4 ${isRtl ? "ml-2" : "mr-2"}`} />
                  {t("entitlements.activateWorkspace.signOut")}
                </Button>
              </div>

              {/* Quiet Footer Note */}
              <p className="text-[11px] text-center text-muted-foreground leading-normal max-w-sm mx-auto">
                {t("entitlements.activateWorkspace.contactSupport")}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </SignupShell>
  );
}
