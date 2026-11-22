"use client";

/**
 * Profile Page ViewModel (Orchestrator)
 *
 * Fetches admin profile data and composes sub-viewmodels.
 * Used by all profile pages via the shared layout.
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { container } from "@modules/profile/di";
import { useI18n } from "@core/providers/i18n-provider";
import type { UpdateProfileRequest } from "../../domain/interfaces/IProfileRepository";
import {
  invalidateOnConcurrencyConflict,
  resolveProfileSaveErrorMessage,
} from "../utils/concurrency";

/**
 * Exported constant defining parameters and fields for profile keys configurations.
 */
export const profileKeys = {
  all: ["profile"] as const,
  me: () => [...profileKeys.all, "me"] as const,
  sessions: () => [...profileKeys.all, "sessions"] as const,
  securityLog: (page: number) => [...profileKeys.all, "security-log", page] as const,
};

/**
 * React hook/ViewModel orchestrating state and data flows for profile page view model.
 * Manages TanStack Query hooks, query cache keys, and repository fetch requests.
 */
export function useProfilePageViewModel() {
  const repo = container.profileRepository;
  const queryClient = useQueryClient();
  const { t } = useI18n();
  const [profileSuccess, setProfileSuccess] = useState(false);

  // ── Fetch profile ──────────────────────────────
  const {
    data: profile,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: profileKeys.me(),
    queryFn: () => repo.getProfile(),
    staleTime: 2 * 60 * 1000,
  });

  // ── Update profile ─────────────────────────────
  const updateMutation = useMutation({
    mutationFn: (data: UpdateProfileRequest) =>
      repo.updateProfile({
        ...data,
        rowVersion: data.rowVersion ?? profile?.rowVersion,
      }),
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(profileKeys.me(), updatedProfile);
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    },
    onError: (err) => {
      invalidateOnConcurrencyConflict(queryClient, profileKeys.me(), err);
    },
  });

  return {
    profile,
    isLoading,
    error: error?.message ?? null,
    refetch,

    // Profile update
    updateProfile: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    updateError: updateMutation.error
      ? resolveProfileSaveErrorMessage(updateMutation.error, t)
      : null,
    profileSuccess,

    // For sub-pages
    queryClient,
  };
}
