"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { Card, CardContent } from "@core/ui/card";
import { Button } from "@core/ui/button";
import {
  CreditCard,
  RefreshCw,
  ExternalLink,
  ArrowRight,
  Shield,
  Banknote,
  Zap,
} from "lucide-react";

const ONBOARDING_STEPS = [
  { key: "createAccount", icon: CreditCard },
  { key: "verifyIdentity", icon: Shield },
  { key: "addBankAccount", icon: Banknote },
  { key: "startEarning", icon: Zap },
] as const;

interface StripeConnectHeroProps {
  onOnboard: () => void;
  isOnboarding: boolean;
}

/**
 * React presentation component representing the stripe connect hero UI element.
 */
export function StripeConnectHero({ onOnboard, isOnboarding }: StripeConnectHeroProps) {
  const { t } = useI18n();

  return (
    <div className="space-y-6">
      {/* Hero CTA Card */}
      <Card className="overflow-hidden border-2 border-dashed shadow-sm transition-all hover:border-violet-300 dark:hover:border-violet-800">
        <div className="relative">
          {/* Decorative background gradient */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-indigo-500/5 dark:from-violet-500/10 dark:to-indigo-500/10" />
          <CardContent className="relative flex flex-col items-center justify-center space-y-5 py-16 text-center">
            <div className="rounded-2xl bg-gradient-to-br from-violet-500/10 to-indigo-500/10 p-5 ring-1 ring-violet-500/10 dark:from-violet-500/20 dark:to-indigo-500/20">
              <CreditCard className="h-10 w-10 text-violet-600 dark:text-violet-400" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight">
                {t("entitlements.tenantConnect.heroTitle") || "Start Receiving Payments"}
              </h2>
              <p className="mx-auto max-w-md text-sm leading-relaxed text-muted-foreground">
                {t("entitlements.tenantConnect.heroDesc") ||
                  "Connect your bank account through Stripe to securely receive automated payouts from your sales. Setup takes just a few minutes."}
              </p>
            </div>
            <Button
              size="lg"
              className="mt-2 gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/20 transition-all duration-300 hover:scale-[1.02] hover:from-violet-700 hover:to-indigo-700 active:scale-95"
              onClick={onOnboard}
              disabled={isOnboarding}
            >
              {isOnboarding ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <ExternalLink className="h-4 w-4" />
              )}
              {t("entitlements.tenantConnect.getStartedBtn") || "Get Started"}
              <ArrowRight className="ml-0.5 h-4 w-4" />
            </Button>
          </CardContent>
        </div>
      </Card>

      {/* Steps Preview */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {ONBOARDING_STEPS.map((step, i) => {
          const Icon = step.icon;
          return (
            <Card
              key={step.key}
              className="group relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
            >
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 rounded-lg bg-muted/60 p-2.5 transition-colors group-hover:bg-violet-50 dark:group-hover:bg-violet-900/20">
                    <Icon className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-violet-600 dark:group-hover:text-violet-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {t("common.step") || "Step"} {i + 1}
                    </p>
                    <p className="mt-1 text-sm font-bold leading-tight">
                      {t(`entitlements.tenantConnect.step${i + 1}Title`) || step.key}
                    </p>
                    <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                      {t(`entitlements.tenantConnect.step${i + 1}Desc`) || ""}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Security Note */}
      <div className="flex items-start gap-3 rounded-lg border bg-muted/40 px-4 py-3.5 text-sm transition-colors hover:bg-muted/60">
        <Shield className="mt-0.5 h-4 w-4 flex-shrink-0 text-violet-600 dark:text-violet-400" />
        <p className="text-xs leading-relaxed text-muted-foreground">
          {t("entitlements.tenantConnect.securityNote") ||
            "Your information is securely processed by Stripe. SCRIPE never sees or stores your bank account details."}
        </p>
      </div>
    </div>
  );
}
