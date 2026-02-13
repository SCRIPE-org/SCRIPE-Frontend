"use client";

/**
 * Avatar ViewModel
 *
 * Handles avatar upload and removal with preview.
 */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useCallback } from "react";
import { container } from "../../../di";
import { profileKeys } from "./useProfilePageViewModel";

export function useAvatarViewModel() {
      const repo = container.profileRepository;
      const queryClient = useQueryClient();
      const [previewUrl, setPreviewUrl] = useState<string | null>(null);

      const uploadMutation = useMutation({
            mutationFn: (file: File) => repo.uploadAvatar(file),
            onSuccess: () => {
                  queryClient.invalidateQueries({ queryKey: profileKeys.me() });
                  setPreviewUrl(null);
            },
      });

      const removeMutation = useMutation({
            mutationFn: () => repo.removeAvatar(),
            onSuccess: () => {
                  queryClient.invalidateQueries({ queryKey: profileKeys.me() });
                  setPreviewUrl(null);
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
