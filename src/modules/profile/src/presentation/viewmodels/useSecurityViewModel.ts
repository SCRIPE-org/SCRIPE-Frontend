"use client";

/**
 * Security ViewModel
 *
 * Handles password change (with 2FA), backup code regeneration,
 * and 2FA enable/confirm/disable.
 */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { container } from "../../../di";
import { profileKeys } from "./useProfilePageViewModel";
import type { ChangePasswordRequest, Enable2FAResult } from "../../../src/domain/interfaces/IProfileRepository";

export function useSecurityViewModel() {
      const repo = container.profileRepository;
      const queryClient = useQueryClient();
      const [passwordSuccess, setPasswordSuccess] = useState(false);
      const [backupCodes, setBackupCodes] = useState<string[] | null>(null);
      const [backupCodesSuccess, setBackupCodesSuccess] = useState(false);

      // ── 2FA Setup State ──────────────────────────────
      const [setupData, setSetupData] = useState<Enable2FAResult | null>(null);
      const [showSetupDialog, setShowSetupDialog] = useState(false);
      const [showDisableDialog, setShowDisableDialog] = useState(false);

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

      // ── Enable 2FA (Step 1: get QR code) ───────────
      const enable2FAMutation = useMutation({
            mutationFn: () => repo.enable2FA(),
            onSuccess: (data) => {
                  setSetupData(data);
                  setShowSetupDialog(true);
            },
      });

      // ── Confirm 2FA (Step 2: verify first code) ────
      const confirm2FAMutation = useMutation({
            mutationFn: (code: string) => repo.confirm2FA(code),
            onSuccess: () => {
                  queryClient.invalidateQueries({ queryKey: profileKeys.me() });
            },
      });

      // ── Disable 2FA ────────────────────────────────
      const disable2FAMutation = useMutation({
            mutationFn: (data: { password: string; twoFactorCode: string }) =>
                  repo.disable2FA(data.password, data.twoFactorCode),
            onSuccess: () => {
                  queryClient.invalidateQueries({ queryKey: profileKeys.me() });
                  setShowDisableDialog(false);
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

            // 2FA Setup
            enable2FA: enable2FAMutation.mutateAsync,
            isEnabling2FA: enable2FAMutation.isPending,
            enableError: enable2FAMutation.error?.message ?? null,
            setupData,
            showSetupDialog,
            setShowSetupDialog,
            openSetupDialog: () => enable2FAMutation.mutateAsync(),

            // 2FA Confirm
            confirm2FA: confirm2FAMutation.mutateAsync,
            isConfirming2FA: confirm2FAMutation.isPending,
            confirmError: confirm2FAMutation.error?.message ?? null,

            // 2FA Disable
            disable2FA: (password: string, twoFactorCode: string) =>
                  disable2FAMutation.mutateAsync({ password, twoFactorCode }),
            isDisabling2FA: disable2FAMutation.isPending,
            disableError: disable2FAMutation.error?.message ?? null,
            showDisableDialog,
            setShowDisableDialog,
      };
}
