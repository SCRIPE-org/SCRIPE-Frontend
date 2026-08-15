/**
 * Payment Gateway Settings ViewModel
 *
 * Fetches enabled gateways from the backend and exposes them
 * for the settings view. Read-only dashboard for platform admins.
 */
"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { entitlementsContainer } from "@modules/entitlements/di";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { useI18n } from "@core/providers/i18n-provider";
import { chartColor } from "@core/ui/chart";
/**
 * Interface defining property specifications, keys types, and structural contract rules for gateway info.
 */
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

const GATEWAY_META: Record<
  string,
  Pick<GatewayInfo, "displayName" | "description" | "color" | "icon" | "features">
> = {
  Stripe: {
    displayName: "Stripe",
    description: "stripeDesc",
    color: chartColor(4),
    icon: "stripe",
    features: [
      "recurring",
      "billingPortal",
      "multiCurrency",
      "webhooks",
      "refunds",
      "paymentLinks",
      "threeDSecure",
    ],
  },
  PayPal: {
    displayName: "PayPal",
    description: "paypalDesc",
    color: chartColor(1),
    icon: "paypal",
    features: ["recurring", "multiCurrency", "webhooks", "refunds", "paymentLinks"],
  },
  Paymob: {
    displayName: "Paymob",
    description: "paymobDesc",
    color: chartColor(3),
    icon: "paymob",
    features: ["checkout", "mobileWallet", "menaCurrencies", "tokenizedRecurring", "webhooks"],
  },
  Manual: {
    displayName: "Manual",
    description: "Manual payment processing — no online gateway",
    color: "var(--nx-ink-3)",
    icon: "manual",
    features: [],
  },
};

/**
 * React hook/ViewModel orchestrating state and data flows for payment gateways view model.
 * Manages TanStack Query hooks, query cache keys, and repository fetch requests.
 */
export function usePaymentGatewaysViewModel() {
  const { billingRepository } = entitlementsContainer;
  const queryClient = useQueryClient();
  const { success, error: showError } = useEnhancedToast();
  const { t } = useI18n();

  // Per-row pending state — keyed by gateway id so mutating one card never
  // busies/disables the others in the list.
  const [pendingTestGateways, setPendingTestGateways] = useState<Set<string>>(new Set());
  const [pendingToggleGateways, setPendingToggleGateways] = useState<Set<string>>(new Set());

  const { data, isLoading, error, refetch } = useQuery({
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
      color: "var(--nx-ink-3)",
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
    onMutate: (gateway) => {
      setPendingTestGateways((prev) => new Set(prev).add(gateway));
    },
    onSuccess: (res) => {
      success({ title: t("billing.gateways.testSuccess"), description: res.message });
    },
    onError: (err: Error & { response?: { data?: { error?: string } } }) => {
      const errorMessage = err.response?.data?.error || err.message;
      showError({ title: t("billing.gateways.testFailed"), description: errorMessage });
    },
    onSettled: (_data, _err, gateway) => {
      setPendingTestGateways((prev) => {
        const next = new Set(prev);
        next.delete(gateway);
        return next;
      });
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ gateway, enabled }: { gateway: string; enabled: boolean }) =>
      billingRepository.toggleGatewayStatus(gateway, enabled),
    onMutate: ({ gateway }) => {
      setPendingToggleGateways((prev) => new Set(prev).add(gateway));
    },
    onSuccess: (res: { actionRequired?: string; message: string }) => {
      if (res.actionRequired === "config_change") {
        showError({
          title: t("billing.gateways.configRequired"),
          description: res.message,
        });
      } else {
        success({ title: t("billing.gateways.toggleSuccess"), description: res.message });
        refetch();
      }
    },
    onError: (err: Error & { response?: { data?: { error?: string } } }) => {
      const errorMessage = err.response?.data?.error || err.message;
      showError({ title: t("billing.gateways.toggleFailed"), description: errorMessage });
    },
    onSettled: (_data, _err, { gateway }) => {
      setPendingToggleGateways((prev) => {
        const next = new Set(prev);
        next.delete(gateway);
        return next;
      });
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
    isTestingConnection: (gateway: string) => pendingTestGateways.has(gateway),
    toggleStatus: (gateway: string, enabled: boolean) =>
      toggleStatusMutation.mutate({ gateway, enabled }),
    isTogglingStatus: (gateway: string) => pendingToggleGateways.has(gateway),
  };
}
