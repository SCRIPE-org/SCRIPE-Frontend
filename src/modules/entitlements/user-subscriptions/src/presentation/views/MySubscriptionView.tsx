/**
 * MySubscriptionView — User self-service subscription portal.
 *
 * Shows:
 * - Current plan name, status badge, expiry date
 * - Billing cycle and price
 * - Resolved feature list from the plan
 * - Cancel action (with confirmation)
 *
 * Extracted components: SubscriptionCard, SubscriptionFeatures, SubscriptionActions
 *
 * Stripe-ready: Phase 10 will add a "Manage Billing" button that opens the
 * Stripe Customer Portal.
 */
"use client";

import { useMySubscriptionViewModel } from "../viewmodels/useMySubscriptionViewModel";
import { useI18n } from "@core/providers/i18n-provider";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { SubscriptionStatusCard } from "../components/my-subscription/SubscriptionStatusCard";
import { SubscriptionFeaturesCard } from "../components/my-subscription/SubscriptionFeaturesCard";
import { SubscriptionActionsCard } from "../components/my-subscription/SubscriptionActionsCard";
import { NoSubscriptionCard } from "../components/my-subscription/NoSubscriptionCard";
import { Card, CardContent } from "@core/ui/card";
import { Loader2 } from "lucide-react";

export function MySubscriptionView() {
  useModuleLocales(() => import("../../../locales"), "user-subscriptions");
  const vm = useMySubscriptionViewModel();
  const { t, language } = useI18n();

  if (vm.isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!vm.hasSubscription || !vm.subscription) {
    return <NoSubscriptionCard t={t} />;
  }

  const sub = vm.subscription;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* ── Page Title ── */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {t("entitlements.mySubscription.title") || "My Subscription"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t("entitlements.mySubscription.description") ||
            "View and manage your current plan."}
        </p>
      </div>

      {/* ── Status Card ── */}
      <SubscriptionStatusCard subscription={sub} t={t} language={language} />

      {/* ── Features Card ── */}
      <SubscriptionFeaturesCard subscription={sub} t={t} language={language} />

      {/* ── Actions Card (Cancel, Manage Billing placeholder) ── */}
      <SubscriptionActionsCard
        subscription={sub}
        onCancel={vm.cancelSubscription}
        isCancelling={vm.isCancelling}
        t={t}
      />
    </div>
  );
}
