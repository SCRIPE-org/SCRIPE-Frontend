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

function getDateRange(range: DateRangeFilter): {
  from?: string;
  to?: string;
  interval: "hour" | "day";
} {
  const now = new Date();
  const to = now.toISOString();

  if (range === "today") {
    const startOfDay = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0)
    );
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
        setSummaryError(
          t("money.error.description", { defaultValue: "Could not load summary metrics." })
        );
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
        setResourceError(
          t("money.error.description", { defaultValue: "Could not load court performance." })
        );
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
        setTimeError(
          t("money.error.description", { defaultValue: "Could not load time breakdown." })
        );
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
        setMethodsError(
          t("money.error.description", { defaultValue: "Could not load payment methods." })
        );
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
        setTablesError(
          t("money.error.description", { defaultValue: "Could not load recent records." })
        );
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
      <div className="border-nx-line/80 flex flex-col justify-between gap-4 border-b pb-5 md:flex-row md:items-center">
        <div>
          <PageHeader
            icon={CircleDollarSign}
            title={t("money.landing.title", { defaultValue: "Money & Commercials" })}
            description={t("money.landing.description", {
              defaultValue:
                "Invoice balances, receivables, and customer payments for your venue operations.",
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
                    ? "shadow-xs bg-nx-accent font-semibold text-nx-surface"
                    : "text-nx-ink-2 hover:bg-nx-hover hover:text-nx-ink"
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
                <span>
                  {t("money.landing.viewReceivables", { defaultValue: "View Receivables" })}
                </span>
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
            <Button asChild size="sm" className="h-8 gap-1.5 text-xs font-semibold">
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => void loadAllData()}
              className="h-7 gap-1.5 text-xs"
            >
              <RefreshCw className="size-3" aria-hidden="true" />
              <span>{t("money.retry", { defaultValue: "Retry" })}</span>
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* PRIMARY MONEY KPIS STRIP */}
      <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-6">
        {/* 1. Commercial Value */}
        <Card className="border-nx-line/80 shadow-xs flex flex-col justify-between p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-nx-ink-3">
              {t("money.landing.kpis.commercialValue", { defaultValue: "Commercial Value" })}
            </span>
            <div className="bg-nx-accent/10 rounded-full p-1.5 text-nx-accent">
              <TrendingUp className="size-3.5" aria-hidden="true" />
            </div>
          </div>
          <div className="mt-2">
            <p className="font-mono text-xl font-bold text-nx-ink">
              {formatMoney(summary?.commercialValue ?? 0, currency, language)}
            </p>
            <p className="mt-0.5 text-[10px] text-nx-ink-3">
              {t("money.landing.kpis.commercialValueNote", {
                defaultValue: "Period booking commitments",
              })}
            </p>
          </div>
        </Card>

        {/* 2. Collected */}
        <Card className="border-nx-line/80 shadow-xs flex flex-col justify-between p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-nx-ink-3">
              {t("money.landing.kpis.collected", { defaultValue: "Collected" })}
            </span>
            <div className="rounded-full bg-emerald-500/10 p-1.5 text-emerald-600 dark:text-emerald-400">
              <Wallet className="size-3.5" aria-hidden="true" />
            </div>
          </div>
          <div className="mt-2">
            <p className="font-mono text-xl font-bold text-emerald-600 dark:text-emerald-400">
              {formatMoney(summary?.collected ?? 0, currency, language)}
            </p>
            <p className="mt-0.5 text-[10px] text-nx-ink-3">
              {t("money.landing.kpis.collectedSubtitle", {
                defaultValue: "Operational cash collected",
              })}
            </p>
          </div>
        </Card>

        {/* 3. Collected Today */}
        <Card className="border-nx-line/80 shadow-xs flex flex-col justify-between p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-nx-ink-3">
              {t("money.landing.kpis.collectedToday", { defaultValue: "Collected Today" })}
            </span>
            <div className="rounded-full bg-emerald-500/10 p-1.5 text-emerald-600 dark:text-emerald-400">
              <CreditCard className="size-3.5" aria-hidden="true" />
            </div>
          </div>
          <div className="mt-2">
            <p className="font-mono text-xl font-bold text-emerald-600 dark:text-emerald-400">
              {formatMoney(summary?.collectedToday ?? 0, currency, language)}
            </p>
            <p className="mt-0.5 text-[10px] text-nx-ink-3">
              {t("money.landing.kpis.collectedTodaySubtitle", {
                defaultValue: "Cash inflow today",
              })}
            </p>
          </div>
        </Card>

        {/* 4. Outstanding */}
        <Card className="border-nx-line/80 shadow-xs flex flex-col justify-between p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-nx-ink-3">
              {t("money.landing.kpis.outstanding", { defaultValue: "Outstanding" })}
            </span>
            <div className="rounded-full bg-amber-500/10 p-1.5 text-amber-600 dark:text-amber-400">
              <Clock className="size-3.5" aria-hidden="true" />
            </div>
          </div>
          <div className="mt-2">
            <p className="font-mono text-xl font-bold text-amber-600 dark:text-amber-400">
              {formatMoney(summary?.outstanding ?? 0, currency, language)}
            </p>
            <p className="mt-0.5 text-[10px] text-nx-ink-3">
              {summary?.openReceivablesCount ?? 0}{" "}
              {t("money.landing.outstandingInvoices", { defaultValue: "open receivables" })}
            </p>
          </div>
        </Card>

        {/* 5. Refunds */}
        <Card className="border-nx-line/80 shadow-xs flex flex-col justify-between p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-nx-ink-3">
              {t("money.landing.kpis.refunds", { defaultValue: "Refunds" })}
            </span>
            <div className="rounded-full bg-slate-500/10 p-1.5 text-slate-600 dark:text-slate-400">
              <RotateCcw className="size-3.5" aria-hidden="true" />
            </div>
          </div>
          <div className="mt-2">
            <p className="font-mono text-xl font-bold text-nx-ink">
              {formatMoney(summary?.refunds ?? 0, currency, language)}
            </p>
            <p className="mt-0.5 text-[10px] text-nx-ink-3">
              {t("money.landing.kpis.refundsSubtitle", {
                defaultValue: "Explicit recorded refunds",
              })}
            </p>
          </div>
        </Card>

        {/* 6. Net Collected */}
        <Card className="border-nx-line/80 shadow-xs flex flex-col justify-between p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-nx-ink-3">
              {t("money.landing.kpis.netCollected", { defaultValue: "Net Collected" })}
            </span>
            <div className="rounded-full bg-purple-500/10 p-1.5 text-purple-600 dark:text-purple-400">
              <ShieldCheck className="size-3.5" aria-hidden="true" />
            </div>
          </div>
          <div className="mt-2">
            <p className="font-mono text-xl font-bold text-nx-ink">
              {formatMoney(summary?.netCollected ?? 0, currency, language)}
            </p>
            <p className="mt-0.5 text-[10px] text-nx-ink-3">
              {t("money.landing.kpis.netCollectedSubtitle", {
                defaultValue: "Collected minus refunds",
              })}
            </p>
          </div>
        </Card>
      </div>

      {/* UNALLOCATED EXCEPTION BANNER */}
      {(summary?.unallocatedPaymentsCount ?? 0) > 0 && (
        <Alert
          variant="default"
          className="border-amber-500/40 bg-amber-500/10 text-amber-900 dark:text-amber-200"
        >
          <AlertCircle className="size-4 text-amber-600 dark:text-amber-400" aria-hidden="true" />
          <AlertDescription className="flex items-center justify-between text-xs">
            <span>
              <strong>{summary?.unallocatedPaymentsCount}</strong>{" "}
              {t("money.landing.exceptions.unallocatedWarning", {
                defaultValue: "unallocated payment(s) require reconciliation to invoice balance.",
              })}
            </span>
            <Button asChild size="sm" variant="outline" className="h-7 border-amber-500/50 text-xs">
              <Link href="/venue/money/payments">
                <span>
                  {t("money.landing.tables.allocateAction", {
                    defaultValue: "Allocate Existing Payment",
                  })}
                </span>
              </Link>
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* PRIMARY FINANCIAL CHART: COMMERCIAL VALUE VS COLLECTED */}
      <Card className="border-nx-line/80 overflow-hidden shadow-sm">
        <CardHeader className="border-nx-line/50 bg-nx-surfaceSubtle/30 flex flex-row items-center justify-between border-b px-5 py-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-sm font-bold text-nx-ink">
              <BarChart3 className="size-4 text-nx-accent" aria-hidden="true" />
              <span>
                {t("money.landing.chart.title", { defaultValue: "Commercial Value vs Collected" })}
              </span>
            </CardTitle>
            <CardDescription className="mt-0.5 text-xs text-nx-ink-2">
              {t("money.landing.chart.subtitle", {
                defaultValue:
                  "Authoritative time series comparing period booking commitment against actual cash collection.",
              })}
            </CardDescription>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-blue-500" />
              <span className="font-medium text-nx-ink-2">
                {t("money.landing.chart.commercialLegend", { defaultValue: "Commercial Value" })}
              </span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-emerald-500" />
              <span className="font-medium text-nx-ink-2">
                {t("money.landing.chart.collectedLegend", { defaultValue: "Collected Cash" })}
              </span>
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
              <Button
                variant="outline"
                size="sm"
                onClick={() => void loadAllData()}
                className="h-7 text-xs"
              >
                {t("money.retry", { defaultValue: "Retry" })}
              </Button>
            </div>
          ) : trendBuckets.length === 0 ? (
            <div className="flex h-48 items-center justify-center text-xs italic text-nx-ink-3">
              {t("money.landing.chart.noData", {
                defaultValue: "No financial activity recorded in this period.",
              })}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Responsive SVG Chart */}
              <div className="border-nx-line/50 flex h-52 w-full items-end gap-1.5 border-b px-2 pb-2 pt-6">
                {trendBuckets.map((bucket, i) => {
                  const maxVal = Math.max(
                    ...trendBuckets.map((b) => Math.max(b.commercialValue, b.collected, 1))
                  );
                  const commHeight = Math.max((bucket.commercialValue / maxVal) * 100, 2);
                  const collHeight = Math.max((bucket.collected / maxVal) * 100, 2);

                  return (
                    <div
                      key={bucket.bucketLabel + i}
                      className="group relative flex h-full flex-1 flex-col items-center justify-end"
                    >
                      {/* Tooltip on hover */}
                      <div className="absolute bottom-full z-20 mb-2 hidden flex-col whitespace-nowrap rounded-nx-sm border border-nx-line bg-nx-surface p-2 text-[10px] shadow-md group-hover:flex">
                        <span className="font-bold text-nx-ink">{bucket.bucketLabel}</span>
                        <span className="font-mono text-nx-accent">
                          Commercial:{" "}
                          {formatMoney(bucket.commercialValue, bucket.currencyCode, language)}
                        </span>
                        <span className="font-mono text-emerald-600">
                          Collected: {formatMoney(bucket.collected, bucket.currencyCode, language)}
                        </span>
                        {bucket.refunds > 0 && (
                          <span className="font-mono text-nx-ink-3">
                            Refunds: {formatMoney(bucket.refunds, bucket.currencyCode, language)}
                          </span>
                        )}
                      </div>

                      {/* Dual Bars */}
                      <div className="flex h-full w-full items-end justify-center gap-0.5">
                        <div
                          className="bg-nx-accent/80 rounded-t-xs w-1/2 max-w-[12px] transition-all hover:bg-nx-accent"
                          style={{ height: `${commHeight}%` }}
                        />
                        <div
                          className="rounded-t-xs w-1/2 max-w-[12px] bg-emerald-500/80 transition-all hover:bg-emerald-600"
                          style={{ height: `${collHeight}%` }}
                        />
                      </div>

                      {/* Label on every few items depending on count */}
                      {(trendBuckets.length <= 10 ||
                        i % Math.ceil(trendBuckets.length / 8) === 0) && (
                        <span className="mt-1 max-w-full truncate font-mono text-[9px] text-nx-ink-3">
                          {bucket.bucketLabel.includes("-")
                            ? bucket.bucketLabel.slice(5)
                            : bucket.bucketLabel}
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
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Performance by Court / Space */}
        <Card className="border-nx-line/80 shadow-xs flex flex-col justify-between">
          <div>
            <CardHeader className="border-nx-line/50 flex flex-row items-center justify-between border-b px-4 py-3">
              <div>
                <CardTitle className="text-xs font-bold text-nx-ink">
                  {t("money.landing.byCourt.title", {
                    defaultValue: "Performance by Court / Space",
                  })}
                </CardTitle>
                <CardDescription className="mt-0.5 text-[11px] text-nx-ink-3">
                  {t("money.landing.byCourt.subtitle", {
                    defaultValue: "Ranked by generated booking value",
                  })}
                </CardDescription>
              </div>
              <Badge variant="outline" className="font-mono text-[10px]">
                {resourcePerformance.length} courts
              </Badge>
            </CardHeader>
            <CardContent className="p-4">
              {resourceLoading ? (
                <div className="flex h-36 items-center justify-center">
                  <LoadingSpinner showText={false} />
                </div>
              ) : resourceError ? (
                <div className="py-6 text-center text-xs text-nx-ink-3">{resourceError}</div>
              ) : resourcePerformance.length === 0 ? (
                <div className="py-8 text-center text-xs italic text-nx-ink-3">
                  {t("money.landing.byCourt.noData", {
                    defaultValue: "No court activity recorded for this period.",
                  })}
                </div>
              ) : (
                <div className="space-y-2">
                  {resourcePerformance.slice(0, 5).map((r, i) => (
                    <div
                      key={r.resourceId}
                      className="bg-nx-surfaceSubtle border-nx-line/50 flex items-center justify-between rounded-nx-sm border p-2.5 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] font-bold text-nx-ink-3">
                          #{i + 1}
                        </span>
                        <div>
                          <p className="max-w-[140px] truncate font-semibold text-nx-ink">
                            Court {r.resourceId.slice(0, 8)}
                          </p>
                          <p className="text-[10px] text-nx-ink-3">
                            {r.invoiceCount} invoices • {r.paymentCount} payments
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-mono font-bold text-nx-ink">
                          {formatMoney(r.commercialValue, r.currencyCode, language)}
                        </p>
                        <p className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400">
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
            <CardHeader className="border-nx-line/50 flex flex-row items-center justify-between border-b px-4 py-3">
              <div>
                <CardTitle className="text-xs font-bold text-nx-ink">
                  {t("money.landing.byTime.title", { defaultValue: "Revenue by Time of Day" })}
                </CardTitle>
                <CardDescription className="mt-0.5 text-[11px] text-nx-ink-3">
                  {t("money.landing.byTime.subtitle", {
                    defaultValue: "Hourly service demand distribution",
                  })}
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
                <div className="py-6 text-center text-xs text-nx-ink-3">{timeError}</div>
              ) : timeOfDayBuckets.length === 0 ? (
                <div className="py-8 text-center text-xs italic text-nx-ink-3">
                  {t("money.landing.byTime.noData", {
                    defaultValue: "No booking activity recorded for this period.",
                  })}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {timeOfDayBuckets.slice(0, 8).map((slot) => {
                    const maxSlot = Math.max(...timeOfDayBuckets.map((s) => s.commercialValue), 1);
                    const pct = Math.round((slot.commercialValue / maxSlot) * 100);
                    return (
                      <div
                        key={slot.timeWindow}
                        className="bg-nx-surfaceSubtle border-nx-line/50 rounded-nx-sm border p-2 text-center"
                      >
                        <p className="font-mono text-[11px] font-semibold text-nx-ink">
                          {slot.timeWindow}
                        </p>
                        <p className="mt-1 font-mono text-xs font-bold text-nx-ink">
                          {formatMoney(slot.commercialValue, slot.currencyCode, language)}
                        </p>
                        <div className="bg-nx-line/50 mt-1.5 h-1 w-full overflow-hidden rounded-full">
                          <div
                            className="h-1 rounded-full bg-blue-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <p className="mt-1 text-[9px] text-nx-ink-3">
                          {slot.bookingCount} bookings
                        </p>
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
        <CardHeader className="border-nx-line/50 border-b px-4 py-3">
          <CardTitle className="flex items-center justify-between text-xs font-bold text-nx-ink">
            <span>
              {t("money.landing.paymentMethods.title", {
                defaultValue: "Payment Methods Breakdown",
              })}
            </span>
            <span className="font-mono text-[11px] font-normal text-nx-ink-3">
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
            <div className="py-4 text-center text-xs text-nx-ink-3">{methodsError}</div>
          ) : paymentMethods.length === 0 ? (
            <div className="py-6 text-center text-xs italic text-nx-ink-3">
              {t("money.landing.paymentMethods.noPayments", {
                defaultValue: "No payments recorded in this period.",
              })}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              {paymentMethods.map((m) => (
                <div
                  key={m.method}
                  className="bg-nx-surfaceSubtle border-nx-line/50 space-y-1.5 rounded-nx-md border p-2.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-nx-ink">{m.method}</span>
                    <span className="font-mono text-[10px] text-nx-ink-3">{m.percentage}%</span>
                  </div>
                  <p className="font-mono text-sm font-bold text-nx-ink">
                    {formatMoney(m.amount, m.currencyCode, language)}
                  </p>
                  <div className="bg-nx-line/60 h-1 w-full overflow-hidden rounded-full">
                    <div
                      className="h-1 rounded-full bg-nx-accent"
                      style={{ width: `${Math.min(m.percentage, 100)}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-nx-ink-3">{m.count} transactions</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ACTIONABLE OPERATIONAL TABLES */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Outstanding Receivables Table */}
        <Card className="border-nx-line/80 shadow-xs flex flex-col justify-between">
          <div>
            <CardHeader className="border-nx-line/50 flex flex-row items-center justify-between border-b px-4 py-3">
              <div>
                <CardTitle className="flex items-center gap-1.5 text-xs font-bold text-nx-ink">
                  <ReceiptText className="size-3.5 text-nx-accent" aria-hidden="true" />
                  <span>
                    {t("money.landing.tables.outstandingTitle", {
                      defaultValue: "Outstanding Receivables",
                    })}
                  </span>
                </CardTitle>
                <CardDescription className="mt-0.5 text-[11px] text-nx-ink-3">
                  {outstandingInvoices.length} active invoices with balances
                </CardDescription>
              </div>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="h-7 gap-1 text-xs text-nx-accent"
              >
                <Link href="/venue/money/receivables">
                  <span>
                    {t("money.landing.tables.viewAllReceivables", { defaultValue: "View All" })}
                  </span>
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
                  <CheckCircle2
                    className="mx-auto mb-1.5 size-6 text-emerald-600"
                    aria-hidden="true"
                  />
                  <span>
                    {t("money.landing.tables.noOutstanding", {
                      defaultValue: "All visible invoices settled.",
                    })}
                  </span>
                </div>
              ) : (
                <div className="divide-nx-line/50 divide-y text-xs">
                  {outstandingInvoices.slice(0, 5).map((inv) => (
                    <div
                      key={inv.id}
                      className="flex items-center justify-between gap-3 p-3 hover:bg-nx-hover"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate font-mono font-semibold text-nx-ink">
                            {inv.invoiceNumber}
                          </span>
                          <Badge variant="outline" className="px-1 py-0 text-[10px]">
                            {inv.status}
                          </Badge>
                        </div>
                        <p className="mt-0.5 text-[10px] text-nx-ink-3">
                          Total: {formatMoney(inv.effectiveTotalAmount, inv.currencyCode, language)}{" "}
                          • Paid: {formatMoney(inv.paidAmount, inv.currencyCode, language)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono font-bold text-amber-600 dark:text-amber-400">
                          {formatMoney(inv.outstandingAmount, inv.currencyCode, language)}
                        </p>
                        {canRecordPayment && (
                          <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="mt-1 h-6 px-2 text-[10px]"
                          >
                            <Link href="/venue/money/payments">
                              <span>
                                {t("money.landing.tables.recordPaymentAction", {
                                  defaultValue: "Record Payment",
                                })}
                              </span>
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
            <CardHeader className="border-nx-line/50 flex flex-row items-center justify-between border-b px-4 py-3">
              <div>
                <CardTitle className="flex items-center gap-1.5 text-xs font-bold text-nx-ink">
                  <CreditCard className="size-3.5 text-emerald-600" aria-hidden="true" />
                  <span>
                    {t("money.landing.tables.recentPaymentsTitle", {
                      defaultValue: "Recent Payments",
                    })}
                  </span>
                </CardTitle>
                <CardDescription className="mt-0.5 text-[11px] text-nx-ink-3">
                  {payments.length} operational transactions
                </CardDescription>
              </div>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="h-7 gap-1 text-xs text-nx-accent"
              >
                <Link href="/venue/money/payments">
                  <span>
                    {t("money.landing.tables.viewAllPayments", { defaultValue: "View All" })}
                  </span>
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
                  <span>
                    {t("money.landing.tables.noPayments", {
                      defaultValue: "No recent payments recorded.",
                    })}
                  </span>
                </div>
              ) : (
                <div className="divide-nx-line/50 divide-y text-xs">
                  {payments.slice(0, 5).map((pay) => (
                    <div
                      key={pay.id}
                      className="flex items-center justify-between gap-3 p-3 hover:bg-nx-hover"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate font-mono font-semibold text-nx-ink">
                            {pay.paymentNumber}
                          </span>
                          <span className="text-[10px] text-nx-ink-3">• {pay.method}</span>
                          {pay.unallocatedAmount > 0 && (
                            <Badge variant="warning" className="px-1 py-0 text-[9px]">
                              {t("money.landing.tables.unallocated", {
                                defaultValue: "Unallocated",
                              })}
                            </Badge>
                          )}
                        </div>
                        <p className="mt-0.5 text-[10px] text-nx-ink-3">
                          {formatDate(pay.recordedAtUtc, language)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          {formatMoney(pay.amount, pay.currencyCode, language)}
                        </p>
                        {pay.unallocatedAmount > 0 && canUpdateAllocations && (
                          <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="mt-1 h-6 border-amber-500/50 px-2 text-[10px]"
                          >
                            <Link href="/venue/money/payments">
                              <span>
                                {t("money.landing.tables.allocateAction", {
                                  defaultValue: "Allocate",
                                })}
                              </span>
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
