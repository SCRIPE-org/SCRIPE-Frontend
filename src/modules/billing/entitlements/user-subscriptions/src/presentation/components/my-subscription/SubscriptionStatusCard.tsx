/**
 * SubscriptionStatusCard — Displays the current plan's status, name, billing info.
 */
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { Crown, Calendar, CreditCard, Timer } from "lucide-react";
import { formatDateUtc } from "@core/common/utils";
import type { UserSubscription } from "../../../domain/entities/UserSubscription";

interface SubscriptionStatusCardProps {
  subscription: UserSubscription;
  t: (key: string) => string;
  language: string;
}

/**
 * Presentation UI component rendering the subscription status card.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function SubscriptionStatusCard({ subscription, t, language }: SubscriptionStatusCardProps) {
  const statusLabels: Record<string, string> = {
    Active: t("entitlements.subscription.status.Active") || "Active",
    Trial: t("entitlements.subscription.status.Trialing") || "Trial",
    Cancelled: t("entitlements.subscription.status.Canceled") || "Cancelled",
    Expired: t("entitlements.subscription.status.Expired") || "Expired",
    PastDue: t("entitlements.subscription.status.PastDue") || "Past Due",
    Free: t("entitlements.mySubscription.free") || "Free",
  };

  const statusColors: Record<string, string> = {
    Active: "bg-success/10 text-success",
    Trial: "bg-info/10 text-info",
    Cancelled: "bg-destructive/10 text-destructive",
    Expired: "bg-muted text-foreground",
    PastDue: "bg-warning/10 text-warning",
    Free: "bg-success/10 text-success",
  };

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return "—";
    return formatDateUtc(dateStr);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-warning" />
            {subscription.planName}
          </CardTitle>
          <Badge className={statusColors[subscription.status] ?? "bg-muted"}>
            {statusLabels[subscription.status] ?? subscription.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Billing Cycle */}
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">
                {t("entitlements.mySubscription.billingCycle") || "Billing Cycle"}
              </p>
              <p className="text-sm font-medium">{subscription.billingCycle || "—"}</p>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">
                {t("entitlements.mySubscription.price") || "Price"}
              </p>
              <p className="text-sm font-medium tabular-nums">
                {subscription.price > 0
                  ? subscription.formattedPrice
                  : t("entitlements.mySubscription.free") || "Free"}
              </p>
            </div>
          </div>

          {/* Expiry / Renewal */}
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">
                {subscription.isAutoRenew
                  ? t("entitlements.mySubscription.renewsOn") || "Renews On"
                  : t("entitlements.mySubscription.expiresOn") || "Expires On"}
              </p>
              <p className="text-sm font-medium">{formatDate(subscription.expiresAt)}</p>
            </div>
          </div>
        </div>

        {/* Days remaining warning */}
        {subscription.isExpiringSoon && subscription.daysRemaining != null && (
          <div className="mt-4 flex items-center gap-2 rounded-md bg-warning/10 px-3 py-2 text-warning">
            <Timer className="h-4 w-4" />
            <span className="text-sm">
              {t("entitlements.mySubscription.expiringSoon") ||
                `Expires in ${subscription.daysRemaining} day(s)`}
            </span>
          </div>
        )}

        {/* Trial info */}
        {subscription.hasTrial && subscription.trialEndsAt && (
          <div className="mt-4 flex items-center gap-2 rounded-md bg-info/10 px-3 py-2 text-info">
            <Timer className="h-4 w-4" />
            <span className="text-sm">
              {t("entitlements.mySubscription.trialEnds") || "Trial ends"}:{" "}
              {formatDate(subscription.trialEndsAt)}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
