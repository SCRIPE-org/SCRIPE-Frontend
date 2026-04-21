/**
 * TenantStripeConnectView
 * Full-page view for a Tenant to manage their own Stripe Connect Express account.
 */
"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { useTenantConnectViewModel } from "../viewmodels/useTenantConnectViewModel";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Skeleton } from "@core/ui/skeleton";
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  ExternalLink,
  RefreshCw,
  LayoutDashboard,
  CreditCard,
  ArrowRight
} from "lucide-react";

const STATUS_CONFIG = {
  Complete: {
    icon: CheckCircle2,
    color: "text-emerald-500",
    badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  },
  Pending: {
    icon: Clock,
    color: "text-amber-500",
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  },
  Restricted: {
    icon: AlertTriangle,
    color: "text-red-500",
    badge: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  },
} as const;

type StatusKey = keyof typeof STATUS_CONFIG;

export function TenantStripeConnectView() {
  useModuleLocales(() => import("../../../locales"), "stripe-connect");
  const { t } = useI18n();
  const vm = useTenantConnectViewModel();

  if (vm.isLoading) {
    return (
      <div className="p-6 space-y-6 max-w-3xl mx-auto">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-[250px] w-full mt-6" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <CreditCard className="h-6 w-6 text-primary" />
          {t("entitlements.stripeConnect.payoutsTitle") || "Payouts & Bank Account"}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {t("entitlements.stripeConnect.payoutsDesc") || "Connect your bank account to receive automated payouts from your sales."}
        </p>
      </div>

      {!vm.account ? (
        /* Not onboarded yet */
        <Card className="border-dashed shadow-sm">
          <CardHeader>
            <CardTitle>{t("entitlements.stripeConnect.getStarted") || "Get Started with Payouts"}</CardTitle>
            <CardDescription>
              {t("entitlements.stripeConnect.getStartedDesc") || "We use Stripe to make sure you get paid securely and on time."}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center space-y-4">
            <div className="rounded-full bg-primary/10 p-6 mb-2">
              <CreditCard className="h-12 w-12 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">
              {t("entitlements.stripeConnect.readyToConnect") || "Ready to receive payouts?"}
            </h3>
            <p className="text-muted-foreground max-w-md">
              {t("entitlements.stripeConnect.readyToConnectDesc") || "Click the button below to securely connect your bank account via Stripe. It only takes a few minutes."}
            </p>
            <Button
              size="lg"
              className="mt-4 gap-2"
              onClick={vm.onboard}
              disabled={vm.isOnboarding}
            >
              {vm.isOnboarding ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <ExternalLink className="h-4 w-4" />
              )}
              {t("entitlements.stripeConnect.connectBankAccount") || "Connect Bank Account"}
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </CardContent>
        </Card>
      ) : (
        /* Already has an account record */
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <CardTitle className="text-lg">
                {t("entitlements.stripeConnect.accountStatus") || "Account Status"}
              </CardTitle>
              <Badge
                className={
                  STATUS_CONFIG[(vm.account.onboardingStatus as StatusKey) || "Pending"]?.badge
                }
              >
                {t(`entitlements.stripeConnect.status.${vm.account.onboardingStatus}`) ||
                  vm.account.onboardingStatus}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-lg border p-4 bg-muted/30">
                <p className="text-sm text-muted-foreground mb-1">
                  {t("entitlements.stripeConnect.chargesEnabled") || "Payments Enabled"}
                </p>
                <div className="flex items-center gap-2">
                  {vm.account.chargesEnabled ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  ) : (
                    <Clock className="h-5 w-5 text-amber-500" />
                  )}
                  <span className="font-medium">
                    {vm.account.chargesEnabled ? t("common.yes") || "Yes" : t("common.no") || "No"}
                  </span>
                </div>
              </div>

              <div className="rounded-lg border p-4 bg-muted/30">
                <p className="text-sm text-muted-foreground mb-1">
                  {t("entitlements.stripeConnect.payoutsEnabled") || "Payouts Enabled"}
                </p>
                <div className="flex items-center gap-2">
                  {vm.account.payoutsEnabled ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  ) : (
                    <Clock className="h-5 w-5 text-amber-500" />
                  )}
                  <span className="font-medium">
                    {vm.account.payoutsEnabled ? t("common.yes") || "Yes" : t("common.no") || "No"}
                  </span>
                </div>
              </div>
            </div>

            {vm.account.onboardingStatus === "Restricted" && (
              <div className="rounded-md bg-red-50 dark:bg-red-900/10 p-4 border border-red-200 dark:border-red-800">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-red-800 dark:text-red-300">
                      {t("entitlements.stripeConnect.actionRequired") || "Action Required"}
                    </h4>
                    <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                      {t("entitlements.stripeConnect.actionRequiredDesc") ||
                        "Stripe requires more information to verify your account. Please open the dashboard to resolve this."}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-4 flex flex-wrap gap-3">
              {vm.account.onboardingStatus === "Complete" ? (
                <Button
                  onClick={vm.openDashboard}
                  disabled={vm.isOpeningDashboard}
                  className="gap-2"
                >
                  {vm.isOpeningDashboard ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <LayoutDashboard className="h-4 w-4" />
                  )}
                  {t("entitlements.stripeConnect.openStripeDashboard") || "Open Stripe Dashboard"}
                </Button>
              ) : (
                <>
                  <Button
                    onClick={vm.onboard}
                    disabled={vm.isOnboarding}
                    className="gap-2"
                  >
                    {vm.isOnboarding ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <ExternalLink className="h-4 w-4" />
                    )}
                    {t("entitlements.stripeConnect.continueOnboarding") || "Continue Setup"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={vm.refreshLink}
                    disabled={vm.isRefreshing}
                    className="gap-2"
                  >
                    <RefreshCw className={`h-4 w-4 ${vm.isRefreshing ? "animate-spin" : ""}`} />
                    {t("entitlements.stripeConnect.refreshLink") || "Refresh Link"}
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
