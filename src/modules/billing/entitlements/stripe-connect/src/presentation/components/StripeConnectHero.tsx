"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { Card, CardContent } from "@core/ui/card";
import { Button } from "@core/ui/button";
import { CreditCard, ExternalLink, ArrowRight, Shield, Banknote, Zap } from "lucide-react";

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
 * Presentation UI component rendering the stripe connect hero.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function StripeConnectHero({ onOnboard, isOnboarding }: StripeConnectHeroProps) {
  const { t } = useI18n();

  return (
    <div className="space-y-6">
      {/* Hero CTA Card */}
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center space-y-5 py-16 text-center">
          <div
            className="grid h-16 w-16 place-items-center rounded-nx-lg border border-nx-line bg-nx-accent-wash text-nx-accent"
            aria-hidden="true"
          >
            <CreditCard className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold tracking-tight text-nx-ink text-balance">
              {t("entitlements.tenantConnect.heroTitle")}
            </h2>
            <p className="mx-auto max-w-md text-pretty text-sm leading-relaxed text-nx-ink-2">
              {t("entitlements.tenantConnect.heroDesc")}
            </p>
          </div>
          <Button size="lg" onClick={onOnboard} loading={isOnboarding}>
            {!isOnboarding && <ExternalLink className="me-2 h-4 w-4" aria-hidden="true" />}
            {t("entitlements.tenantConnect.getStartedBtn")}
            <ArrowRight className="ms-2 h-4 w-4 rtl:rotate-180" aria-hidden="true" />
          </Button>
        </CardContent>
      </Card>

      {/* Steps Preview */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {ONBOARDING_STEPS.map((step, i) => {
          const Icon = step.icon;
          return (
            <Card key={step.key}>
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-nx-md border border-nx-line bg-nx-raised text-nx-ink-2"
                    aria-hidden="true"
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase leading-none tracking-wider text-nx-ink-3">
                      {t("common.step")} {i + 1}
                    </p>
                    <p className="mt-1.5 text-sm font-bold leading-tight text-nx-ink">
                      {t(`entitlements.tenantConnect.step${i + 1}Title`)}
                    </p>
                    <p className="mt-1.5 text-pretty text-xs leading-relaxed text-nx-ink-2">
                      {t(`entitlements.tenantConnect.step${i + 1}Desc`)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Security Note */}
      <div className="flex items-start gap-3 rounded-nx-md border border-nx-line bg-nx-surface px-4 py-3.5 text-sm">
        <Shield className="mt-0.5 h-4 w-4 shrink-0 text-nx-accent" aria-hidden="true" />
        <p className="text-pretty text-xs leading-relaxed text-nx-ink-2">
          {t("entitlements.tenantConnect.securityNote")}
        </p>
      </div>
    </div>
  );
}
