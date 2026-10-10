"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CircleDollarSign,
  ReceiptText,
  CreditCard,
  Plus,
  ArrowRight,
  Lock,
  AlertCircle,
  RefreshCw,
  TrendingUp,
  Wallet,
  Clock,
  RotateCcw,
  BarChart3,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowUpRight,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { EmptyState } from "@core/ui/empty-state";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { PageHeader } from "@core/ui/page-header";
import { Alert, AlertDescription } from "@core/ui/alert";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { usePermission } from "@core/hooks/use-permission";
import { useI18n } from "@core/providers/i18n-provider";
import { VENUE_PERMISSIONS } from "@modules/venue/permission-constants";
import { VenueNav } from "@modules/venue/shared/src/presentation/components/VenueNav";
import { VenueMoneyNav } from "@modules/venue/shared/src/presentation/components/VenueMoneyNav";
import { getVenueContainer } from "@modules/venue/di";
import type {
  MoneyInvoice,
  MoneyPayment,
  MoneySummaryItem,
  MoneyTrendBucket,
  MoneyResourcePerformance,
  MoneyTimeOfDayBucket,
  MoneyPaymentMethodItem,
  MoneyAnalyticsFilter,
} from "../../domain/entities/Money";

type DateRangeFilter = "today" | "days7" | "days30" | "thisMonth" | "custom";

function formatMoney(value: number, currency: string, locale: string) {
  try {
    return new Intl.NumberFormat(locale, { style: "currency", currency }).format(value);
  } catch {
    return `${value.toFixed(2)} ${currency}`;
  }
}

function formatDate(dateStr: string, locale: string) {
  try {
    return new Intl.DateTimeFormat(locale, {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

function getDateRange(range: DateRangeFilter): { from?: string; to?: string; interval: "hour" | "day" } {
  const now = new Date();
  const to = now.toISOString();

  if (range === "today") {
    const startOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0));
    return { from: startOfDay.toISOString(), to, interval: "hour" };
  }
  if (range === "days7") {
    const d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return { from: d.toISOString(), to, interval: "day" };
  }
  if (range === "days30") {
    const d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    return { from: d.toISOString(), to, interval: "day" };
  }
  if (range === "thisMonth") {
    const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0));
    return { from: startOfMonth.toISOString(), to, interval: "day" };
  }
  return { interval: "day" };
}

