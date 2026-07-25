/**
 * OnboardingStatusCard
 * Shows the current Connect onboarding status and primary action CTA.
 */
"use client";

import { cn } from "@core/common/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { Badge, type BadgeProps } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@core/ui/alert";
import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  ExternalLink,
  RefreshCw,
  LayoutDashboard,
  type LucideIcon,
} from "lucide-react";
import type { ConnectAccountListItem } from "../../domain/entities/ConnectAccount";

interface OnboardingStatusCardProps {
  account: ConnectAccountListItem & { disabledReason?: string; currency?: string };
  t: (key: string) => string;
  onOpenOnboarding: (tenantId: string) => void;
  onRefreshLink: (tenantId: string) => void;
  onOpenDashboard: (tenantId: string) => void;
  isRefreshing: boolean;
  isOpeningDashboard: boolean;
}

const STATUS_CONFIG: Record<string, { icon: LucideIcon; badgeVariant: BadgeProps["variant"] }> = {
  Complete: { icon: CheckCircle2, badgeVariant: "success" },
  Pending: { icon: Clock, badgeVariant: "warning" },
  Restricted: { icon: AlertTriangle, badgeVariant: "destructive" },
};

type StatusKey = keyof typeof STATUS_CONFIG;

/**
 * Presentation UI component rendering the onboarding status card.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function OnboardingStatusCard({
  account,
  t,
  onOpenOnboarding,
  onRefreshLink,
  onOpenDashboard,
  isRefreshing,
  isOpeningDashboard,
}: OnboardingStatusCardProps) {
  const statusKey = (account.onboardingStatus as StatusKey) ?? "Pending";
  const config = STATUS_CONFIG[statusKey] ?? STATUS_CONFIG.Pending;
  const StatusIcon = config.icon;

  // A capability reading: real icon + real word, never an emoji standing in
  // for both. Colour alone never carries the meaning.
  const capability = (enabled: boolean) => (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-sm font-medium",
        enabled ? "text-success" : "text-nx-ink-3"
      )}
    >
      {enabled ? (
        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      ) : (
        <XCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      )}
      {enabled ? t("common.yes") : t("common.no")}
    </span>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <StatusIcon className="h-5 w-5 text-nx-ink-2" aria-hidden="true" />
            {t("entitlements.stripeConnect.onboardingStatus")}
          </CardTitle>
          <Badge variant={config.badgeVariant}>
            {t(`entitlements.stripeConnect.status.${statusKey}`)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Status description */}
        <p className="text-sm leading-relaxed text-nx-ink-2">
          {t(`entitlements.stripeConnect.onboarding${statusKey}`)}
        </p>

        {/* Disabled reason */}
        {account.onboardingStatus === "Restricted" && account.disabledReason && (
          <Alert variant="destructive">
            <AlertTriangle aria-hidden="true" />
            <AlertTitle>{t("entitlements.stripeConnect.disabledReason")}</AlertTitle>
            <AlertDescription>{account.disabledReason}</AlertDescription>
          </Alert>
        )}

        {/* Key details */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="mb-0.5 text-xs text-nx-ink-3">
              {t("entitlements.stripeConnect.chargesEnabled")}
            </p>
            {capability(account.chargesEnabled)}
          </div>
          <div>
            <p className="mb-0.5 text-xs text-nx-ink-3">
              {t("entitlements.stripeConnect.payoutsEnabled")}
            </p>
            {capability(account.payoutsEnabled)}
          </div>
          <div>
            <p className="mb-0.5 text-xs text-nx-ink-3">
              {t("entitlements.stripeConnect.currency")}
            </p>
            <p className="text-sm font-medium uppercase text-nx-ink">{account.currency || "—"}</p>
          </div>
          <div>
            <p className="mb-0.5 text-xs text-nx-ink-3">
              {t("entitlements.stripeConnect.country")}
            </p>
            <p className="text-sm font-medium uppercase text-nx-ink">{account.country || "—"}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 pt-2">
          {account.onboardingStatus === "Complete" ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenDashboard(account.tenantId)}
              loading={isOpeningDashboard}
            >
              {!isOpeningDashboard && (
                <LayoutDashboard className="me-2 h-4 w-4" aria-hidden="true" />
              )}
              {t("entitlements.stripeConnect.viewDashboard")}
            </Button>
          ) : (
            <>
              <Button
                variant="default"
                size="sm"
                onClick={() => onOpenOnboarding(account.tenantId)}
              >
                <ExternalLink className="me-2 h-4 w-4" aria-hidden="true" />
                {t("entitlements.stripeConnect.openOnboarding")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onRefreshLink(account.tenantId)}
                loading={isRefreshing}
              >
                {!isRefreshing && <RefreshCw className="me-2 h-4 w-4" aria-hidden="true" />}
                {t("entitlements.stripeConnect.refreshLink")}
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
