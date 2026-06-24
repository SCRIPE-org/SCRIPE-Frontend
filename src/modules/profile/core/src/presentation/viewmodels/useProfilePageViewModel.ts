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
import type { UpdateProfileRequest } from "../../domain/interfaces/IProfileRepository";

/**
 * Constant definition representing profile keys.
 */
export const profileKeys = {
  all: ["profile"] as const,
  me: () => [...profileKeys.all, "me"] as const,
  sessions: () => [...profileKeys.all, "sessions"] as const,
  securityLog: (page: number) => [...profileKeys.all, "security-log", page] as const,
};

/**
 * React hook/ViewModel managing logic, state, and repository queries for profile page view model.
 */
export function useProfilePageViewModel() {
  const repo = container.profileRepository;
  const queryClient = useQueryClient();
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
    mutationFn: (data: UpdateProfileRequest) => repo.updateProfile(data),
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(profileKeys.me(), updatedProfile);
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
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
    updateError: updateMutation.error?.message ?? null,
    profileSuccess,

    // For sub-pages
    queryClient,
  };
}