export function MoneyLandingView() {
  useModuleLocales(() => import("../../../locales"), "venue.money");
  const { t, language, direction } = useI18n();
  const router = useRouter();

  const canViewReceivables = usePermission(VENUE_PERMISSIONS.FINANCE_RECEIVABLES_VIEW);
  const canViewPayments = usePermission(VENUE_PERMISSIONS.FINANCE_PAYMENTS_VIEW);
  const canCreatePayment = usePermission(VENUE_PERMISSIONS.FINANCE_PAYMENTS_CREATE);
  const canUpdateAllocations = usePermission(VENUE_PERMISSIONS.FINANCE_PAYMENT_ALLOCATIONS_UPDATE);
  const canRecordPayment = canCreatePayment && canUpdateAllocations;

  // Single-permission routing redirect:
  useEffect(() => {
    if (canViewReceivables && !canViewPayments) {
      router.replace("/venue/money/receivables");
    } else if (!canViewReceivables && canViewPayments) {
      router.replace("/venue/money/payments");
    }
  }, [canViewReceivables, canViewPayments, router]);

  const [dateFilter, setDateFilter] = useState<DateRangeFilter>("thisMonth");

  // Authoritative State
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<MoneySummaryItem | null>(null);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const [trendBuckets, setTrendBuckets] = useState<MoneyTrendBucket[]>([]);
  const [trendLoading, setTrendLoading] = useState(true);
  const [trendError, setTrendError] = useState<string | null>(null);

  const [resourcePerformance, setResourcePerformance] = useState<MoneyResourcePerformance[]>([]);
  const [resourceLoading, setResourceLoading] = useState(true);
  const [resourceError, setResourceError] = useState<string | null>(null);

  const [timeOfDayBuckets, setTimeOfDayBuckets] = useState<MoneyTimeOfDayBucket[]>([]);
  const [timeLoading, setTimeLoading] = useState(true);
  const [timeError, setTimeError] = useState<string | null>(null);

  const [paymentMethods, setPaymentMethods] = useState<MoneyPaymentMethodItem[]>([]);
  const [methodsLoading, setMethodsLoading] = useState(true);
  const [methodsError, setMethodsError] = useState<string | null>(null);

  const [invoices, setInvoices] = useState<MoneyInvoice[]>([]);
  const [payments, setPayments] = useState<MoneyPayment[]>([]);
  const [tablesLoading, setTablesLoading] = useState(true);
  const [tablesError, setTablesError] = useState<string | null>(null);

  const currency = summary?.currencyCode || trendBuckets[0]?.currencyCode || "EGP";

  const loadAllData = useCallback(async () => {
    if (!canViewReceivables && !canViewPayments) return;
    const { moneyRepository } = getVenueContainer();
    const { from, to, interval } = getDateRange(dateFilter);

    const filter: MoneyAnalyticsFilter = {
      dateFromUtc: from,
      dateToUtc: to,
      interval,
    };

    setLoading(true);

    // 1. Authoritative Summary
    setSummaryError(null);
    moneyRepository
      .getSummary(filter)
      .then((res) => {
        setSummary(res.primary || res.items[0] || null);
      })
      .catch(() => {
        setSummaryError(t("money.error.description", { defaultValue: "Could not load summary metrics." }));
      });

    // 2. Trend Time Series
    setTrendLoading(true);
    setTrendError(null);
    moneyRepository
      .getTrend(filter)
      .then((res) => {
        setTrendBuckets(res.buckets || []);
      })
      .catch(() => {
        setTrendError(t("money.error.description", { defaultValue: "Could not load trend data." }));
      })
      .finally(() => setTrendLoading(false));

    // 3. Performance by Court
    setResourceLoading(true);
    setResourceError(null);
    moneyRepository
      .getByResource(filter)
      .then((items) => {
        setResourcePerformance(items || []);
      })
      .catch(() => {
        setResourceError(t("money.error.description", { defaultValue: "Could not load court performance." }));
      })
      .finally(() => setResourceLoading(false));

    // 4. Performance by Time of Day
    setTimeLoading(true);
    setTimeError(null);
    moneyRepository
      .getByTimeOfDay(filter)
      .then((items) => {
        setTimeOfDayBuckets(items || []);
      })
      .catch(() => {
        setTimeError(t("money.error.description", { defaultValue: "Could not load time breakdown." }));
      })
      .finally(() => setTimeLoading(false));

    // 5. Payment Methods
    setMethodsLoading(true);
    setMethodsError(null);
    moneyRepository
      .getPaymentMethods(filter)
      .then((items) => {
        setPaymentMethods(items || []);
      })
      .catch(() => {
        setMethodsError(t("money.error.description", { defaultValue: "Could not load payment methods." }));
      })
      .finally(() => setMethodsLoading(false));

    // 6. Actionable Tables (Outstanding Receivables and Recent Payments)
    setTablesLoading(true);
    setTablesError(null);
    Promise.all([
      canViewReceivables ? moneyRepository.getInvoices(1, 10) : Promise.resolve({ items: [] }),
      canViewPayments ? moneyRepository.getPayments(1, 10) : Promise.resolve({ items: [] }),
    ])
      .then(([invRes, payRes]) => {
        setInvoices(invRes.items || []);
        setPayments(payRes.items || []);
      })
      .catch(() => {
        setTablesError(t("money.error.description", { defaultValue: "Could not load recent records." }));
      })
      .finally(() => {
        setTablesLoading(false);
        setLoading(false);
      });
  }, [canViewReceivables, canViewPayments, dateFilter, t]);

  useEffect(() => {
    if (canViewReceivables && canViewPayments) {
      void loadAllData();
    } else if (!canViewReceivables && !canViewPayments) {
      setLoading(false);
    }
  }, [canViewReceivables, canViewPayments, loadAllData]);

  const outstandingInvoices = useMemo(() => {
    return invoices.filter((i) => i.outstandingAmount > 0);
  }, [invoices]);

  // Access denied for users without any finance permission
  if (!canViewReceivables && !canViewPayments) {
    return (
      <div className="space-y-6" dir={direction} data-testid="venue-money-denied">
        <EmptyState
          icon={Lock}
          title={t("money.permission.title", { defaultValue: "Finance access required" })}
          description={t("money.permission.description", {
            defaultValue: "You do not have permission to view Venue financial records.",
          })}
        />
      </div>
    );
  }

  // Intermediate state while redirecting single-permission users
  if ((canViewReceivables && !canViewPayments) || (!canViewReceivables && canViewPayments)) {
    return (
      <div className="flex h-64 items-center justify-center">
        <LoadingSpinner showText={false} />
      </div>
    );
  }

  return (
    <div className="space-y-6" dir={direction} data-testid="venue-money-landing">
      <VenueMoneyNav />

      {/* Header and Filter Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-nx-line/80 pb-5">
        <div>
          <PageHeader
            icon={CircleDollarSign}
            title={t("money.landing.title", { defaultValue: "Money & Commercials" })}
            description={t("money.landing.description", {
              defaultValue: "Invoice balances, receivables, and customer payments for your venue operations.",
            })}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Date Filter Pills */}
          <div className="flex items-center rounded-nx-md border border-nx-line bg-nx-surface p-0.5 text-xs">
            {(
              [
                ["today", t("money.landing.filters.today", { defaultValue: "Today" })],
                ["days7", t("money.landing.filters.days7", { defaultValue: "7 Days" })],
                ["days30", t("money.landing.filters.days30", { defaultValue: "30 Days" })],
                ["thisMonth", t("money.landing.filters.thisMonth", { defaultValue: "This Month" })],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setDateFilter(key)}
                className={`rounded-nx-sm px-2.5 py-1 font-medium transition-colors ${
                  dateFilter === key
                    ? "bg-nx-accent text-nx-surface font-semibold shadow-xs"
                    : "text-nx-ink-2 hover:text-nx-ink hover:bg-nx-hover"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => void loadAllData()}
            disabled={loading}
            className="h-8 gap-1.5 text-xs"
          >
            <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} aria-hidden="true" />
            <span>{t("money.retry", { defaultValue: "Refresh" })}</span>
          </Button>

          {canViewReceivables && (
            <Button asChild variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
              <Link href="/venue/money/receivables">
                <ReceiptText className="size-3.5" aria-hidden="true" />
                <span>{t("money.landing.viewReceivables", { defaultValue: "View Receivables" })}</span>
              </Link>
            </Button>
          )}

          {canViewPayments && (
            <Button asChild variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
              <Link href="/venue/money/payments">
                <CreditCard className="size-3.5" aria-hidden="true" />
                <span>{t("money.landing.viewPayments", { defaultValue: "View Payments" })}</span>
              </Link>
            </Button>
          )}

          {canRecordPayment && (
            <Button asChild size="sm" className="h-8 gap-1.5 font-semibold text-xs">
              <Link href="/venue/money/payments">
                <Plus className="size-3.5" aria-hidden="true" />
                <span>{t("money.landing.recordPayment", { defaultValue: "Record Payment" })}</span>
              </Link>
            </Button>
          )}
        </div>
      </div>

      {summaryError && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" aria-hidden="true" />
          <AlertDescription className="flex items-center justify-between">
            <span>{summaryError}</span>
            <Button variant="outline" size="sm" onClick={() => void loadAllData()} className="gap-1.5 h-7 text-xs">
              <RefreshCw className="size-3" aria-hidden="true" />
              <span>{t("money.retry", { defaultValue: "Retry" })}</span>
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* PRIMARY MONEY KPIS STRIP */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3.5">
        {/* 1. Commercial Value */}
        <Card className="p-3.5 border-nx-line/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-nx-ink-3 uppercase tracking-wider">
              {t("money.landing.kpis.commercialValue", { defaultValue: "Commercial Value" })}
            </span>
            <div className="p-1.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <TrendingUp className="size-3.5" aria-hidden="true" />
            </div>
          </div>
          <div className="mt-2">
            <p className="text-xl font-bold font-mono text-nx-ink">
              {formatMoney(summary?.commercialValue ?? 0, currency, language)}
            </p>
            <p className="text-[10px] text-nx-ink-3 mt-0.5">
              {t("money.landing.kpis.commercialValueNote", { defaultValue: "Period booking commitments" })}
            </p>
          </div>
        </Card>

        {/* 2. Collected */}
        <Card className="p-3.5 border-nx-line/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-nx-ink-3 uppercase tracking-wider">
              {t("money.landing.kpis.collected", { defaultValue: "Collected" })}
            </span>
            <div className="p-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Wallet className="size-3.5" aria-hidden="true" />
            </div>
          </div>
          <div className="mt-2">
            <p className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
              {formatMoney(summary?.collected ?? 0, currency, language)}
            </p>
            <p className="text-[10px] text-nx-ink-3 mt-0.5">
              {t("money.landing.kpis.collectedSubtitle", { defaultValue: "Operational cash collected" })}
            </p>
          </div>
        </Card>

        {/* 3. Collected Today */}
        <Card className="p-3.5 border-nx-line/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-nx-ink-3 uppercase tracking-wider">
              {t("money.landing.kpis.collectedToday", { defaultValue: "Collected Today" })}
            </span>
            <div className="p-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CreditCard className="size-3.5" aria-hidden="true" />
            </div>
          </div>
          <div className="mt-2">
            <p className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
              {formatMoney(summary?.collectedToday ?? 0, currency, language)}
            </p>
            <p className="text-[10px] text-nx-ink-3 mt-0.5">
              {t("money.landing.kpis.collectedTodaySubtitle", { defaultValue: "Cash inflow today" })}
            </p>
          </div>
        </Card>

        {/* 4. Outstanding */}
        <Card className="p-3.5 border-nx-line/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-nx-ink-3 uppercase tracking-wider">
              {t("money.landing.kpis.outstanding", { defaultValue: "Outstanding" })}
            </span>
            <div className="p-1.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Clock className="size-3.5" aria-hidden="true" />
            </div>
          </div>
          <div className="mt-2">
            <p className="text-xl font-bold font-mono text-amber-600 dark:text-amber-400">
              {formatMoney(summary?.outstanding ?? 0, currency, language)}
            </p>
            <p className="text-[10px] text-nx-ink-3 mt-0.5">
              {summary?.openReceivablesCount ?? 0} {t("money.landing.outstandingInvoices", { defaultValue: "open receivables" })}
            </p>
          </div>
        </Card>

        {/* 5. Refunds */}
        <Card className="p-3.5 border-nx-line/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-nx-ink-3 uppercase tracking-wider">
              {t("money.landing.kpis.refunds", { defaultValue: "Refunds" })}
            </span>
            <div className="p-1.5 rounded-full bg-slate-500/10 text-slate-600 dark:text-slate-400">
              <RotateCcw className="size-3.5" aria-hidden="true" />
            </div>
          </div>
          <div className="mt-2">
            <p className="text-xl font-bold font-mono text-nx-ink">
              {formatMoney(summary?.refunds ?? 0, currency, language)}
            </p>
            <p className="text-[10px] text-nx-ink-3 mt-0.5">
              {t("money.landing.kpis.refundsSubtitle", { defaultValue: "Explicit recorded refunds" })}
            </p>
          </div>
        </Card>

        {/* 6. Net Collected */}
        <Card className="p-3.5 border-nx-line/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-nx-ink-3 uppercase tracking-wider">
              {t("money.landing.kpis.netCollected", { defaultValue: "Net Collected" })}
            </span>
            <div className="p-1.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <ShieldCheck className="size-3.5" aria-hidden="true" />
            </div>
          </div>
          <div className="mt-2">
            <p className="text-xl font-bold font-mono text-nx-ink">
              {formatMoney(summary?.netCollected ?? 0, currency, language)}
            </p>
            <p className="text-[10px] text-nx-ink-3 mt-0.5">
              {t("money.landing.kpis.netCollectedSubtitle", { defaultValue: "Collected minus refunds" })}
            </p>
          </div>
        </Card>
      </div>

      {/* UNALLOCATED EXCEPTION BANNER */}
      {(summary?.unallocatedPaymentsCount ?? 0) > 0 && (
        <Alert variant="default" className="border-amber-500/40 bg-amber-500/10 text-amber-900 dark:text-amber-200">
          <AlertCircle className="size-4 text-amber-600 dark:text-amber-400" aria-hidden="true" />
          <AlertDescription className="flex items-center justify-between text-xs">
            <span>
              <strong>{summary?.unallocatedPaymentsCount}</strong>{" "}
              {t("money.landing.exceptions.unallocatedWarning", {
                defaultValue: "unallocated payment(s) require reconciliation to invoice balance.",
              })}
            </span>
            <Button asChild size="sm" variant="outline" className="h-7 text-xs border-amber-500/50">
              <Link href="/venue/money/payments">
                <span>{t("money.landing.tables.allocateAction", { defaultValue: "Allocate Existing Payment" })}</span>
              </Link>
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* PRIMARY FINANCIAL CHART: COMMERCIAL VALUE VS COLLECTED */}
      <Card className="border-nx-line/80 shadow-sm overflow-hidden">
        <CardHeader className="py-4 px-5 border-b border-nx-line/50 bg-nx-surfaceSubtle/30 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-nx-ink">
              <BarChart3 className="size-4 text-nx-accent" aria-hidden="true" />
              <span>{t("money.landing.chart.title", { defaultValue: "Commercial Value vs Collected" })}</span>
            </CardTitle>
            <CardDescription className="text-xs text-nx-ink-2 mt-0.5">
              {t("money.landing.chart.subtitle", {
                defaultValue: "Authoritative time series comparing period booking commitment against actual cash collection.",
              })}
            </CardDescription>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-blue-500" />
              <span className="font-medium text-nx-ink-2">{t("money.landing.chart.commercialLegend", { defaultValue: "Commercial Value" })}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-emerald-500" />
              <span className="font-medium text-nx-ink-2">{t("money.landing.chart.collectedLegend", { defaultValue: "Collected Cash" })}</span>
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-5">
          {trendLoading ? (
            <div className="flex h-48 items-center justify-center">
              <LoadingSpinner showText={false} />
            </div>
          ) : trendError ? (
            <div className="flex h-48 flex-col items-center justify-center gap-2 text-xs text-nx-ink-3">
              <p>{trendError}</p>
              <Button variant="outline" size="sm" onClick={() => void loadAllData()} className="h-7 text-xs">
                {t("money.retry", { defaultValue: "Retry" })}
              </Button>
            </div>
          ) : trendBuckets.length === 0 ? (
            <div className="flex h-48 items-center justify-center text-xs text-nx-ink-3 italic">
              {t("money.landing.chart.noData", { defaultValue: "No financial activity recorded in this period." })}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Responsive SVG Chart */}
              <div className="h-52 w-full flex items-end gap-1.5 pt-6 pb-2 px-2 border-b border-nx-line/50">
                {trendBuckets.map((bucket, i) => {
                  const maxVal = Math.max(
                    ...trendBuckets.map((b) => Math.max(b.commercialValue, b.collected, 1))
                  );
                  const commHeight = Math.max((bucket.commercialValue / maxVal) * 100, 2);
                  const collHeight = Math.max((bucket.collected / maxVal) * 100, 2);

                  return (
                    <div key={bucket.bucketLabel + i} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                      {/* Tooltip on hover */}
                      <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col z-20 bg-nx-surface p-2 rounded-nx-sm shadow-md border border-nx-line text-[10px] whitespace-nowrap">
                        <span className="font-bold text-nx-ink">{bucket.bucketLabel}</span>
                        <span className="text-blue-600 font-mono">
                          Commercial: {formatMoney(bucket.commercialValue, bucket.currencyCode, language)}
                        </span>
                        <span className="text-emerald-600 font-mono">
                          Collected: {formatMoney(bucket.collected, bucket.currencyCode, language)}
                        </span>
                        {bucket.refunds > 0 && (
                          <span className="text-slate-500 font-mono">
                            Refunds: {formatMoney(bucket.refunds, bucket.currencyCode, language)}
                          </span>
                        )}
                      </div>

                      {/* Dual Bars */}
                      <div className="w-full flex items-end justify-center gap-0.5 h-full">
                        <div
                          className="w-1/2 max-w-[12px] bg-blue-500/80 hover:bg-blue-600 rounded-t-xs transition-all"
                          style={{ height: `${commHeight}%` }}
                        />
                        <div
                          className="w-1/2 max-w-[12px] bg-emerald-500/80 hover:bg-emerald-600 rounded-t-xs transition-all"
                          style={{ height: `${collHeight}%` }}
                        />
                      </div>

                      {/* Label on every few items depending on count */}
                      {(trendBuckets.length <= 10 || i % Math.ceil(trendBuckets.length / 8) === 0) && (
                        <span className="text-[9px] text-nx-ink-3 mt-1 font-mono truncate max-w-full">
                          {bucket.bucketLabel.includes("-") ? bucket.bucketLabel.slice(5) : bucket.bucketLabel}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* TWO INSIGHT PANELS: COURT PERFORMANCE & TIME OF DAY */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Performance by Court / Space */}
        <Card className="border-nx-line/80 shadow-xs flex flex-col justify-between">
          <div>
            <CardHeader className="py-3 px-4 border-b border-nx-line/50 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xs font-bold text-nx-ink">
                  {t("money.landing.byCourt.title", { defaultValue: "Performance by Court / Space" })}
                </CardTitle>
                <CardDescription className="text-[11px] text-nx-ink-3 mt-0.5">
                  {t("money.landing.byCourt.subtitle", { defaultValue: "Ranked by generated booking value" })}
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-[10px] font-mono">
                {resourcePerformance.length} courts
              </Badge>
            </CardHeader>
            <CardContent className="p-4">
              {resourceLoading ? (
                <div className="flex h-36 items-center justify-center">
                  <LoadingSpinner showText={false} />
                </div>
              ) : resourceError ? (
                <div className="text-center py-6 text-xs text-nx-ink-3">{resourceError}</div>
              ) : resourcePerformance.length === 0 ? (
                <div className="text-center py-8 text-xs text-nx-ink-3 italic">
                  {t("money.landing.byCourt.noData", { defaultValue: "No court activity recorded for this period." })}
                </div>
              ) : (
                <div className="space-y-2">
                  {resourcePerformance.slice(0, 5).map((r, i) => (
                    <div
                      key={r.resourceId}
                      className="p-2.5 rounded-nx-sm bg-nx-surfaceSubtle border border-nx-line/50 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold font-mono text-nx-ink-3 text-[11px]">#{i + 1}</span>
                        <div>
                          <p className="font-semibold text-nx-ink truncate max-w-[140px]">
                            Court {r.resourceId.slice(0, 8)}
                          </p>
                          <p className="text-[10px] text-nx-ink-3">
                            {r.invoiceCount} invoices • {r.paymentCount} payments
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold font-mono text-nx-ink">
                          {formatMoney(r.commercialValue, r.currencyCode, language)}
                        </p>
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
                          {formatMoney(r.collected, r.currencyCode, language)} collected
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </div>
        </Card>

        {/* Business by Time of Day */}
        <Card className="border-nx-line/80 shadow-xs flex flex-col justify-between">
          <div>
            <CardHeader className="py-3 px-4 border-b border-nx-line/50 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xs font-bold text-nx-ink">
                  {t("money.landing.byTime.title", { defaultValue: "Revenue by Time of Day" })}
                </CardTitle>
                <CardDescription className="text-[11px] text-nx-ink-3 mt-0.5">
                  {t("money.landing.byTime.subtitle", { defaultValue: "Hourly service demand distribution" })}
                </CardDescription>
              </div>
              <Clock className="size-3.5 text-nx-ink-3" aria-hidden="true" />
            </CardHeader>
            <CardContent className="p-4">
              {timeLoading ? (
                <div className="flex h-36 items-center justify-center">
                  <LoadingSpinner showText={false} />
                </div>
              ) : timeError ? (
                <div className="text-center py-6 text-xs text-nx-ink-3">{timeError}</div>
              ) : timeOfDayBuckets.length === 0 ? (
                <div className="text-center py-8 text-xs text-nx-ink-3 italic">
                  {t("money.landing.byTime.noData", { defaultValue: "No booking activity recorded for this period." })}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {timeOfDayBuckets.slice(0, 8).map((slot) => {
                    const maxSlot = Math.max(...timeOfDayBuckets.map((s) => s.commercialValue), 1);
                    const pct = Math.round((slot.commercialValue / maxSlot) * 100);
                    return (
                      <div
                        key={slot.timeWindow}
                        className="p-2 rounded-nx-sm bg-nx-surfaceSubtle border border-nx-line/50 text-center"
                      >
                        <p className="font-semibold text-nx-ink text-[11px] font-mono">{slot.timeWindow}</p>
                        <p className="text-xs font-bold text-nx-ink font-mono mt-1">
                          {formatMoney(slot.commercialValue, slot.currencyCode, language)}
                        </p>
                        <div className="w-full bg-nx-line/50 rounded-full h-1 mt-1.5 overflow-hidden">
                          <div className="bg-blue-500 h-1 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <p className="text-[9px] text-nx-ink-3 mt-1">{slot.bookingCount} bookings</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </div>
        </Card>
      </div>

      {/* PAYMENT METHODS BREAKDOWN */}
      <Card className="border-nx-line/80 shadow-xs">
        <CardHeader className="py-3 px-4 border-b border-nx-line/50">
          <CardTitle className="text-xs font-bold text-nx-ink flex items-center justify-between">
            <span>{t("money.landing.paymentMethods.title", { defaultValue: "Payment Methods Breakdown" })}</span>
            <span className="text-[11px] font-normal text-nx-ink-3 font-mono">
              {paymentMethods.reduce((sum, m) => sum + m.count, 0)} total payments
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {methodsLoading ? (
            <div className="flex h-24 items-center justify-center">
              <LoadingSpinner showText={false} />
            </div>
          ) : methodsError ? (
            <div className="text-center py-4 text-xs text-nx-ink-3">{methodsError}</div>
          ) : paymentMethods.length === 0 ? (
            <div className="text-center py-6 text-xs text-nx-ink-3 italic">
              {t("money.landing.paymentMethods.noPayments", { defaultValue: "No payments recorded in this period." })}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {paymentMethods.map((m) => (
                <div key={m.method} className="p-2.5 rounded-nx-md bg-nx-surfaceSubtle border border-nx-line/50 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-nx-ink">{m.method}</span>
                    <span className="text-[10px] text-nx-ink-3 font-mono">{m.percentage}%</span>
                  </div>
                  <p className="text-sm font-bold font-mono text-nx-ink">
                    {formatMoney(m.amount, m.currencyCode, language)}
                  </p>
                  <div className="w-full bg-nx-line/60 rounded-full h-1 overflow-hidden">
                    <div className="bg-nx-accent h-1 rounded-full" style={{ width: `${Math.min(m.percentage, 100)}%` }} />
                  </div>
                  <p className="text-[10px] text-nx-ink-3">{m.count} transactions</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ACTIONABLE OPERATIONAL TABLES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Outstanding Receivables Table */}
        <Card className="border-nx-line/80 shadow-xs flex flex-col justify-between">
          <div>
            <CardHeader className="py-3 px-4 border-b border-nx-line/50 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xs font-bold text-nx-ink flex items-center gap-1.5">
                  <ReceiptText className="size-3.5 text-blue-600" aria-hidden="true" />
                  <span>{t("money.landing.tables.outstandingTitle", { defaultValue: "Outstanding Receivables" })}</span>
                </CardTitle>
                <CardDescription className="text-[11px] text-nx-ink-3 mt-0.5">
                  {outstandingInvoices.length} active invoices with balances
                </CardDescription>
              </div>
              <Button asChild variant="ghost" size="sm" className="h-7 text-xs text-nx-accent gap-1">
                <Link href="/venue/money/receivables">
                  <span>{t("money.landing.tables.viewAllReceivables", { defaultValue: "View All" })}</span>
                  <ArrowRight className="size-3 rtl:rotate-180" aria-hidden="true" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {tablesLoading ? (
                <div className="flex h-36 items-center justify-center">
                  <LoadingSpinner showText={false} />
                </div>
              ) : tablesError ? (
                <div className="p-6 text-center text-xs text-nx-ink-3">{tablesError}</div>
              ) : outstandingInvoices.length === 0 ? (
                <div className="p-6 text-center text-xs text-nx-ink-3">
                  <CheckCircle2 className="size-6 text-emerald-600 mx-auto mb-1.5" aria-hidden="true" />
                  <span>{t("money.landing.tables.noOutstanding", { defaultValue: "All visible invoices settled." })}</span>
                </div>
              ) : (
                <div className="divide-y divide-nx-line/50 text-xs">
                  {outstandingInvoices.slice(0, 5).map((inv) => (
                    <div key={inv.id} className="p-3 flex items-center justify-between gap-3 hover:bg-nx-hover">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-nx-ink truncate font-mono">{inv.invoiceNumber}</span>
                          <Badge variant="outline" className="text-[10px] px-1 py-0">
                            {inv.status}
                          </Badge>
                        </div>
                        <p className="text-[10px] text-nx-ink-3 mt-0.5">
                          Total: {formatMoney(inv.effectiveTotalAmount, inv.currencyCode, language)} • Paid:{" "}
                          {formatMoney(inv.paidAmount, inv.currencyCode, language)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold font-mono text-amber-600 dark:text-amber-400">
                          {formatMoney(inv.outstandingAmount, inv.currencyCode, language)}
                        </p>
                        {canRecordPayment && (
                          <Button asChild variant="outline" size="sm" className="h-6 text-[10px] mt-1 px-2">
                            <Link href="/venue/money/payments">
                              <span>{t("money.landing.tables.recordPaymentAction", { defaultValue: "Record Payment" })}</span>
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </div>
        </Card>

        {/* Recent Payments Table */}
        <Card className="border-nx-line/80 shadow-xs flex flex-col justify-between">
          <div>
            <CardHeader className="py-3 px-4 border-b border-nx-line/50 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xs font-bold text-nx-ink flex items-center gap-1.5">
                  <CreditCard className="size-3.5 text-emerald-600" aria-hidden="true" />
                  <span>{t("money.landing.tables.recentPaymentsTitle", { defaultValue: "Recent Payments" })}</span>
                </CardTitle>
                <CardDescription className="text-[11px] text-nx-ink-3 mt-0.5">
                  {payments.length} operational transactions
                </CardDescription>
              </div>
              <Button asChild variant="ghost" size="sm" className="h-7 text-xs text-nx-accent gap-1">
                <Link href="/venue/money/payments">
                  <span>{t("money.landing.tables.viewAllPayments", { defaultValue: "View All" })}</span>
                  <ArrowRight className="size-3 rtl:rotate-180" aria-hidden="true" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {tablesLoading ? (
                <div className="flex h-36 items-center justify-center">
                  <LoadingSpinner showText={false} />
                </div>
              ) : tablesError ? (
                <div className="p-6 text-center text-xs text-nx-ink-3">{tablesError}</div>
              ) : payments.length === 0 ? (
                <div className="p-6 text-center text-xs text-nx-ink-3">
                  <span>{t("money.landing.tables.noPayments", { defaultValue: "No recent payments recorded." })}</span>
                </div>
              ) : (
                <div className="divide-y divide-nx-line/50 text-xs">
                  {payments.slice(0, 5).map((pay) => (
                    <div key={pay.id} className="p-3 flex items-center justify-between gap-3 hover:bg-nx-hover">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-nx-ink truncate font-mono">{pay.paymentNumber}</span>
                          <span className="text-[10px] text-nx-ink-3">• {pay.method}</span>
                          {pay.unallocatedAmount > 0 && (
                            <Badge variant="warning" className="text-[9px] px-1 py-0">
                              {t("money.landing.tables.unallocated", { defaultValue: "Unallocated" })}
                            </Badge>
                          )}
                        </div>
                        <p className="text-[10px] text-nx-ink-3 mt-0.5">
                          {formatDate(pay.recordedAtUtc, language)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold font-mono text-emerald-600 dark:text-emerald-400">
                          {formatMoney(pay.amount, pay.currencyCode, language)}
                        </p>
                        {pay.unallocatedAmount > 0 && canUpdateAllocations && (
                          <Button asChild variant="outline" size="sm" className="h-6 text-[10px] mt-1 px-2 border-amber-500/50">
                            <Link href="/venue/money/payments">
                              <span>{t("money.landing.tables.allocateAction", { defaultValue: "Allocate" })}</span>
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </div>
        </Card>
      </div>
    </div>
  );
}
