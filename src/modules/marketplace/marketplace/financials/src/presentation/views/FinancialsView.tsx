"use client";

import { useFinancialsViewModel } from "../viewmodels/useFinancialsViewModel";
import { RevenueChart, type RevenueDataPoint } from "../components/RevenueChart";
import type { AppPurchase } from "../../domain/entities/FinancialEntities";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Card, CardContent } from "@core/ui/card";
import { Skeleton } from "@core/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@core/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@core/ui/select";
import { EmptyState } from "@core/ui/empty-state";
import { useI18n } from "@core/providers/i18n-provider";
import { DollarSign, Play, Users } from "lucide-react";
import { formatDateUtc } from "@core/common/utils";
import type { PayoutStatus } from "../../domain/entities/FinancialEntities";

const PAYOUT_STATUS_KEY: Record<PayoutStatus, string> = {
  Pending: "marketplace.financialsPayoutStatusPending",
  Processing: "marketplace.financialsPayoutStatusProcessing",
  Paid: "marketplace.financialsPayoutStatusPaid",
  Failed: "marketplace.financialsPayoutStatusFailed",
};

/**
 * Presentation UI component rendering the financials view.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function FinancialsView() {
  const vm = useFinancialsViewModel();
  const { t } = useI18n();

  // Purchases can carry different currencies (per-app pricing currency), so
  // revenue is grouped and summed per currency rather than added together —
  // summing mixed currencies as one number would silently misreport totals.
  const purchasesByCurrency = groupPurchasesByCurrency(vm.purchases);

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h2 className="text-xl font-semibold text-nx-ink">{t("marketplace.financialsTitle")}</h2>
        <p className="text-sm text-nx-ink-2">{t("marketplace.financialsPageSubtitle")}</p>
      </div>

      {/* Revenue chart(s) — one per currency present in the purchase data (Phase 5.4) */}
      {!vm.isLoadingPurchases && purchasesByCurrency.size > 0 && (
        <div className="flex flex-col gap-4 lg:flex-row lg:flex-wrap">
          {Array.from(purchasesByCurrency.entries()).map(([currency, currencyPurchases]) => (
            <RevenueChart
              key={currency}
              className="lg:min-w-[320px] lg:flex-1"
              data={buildMonthlyRevenueData(currencyPurchases)}
              totalRevenue={currencyPurchases.reduce((sum, p) => sum + p.amount, 0)}
              currencySymbol={currencyPrefix(currency)}
              title={
                purchasesByCurrency.size > 1
                  ? `${t("marketplace.financialsRevenueChartTitle")} — ${currency}`
                  : undefined
              }
            />
          ))}
        </div>
      )}

      <Tabs defaultValue="purchases">
        <TabsList>
          <TabsTrigger value="purchases">
            {t("marketplace.financialsPurchasesTab", { count: vm.purchasesPagination.totalCount })}
          </TabsTrigger>
          <TabsTrigger value="payouts">{t("marketplace.financialsPayoutsTab")}</TabsTrigger>
        </TabsList>

        {/* Purchases tab */}
        <TabsContent value="purchases" className="mt-4">
          {vm.isLoadingPurchases ? (
            <div
              className="flex flex-col gap-2"
              role="status"
              aria-busy="true"
              aria-label={t("common.loading")}
            >
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-nx-md" />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {vm.purchases.map((p) => (
                <Card key={p.id}>
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className="rounded-nx-md bg-nx-raised p-2">
                      <DollarSign className="size-4 text-success" aria-hidden="true" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-nx-ink">{p.appName}</p>
                      <p className="text-xs text-nx-ink-2">{p.tenantName}</p>
                    </div>
                    <div className="text-end">
                      <p className="text-sm font-semibold tabular-nums text-success">
                        {p.amountLabel}
                      </p>
                      <p className="text-xs text-nx-ink-2">{formatDateUtc(p.purchasedAt)}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Payouts tab */}
        <TabsContent value="payouts" className="mt-4 flex flex-col gap-4">
          {/* Payouts are scoped to one developer at a time (the backend query
              requires a developerProfileId — there is no "all developers"
              mode), so an explicit picker drives which developer's payouts
              are fetched. */}
          <div className="max-w-xs">
            <Select
              value={vm.developerProfileId}
              onValueChange={vm.setDeveloperProfileId}
              disabled={vm.isLoadingDeveloperOptions || vm.developerOptions.length === 0}
            >
              <SelectTrigger aria-label={t("marketplace.financialsSelectDeveloperLabel")}>
                <SelectValue placeholder={t("marketplace.financialsSelectDeveloperPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                {vm.developerOptions.map((developer) => (
                  <SelectItem key={developer.id} value={developer.id}>
                    {developer.displayName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {!vm.developerProfileId ? (
            <EmptyState
              size="sm"
              bare
              icon={Users}
              title={t("marketplace.financialsSelectDeveloperPrompt")}
            />
          ) : vm.isLoadingPayouts ? (
            <div
              className="flex flex-col gap-2"
              role="status"
              aria-busy="true"
              aria-label={t("common.loading")}
            >
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-nx-md" />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {vm.payouts.map((payout) => (
                <Card key={payout.id}>
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-nx-ink">{payout.developerName}</p>
                        <Badge variant={payout.statusVariant} className="text-xs">
                          {t(PAYOUT_STATUS_KEY[payout.status])}
                        </Badge>
                      </div>
                      <p className="text-xs text-nx-ink-2">
                        {formatDateUtc(payout.periodStart)} — {formatDateUtc(payout.periodEnd)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-sm font-semibold tabular-nums text-nx-ink">
                        {payout.amountLabel}
                      </p>
                      {payout.canProcess && (
                        <Button
                          size="sm"
                          className="gap-1.5"
                          onClick={() => vm.processPayout({ id: payout.id })}
                          disabled={vm.isProcessingPayout}
                        >
                          <Play className="size-3.5" aria-hidden="true" />{" "}
                          {t("marketplace.financialsProcessPayout")}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────────

/**
 * Groups purchases by their currency code (F-93).
 * Each app can be priced in a different currency, and there is no FX-rate
 * source available, so purchases are never summed across currencies —
 * every group gets its own chart and its own labeled total instead.
 */
function groupPurchasesByCurrency(purchases: AppPurchase[]): Map<string, AppPurchase[]> {
  const groups = new Map<string, AppPurchase[]>();
  for (const p of purchases) {
    const currency = p.currency || "USD";
    const list = groups.get(currency);
    if (list) {
      list.push(p);
    } else {
      groups.set(currency, [p]);
    }
  }
  return groups;
}

/**
 * Resolves the real, locale-correct currency symbol (e.g. "$", "€", "£") for
 * an ISO 4217 currency code via Intl, instead of guessing/hardcoding a
 * symbol table. Falls back to the currency code itself if Intl can't resolve
 * a symbol (e.g. an unrecognized code).
 */
function currencyPrefix(currency: string): string {
  try {
    const part = new Intl.NumberFormat("en", {
      style: "currency",
      currency,
      currencyDisplay: "narrowSymbol",
    })
      .formatToParts(0)
      .find((p) => p.type === "currency");
    return part?.value ?? `${currency} `;
  } catch {
    return `${currency} `;
  }
}

/**
 * Groups a list of purchases into monthly buckets for the RevenueChart.
 * Returns a sorted array of { label, revenue } data points.
 */
function buildMonthlyRevenueData(purchases: AppPurchase[]): RevenueDataPoint[] {
  const buckets: Record<string, number> = {};
  for (const p of purchases) {
    const d = new Date(p.purchasedAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    buckets[key] = (buckets[key] ?? 0) + p.amount;
  }
  return Object.entries(buckets)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, revenue]) => ({
      label: formatDateUtc(key),
      revenue,
    }));
}
