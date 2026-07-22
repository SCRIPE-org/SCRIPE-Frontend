/**
 * OnboardingStatusCard
 * Shows the current Connect onboarding status and primary action CTA.
 */
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  ExternalLink,
  RefreshCw,
  LayoutDashboard,
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

const STATUS_CONFIG = {
  Complete: {
    icon: CheckCircle2,
    color: "text-success",
    badge: "bg-success/10 text-success",
  },
  Pending: {
    icon: Clock,
    color: "text-warning",
    badge: "bg-warning/10 text-warning",
  },
  Restricted: {
    icon: AlertTriangle,
    color: "text-destructive",
    badge: "bg-destructive/10 text-destructive",
  },
} as const;

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
  const Icon = config.icon;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Icon className={`h-5 w-5 ${config.color}`} />
            {t("entitlements.stripeConnect.onboardingStatus")}
          </CardTitle>
          <Badge className={config.badge}>
            {t(`entitlements.stripeConnect.status.${statusKey}`) || statusKey}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Status description */}
        <p className="text-sm text-muted-foreground">
          {t(`entitlements.stripeConnect.onboarding${statusKey}`)}
        </p>

        {/* Disabled reason */}
        {account.onboardingStatus === "Restricted" && account.disabledReason && (
          <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            <strong>{t("entitlements.stripeConnect.disabledReason")}:</strong>{" "}
            {account.disabledReason}
          </div>
        )}

        {/* Key details */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="mb-0.5 text-xs text-muted-foreground">
              {t("entitlements.stripeConnect.chargesEnabled")}
            </p>
            <p className="font-medium">{account.chargesEnabled ? "✅ Yes" : "❌ No"}</p>
          </div>
          <div>
            <p className="mb-0.5 text-xs text-muted-foreground">
              {t("entitlements.stripeConnect.payoutsEnabled")}
            </p>
            <p className="font-medium">{account.payoutsEnabled ? "✅ Yes" : "❌ No"}</p>
          </div>
          <div>
            <p className="mb-0.5 text-xs text-muted-foreground">
              {t("entitlements.stripeConnect.currency")}
            </p>
            <p className="font-medium uppercase">{account.currency || "—"}</p>
          </div>
          <div>
            <p className="mb-0.5 text-xs text-muted-foreground">
              {t("entitlements.stripeConnect.country")}
            </p>
            <p className="font-medium uppercase">{account.country || "—"}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 pt-2">
          {account.onboardingStatus === "Complete" ? (
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => onOpenDashboard(account.tenantId)}
              disabled={isOpeningDashboard}
            >
              <LayoutDashboard className="h-4 w-4" />
              {t("entitlements.stripeConnect.viewDashboard")}
            </Button>
          ) : (
            <>
              <Button
                variant="default"
                size="sm"
                className="gap-2"
                onClick={() => onOpenOnboarding(account.tenantId)}
              >
                <ExternalLink className="h-4 w-4" />
                {t("entitlements.stripeConnect.openOnboarding")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => onRefreshLink(account.tenantId)}
                disabled={isRefreshing}
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                {t("entitlements.stripeConnect.refreshLink")}
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
