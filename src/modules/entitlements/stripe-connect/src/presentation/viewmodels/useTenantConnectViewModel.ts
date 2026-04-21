/**
 * useTenantConnectViewModel
 * Manages Stripe Connect account lifecycle for the currently logged-in tenant:
 * - View account status
 * - Onboard (create account + get URL)
 * - Refresh onboarding link
 * - Open Stripe Express dashboard
 */
"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { entitlementsContainer } from "@modules/entitlements/di";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { useI18n } from "@core/providers/i18n-provider";
import type { ConnectAccount } from "../../domain/entities/ConnectAccount";

const QUERY_KEY = ["entitlements", "tenant-stripe-connect", "status"];

export function useTenantConnectViewModel() {
  const { connectRepository } = entitlementsContainer;
  const { success, error } = useEnhancedToast();
  const { t } = useI18n();
  const queryClient = useQueryClient();

  // ── Status query ────────────────────────────────────────────────────────
  const statusQuery = useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      try {
        return await connectRepository.getTenantStatus();
      } catch (err: any) {
        // If 404, it means the tenant hasn't onboarded yet, which is a normal state.
        if (err?.response?.status === 404) {
          return null;
        }
        throw err;
      }
    },
    staleTime: 15_000,
    retry: false, // Don't retry on 404
  });

  const account: ConnectAccount | null = statusQuery.data || null;

  // ── Onboard mutation ────────────────────────────────────────────────────
  const onboardMutation = useMutation({
    mutationFn: () => connectRepository.tenantOnboard(),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      if (result.onboardingUrl) {
        window.open(result.onboardingUrl, "_blank", "noopener,noreferrer");
      }
    },
    onError: () => {
      error({
        title: t("common.error"),
        description: t("entitlements.stripeConnect.createFailed"),
      });
    },
  });

  // ── Refresh link mutation ───────────────────────────────────────────────
  const refreshLinkMutation = useMutation({
    mutationFn: () => connectRepository.tenantRefreshLink(),
    onSuccess: (url) => {
      if (url) {
        window.open(url, "_blank", "noopener,noreferrer");
      }
    },
    onError: () => {
      error({
        title: t("common.error"),
        description: t("entitlements.stripeConnect.refreshFailed"),
      });
    },
  });

  // ── Dashboard link mutation ─────────────────────────────────────────────
  const dashboardLinkMutation = useMutation({
    mutationFn: () => connectRepository.tenantDashboard(),
    onSuccess: (url) => {
      if (url) {
        window.open(url, "_blank", "noopener,noreferrer");
      }
    },
    onError: () => {
      error({
        title: t("common.error"),
        description: t("entitlements.stripeConnect.dashboardLinkFailed"),
      });
    },
  });

  return {
    account,
    isLoading: statusQuery.isLoading,
    isError: statusQuery.isError,
    
    // Actions
    onboard: () => onboardMutation.mutate(),
    isOnboarding: onboardMutation.isPending,

    refreshLink: () => refreshLinkMutation.mutate(),
    isRefreshing: refreshLinkMutation.isPending,

    openDashboard: () => dashboardLinkMutation.mutate(),
    isOpeningDashboard: dashboardLinkMutation.isPending,
  };
}
