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
import { Wallet, ExternalLink, RefreshCw, AlertCircle, Loader2 } from "lucide-react";

import { AccountHeroCard } from "../components/AccountHeroCard";
import { BalanceCards } from "../components/BalanceCards";
import { ConnectSummaryCard } from "../components/ConnectSummaryCard";
import { TransactionsCard } from "../components/TransactionsCard";
import { PayoutsCard } from "../components/PayoutsCard";
import { QuickLinksCard } from "../components/QuickLinksCard";

/**
 * React presentation component representing the platform stripe dashboard view UI element.
 */
export function PlatformStripeDashboardView() {
  useModuleLocales(() => import("../../../locales"), "platform-stripe");
  const { t } = useI18n();
  const { dashboard, isLoading, error, refetch } = usePlatformStripeViewModel();

  // ── Loading State ──
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[#635bff]" />
      </div>
    );
  }

  // ── Error State ──
  if (error || !dashboard) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center justify-center gap-4 py-20 text-center">
        <div className="rounded-full bg-destructive/10 p-4">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>
        <h2 className="text-lg font-semibold">{t("entitlements.platformStripe.errorTitle")}</h2>
        <p className="text-sm text-muted-foreground">
          {t("entitlements.platformStripe.errorDescription")}
        </p>
        <Button variant="outline" onClick={() => refetch()} className="gap-2">
          <RefreshCw className="h-4 w-4" /> {t("entitlements.platformStripe.retry")}
        </Button>
      </div>
    );
  }

  // ── Dashboard ──
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Page Header */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <Wallet className="h-6 w-6 text-[#635bff]" />
            {t("entitlements.platformStripe.title")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("entitlements.platformStripe.description")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
            <RefreshCw className="h-4 w-4" /> {t("entitlements.platformStripe.refresh")}
          </Button>
          <Button
            size="sm"
            className="gap-2 bg-[#635bff] text-white hover:bg-[#5851ea]"
            onClick={() => window.open(dashboard.links.dashboard, "_blank")}
          >
            <ExternalLink className="h-4 w-4" /> {t("entitlements.platformStripe.openStripe")}
          </Button>
        </div>
      </div>

      {/* Account Hero */}
      <AccountHeroCard account={dashboard.account} />

      {/* Balance Cards */}
      <BalanceCards balance={dashboard.balance} />

      {/* Connect Summary */}
      <ConnectSummaryCard connectSummary={dashboard.connectSummary} />

      {/* Transactions + Payouts (side by side) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <TransactionsCard
          transactions={dashboard.recentTransactions}
          paymentsLink={dashboard.links.payments}
        />
        <PayoutsCard payouts={dashboard.recentPayouts} payoutsLink={dashboard.links.payouts} />
      </div>

      {/* Quick Links */}
      <QuickLinksCard links={dashboard.links} />
    </div>
  );
}
