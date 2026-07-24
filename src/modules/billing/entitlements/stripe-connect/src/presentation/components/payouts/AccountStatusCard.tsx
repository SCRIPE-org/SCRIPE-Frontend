"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { Card, CardHeader, CardTitle, CardContent } from "@core/ui/card";
import { Button } from "@core/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@core/ui/alert";
import { StripeMark } from "@core/ui/brand-icons";
import { ExternalLink, RefreshCw, LayoutDashboard, AlertTriangle } from "lucide-react";
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
            <div
              className="grid h-10 w-10 shrink-0 place-items-center rounded-nx-md border border-nx-line bg-nx-raised"
              aria-hidden="true"
            >
              <StripeMark className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base">
                {t("entitlements.stripeConnect.stripeAccount")}
              </CardTitle>
              {account.stripeAccountId && (
                <p className="mt-0.5 font-mono text-xs text-nx-ink-3">
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
                onClick={onOpenDashboard}
                loading={isOpeningDashboard}
              >
                {!isOpeningDashboard && (
                  <LayoutDashboard className="me-1.5 h-3.5 w-3.5" aria-hidden="true" />
                )}
                {t("entitlements.stripeConnect.openStripeDashboard")}
              </Button>
            ) : (
              <>
                <Button size="sm" onClick={onOnboard} loading={isOnboarding}>
                  {!isOnboarding && (
                    <ExternalLink className="me-1.5 h-3.5 w-3.5" aria-hidden="true" />
                  )}
                  {t("entitlements.stripeConnect.continueOnboarding")}
                </Button>
                <Button variant="outline" size="sm" onClick={onRefreshLink} loading={isRefreshing}>
                  {!isRefreshing && (
                    <RefreshCw className="me-1.5 h-3.5 w-3.5" aria-hidden="true" />
                  )}
                  {t("entitlements.stripeConnect.refreshLink")}
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>

      {/* Restricted warning */}
      {isRestricted && (
        <CardContent className="pt-0">
          <Alert variant="destructive">
            <AlertTriangle aria-hidden="true" />
            <AlertTitle>{t("entitlements.stripeConnect.actionRequired")}</AlertTitle>
            <AlertDescription>
              {t("entitlements.stripeConnect.actionRequiredDesc")}
            </AlertDescription>
          </Alert>
        </CardContent>
      )}
    </Card>
  );
}
