"use client";

/**
 * Security ViewModel
 *
 * Handles password change (with 2FA) and backup code regeneration.
 */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { container } from "../../../di";
import { profileKeys } from "./useProfilePageViewModel";
import type { ChangePasswordRequest } from "../../../src/domain/interfaces/IProfileRepository";

export function useSecurityViewModel() {
      const repo = container.profileRepository;
      const queryClient = useQueryClient();
      const [passwordSuccess, setPasswordSuccess] = useState(false);
      const [backupCodes, setBackupCodes] = useState<string[] | null>(null);
      const [backupCodesSuccess, setBackupCodesSuccess] = useState(false);

      // ── Change Password ────────────────────────────
      const passwordMutation = useMutation({
            mutationFn: (data: ChangePasswordRequest) => repo.changePassword(data),
            onSuccess: () => {
                  queryClient.invalidateQueries({ queryKey: profileKeys.me() });
                  setPasswordSuccess(true);
                  setTimeout(() => setPasswordSuccess(false), 5000);
            },
      });

      // ── Regenerate Backup Codes ────────────────────
      const backupCodesMutation = useMutation({
            mutationFn: (twoFactorCode: string) =>
                  repo.regenerateBackupCodes(twoFactorCode),
            onSuccess: (codes) => {
                  setBackupCodes(codes);
                  setBackupCodesSuccess(true);
                  queryClient.invalidateQueries({ queryKey: profileKeys.me() });
            },
      });

      return {
            // Password
            changePassword: passwordMutation.mutateAsync,
            isChangingPassword: passwordMutation.isPending,
            passwordError: passwordMutation.error?.message ?? null,
            passwordSuccess,

            // Backup codes
            regenerateBackupCodes: backupCodesMutation.mutateAsync,
            isRegenerating: backupCodesMutation.isPending,
            regenerateError: backupCodesMutation.error?.message ?? null,
            backupCodes,
            backupCodesSuccess,
            clearBackupCodes: () => {
                  setBackupCodes(null);
                  setBackupCodesSuccess(false);
            },
      };
}
