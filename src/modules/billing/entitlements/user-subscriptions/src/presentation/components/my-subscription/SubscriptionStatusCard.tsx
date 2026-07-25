/**
 * SubscriptionStatusCard — Displays the current plan's status, name, billing info.
 */
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { Badge, type BadgeProps } from "@core/ui/badge";
import { Crown, Calendar, CreditCard, Timer } from "lucide-react";
import { formatDateUtc } from "@core/common/utils";
import type { UserSubscription } from "../../../domain/entities/UserSubscription";

interface SubscriptionStatusCardProps {
  subscription: UserSubscription;
  t: (key: string) => string;
  language: string;
}

// Status keys as this component's own UserSubscription entity reports them —
// distinct casing from the tenant-level entitlements.subscription.status set.
const STATUS_LABEL_KEY: Record<string, string> = {
  Active: "entitlements.subscription.status.Active",
  Trial: "entitlements.subscription.status.Trialing",
  Cancelled: "entitlements.subscription.status.Canceled",
  Expired: "entitlements.subscription.status.Expired",
  PastDue: "entitlements.subscription.status.PastDue",
  Free: "entitlements.mySubscription.free",
};

const STATUS_BADGE_VARIANT: Record<string, BadgeProps["variant"]> = {
  Active: "success",
  Trial: "info",
  Cancelled: "destructive",
  Expired: "inactive",
  PastDue: "warning",
  Free: "success",
};

/**
 * Presentation UI component rendering the subscription status card.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function SubscriptionStatusCard({ subscription, t }: SubscriptionStatusCardProps) {
  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return "—";
    return formatDateUtc(dateStr);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-warning" aria-hidden="true" />
            {subscription.planName}
          </CardTitle>
          <Badge variant={STATUS_BADGE_VARIANT[subscription.status] ?? "inactive"}>
            {t(STATUS_LABEL_KEY[subscription.status] ?? "entitlements.mySubscription.free")}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Billing Cycle */}
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-nx-ink-3" aria-hidden="true" />
            <div>
              <p className="text-xs text-nx-ink-2">
                {t("entitlements.mySubscription.billingCycle")}
              </p>
              <p className="text-sm font-medium text-nx-ink">{subscription.billingCycle || "—"}</p>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-nx-ink-3" aria-hidden="true" />
            <div>
              <p className="text-xs text-nx-ink-2">{t("entitlements.mySubscription.price")}</p>
              <p className="text-sm font-medium tabular-nums text-nx-ink">
                {subscription.price > 0
                  ? subscription.formattedPrice
                  : t("entitlements.mySubscription.free")}
              </p>
            </div>
          </div>

          {/* Expiry / Renewal */}
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-nx-ink-3" aria-hidden="true" />
            <div>
              <p className="text-xs text-nx-ink-2">
                {subscription.isAutoRenew
                  ? t("entitlements.mySubscription.renewsOn")
                  : t("entitlements.mySubscription.expiresOn")}
              </p>
              <p className="text-sm font-medium text-nx-ink">
                {formatDate(subscription.expiresAt)}
              </p>
            </div>
          </div>
        </div>

        {/* Days remaining warning */}
        {subscription.isExpiringSoon && subscription.daysRemaining != null && (
          <div className="mt-4 flex items-center gap-2 rounded-nx-md bg-warning/10 px-3 py-2 text-warning">
            <Timer className="h-4 w-4" aria-hidden="true" />
            <span className="text-sm">{t("entitlements.mySubscription.expiringSoon")}</span>
          </div>
        )}

        {/* Trial info */}
        {subscription.hasTrial && subscription.trialEndsAt && (
          <div className="mt-4 flex items-center gap-2 rounded-nx-md bg-info/10 px-3 py-2 text-info">
            <Timer className="h-4 w-4" aria-hidden="true" />
            <span className="text-sm">
              {t("entitlements.mySubscription.trialEnds")}: {formatDate(subscription.trialEndsAt)}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
