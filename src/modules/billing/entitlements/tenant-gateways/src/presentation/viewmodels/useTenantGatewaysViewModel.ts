"use client";

import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { entitlementsContainer } from "@modules/entitlements/di";
import type { ConfigureGatewayRequest } from "../../domain/interfaces/ITenantGatewayRepository";
import type { TenantGateway } from "../../domain/entities/TenantGateway";

const QUERY_KEY = ["tenant-gateways"];

/**
 * Interface defining property specifications, keys types, and structural contract rules for gateway form state.
 */
export interface GatewayFormState {
  isOpen: boolean;
  gatewayType: string;
  isEditing: boolean;
}

/** Available gateway definitions for the form picker */
export const AVAILABLE_GATEWAYS = [
  {
    type: "Stripe",
    label: "Stripe",
    icon: "CreditCard",
    description: "Accept cards, Apple Pay, Google Pay via Stripe",
    fields: [
      { key: "apiKey", label: "Publishable Key", placeholder: "pk_live_..." },
      { key: "secretKey", label: "Secret Key", placeholder: "sk_live_...", secret: true },
      {
        key: "webhookSecret",
        label: "Webhook Signing Secret",
        placeholder: "whsec_...",
        secret: true,
        optional: true,
      },
    ],
  },
  {
    type: "PayPal",
    label: "PayPal",
    icon: "Wallet",
    description: "Accept PayPal, Venmo, and debit/credit cards",
    fields: [
      { key: "apiKey", label: "Client ID", placeholder: "AbC123..." },
      { key: "secretKey", label: "Client Secret", placeholder: "EfG456...", secret: true },
      { key: "webhookSecret", label: "Webhook ID", placeholder: "WH-...", optional: true },
    ],
  },
  {
    type: "Paymob",
    label: "Paymob",
    icon: "Banknote",
    description: "Accept local payment methods in MENA region",
    fields: [
      { key: "apiKey", label: "API Key", placeholder: "ZXlKaGJH..." },
      { key: "secretKey", label: "Integration ID", placeholder: "123456" },
      {
        key: "webhookSecret",
        label: "HMAC Secret",
        placeholder: "hmac_...",
        secret: true,
        optional: true,
      },
      { key: "merchantId", label: "Merchant ID", placeholder: "MID-...", optional: true },
    ],
  },
] as const;

/**
 * React hook/ViewModel orchestrating state and data flows for tenant gateways view model.
 * Manages TanStack Query hooks, query cache keys, and repository fetch requests.
 */
export function useTenantGatewaysViewModel() {
  const { tenantGatewayRepository } = entitlementsContainer;
  const queryClient = useQueryClient();

  // ── Form dialog state ──
  const [formState, setFormState] = useState<GatewayFormState>({
    isOpen: false,
    gatewayType: "",
    isEditing: false,
  });

  // Per-row pending state — keyed by gateway type so verifying one gateway
  // never busies/disables the Verify button on the other configured cards.
  const [pendingVerifyTypes, setPendingVerifyTypes] = useState<Set<string>>(new Set());

  // ── Queries ──
  const {
    data: gateways = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => tenantGatewayRepository.getMyGateways(),
    staleTime: 60_000,
  });

  // ── Mutations ──
  const configureMutation = useMutation({
    mutationFn: (data: ConfigureGatewayRequest) => tenantGatewayRepository.configureGateway(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      closeForm();
    },
  });

  const verifyMutation = useMutation({
    mutationFn: (gatewayType: string) => tenantGatewayRepository.verifyGateway(gatewayType),
    onMutate: (gatewayType) => {
      setPendingVerifyTypes((prev) => new Set(prev).add(gatewayType));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
    onSettled: (_data, _err, gatewayType) => {
      setPendingVerifyTypes((prev) => {
        const next = new Set(prev);
        next.delete(gatewayType);
        return next;
      });
    },
  });

  const removeMutation = useMutation({
    mutationFn: (gatewayType: string) => tenantGatewayRepository.removeGateway(gatewayType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });

  // ── Helpers ──
  const openConfigureForm = useCallback((gatewayType: string, isEditing = false) => {
    setFormState({ isOpen: true, gatewayType, isEditing });
  }, []);

  const closeForm = useCallback(() => {
    setFormState({ isOpen: false, gatewayType: "", isEditing: false });
  }, []);

  /** Which gateways are already configured */
  const configuredTypes = new Set(gateways.map((g: TenantGateway) => g.gateway));

  /** Gateways available to add (not yet configured) */
  const availableToAdd = AVAILABLE_GATEWAYS.filter((g) => !configuredTypes.has(g.type));

  return {
    // State
    gateways,
    isLoading,
    error,
    formState,

    // Computed
    configuredTypes,
    availableToAdd,

    // Actions
    openConfigureForm,
    closeForm,
    configureGateway: configureMutation.mutateAsync,
    verifyGateway: verifyMutation.mutateAsync,
    removeGateway: removeMutation.mutateAsync,

    // Mutation state
    isConfiguring: configureMutation.isPending,
    isVerifying: (gatewayType: string) => pendingVerifyTypes.has(gatewayType),
    isRemoving: removeMutation.isPending,
    configureError: configureMutation.error,
    verifyError: verifyMutation.error,
    removeError: removeMutation.error,
  };
}
