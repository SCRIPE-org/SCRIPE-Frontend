"use client";

/**
 * Avatar ViewModel
 *
 * Handles avatar upload and removal with preview.
 * After upload/remove, updates the app store user so the dropdown reflects changes immediately.
 */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useCallback } from "react";
import { container } from "@modules/profile/di";
import { profileKeys } from "./useProfilePageViewModel";
import { useAppStore } from "@core/store/useAppStore";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { useI18n } from "@core/providers/i18n-provider";

/**
 * React hook/ViewModel orchestrating state and data flows for avatar view model.
 * Coordinates query synchronization (TanStack Query) with application client store indicators (Zustand) and returns validation fields.
 */
export function useAvatarViewModel() {
  const repo = container.profileRepository;
  const queryClient = useQueryClient();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { success, error: showError } = useEnhancedToast();
  const { t } = useI18n();

  const uploadMutation = useMutation({
    mutationFn: (file: File) => repo.uploadAvatar(file),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: profileKeys.me() });
      setPreviewUrl(null);

      // Update the app store so the dropdown avatar reflects immediately
      const currentUser = useAppStore.getState().user;
      if (currentUser && data?.profileImageUrl) {
        useAppStore
          .getState()
          .setUser(currentUser.update({ profileImageUrl: data.profileImageUrl }));
      }
      success({ title: t("profile.avatar.uploaded") || "Avatar updated" });
    },
    onError: (err: Error) => {
      showError({ title: t("common.error") || "Error", description: err.message });
    },
  });

  const removeMutation = useMutation({
    mutationFn: () => repo.removeAvatar(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.me() });
      setPreviewUrl(null);

      // Clear avatar from the app store
      const currentUser = useAppStore.getState().user;
      if (currentUser) {
        useAppStore.getState().setUser(currentUser.update({ profileImageUrl: null }));
      }
      success({ title: t("profile.avatar.removed") || "Avatar removed" });
    },
    onError: (err: Error) => {
      showError({ title: t("common.error") || "Error", description: err.message });
    },
  });

  const handleFileSelect = useCallback((file: File) => {
    // Validate
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      throw new Error("Only JPG, PNG, and WebP images are allowed.");
    }
    if (file.size > maxSize) {
      throw new Error("Image must be under 5MB.");
    }

    // Create preview
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return file;
  }, []);

  return {
    previewUrl,
    upload: uploadMutation.mutateAsync,
    remove: removeMutation.mutateAsync,
    handleFileSelect,
    isUploading: uploadMutation.isPending,
    isRemoving: removeMutation.isPending,
    uploadError: uploadMutation.error?.message ?? null,
  };
}
