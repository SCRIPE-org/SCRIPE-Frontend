/**
 * NoSubscriptionCard — Shown when the user has no active subscription.
 */
"use client";

import { Card, CardContent } from "@core/ui/card";
import { PackageOpen } from "lucide-react";

interface NoSubscriptionCardProps {
  t: (key: string) => string;
}

/**
 * React presentation component representing the no subscription card UI element.
 */
export function NoSubscriptionCard({ t }: NoSubscriptionCardProps) {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {t("entitlements.mySubscription.title") || "My Subscription"}
        </h1>
      </div>
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <PackageOpen className="mb-4 h-12 w-12 text-muted-foreground/50" />
          <h3 className="mb-1 text-lg font-semibold">
            {t("entitlements.mySubscription.noSubscription") || "No Active Subscription"}
          </h3>
          <p className="max-w-md text-sm text-muted-foreground">
            {t("entitlements.mySubscription.noSubscriptionDesc") ||
              "You don't have an active subscription yet. Contact your administrator or browse available plans."}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
