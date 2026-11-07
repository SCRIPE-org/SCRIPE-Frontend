"use client";

/**
 * useSessionsFleetViewModel
 *
 * ViewModel for the Workstations & Active Session Fleet view.
 * Handles real-time workstation introspection, single-target termination,
 * cluster revocation, and emergency isolation.
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { container } from "@modules/profile/di";

export const sessionsFleetKeys = {
  all: ["profile", "sessions-fleet"] as const,
  list: () => [...sessionsFleetKeys.all, "list"] as const,
};

export function useSessionsFleetViewModel() {
  const securityRepo = container.securityRepository;
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
    staleTime: 15 * 1000,
    refetchInterval: 30 * 1000,
  });

  // Revoke single session mutation
  const revokeMutation = useMutation({
    mutationFn: (tokenId: string) => securityRepo.revokeSession(tokenId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sessionsFleetKeys.list() });
    },
  });

  // Revoke all other sessions mutation
  const revokeAllOthersMutation = useMutation({
    mutationFn: () => securityRepo.revokeAllOtherSessions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sessionsFleetKeys.list() });
    },
  });

  // Emergency lockdown mutation
  const emergencyLockdownMutation = useMutation({
    mutationFn: () => securityRepo.emergencyLockdown(),
    onSuccess: () => {
      queryClient.clear();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    },
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
