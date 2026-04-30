/**
 * Payment Gateway Settings ViewModel
 *
 * Fetches enabled gateways from the backend and exposes them
 * for the settings view. Read-only dashboard for platform admins.
 */
"use client";

import { useQuery } from "@tanstack/react-query";
import { entitlementsContainer } from "@modules/entitlements/di";
import type { GatewayStatusModel } from "@modules/entitlements/billing/src/domain/interfaces/IBillingService";

export interface GatewayInfo extends GatewayStatusModel {
  displayName: string;
  description: string;
  color: string;
  icon: "stripe" | "paypal" | "paymob" | "manual";
  features: string[];
}

const GATEWAY_META: Record<string, Omit<GatewayInfo, keyof GatewayStatusModel>> = {
  Stripe: {
    displayName: "Stripe",
    description: "stripeDesc",
    color: "#635bff",
    icon: "stripe",
    features: ["recurring", "billingPortal", "multiCurrency", "webhooks", "refunds", "paymentLinks", "threeDSecure"],
  },
  PayPal: {
    displayName: "PayPal",
    description: "paypalDesc",
    color: "#003087",
    icon: "paypal",
    features: ["recurring", "multiCurrency", "webhooks", "refunds", "paymentLinks"],
  },
  Paymob: {
    displayName: "Paymob",
    description: "paymobDesc",
    color: "#00B2FF",
    icon: "paymob",
    features: ["checkout", "mobileWallet", "menaCurrencies", "tokenizedRecurring", "webhooks"],
  },
  Manual: {
    displayName: "Manual",
    description: "Manual payment processing — no online gateway",
    color: "#6b7280",
    icon: "manual",
    features: [],
  },
};

export function usePaymentGatewaysViewModel() {
  const { billingRepository } = entitlementsContainer;

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["payment-gateways"],
    queryFn: async () => {
      return billingRepository.getGateways();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const gateways: GatewayInfo[] = (data?.gateways ?? []).map((gw) => {
    const meta = GATEWAY_META[gw.gateway] ?? {
      displayName: gw.gateway,
      description: "",
      color: "#6b7280",
      icon: "manual" as const,
      features: [],
    };
    return {
      ...gw,
      ...meta,
      features: meta.features,
    };
  });

  const defaultGateway = data?.defaultGateway ?? "Stripe";
  const enabledCount = gateways.filter((g) => g.enabled).length;

  return {
    gateways,
    defaultGateway,
    enabledCount,
    totalCount: gateways.length,
    isLoading,
    error: error?.message,
    refetch,
  };
}
