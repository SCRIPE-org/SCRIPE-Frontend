"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { complianceContainer } from "@modules/compliance/di";
import type { RecordConsentRequest } from "../../domain/entities/ConsentStatus";

export function useConsentViewModel() {
  const { consentRepository } = complianceContainer;
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["compliance", "consent", "me"],
    queryFn: () => consentRepository.getMyConsent(),
    staleTime: 60_000,
  });

  const recordMutation = useMutation({
    mutationFn: (data: RecordConsentRequest) => consentRepository.recordConsent(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["compliance", "consent"] }),
  });

  const withdrawMutation = useMutation({
    mutationFn: (purposeId: string) => consentRepository.withdrawConsent(purposeId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["compliance", "consent"] }),
  });

  return {
    consents: query.data ?? [],
    grantedCount: (query.data ?? []).filter((c) => c.isGranted).length,
    withdrawnCount: (query.data ?? []).filter((c) => !c.isGranted).length,
    reConsentCount: (query.data ?? []).filter((c) => c.requiresReConsent).length,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
    recordConsent: recordMutation.mutateAsync,
    withdrawConsent: withdrawMutation.mutateAsync,
    isRecording: recordMutation.isPending,
    isWithdrawing: withdrawMutation.isPending,
  };
}
