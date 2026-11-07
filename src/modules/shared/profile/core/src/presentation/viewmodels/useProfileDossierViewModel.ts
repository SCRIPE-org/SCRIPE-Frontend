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
import type { UpdateProfileRequest } from "../../domain/interfaces/IProfileRepository";

export const dossierKeys = {
  all: ["profile"] as const,
  profile: () => ["profile", "me"] as const,
};

export function useProfileDossierViewModel() {
  const profileRepo = container.profileRepository;
  const queryClient = useQueryClient();
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [selectedAcademyId, setSelectedAcademyId] = useState<string>("default-ahly");
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
      // Enrich with defaults if not present
      if (!data.staffCode) {
        data.staffCode = `#SCR-${data.id.slice(0, 6).toUpperCase()}`;
      }
      if (!data.clubAffiliation) {
        data.clubAffiliation = "Al-Ahly SC • Football Intelligence Hub";
      }
      if (!data.activeBranchName) {
        data.activeBranchName = "Gezira Main Campus (HQ)";
      }
      if (!data.editionName) {
        data.editionName = "Sports Enterprise Ultra";
      }
      if (data.isAvailableForOperations === undefined) {
        data.isAvailableForOperations = true;
      }
      if (!data.securityScore) {
        // Compute security posture score based on 2FA and password status
        let score = 50;
        if (data.isTwoFactorEnabled) score += 30;
        if (!data.isPasswordExpired) score += 20;
        data.securityScore = score;
      }
      if (!data.availableAcademies || data.availableAcademies.length === 0) {
        data.availableAcademies = [
          { id: "default-ahly", name: "Al-Ahly SC — Gezira HQ", isCurrent: true },
          { id: "ahly-nasr", name: "Al-Ahly SC — Nasr City Campus", isCurrent: false },
          { id: "ahly-sheikh-zayed", name: "Al-Ahly SC — Sheikh Zayed Complex", isCurrent: false },
        ];
      }
      return data;
    },
    staleTime: 60 * 1000,
  });

  // Update profile mutation
  const updateMutation = useMutation({
    mutationFn: (data: UpdateProfileRequest) => profileRepo.updateProfile(data),
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
        firstName: current.firstName || "Alex",
        lastName: current.lastName || "Morgan",
        phoneNumber: current.phoneNumber || "",
        bio: current.bio,
        activeBranchName: current.activeBranchName,
        isAvailableForOperations: available,
        adminSettingsJson: current.adminSettingsJson ?? undefined,
      });
    }
  };

  // Switch active academy & persist to DB
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
        firstName: current.firstName || "Alex",
        lastName: current.lastName || "Morgan",
        phoneNumber: current.phoneNumber || "",
        bio: current.bio,
        activeBranchName: nextBranchName,
        isAvailableForOperations: current.isAvailableForOperations,
        adminSettingsJson: current.adminSettingsJson ?? undefined,
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
    updateError: updateMutation.error?.message ?? null,
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
