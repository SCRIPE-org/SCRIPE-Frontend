"use client";

/**
 * Avatar ViewModel
 *
 * Handles avatar upload and removal with preview.
 * After upload/remove, updates the app store user so the dropdown reflects changes immediately.
 */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useCallback } from "react";
import { container } from "../../../di";
import { profileKeys } from "./useProfilePageViewModel";
import { useAppStore } from "@core/store/useAppStore";

export function useAvatarViewModel() {
  const repo = container.profileRepository;
  const queryClient = useQueryClient();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

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
