"use client";

import { useState, useCallback, useEffect } from "react";
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

export type DateRangeFilter = "today" | "days7" | "days30" | "thisMonth" | "custom";

export interface DailyShiftChannelSummary {
  key: "Cash" | "Card" | "BankTransfer";
  amount: number;
  count: number;
  percentage: number;
}

/**
 * Computes UTC date bounds and aggregation interval for a quick-select range filter.
 */
export function getDateRange(range: DateRangeFilter): {
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

/**
 * Aggregates payment method metrics into daily shift operational buckets.
 */
export function aggregateDailyShiftChannels(
  paymentMethods: MoneyPaymentMethodItem[]
): DailyShiftChannelSummary[] {
  const definitions: Array<{
    key: DailyShiftChannelSummary["key"];
    predicate: (pm: MoneyPaymentMethodItem) => boolean;
  }> = [
    {
      key: "Cash",
      predicate: (pm) => pm.method.toLowerCase() === "cash",
    },
    {
      key: "Card",
      predicate: (pm) => {
        const method = pm.method.toLowerCase();
        return method === "card" || method === "pos";
      },
    },
    {
      key: "BankTransfer",
      predicate: (pm) => {
        const method = pm.method.toLowerCase();
        return method.includes("bank") || method === "banktransfer";
      },
    },
  ];

  return definitions.map(({ key, predicate }) => {
    const matching = paymentMethods.filter(predicate);
    return {
      key,
      amount: matching.reduce((sum, item) => sum + item.amount, 0),
      count: matching.reduce((sum, item) => sum + item.count, 0),
      percentage: Math.round(matching.reduce((sum, item) => sum + item.percentage, 0)),
    };
  });
}

export interface UseMoneyLandingViewModelOptions {
  canViewReceivables: boolean;
  canViewPayments: boolean;
  errorDescriptionMessage: string;
}

/**
 * ViewModel for MoneyLandingView.
 * Encapsulates financial telemetry, trends, breakdowns, and recent invoices/payments via DI.
 */
export function useMoneyLandingViewModel(options: UseMoneyLandingViewModelOptions) {
  const { canViewReceivables, canViewPayments, errorDescriptionMessage } = options;

  const [dateFilter, setDateFilter] = useState<DateRangeFilter>("thisMonth");
  const [loading, setLoading] = useState(canViewReceivables && canViewPayments);

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
    setSummaryError(null);
    setTrendLoading(true);
    setTrendError(null);
    setResourceLoading(true);
    setResourceError(null);
    setTimeLoading(true);
    setTimeError(null);
    setMethodsLoading(true);
    setMethodsError(null);
    setTablesLoading(true);
    setTablesError(null);

    const summaryTask = moneyRepository
      .getSummary(filter)
      .then((res) => {
        setSummary(res.primary || res.items[0] || null);
      })
      .catch(() => {
        setSummaryError(errorDescriptionMessage);
      });

    const trendTask = moneyRepository
      .getTrend(filter)
      .then((res) => {
        setTrendBuckets(res.buckets || []);
      })
      .catch(() => {
        setTrendError(errorDescriptionMessage);
      })
      .finally(() => setTrendLoading(false));

    const resourceTask = moneyRepository
      .getByResource(filter)
      .then((items) => {
        setResourcePerformance(items || []);
      })
      .catch(() => {
        setResourceError(errorDescriptionMessage);
      })
      .finally(() => setResourceLoading(false));

    const timeTask = moneyRepository
      .getByTimeOfDay(filter)
      .then((items) => {
        setTimeOfDayBuckets(items || []);
      })
      .catch(() => {
        setTimeError(errorDescriptionMessage);
      })
      .finally(() => setTimeLoading(false));

    const methodsTask = moneyRepository
      .getPaymentMethods(filter)
      .then((items) => {
        setPaymentMethods(items || []);
      })
      .catch(() => {
        setMethodsError(errorDescriptionMessage);
      })
      .finally(() => setMethodsLoading(false));

    const tablesTask = Promise.all([
      canViewReceivables ? moneyRepository.getInvoices(1, 10) : Promise.resolve({ items: [] }),
      canViewPayments ? moneyRepository.getPayments(1, 10) : Promise.resolve({ items: [] }),
    ])
      .then(([invRes, payRes]) => {
        setInvoices(invRes.items || []);
        setPayments(payRes.items || []);
      })
      .catch(() => {
        setTablesError(errorDescriptionMessage);
      })
      .finally(() => {
        setTablesLoading(false);
      });

    await Promise.allSettled([
      summaryTask,
      trendTask,
      resourceTask,
      timeTask,
      methodsTask,
      tablesTask,
    ]);
    setLoading(false);
  }, [canViewReceivables, canViewPayments, dateFilter, errorDescriptionMessage]);

  useEffect(() => {
    if (!(canViewReceivables && canViewPayments)) return;
    let active = true;
    void Promise.resolve().then(() => {
      if (active) {
        void loadAllData();
      }
    });
    return () => {
      active = false;
    };
  }, [canViewReceivables, canViewPayments, loadAllData]);

  const currency = summary?.currencyCode || trendBuckets[0]?.currencyCode || "EGP";
  const outstandingInvoices = invoices.filter((i) => i.outstandingAmount > 0);
  const totalPaymentMethodCount = paymentMethods.reduce((sum, m) => sum + m.count, 0);
  const dailyShiftChannels = aggregateDailyShiftChannels(paymentMethods);

  return {
    dateFilter,
    setDateFilter,
    loading,
    summary,
    summaryError,
    trendBuckets,
    trendLoading,
    trendError,
    resourcePerformance,
    resourceLoading,
    resourceError,
    timeOfDayBuckets,
    timeLoading,
    timeError,
    paymentMethods,
    methodsLoading,
    methodsError,
    invoices,
    payments,
    tablesLoading,
    tablesError,
    currency,
    outstandingInvoices,
    totalPaymentMethodCount,
    dailyShiftChannels,
    loadAllData,
  };
}
