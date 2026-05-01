/**
 * SubscriptionStatusCard — Displays the current plan's status, name, billing info.
 */
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { Crown, Calendar, CreditCard, Timer } from "lucide-react";
import type { UserSubscription } from "../../../domain/entities/UserSubscription";

interface SubscriptionStatusCardProps {
  subscription: UserSubscription;
  t: (key: string) => string;
  language: string;
}

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
    Active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    Trial: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    Cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    Expired: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
    PastDue: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    Free: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  };

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString(language === "ar" ? "ar-EG" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-amber-500" />
            {subscription.planName}
          </CardTitle>
          <Badge className={statusColors[subscription.status] ?? "bg-gray-100"}>
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
          <div className="mt-4 flex items-center gap-2 rounded-md bg-amber-50 px-3 py-2 text-amber-700 dark:bg-amber-900/10 dark:text-amber-400">
            <Timer className="h-4 w-4" />
            <span className="text-sm">
              {t("entitlements.mySubscription.expiringSoon") ||
                `Expires in ${subscription.daysRemaining} day(s)`}
            </span>
          </div>
        )}

        {/* Trial info */}
        {subscription.hasTrial && subscription.trialEndsAt && (
          <div className="mt-4 flex items-center gap-2 rounded-md bg-blue-50 px-3 py-2 text-blue-700 dark:bg-blue-900/10 dark:text-blue-400">
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
