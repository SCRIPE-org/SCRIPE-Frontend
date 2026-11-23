"use client";

/**
 * useProfileDossierViewModel
 *
 * ViewModel for the Executive Profile Dossier view.
 * Handles user bio, personal contact info, staff identifier, operational availability,
 * avatar management, and live academy switching.
 */
import { useState, useTransition } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { container } from "@modules/profile/di";
import { useAppStore } from "@core/store/useAppStore";
import { useI18n } from "@core/providers/i18n-provider";
import { toast } from "@core/ui/sileo-toast";
import type { UpdateProfileRequest } from "../../domain/interfaces/IProfileRepository";
import {
  invalidateOnConcurrencyConflict,
  resolveProfileSaveErrorMessage,
} from "../utils/concurrency";

/** React Query key factory for executive profile dossier queries. */
export const dossierKeys = {
  all: ["profile"] as const,
  profile: () => ["profile", "me"] as const,
};

/** ViewModel managing executive profile details, avatars, availability, and academy switching. */
export function useProfileDossierViewModel() {
  const profileRepo = container.profileRepository;
  const queryClient = useQueryClient();
  const { t } = useI18n();
  const requireMfaEnrollment = useAppStore((s) => s.requireMfaEnrollment);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [selectedAcademyId, setSelectedAcademyId] = useState<string>("default-hq");
  const [, startTransition] = useTransition();

  // Fetch admin profile (single shared query across ProfileLayout and all child views)
  const {
    data: profile,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: dossierKeys.profile(),
    queryFn: async () => {
      const data = await profileRepo.getProfile();
      if (!data.staffCode) {
        data.staffCode = `#SCR-${data.id.slice(0, 6).toUpperCase()}`;
      }
      if (!data.clubAffiliation) {
        data.clubAffiliation = "";
      }
      if (!data.activeBranchName) {
        data.activeBranchName = "";
      }
      if (!data.editionName) {
        data.editionName = "";
      }
      if (data.isAvailableForOperations === undefined) {
        data.isAvailableForOperations = true;
      }
      if (!data.securityScore) {
        let score = 50;
        if (data.isTwoFactorEnabled) score += 30;
        if (!data.isPasswordExpired) score += 20;
        data.securityScore = score;
      }
      if (!data.availableAcademies) {
        data.availableAcademies = [];
      }
      return data;
    },
    enabled: !requireMfaEnrollment,
    staleTime: 60 * 1000,
  });

  // Update profile mutation
  const updateMutation = useMutation({
    mutationFn: (data: UpdateProfileRequest) =>
      profileRepo.updateProfile({
        ...data,
        rowVersion: data.rowVersion ?? profile?.rowVersion,
      }),
    onSuccess: (updated) => {
      queryClient.setQueryData(dossierKeys.profile(), (prev: any) => ({
        ...prev,
        ...updated,
      }));
      // Synchronize updated name/avatar with Zustand auth store
      const currentUser = useAppStore.getState().user;
      if (currentUser && updated) {
        const patch = {
          firstName: updated.firstName || currentUser.firstName,
          lastName: updated.lastName || currentUser.lastName,
          profileImageUrl: updated.profileImageUrl ?? currentUser.profileImageUrl,
        };
        useAppStore.getState().setUser(
          typeof currentUser.update === "function"
            ? currentUser.update(patch)
            : ({ ...currentUser, ...patch } as typeof currentUser)
        );
      }
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    },
    onError: (err) => {
      if (invalidateOnConcurrencyConflict(queryClient, dossierKeys.profile(), err)) {
        toast.warning(resolveProfileSaveErrorMessage(err, t));
      }
    },
  });

  // Upload avatar mutation
  const avatarMutation = useMutation({
    mutationFn: (file: File) => profileRepo.uploadAvatar(file),
    onSuccess: (res) => {
      queryClient.setQueryData(dossierKeys.profile(), (prev: any) => ({
        ...prev,
        profileImageUrl: res.profileImageUrl,
      }));
    },
  });

  // Remove avatar mutation
  const removeAvatarMutation = useMutation({
    mutationFn: () => profileRepo.removeAvatar(),
    onSuccess: () => {
      queryClient.setQueryData(dossierKeys.profile(), (prev: any) => ({
        ...prev,
        profileImageUrl: null,
      }));
    },
  });

  // Toggle operational availability & persist to DB
  const toggleAvailability = (available: boolean) => {
    const current = queryClient.getQueryData<any>(dossierKeys.profile()) ?? profile;
    queryClient.setQueryData(dossierKeys.profile(), (prev: any) => {
      if (!prev) return prev;
      return { ...prev, isAvailableForOperations: available };
    });
    if (current) {
      updateMutation.mutate({
        firstName: current.firstName || "",
        lastName: current.lastName || "",
        phoneNumber: current.phoneNumber || "",
        bio: current.bio,
        activeBranchName: current.activeBranchName,
        isAvailableForOperations: available,
        rowVersion: current.rowVersion,
      });
    }
  };

  // Switch active branch/workspace & persist to DB
  const switchAcademy = (academyId: string) => {
    const current = queryClient.getQueryData<any>(dossierKeys.profile()) ?? profile;
    const academies = (current?.availableAcademies || []).map((a: any) => ({
      ...a,
      isCurrent: a.id === academyId,
    }));
    const selected = academies.find((a: any) => a.id === academyId);
    const nextBranchName = selected ? selected.name : current?.activeBranchName;

    startTransition(() => {
      setSelectedAcademyId(academyId);
      queryClient.setQueryData(dossierKeys.profile(), (prev: any) => {
        if (!prev) return prev;
        return {
          ...prev,
          availableAcademies: academies,
          activeBranchName: nextBranchName,
        };
      });
    });

    if (current && nextBranchName) {
      updateMutation.mutate({
        firstName: current.firstName || "",
        lastName: current.lastName || "",
        phoneNumber: current.phoneNumber || "",
        bio: current.bio,
        activeBranchName: nextBranchName,
        isAvailableForOperations: current.isAvailableForOperations,
        rowVersion: current.rowVersion,
      });
    }
  };

  return {
    profile,
    isLoading,
    error: error?.message ?? null,
    refetch,

    // Profile updates
    updateProfile: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    updateError: updateMutation.error
      ? resolveProfileSaveErrorMessage(updateMutation.error, t)
      : null,
    profileSuccess,

    // Avatar
    uploadAvatar: avatarMutation.mutateAsync,
    isUploadingAvatar: avatarMutation.isPending,
    removeAvatar: removeAvatarMutation.mutateAsync,
    isRemovingAvatar: removeAvatarMutation.isPending,

    // Availability & Academy
    toggleAvailability,
    switchAcademy,
    selectedAcademyId,
  };
}
