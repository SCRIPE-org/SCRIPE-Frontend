"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  ExternalLink,
  RefreshCw,
  Info,
  CreditCard,
  Shield,
  Banknote,
  Zap,
} from "lucide-react";

const STATUS_CONFIG = {
  Complete: {
    icon: CheckCircle2,
    color: "text-emerald-500",
    bgGradient: "from-emerald-500/10 to-emerald-600/5",
    badgeClass:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
    ringClass: "ring-emerald-500/20",
  },
  Pending: {
    icon: Clock,
    color: "text-amber-500",
    bgGradient: "from-amber-500/10 to-amber-600/5",
    badgeClass:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800",
    ringClass: "ring-amber-500/20",
  },
  Restricted: {
    icon: AlertTriangle,
    color: "text-red-500",
    bgGradient: "from-red-500/10 to-red-600/5",
    badgeClass:
      "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800",
    ringClass: "ring-red-500/20",
  },
} as const;

type StatusKey = keyof typeof STATUS_CONFIG;

const ONBOARDING_STEPS = [
  { key: "createAccount", icon: CreditCard },
  { key: "verifyIdentity", icon: Shield },
  { key: "addBankAccount", icon: Banknote },
  { key: "startEarning", icon: Zap },
] as const;

interface StripeOnboardingStepperProps {
  account: {
    onboardingStatus: string;
    chargesEnabled: boolean;
    payoutsEnabled: boolean;
    stripeAccountId: string;
  };
  onOnboard: () => void;
  onRefreshLink: () => void;
  isOnboarding: boolean;
  isRefreshing: boolean;
}

/**
 * React presentation component representing the stripe onboarding stepper UI element.
 */
export function StripeOnboardingStepper({
  account,
  onOnboard,
  onRefreshLink,
  isOnboarding,
  isRefreshing,
}: StripeOnboardingStepperProps) {
  const { t } = useI18n();

  const statusKey = (account.onboardingStatus as StatusKey) || "Pending";
  const config = STATUS_CONFIG[statusKey] || STATUS_CONFIG.Pending;
  const StatusIcon = config.icon;

  const stepStatus = [
    true, // Step 1: Account created
    account.chargesEnabled, // Step 2: Identity verified
    account.payoutsEnabled, // Step 3: Bank account added
    account.chargesEnabled && account.payoutsEnabled, // Step 4: Ready
  ];

  return (
    <div className="space-y-6">
      {/* Status Header Card */}
      <Card
        className={`overflow-hidden ring-1 ${config.ringClass} transition-shadow hover:shadow-sm`}
      >
        <div className={`bg-gradient-to-r ${config.bgGradient} px-6 py-5`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-background/80 p-2 backdrop-blur-sm">
                <StatusIcon className={`h-5 w-5 ${config.color}`} />
              </div>
              <div>
                <h2 className="text-lg font-semibold tracking-tight">
                  {t("entitlements.tenantConnect.setupInProgress") || "Account Setup In Progress"}
                </h2>
                <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">
                  {t("entitlements.tenantConnect.setupInProgressDesc") ||
                    "Complete the remaining steps to start accepting payments."}
                </p>
              </div>
            </div>
            <Badge
              variant="outline"
              className={`${config.badgeClass} border px-3 py-1 text-xs font-semibold`}
            >
              {t(`entitlements.stripeConnect.status.${account.onboardingStatus}`) ||
                account.onboardingStatus}
            </Badge>
          </div>
        </div>
      </Card>

      {/* Stepper Progress */}
      <Card className="shadow-sm">
        <CardHeader className="border-b bg-muted/20 pb-4">
          <CardTitle className="text-sm font-bold tracking-tight text-foreground/95">
            {t("entitlements.tenantConnect.setupProgress") || "Setup Progress"}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {ONBOARDING_STEPS.map((step, i) => {
              const Icon = step.icon;
              const done = stepStatus[i];
              return (
                <div key={step.key} className="group flex items-center gap-4">
                  <div
                    className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
                      done
                        ? "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/20"
                        : "border-muted-foreground/10 bg-muted/50"
                    }`}
                  >
                    {done ? (
                      <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <Icon className="h-4.5 w-4.5 text-muted-foreground/85 transition-colors group-hover:text-violet-600" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-sm font-semibold transition-colors duration-200 ${
                        done ? "text-foreground" : "text-muted-foreground/80"
                      }`}
                    >
                      {t(`entitlements.tenantConnect.step${i + 1}Title`) || step.key}
                    </p>
                  </div>
                  {done && (
                    <Badge
                      variant="outline"
                      className="border-emerald-200 bg-emerald-50/70 text-xs font-medium text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/10 dark:text-emerald-400"
                    >
                      {t("common.complete") || "Complete"}
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Restricted Warning */}
      {account.onboardingStatus === "Restricted" && (
        <div className="rounded-lg border border-red-200 bg-red-50/70 p-4 transition-all duration-200 dark:border-red-900/30 dark:bg-red-950/10">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400" />
            <div>
              <h4 className="text-sm font-bold text-red-800 dark:text-red-300">
                {t("entitlements.stripeConnect.actionRequired") || "Action Required"}
              </h4>
              <p className="mt-1 text-xs leading-relaxed text-red-700/95 dark:text-red-400/90">
                {t("entitlements.tenantConnect.restrictedDesc") ||
                  "Stripe requires additional information to verify your identity. Please complete the verification to continue."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <Button
          onClick={onOnboard}
          disabled={isOnboarding}
          className="gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/10 transition-all hover:from-violet-700 hover:to-indigo-700"
        >
          {isOnboarding ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <ExternalLink className="h-4 w-4" />
          )}
          {t("entitlements.stripeConnect.continueOnboarding") || "Continue Setup"}
        </Button>
        <Button variant="outline" onClick={onRefreshLink} disabled={isRefreshing} className="gap-2">
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          {t("entitlements.stripeConnect.refreshLink") || "Refresh Link"}
        </Button>
      </div>

      {/* Account ID Footer */}
      {account.stripeAccountId && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground/80">
          <Info className="h-3.5 w-3.5" />
          <span>{t("entitlements.stripeConnect.stripeAccountId") || "Account ID"}:</span>
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] font-semibold text-foreground/90">
            {account.stripeAccountId}
          </code>
        </div>
      )}
    </div>
  );
}
