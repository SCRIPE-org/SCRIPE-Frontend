"use client";

import { useQuery } from "@tanstack/react-query";
import { entitlementsContainer } from "@modules/entitlements/di";
import { useAppStore } from "@/core/store/useAppStore";

/** Typed shape from billing config API */
interface BillingConfig {
  paymentMode?: string;
  currency?: string;
  billingCycle?: string;
  autoRenew?: boolean;
  nextBillingDate?: string;
  activeSubscriptions?: number;
}

/** Typed shape from revenue API */
interface RevenueData {
  totalRevenue?: number;
  growthRate?: string;
}

/** Typed shape from features API */
interface BillingFeature {
  name: string;
  value: string;
}

export function useBillingViewModel() {
  const { billingRepository } = entitlementsContainer;
  const tenantId = useAppStore((s) => s.user?.tenantId ?? "");

  const configQuery = useQuery({
    queryKey: ["billing", "config", tenantId],
    queryFn: () => billingRepository.getConfig(tenantId),
    enabled: !!tenantId,
  });

  const revenueQuery = useQuery({
    queryKey: ["billing", "revenue"],
    queryFn: () => billingRepository.getRevenue(),
  });

  const featuresQuery = useQuery({
    queryKey: ["billing", "features"],
    queryFn: () => billingRepository.getFeatures(),
  });

  // Safely extract typed properties with defaults
  const config = (configQuery.data ?? {}) as BillingConfig;
  const revenue = (revenueQuery.data ?? {}) as RevenueData;
  const featuresList = Array.isArray(featuresQuery.data) ? (featuresQuery.data as BillingFeature[]) : [];

  return {
    // Typed scalar values — view just reads these, no casting needed
    totalRevenue: revenue.totalRevenue ?? 0,
    growthRate: revenue.growthRate ?? "—",
    activeSubscriptions: config.activeSubscriptions ?? 0,
    nextBillingDate: config.nextBillingDate ?? "—",
    paymentMode: config.paymentMode ?? "Not set",
    currency: config.currency ?? "USD",
    billingCycle: config.billingCycle ?? "Monthly",
    autoRenew: config.autoRenew ?? false,

    // Features list with safe default
    features: featuresList.map((f) => ({
      name: f.name ?? `Feature`,
      value: f.value ?? "—",
    })),

    // Meta
    isLoading: configQuery.isLoading || revenueQuery.isLoading,
    error: configQuery.error || revenueQuery.error,
    refetch: () => {
      configQuery.refetch();
      revenueQuery.refetch();
      featuresQuery.refetch();
    },
    tenantId,
  };
}
