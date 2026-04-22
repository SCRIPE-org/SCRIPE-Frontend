"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { Card, CardHeader, CardTitle, CardContent } from "@core/ui/card";
import { Button } from "@core/ui/button";
import { CreditCard, ExternalLink, RefreshCw, LayoutDashboard, AlertTriangle } from "lucide-react";
import type { ConnectAccount } from "../../../domain/entities/ConnectAccount";

interface AccountStatusCardProps {
  account:            ConnectAccount;
  isOnboarding:       boolean;
  isRefreshing:       boolean;
  isOpeningDashboard: boolean;
  onOnboard:          () => void;
  onRefreshLink:      () => void;
  onOpenDashboard:    () => void;
}

export function AccountStatusCard({
  account, isOnboarding, isRefreshing, isOpeningDashboard,
  onOnboard, onRefreshLink, onOpenDashboard,
}: AccountStatusCardProps) {
  const { t } = useI18n();

  const isComplete = account.onboardingStatus === "Complete";
  const isRestricted = account.onboardingStatus === "Restricted";

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          {/* Left — account identity */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted">
              <CreditCard className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">
                {t("entitlements.stripeConnect.stripeAccount") || "Stripe Connect Account"}
              </CardTitle>
              {account.stripeAccountId && (
                <p className="text-xs text-muted-foreground font-mono mt-0.5">
                  {account.stripeAccountId}
                </p>
              )}
            </div>
          </div>

          {/* Right — action buttons */}
          <div className="flex gap-2 flex-wrap">
            {isComplete ? (
              <Button variant="outline" size="sm" className="gap-2"
                onClick={onOpenDashboard} disabled={isOpeningDashboard}>
                {isOpeningDashboard
                  ? <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  : <LayoutDashboard className="h-3.5 w-3.5" />}
                {t("entitlements.stripeConnect.openStripeDashboard") || "Stripe Dashboard"}
              </Button>
            ) : (
              <>
                <Button size="sm" className="gap-2" onClick={onOnboard} disabled={isOnboarding}>
                  {isOnboarding
                    ? <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    : <ExternalLink className="h-3.5 w-3.5" />}
                  {t("entitlements.stripeConnect.continueOnboarding") || "Continue Setup"}
                </Button>
                <Button variant="outline" size="sm" className="gap-2"
                  onClick={onRefreshLink} disabled={isRefreshing}>
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
          <div className="rounded-md bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-red-800 dark:text-red-300">
                  {t("entitlements.stripeConnect.actionRequired") || "Action Required"}
                </p>
                <p className="text-sm text-red-700 dark:text-red-400 mt-1">
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
