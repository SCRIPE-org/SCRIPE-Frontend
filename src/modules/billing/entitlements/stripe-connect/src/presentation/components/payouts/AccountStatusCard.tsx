"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { Card, CardHeader, CardTitle, CardContent } from "@core/ui/card";
import { Button } from "@core/ui/button";
import { CreditCard, ExternalLink, RefreshCw, LayoutDashboard, AlertTriangle } from "lucide-react";
import type { ConnectAccount } from "../../../domain/entities/ConnectAccount";

interface AccountStatusCardProps {
  account: ConnectAccount;
  isOnboarding: boolean;
  isRefreshing: boolean;
  isOpeningDashboard: boolean;
  onOnboard: () => void;
  onRefreshLink: () => void;
  onOpenDashboard: () => void;
}

/**
 * Presentation UI component rendering the account status card.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function AccountStatusCard({
  account,
  isOnboarding,
  isRefreshing,
  isOpeningDashboard,
  onOnboard,
  onRefreshLink,
  onOpenDashboard,
}: AccountStatusCardProps) {
  const { t } = useI18n();

  const isComplete = account.onboardingStatus === "Complete";
  const isRestricted = account.onboardingStatus === "Restricted";

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Left — account identity */}
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-muted p-2">
              <CreditCard className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">
                {t("entitlements.stripeConnect.stripeAccount") || "Stripe Connect Account"}
              </CardTitle>
              {account.stripeAccountId && (
                <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                  {account.stripeAccountId}
                </p>
              )}
            </div>
          </div>

          {/* Right — action buttons */}
          <div className="flex flex-wrap gap-2">
            {isComplete ? (
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={onOpenDashboard}
                disabled={isOpeningDashboard}
              >
                {isOpeningDashboard ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <LayoutDashboard className="h-3.5 w-3.5" />
                )}
                {t("entitlements.stripeConnect.openStripeDashboard") || "Stripe Dashboard"}
              </Button>
            ) : (
              <>
                <Button size="sm" className="gap-2" onClick={onOnboard} disabled={isOnboarding}>
                  {isOnboarding ? (
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <ExternalLink className="h-3.5 w-3.5" />
                  )}
                  {t("entitlements.stripeConnect.continueOnboarding") || "Continue Setup"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={onRefreshLink}
                  disabled={isRefreshing}
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
                  {t("entitlements.stripeConnect.refreshLink") || "Refresh Link"}
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>

      {/* Restricted warning */}
      {isRestricted && (
        <CardContent className="pt-0">
          <div className="rounded-md border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/10">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400" />
              <div>
                <p className="text-sm font-semibold text-red-800 dark:text-red-300">
                  {t("entitlements.stripeConnect.actionRequired") || "Action Required"}
                </p>
                <p className="mt-1 text-sm text-red-700 dark:text-red-400">
                  {t("entitlements.stripeConnect.actionRequiredDesc") ||
                    "Stripe needs more information. Open Stripe Dashboard to resolve."}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
