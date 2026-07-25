/**
 * MyUserSubscriptionView — end-user self-service page for the caller's own
 * UserSubscription (plan, features, cancel). Composes the four
 * my-subscription/* cards that already existed but were never wired to a route.
 */
"use client";

import { useMyUserSubscriptionViewModel } from "../viewmodels/useMyUserSubscriptionViewModel";
import { useI18n } from "@core/providers/i18n-provider";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { PageHeader } from "@core/ui/page-header";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { ErrorMessage } from "@core/ui/error-message";
import { CreditCard } from "lucide-react";
import { NoSubscriptionCard } from "../components/my-subscription/NoSubscriptionCard";
import { SubscriptionStatusCard } from "../components/my-subscription/SubscriptionStatusCard";
import { SubscriptionFeaturesCard } from "../components/my-subscription/SubscriptionFeaturesCard";
import { SubscriptionActionsCard } from "../components/my-subscription/SubscriptionActionsCard";

export function MyUserSubscriptionView() {
  useModuleLocales(() => import("../../../locales"), "user-subscriptions");
  const vm = useMyUserSubscriptionViewModel();
  const { t, language } = useI18n();

  if (vm.isLoading) {
    return <LoadingSpinner fullHeight />;
  }

  if (vm.error && !vm.subscription) {
    return <ErrorMessage message={t("common.error")} onRetry={() => vm.refetch()} fullHeight />;
  }

  if (!vm.hasSubscription || !vm.subscription) {
    return <NoSubscriptionCard t={t} />;
  }

  const sub = vm.subscription;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex flex-col gap-6">
        <PageHeader
          icon={CreditCard}
          title={t("entitlements.mySubscription.title")}
          description={t("entitlements.mySubscription.description")}
        />

        <SubscriptionStatusCard subscription={sub} t={t} language={language} />
        <SubscriptionFeaturesCard subscription={sub} t={t} language={language} />
        <SubscriptionActionsCard
          subscription={sub}
          onCancel={vm.cancel}
          isCancelling={vm.isCancelling}
          t={t}
        />
      </div>
    </div>
  );
}
