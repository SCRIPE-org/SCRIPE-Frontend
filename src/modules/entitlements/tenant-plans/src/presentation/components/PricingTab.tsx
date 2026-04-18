/**
 * PricingTab — Multi-currency pricing matrix, grouped by currency.
 */
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { DollarSign } from "lucide-react";
import type { TenantPlan, TenantPlanPriceData } from "../../domain/entities/TenantPlan";
import { formatAmount, type TFn } from "./shared-helpers";

interface PricingTabProps {
  plan: TenantPlan;
  t: TFn;
}

export function PricingTab({ plan, t }: PricingTabProps) {
  const prices: TenantPlanPriceData[] = plan.prices || [];

  if (prices.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <DollarSign className="h-10 w-10 text-muted-foreground/40 mb-3" />
          <p className="text-sm text-muted-foreground">{t("entitlements.tenantPlans.noPricing")}</p>
          <p className="text-xs text-muted-foreground mt-1">{t("entitlements.tenantPlans.noPricingHint")}</p>
        </CardContent>
      </Card>
    );
  }

  // Group by currency
  const byCurrency: Record<string, TenantPlanPriceData[]> = {};
  for (const price of prices) {
    const cur = price.currency || "USD";
    if (!byCurrency[cur]) byCurrency[cur] = [];
    byCurrency[cur].push(price);
  }

  return (
    <div className="space-y-4">
      {Object.entries(byCurrency).map(([currency, currencyPrices]) => (
        <Card key={currency}>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-emerald-500" />
              <CardTitle className="text-base">{currency}</CardTitle>
              <Badge variant="secondary" className="text-xs">
                {currencyPrices.length} {currencyPrices.length === 1 ? t("entitlements.tenantPlans.priceCount") : t("entitlements.tenantPlans.priceCountPlural")}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              {currencyPrices.map((price) => (
                <div key={price.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">{price.billingCycle}</Badge>
                    {price.isPromotional && (
                      <Badge variant="default" className="bg-amber-500 text-xs">
                        {t("entitlements.tenantPlans.promo")}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 tabular-nums">
                    {price.originalAmount != null && price.originalAmount > price.amount && (
                      <span className="text-sm text-muted-foreground line-through">
                        {formatAmount(price.originalAmount, currency)}
                      </span>
                    )}
                    <span className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                      {formatAmount(price.amount, currency)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
