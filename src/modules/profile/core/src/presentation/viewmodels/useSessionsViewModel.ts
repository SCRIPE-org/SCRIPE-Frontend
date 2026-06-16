"use client";

/**
 * Sessions ViewModel
 *
 * Handles active sessions list and revocation.
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { container } from "@modules/profile/di";
import { profileKeys } from "./useProfilePageViewModel";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { useI18n } from "@core/providers/i18n-provider";

export function useSessionsViewModel() {
  const repo = container.profileRepository;
  const queryClient = useQueryClient();
  const { success, error: showError } = useEnhancedToast();
  const { t } = useI18n();

  const {
    data: sessions,
    isLoading,
    error,
  } = useQuery({
    queryKey: profileKeys.sessions(),
    queryFn: () => repo.getSessions(),
    staleTime: 30 * 1000, // 30s
  });

  const revokeMutation = useMutation({
    mutationFn: (tokenId: string) => repo.revokeSession(tokenId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.sessions() });
      success({ title: t("profile.sessions.revoked") || "Session revoked" });
    },
    onError: (err: Error) => {
      showError({ title: t("common.error") || "Error", description: err.message });
    },
  });

  const revokeAllMutation = useMutation({
    mutationFn: () => repo.revokeAllSessions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.sessions() });
      success({ title: t("profile.sessions.allRevoked") || "All other sessions revoked" });
    },
    onError: (err: Error) => {
      showError({ title: t("common.error") || "Error", description: err.message });
    },
  });

  const currentSession = sessions?.find((s) => s.isCurrent) ?? null;
  const otherSessions = sessions?.filter((s) => !s.isCurrent) ?? [];

  return {
    sessions,
    currentSession,
    otherSessions,
    isLoading,
    error: error?.message ?? null,

    revokeSession: revokeMutation.mutateAsync,
    isRevoking: revokeMutation.isPending,

    revokeAllSessions: revokeAllMutation.mutateAsync,
    isRevokingAll: revokeAllMutation.isPending,
  };
}
