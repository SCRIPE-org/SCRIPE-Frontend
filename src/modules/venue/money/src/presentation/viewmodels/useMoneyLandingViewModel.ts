"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
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

export interface UseMoneyLandingViewModelOptions {
  canViewReceivables: boolean;
  canViewPayments: boolean;
  errorDescriptionMessage?: string;
}

/**
 * ViewModel for MoneyLandingView.
 * Encapsulates financial telemetry, trends, breakdowns, and recent invoices/payments via DI.
 */
export function useMoneyLandingViewModel(options: UseMoneyLandingViewModelOptions) {
  const { canViewReceivables, canViewPayments, errorDescriptionMessage = "Could not load metrics." } = options;

  const [dateFilter, setDateFilter] = useState<DateRangeFilter>("thisMonth");
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
        setSummaryError(errorDescriptionMessage);
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
        setTrendError(errorDescriptionMessage);
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
        setResourceError(errorDescriptionMessage);
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
        setTimeError(errorDescriptionMessage);
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
        setMethodsError(errorDescriptionMessage);
      })
      .finally(() => setMethodsLoading(false));

    // 6. Actionable Tables
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
        setTablesError(errorDescriptionMessage);
      })
      .finally(() => {
        setTablesLoading(false);
        setLoading(false);
      });
  }, [canViewReceivables, canViewPayments, dateFilter, errorDescriptionMessage]);

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
    loadAllData,
  };
}
