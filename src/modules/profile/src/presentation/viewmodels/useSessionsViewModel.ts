"use client";

/**
 * Sessions ViewModel
 *
 * Handles active sessions list and revocation.
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { container } from "../../../di";
import { profileKeys } from "./useProfilePageViewModel";

export function useSessionsViewModel() {
      const repo = container.profileRepository;
      const queryClient = useQueryClient();

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
            },
      });

      const revokeAllMutation = useMutation({
            mutationFn: () => repo.revokeAllSessions(),
            onSuccess: () => {
                  queryClient.invalidateQueries({ queryKey: profileKeys.sessions() });
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
