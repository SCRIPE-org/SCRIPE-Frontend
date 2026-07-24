/**
 * PlatformStripeDashboardView — Slim orchestrator composing extracted components.
 *
 * Data flow: View → ViewModel → Repository → Service → API
 */
"use client";

import { usePlatformStripeViewModel } from "../viewmodels/usePlatformStripeViewModel";
import { useI18n } from "@core/providers/i18n-provider";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { Button } from "@core/ui/button";
import { ErrorMessage } from "@core/ui/error-message";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { PageHeader } from "@core/ui/page-header";
import { Wallet, ExternalLink, RefreshCw } from "lucide-react";

import { AccountHeroCard } from "../components/AccountHeroCard";
import { BalanceCards } from "../components/BalanceCards";
import { ConnectSummaryCard } from "../components/ConnectSummaryCard";
import { TransactionsCard } from "../components/TransactionsCard";
import { PayoutsCard } from "../components/PayoutsCard";
import { QuickLinksCard } from "../components/QuickLinksCard";

/**
 * Presentation UI component rendering the platform stripe dashboard view.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function PlatformStripeDashboardView() {
  useModuleLocales(() => import("../../../locales"), "platform-stripe");
  const { t } = useI18n();
  const { dashboard, isLoading, error, refetch } = usePlatformStripeViewModel();

  // ── Loading State ──
  if (isLoading) {
    return <LoadingSpinner showText={false} />;
  }

  // ── Error State ──
  if (error || !dashboard) {
    return (
      <ErrorMessage
        message={t("entitlements.platformStripe.errorMessage")}
        onRetry={() => refetch()}
      />
    );
  }

  // ── Dashboard ──
  const currency = dashboard.account.defaultCurrency;

  return (
    <div
      className="mx-auto flex max-w-7xl flex-col"
      style={{ gap: "calc(var(--spacing-unit) * 1.5)" }}
    >
      <PageHeader
        icon={Wallet}
        title={t("entitlements.platformStripe.title")}
        description={t("entitlements.platformStripe.description")}
        className="mb-0"
        actions={
          <>
            <Button variant="outline" size="sm" className="gap-2" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              {t("common.refresh")}
            </Button>
            <Button asChild size="sm" className="gap-2">
              <a href={dashboard.links.dashboard} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
                {t("entitlements.platformStripe.openStripe")}
                <span className="sr-only">{t("entitlements.platformStripe.opensInNewTab")}</span>
              </a>
            </Button>
          </>
        }
      />

      <AccountHeroCard account={dashboard.account} />

      <BalanceCards balance={dashboard.balance} defaultCurrency={currency} />

      <ConnectSummaryCard connectSummary={dashboard.connectSummary} currency={currency} />

      {/* Transactions + Payouts (side by side) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <TransactionsCard
          transactions={dashboard.recentTransactions}
          paymentsLink={dashboard.links.payments}
        />
        <PayoutsCard payouts={dashboard.recentPayouts} payoutsLink={dashboard.links.payouts} />
      </div>

      <QuickLinksCard links={dashboard.links} />
    </div>
  );
}
