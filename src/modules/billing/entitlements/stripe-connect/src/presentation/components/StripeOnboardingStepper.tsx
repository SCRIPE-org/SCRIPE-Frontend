"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { Badge, type BadgeProps } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@core/ui/alert";
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

const STATUS_CONFIG: Record<string, { icon: typeof CheckCircle2; variant: BadgeProps["variant"] }> =
  {
    Complete: { icon: CheckCircle2, variant: "success" },
    Pending: { icon: Clock, variant: "warning" },
    Restricted: { icon: AlertTriangle, variant: "destructive" },
  };

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
 * Presentation UI component rendering the stripe onboarding stepper.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function StripeOnboardingStepper({
  account,
  onOnboard,
  onRefreshLink,
  isOnboarding,
  isRefreshing,
}: StripeOnboardingStepperProps) {
  const { t } = useI18n();

  const config = STATUS_CONFIG[account.onboardingStatus] ?? STATUS_CONFIG.Pending;
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
      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-3 p-5">
          <div className="flex items-center gap-3">
            <div
              className="grid h-10 w-10 shrink-0 place-items-center rounded-nx-md border border-nx-line bg-nx-raised text-nx-ink-2"
              aria-hidden="true"
            >
              <StatusIcon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-nx-ink">
                {t("entitlements.tenantConnect.setupInProgress")}
              </h2>
              <p className="mt-0.5 text-sm leading-relaxed text-nx-ink-2">
                {t("entitlements.tenantConnect.setupInProgressDesc")}
              </p>
            </div>
          </div>
          <Badge variant={config.variant}>
            {t(`entitlements.stripeConnect.status.${account.onboardingStatus}`)}
          </Badge>
        </CardContent>
      </Card>

      {/* Stepper Progress */}
      <Card>
        <CardHeader className="border-b border-nx-line pb-3">
          <CardTitle className="text-sm">{t("entitlements.tenantConnect.setupProgress")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {ONBOARDING_STEPS.map((step, i) => {
              const Icon = step.icon;
              const done = stepStatus[i];
              return (
                <div key={step.key} className="flex items-center gap-4">
                  <div
                    className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border ${
                      done ? "border-success/30 bg-success/10" : "border-nx-line bg-nx-raised"
                    }`}
                    aria-hidden="true"
                  >
                    {done ? (
                      <CheckCircle2 className="h-4 w-4 text-success" />
                    ) : (
                      <Icon className="h-4 w-4 text-nx-ink-3" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-sm font-semibold ${done ? "text-nx-ink" : "text-nx-ink-3"}`}
                    >
                      {t(`entitlements.tenantConnect.step${i + 1}Title`)}
                    </p>
                  </div>
                  {done && <Badge variant="success">{t("common.complete")}</Badge>}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Restricted Warning */}
      {account.onboardingStatus === "Restricted" && (
        <Alert variant="destructive">
          <AlertTriangle aria-hidden="true" />
          <AlertTitle>{t("entitlements.stripeConnect.actionRequired")}</AlertTitle>
          <AlertDescription>{t("entitlements.tenantConnect.restrictedDesc")}</AlertDescription>
        </Alert>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <Button onClick={onOnboard} loading={isOnboarding}>
          {!isOnboarding && <ExternalLink className="me-2 h-4 w-4" aria-hidden="true" />}
          {t("entitlements.stripeConnect.continueOnboarding")}
        </Button>
        <Button variant="outline" onClick={onRefreshLink} loading={isRefreshing}>
          {!isRefreshing && <RefreshCw className="me-2 h-4 w-4" aria-hidden="true" />}
          {t("entitlements.stripeConnect.refreshLink")}
        </Button>
      </div>

      {/* Account ID Footer */}
      {account.stripeAccountId && (
        <div className="flex items-center gap-2 text-xs text-nx-ink-3">
          <Info className="h-3.5 w-3.5" aria-hidden="true" />
          <span>{t("entitlements.stripeConnect.stripeAccountId")}:</span>
          <code className="rounded-nx-sm bg-nx-raised px-1.5 py-0.5 font-mono text-[11px] font-semibold text-nx-ink-2">
            {account.stripeAccountId}
          </code>
        </div>
      )}
    </div>
  );
}
