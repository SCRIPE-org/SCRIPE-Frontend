"use client";

import { useFinancialsViewModel } from "../viewmodels/useFinancialsViewModel";
import { RevenueChart, type RevenueDataPoint } from "../components/RevenueChart";
import type { AppPurchase } from "../../domain/entities/FinancialEntities";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Card, CardContent } from "@core/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@core/ui/tabs";
import { DollarSign, Play } from "lucide-react";
import { formatDateUtc } from "@core/common/utils";

/**
 * Presentation UI component rendering the financials view.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function FinancialsView() {
  const vm = useFinancialsViewModel();

  // Build chart data from purchases grouped by month (Phase 5.4)
  const chartData = buildMonthlyRevenueData(vm.purchases);
  const totalRevenue = vm.purchases.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h2 className="text-xl font-semibold">Marketplace Financials</h2>
        <p className="text-sm text-muted-foreground">Purchases and developer payouts</p>
      </div>

      {/* Revenue chart (Phase 5.4) */}
      {!vm.isLoadingPurchases && chartData.length > 0 && (
        <RevenueChart data={chartData} totalRevenue={totalRevenue} title="Revenue Over Time" />
      )}

      <Tabs defaultValue="purchases">
        <TabsList>
          <TabsTrigger value="purchases">
            Purchases ({vm.purchasesPagination.totalCount})
          </TabsTrigger>
          <TabsTrigger value="payouts">Payouts</TabsTrigger>
        </TabsList>

        {/* Purchases tab */}
        <TabsContent value="purchases" className="mt-4">
          {vm.isLoadingPurchases ? (
            <div className="flex flex-col gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 motion-safe:animate-pulse rounded-lg bg-muted" />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {vm.purchases.map((p) => (
                <Card key={p.id}>
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className="rounded-lg bg-muted p-2">
                      <DollarSign className="size-4 text-success" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{p.appName}</p>
                      <p className="text-xs text-muted-foreground">{p.tenantName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-success">{p.amountLabel}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDateUtc(p.purchasedAt)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Payouts tab */}
        <TabsContent value="payouts" className="mt-4">
          {vm.isLoadingPayouts ? (
            <div className="flex flex-col gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 motion-safe:animate-pulse rounded-lg bg-muted" />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {vm.payouts.map((payout) => (
                <Card key={payout.id}>
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{payout.developerName}</p>
                        <Badge variant={payout.statusVariant} className="text-xs">
                          {payout.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatDateUtc(payout.periodStart)} —{" "}
                        {formatDateUtc(payout.periodEnd)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-sm font-semibold">{payout.amountLabel}</p>
                      {payout.canProcess && (
                        <Button
                          size="sm"
                          className="gap-1.5"
                          onClick={() => vm.processPayout({ id: payout.id })}
                          disabled={vm.isProcessingPayout}
                        >
                          <Play className="size-3.5" /> Process
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
