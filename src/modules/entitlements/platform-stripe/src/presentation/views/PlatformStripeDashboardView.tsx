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
      <div className="flex flex-col items-center justify-center py-20 gap-4 max-w-md mx-auto text-center">
        <div className="p-4 rounded-full bg-destructive/10">
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
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Wallet className="h-6 w-6 text-[#635bff]" />
            {t("entitlements.platformStripe.title")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("entitlements.platformStripe.description")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
            <RefreshCw className="h-4 w-4" /> {t("entitlements.platformStripe.refresh")}
          </Button>
          <Button
            size="sm"
            className="gap-2 bg-[#635bff] hover:bg-[#5851ea] text-white"
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TransactionsCard
          transactions={dashboard.recentTransactions}
          paymentsLink={dashboard.links.payments}
        />
        <PayoutsCard
          payouts={dashboard.recentPayouts}
          payoutsLink={dashboard.links.payouts}
        />
      </div>

      {/* Quick Links */}
      <QuickLinksCard links={dashboard.links} />
    </div>
  );
}
