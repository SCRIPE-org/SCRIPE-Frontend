"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { complianceContainer } from "@modules/compliance/di";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { useI18n } from "@core/providers/i18n-provider";
import type { RecordConsentRequest } from "../../domain/entities/ConsentStatus";

export function useConsentViewModel() {
  const { consentRepository } = complianceContainer;
  const queryClient = useQueryClient();
  const { success, error: showError } = useEnhancedToast();
  const { t } = useI18n();

  const query = useQuery({
    queryKey: ["compliance", "consent", "me"],
    queryFn: () => consentRepository.getMyConsent(),
    staleTime: 60_000,
  });

  const recordMutation = useMutation({
    mutationFn: (data: RecordConsentRequest) => consentRepository.recordConsent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["compliance", "consent"] });
      success({ title: t("compliance.consent.recorded") || "Consent recorded" });
    },
    onError: (err: Error) => {
      showError({ title: t("common.error") || "Error", description: err.message });
    },
  });

  const withdrawMutation = useMutation({
    mutationFn: (purposeId: string) => consentRepository.withdrawConsent(purposeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["compliance", "consent"] });
      success({ title: t("compliance.consent.withdrawn") || "Consent withdrawn" });
    },
    onError: (err: Error) => {
      showError({ title: t("common.error") || "Error", description: err.message });
    },
  });

  const analyticsQuery = useQuery({
    queryKey: ["compliance", "consent", "analytics"],
    queryFn: () => consentRepository.getAnalytics(),
    staleTime: 5 * 60_000,
  });

  return {
    consents: query.data ?? [],
    analytics: analyticsQuery.data ?? null,
    grantedCount: (query.data ?? []).filter((c) => c.isGranted).length,
    withdrawnCount: (query.data ?? []).filter((c) => !c.isGranted).length,
    reConsentCount: (query.data ?? []).filter((c) => c.requiresReConsent).length,
    isLoading: query.isLoading,
    isError: query.isError,
    isAnalyticsLoading: analyticsQuery.isLoading,
    isAnalyticsError: analyticsQuery.isError,
    refetch: query.refetch,
    recordConsent: recordMutation.mutateAsync,
    withdrawConsent: withdrawMutation.mutateAsync,
    isRecording: recordMutation.isPending,
    isWithdrawing: withdrawMutation.isPending,
  };
}
