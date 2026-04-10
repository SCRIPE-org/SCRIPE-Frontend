"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Skeleton } from "@core/ui/skeleton";
import { CreditCard, Zap, TrendingUp, DollarSign, Calendar, RefreshCw, Settings, Shield } from "lucide-react";
import { useBillingViewModel } from "../viewmodels/useBillingViewModel";

export function BillingView() {
  useModuleLocales(() => import("../../../locales"), "billing");
  const { t } = useI18n();
  const vm = useBillingViewModel();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
          <CreditCard className="h-5 w-5 text-green-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("billing.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("billing.description")}</p>
        </div>
        <div className="ml-auto">
          <Button variant="outline" size="sm" onClick={() => vm.refetch()} className="gap-2">
            <RefreshCw className="h-3.5 w-3.5" />{t("common.refresh")}
          </Button>
        </div>
      </div>

      {vm.isLoading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}</div>
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      ) : vm.error ? (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-sm text-destructive mb-3">{t("common.errorLoading")}</p>
            <Button variant="outline" size="sm" onClick={() => vm.refetch()} className="gap-2">
              <RefreshCw className="h-3.5 w-3.5" />{t("common.retry")}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Stats — from billing config & revenue data */}
          <div className="grid grid-cols-4 gap-4">
            <Card className="border-green-500/20 bg-green-50/50 dark:bg-green-950/20">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1"><DollarSign className="h-4 w-4" />{t("billing.mrr")}</div>
                <p className="text-2xl font-bold">${(vm.revenue as Record<string, unknown>)?.totalRevenue as number ?? 0}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1"><Zap className="h-4 w-4" />{t("billing.activeSubs")}</div>
                <p className="text-2xl font-bold">{(vm.config as Record<string, unknown>)?.activeSubscriptions as number ?? 0}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1"><TrendingUp className="h-4 w-4" />{t("billing.growth")}</div>
                <p className="text-2xl font-bold text-green-500">{(vm.revenue as Record<string, unknown>)?.growthRate as string ?? "—"}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1"><Calendar className="h-4 w-4" />{t("billing.nextBilling")}</div>
                <p className="text-2xl font-bold">{(vm.config as Record<string, unknown>)?.nextBillingDate as string ?? "—"}</p>
              </CardContent>
            </Card>
          </div>

          {/* Billing Configuration */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2"><Settings className="h-4 w-4" />{t("billing.configuration")}</CardTitle>
              <Badge variant="outline" className="gap-1.5">
                {(vm.config as Record<string, unknown>)?.paymentMode as string ?? "Not set"}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Tenant ID</span>
                    <span className="font-mono">{vm.tenantId || "—"}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Payment Mode</span>
                    <Badge variant="secondary">{(vm.config as Record<string, unknown>)?.paymentMode as string ?? "—"}</Badge>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Currency</span>
                    <span>{(vm.config as Record<string, unknown>)?.currency as string ?? "USD"}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Billing Cycle</span>
                    <span>{(vm.config as Record<string, unknown>)?.billingCycle as string ?? "Monthly"}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Auto-Renew</span>
                    <Badge variant={(vm.config as Record<string, unknown>)?.autoRenew ? "success" : "secondary"}>
                      {(vm.config as Record<string, unknown>)?.autoRenew ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          {vm.features.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><Shield className="h-4 w-4" />{t("billing.features")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3">
                  {vm.features.map((f: unknown, i: number) => {
                    const feature = f as Record<string, unknown>;
                    return (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                        <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/10">
                          <Zap className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{feature.name as string ?? `Feature ${i + 1}`}</p>
                          <p className="text-xs text-muted-foreground">{feature.value as string ?? "—"}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
