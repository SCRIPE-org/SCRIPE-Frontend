"use client";

/**
 * useSessionsFleetViewModel
 *
 * ViewModel for the Workstations & Active Session Fleet view.
 * Handles real-time workstation introspection, single-target termination,
 * cluster revocation, and emergency isolation.
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppStore } from "@core/store/useAppStore";
import { useSudoStore } from "@core/store/useSudoStore";
import { useServices } from "@core/providers/service-provider";
import { container } from "@modules/profile/di";
import { finalizeEmergencyLockdownCleanup } from "../utils/emergency-lockdown";
import { sovereignAccountKeys } from "../utils/sovereignAccountKeys";

/** React Query key factory for active workstation session fleet queries. */
export const sessionsFleetKeys = {
  all: ["profile", "sessions-fleet"] as const,
  list: () => [...sessionsFleetKeys.all, "list"] as const,
};

/** ViewModel for listing active workstation sessions, revoking sessions, and emergency lockdown. */
export function useSessionsFleetViewModel() {
  const securityRepo = container.securityRepository;
  const { authRepository } = useServices();
  const requireMfaEnrollment = useAppStore((s) => s.requireMfaEnrollment);
  const markLocked = useSudoStore((s) => s.markLocked);
  const queryClient = useQueryClient();

  // Active sessions query
  const {
    data: sessions = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: sessionsFleetKeys.list(),
    queryFn: () => securityRepo.getSessions(),
    enabled: !requireMfaEnrollment,
    staleTime: 15 * 1000,
    refetchInterval: 30 * 1000,
  });

  // Revoke single session mutation
  const revokeMutation = useMutation({
    mutationFn: (tokenId: string) =>
      securityRepo.revokeSession(
        tokenId,
        useSudoStore.getState().getValidSudoToken() ?? undefined
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sessionsFleetKeys.list() });
      queryClient.invalidateQueries({ queryKey: sovereignAccountKeys.sessions() });
      queryClient.invalidateQueries({ queryKey: sovereignAccountKeys.context() });
    },
  });

  // Revoke all other sessions mutation
  const revokeAllOthersMutation = useMutation({
    mutationFn: () =>
      securityRepo.revokeAllOtherSessions(
        useSudoStore.getState().getValidSudoToken() ?? undefined
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sessionsFleetKeys.list() });
      queryClient.invalidateQueries({ queryKey: sovereignAccountKeys.sessions() });
      queryClient.invalidateQueries({ queryKey: sovereignAccountKeys.context() });
    },
  });

  // Emergency lockdown mutation
  const emergencyLockdownMutation = useMutation({
    mutationFn: () => securityRepo.emergencyLockdown(),
    onSuccess: () => finalizeEmergencyLockdownCleanup(queryClient, authRepository, markLocked),
  });

  const currentSession = sessions.find((s) => s.isCurrent) ?? null;
  const otherSessions = sessions.filter((s) => !s.isCurrent);

  return {
    sessions,
    currentSession,
    otherSessions,
    totalCount: sessions.length,
    otherCount: otherSessions.length,
    isLoading,
    error: error?.message ?? null,
    refetch,

    // Actions
    revokeSession: revokeMutation.mutateAsync,
    isRevoking: revokeMutation.isPending,

    revokeAllOtherSessions: revokeAllOthersMutation.mutateAsync,
    isRevokingAllOthers: revokeAllOthersMutation.isPending,

    emergencyLockdown: emergencyLockdownMutation.mutateAsync,
    isLockingDown: emergencyLockdownMutation.isPending,
  };
}
