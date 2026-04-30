/**
 * Payment Gateway Settings ViewModel
 *
 * Fetches enabled gateways from the backend and exposes them
 * for the settings view. Read-only dashboard for platform admins.
 */
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { entitlementsContainer } from "@modules/entitlements/di";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { useI18n } from "@core/providers/i18n-provider";
export interface GatewayInfo {
  gateway: string;
  enabled: boolean;
  isDefault: boolean;
  supportsRecurring: boolean;
  supportsBillingPortal: boolean;
  supportedFeatures: string[];
  displayName: string;
  description: string;
  color: string;
  icon: "stripe" | "paypal" | "paymob" | "manual";
  features: string[];
}

const GATEWAY_META: Record<string, Pick<GatewayInfo, "displayName" | "description" | "color" | "icon" | "features">> = {
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
  const queryClient = useQueryClient();
  const { success, error: showError } = useEnhancedToast();
  const { t } = useI18n();

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

  const testConnectionMutation = useMutation({
    mutationFn: (gateway: string) => billingRepository.testGatewayConnection(gateway),
    onSuccess: (res) => {
      success({ title: t("billing.gateways.testSuccess"), description: res.message });
    },
    onError: (err: any) => {
      const errorMessage = err.response?.data?.error || err.message;
      showError({ title: t("billing.gateways.testFailed"), description: errorMessage });
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ gateway, enabled }: { gateway: string; enabled: boolean }) => 
      billingRepository.toggleGatewayStatus(gateway, enabled),
    onSuccess: (res: any) => {
      if (res.actionRequired === "config_change") {
        showError({ 
          title: t("billing.gateways.configRequired") || "Configuration Required", 
          description: res.message 
        });
      } else {
        success({ title: t("billing.gateways.toggleSuccess"), description: res.message });
        refetch();
      }
    },
    onError: (err: any) => {
      const errorMessage = err.response?.data?.error || err.message;
      showError({ title: t("billing.gateways.toggleFailed"), description: errorMessage });
    },
  });

  return {
    gateways,
    defaultGateway,
    enabledCount,
    totalCount: gateways.length,
    isLoading,
    error: error?.message,
    refetch,
    testConnection: (gateway: string) => testConnectionMutation.mutate(gateway),
    isTestingConnection: testConnectionMutation.isPending,
    toggleStatus: (gateway: string, enabled: boolean) => toggleStatusMutation.mutate({ gateway, enabled }),
    isTogglingStatus: toggleStatusMutation.isPending,
  };
}
