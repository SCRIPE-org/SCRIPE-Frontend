/**
 * NoSubscriptionCard — Shown when the user has no active subscription.
 */
"use client";

import { EmptyState } from "@core/ui/empty-state";
import { PackageOpen } from "lucide-react";

interface NoSubscriptionCardProps {
  t: (key: string) => string;
}

/**
 * Presentation UI component rendering the no subscription card.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function NoSubscriptionCard({ t }: NoSubscriptionCardProps) {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-balance text-xl font-bold leading-tight tracking-tight text-nx-ink">
          {t("entitlements.mySubscription.title")}
        </h1>
      </div>
      <EmptyState
        icon={PackageOpen}
        title={t("entitlements.mySubscription.noSubscription")}
        description={t("entitlements.mySubscription.noSubscriptionDesc")}
        size="lg"
      />
    </div>
  );
}
