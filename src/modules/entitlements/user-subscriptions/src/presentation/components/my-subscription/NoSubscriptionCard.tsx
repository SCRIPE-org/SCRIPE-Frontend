/**
 * NoSubscriptionCard — Shown when the user has no active subscription.
 */
"use client";

import { Card, CardContent } from "@core/ui/card";
import { PackageOpen } from "lucide-react";

interface NoSubscriptionCardProps {
  t: (key: string) => string;
}

export function NoSubscriptionCard({ t }: NoSubscriptionCardProps) {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {t("entitlements.mySubscription.title") || "My Subscription"}
        </h1>
      </div>
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <PackageOpen className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold mb-1">
            {t("entitlements.mySubscription.noSubscription") || "No Active Subscription"}
          </h3>
          <p className="text-sm text-muted-foreground max-w-md">
            {t("entitlements.mySubscription.noSubscriptionDesc") ||
              "You don't have an active subscription yet. Contact your administrator or browse available plans."}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
