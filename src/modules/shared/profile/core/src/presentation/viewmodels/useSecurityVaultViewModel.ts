"use client";

/**
 * useSecurityVaultViewModel
 *
 * ViewModel for the Security & Identity Vault view.
 * Coordinates FIDO2/WebAuthn Level 3 Passkeys, TOTP 2FA, Biometric Sudo Mode step-up,
 * Password Rotation, and Emergency Lockdown.
 */
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppStore } from "@core/store/useAppStore";
import { useSudoStore } from "@core/store/useSudoStore";
import { useNavigationStore } from "@core/navigation/store/useNavigationStore";
import { useServices } from "@core/providers/service-provider";
import { secureTokenService } from "@core/common/secure-token-service";
import { container } from "@modules/profile/di";
import { finalizeEmergencyLockdownCleanup } from "../utils/emergency-lockdown";
import {
  isWebAuthnAvailable,
  isPlatformAuthenticatorAvailable,
  detectDeviceBadge,
} from "@core/services/webauthn.service";
import type { ChangePasswordRequest } from "../../domain/interfaces/IProfileRepository";
import type { PasskeyCredential } from "../../domain/entities/PasskeyCredential";
import { sovereignAccountKeys } from "./useSovereignAccountSlicesViewModel";
import { useSecurityPasskeyActions } from "./useSecurityPasskeyActions";

/** React Query key factory for security vault queries (passkeys & 2FA status). */
export const securityVaultKeys = {
  all: ["profile", "security"] as const,
  passkeys: () => [...securityVaultKeys.all, "passkeys"] as const,
  status2fa: () => [...securityVaultKeys.all, "2fa-status"] as const,
};

/** ViewModel coordinating passkeys, 2FA, sudo elevation, password rotation, and lockdown. */
export function useSecurityVaultViewModel() {
  const securityRepo = container.securityRepository;
  const profileRepo = container.profileRepository;
  const { authRepository } = useServices();
  const queryClient = useQueryClient();
  const router = useRouter();
  const requireMfaEnrollment = useAppStore((s) => s.requireMfaEnrollment);

  const finalizeMfaEnrollmentIfRequired = useCallback(async () => {
    if (!useAppStore.getState().requireMfaEnrollment) return;
    try {
      const refreshRes = await authRepository.refreshToken();
      const stillRequired =
        refreshRes.kind === "ok" ? Boolean(refreshRes.value.requireMfaEnrollment) : false;
      useAppStore.getState().setRequireMfaEnrollment(stillRequired);
      if (!stillRequired) {
        useNavigationStore.getState().clearRouteData();
        useNavigationStore.getState().reset();
        await queryClient.invalidateQueries();
        router.replace("/");
      }
    } catch {
      // Retain /account/security so user can retry refresh or re-authenticate cleanly
    }
  }, [authRepository, queryClient, router]);

  const [webAuthnSupported, setWebAuthnSupported] = useState(false);
  const [platformSupported, setPlatformSupported] = useState(false);

  const isSudoActive = useSudoStore((s) => s.isActive);
  const sudoToken = useSudoStore((s) => s.sudoToken);
  const sudoExpiresAtUtc = useSudoStore((s) => s.expiresAtUtc);
  const sudoMethodUsed = useSudoStore((s) => s.methodUsed);
  const openSudoModal = useSudoStore((s) => s.openModal);
  const requestElevation = useSudoStore((s) => s.requestElevation);
  const markLocked = useSudoStore((s) => s.markLocked);

  const [twoFaSetupData, setTwoFaSetupData] = useState<{
    qrCodeDataUri: string;
    manualEntryKey: string;
    backupCodes: string[];
  } | null>(null);

  useEffect(() => {
    isWebAuthnAvailable().then(setWebAuthnSupported);
    isPlatformAuthenticatorAvailable().then(setPlatformSupported);
  }, []);

  const {
    data: passkeys = [],
    isLoading: isLoadingPasskeys,
    error: passkeysError,
    refetch: refetchPasskeys,
  } = useQuery({
    queryKey: securityVaultKeys.passkeys(),
    queryFn: () => securityRepo.listPasskeys(),
    staleTime: 30 * 1000,
  });

  const { data: profile, refetch: refetchProfile } = useQuery({
    queryKey: ["profile", "me"],
    queryFn: () => profileRepo.getProfile(),
    staleTime: 60 * 1000,
  });

  const {
    data: passwordPolicy = null,
    isLoading: isLoadingPasswordPolicy,
    error: passwordPolicyErrorObj,
    refetch: refetchPasswordPolicy,
  } = useQuery({
    queryKey: [...securityVaultKeys.all, "password-policy"],
    queryFn: () => securityRepo.getPasswordPolicy(),
    staleTime: 5 * 60 * 1000,
  });

  const { enrollPasskeyMutation, removePasskeyMutation, renamePasskeyMutation } =
    useSecurityPasskeyActions(securityVaultKeys.passkeys(), finalizeMfaEnrollmentIfRequired);

  const verifySudoMutation = useMutation({
    mutationFn: async () => {
      const token = await requestElevation();
      return { sudoToken: token, expiresInSeconds: 900 };
    },
  });

  const lockSudoSession = useCallback(async () => {
    try {
      await securityRepo.lockSudoSession();
    } finally {
      markLocked();
    }
  }, [securityRepo, markLocked]);

  const invalidateContextAndSecurity = () => {
    refetchProfile();
    queryClient.invalidateQueries({ queryKey: sovereignAccountKeys.context() });
    queryClient.invalidateQueries({ queryKey: sovereignAccountKeys.security() });
  };

  const begin2FaSetupMutation = useMutation({
    mutationFn: () => securityRepo.enable2FA(),
    onSuccess: (data) => setTwoFaSetupData(data),
  });

  const confirm2FaMutation = useMutation({
    mutationFn: (code: string) => securityRepo.confirm2FA(code),
    onSuccess: async () => {
      setTwoFaSetupData(null);
      invalidateContextAndSecurity();
      await finalizeMfaEnrollmentIfRequired();
    },
  });

  const disable2FaMutation = useMutation({
    mutationFn: ({ password, code }: { password: string; code: string }) =>
      securityRepo.disable2FA(password, code),
    onSuccess: invalidateContextAndSecurity,
  });

  const regenerateBackupCodesMutation = useMutation({
    mutationFn: (code: string) => securityRepo.regenerateBackupCodes(code),
    onSuccess: () => {
      refetchProfile();
      queryClient.invalidateQueries({ queryKey: sovereignAccountKeys.security() });
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: (data: ChangePasswordRequest) => securityRepo.changePassword(data),
    onSuccess: (result) => {
      if (result && typeof result === "object" && "accessToken" in result && result.accessToken) {
        secureTokenService.setAccessToken(result.accessToken);
        if (result.expiresAt) {
          const parsedExpiry = Date.parse(result.expiresAt);
          if (!Number.isNaN(parsedExpiry)) {
            secureTokenService.setTokenExpiry(parsedExpiry);
          }
        }
      }
      refetchProfile();
      queryClient.invalidateQueries({ queryKey: sovereignAccountKeys.security() });
      queryClient.invalidateQueries({ queryKey: sovereignAccountKeys.sessions() });
    },
  });

  const emergencyLockdownMutation = useMutation({
    mutationFn: () => securityRepo.emergencyLockdown(),
    onSuccess: () => finalizeEmergencyLockdownCleanup(queryClient, authRepository, markLocked),
  });

  const sudoExpiresAt = sudoExpiresAtUtc ? new Date(sudoExpiresAtUtc) : null;
  const passkeysWithBadges: PasskeyCredential[] = passkeys.map((pk) => ({
    ...pk,
    badge: pk.badge ?? detectDeviceBadge(pk.aaguid || undefined),
  }));

  return {
    passkeys: passkeysWithBadges,
    isLoadingPasskeys,
    passkeysError: passkeysError?.message ?? null,
    isPasskeysError: Boolean(passkeysError),
    refetchPasskeys,
    detectDeviceBadge,
    webAuthnSupported,
    platformSupported,
    enrollPasskey: enrollPasskeyMutation.mutateAsync,
    isEnrollingPasskey: enrollPasskeyMutation.isPending,
    enrollError: enrollPasskeyMutation.error?.message ?? null,
    resetEnrollError: enrollPasskeyMutation.reset,
    removePasskey: removePasskeyMutation.mutateAsync,
    isRemovingPasskey: removePasskeyMutation.isPending,
    removePasskeyError: removePasskeyMutation.error ?? null,
    renamePasskey: renamePasskeyMutation.mutateAsync,
    isRenamingPasskey: renamePasskeyMutation.isPending,
    renamePasskeyError: renamePasskeyMutation.error?.message ?? null,
    isSudoActive,
    sudoToken,
    sudoExpiresAt,
    sudoMethodUsed,
    openSudoModal,
    lockSudoSession,
    verifySudo: verifySudoMutation.mutateAsync,
    isVerifyingSudo: verifySudoMutation.isPending,
    sudoError: verifySudoMutation.error?.message ?? null,
    isTwoFactorEnabled: !!profile?.isTwoFactorEnabled,
    backupCodesRemaining: profile?.backupCodesRemaining ?? null,
    twoFaSetupData,
    clearTwoFaSetup: () => setTwoFaSetupData(null),
    begin2FaSetup: begin2FaSetupMutation.mutateAsync,
    isBeginning2Fa: begin2FaSetupMutation.isPending,
    confirm2Fa: confirm2FaMutation.mutateAsync,
    isConfirming2Fa: confirm2FaMutation.isPending,
    disable2Fa: disable2FaMutation.mutateAsync,
    isDisabling2Fa: disable2FaMutation.isPending,
    disable2FaError: disable2FaMutation.error?.message ?? null,
    regenerateBackupCodes: regenerateBackupCodesMutation.mutateAsync,
    isRegeneratingCodes: regenerateBackupCodesMutation.isPending,
    regenerateCodesError: regenerateBackupCodesMutation.error?.message ?? null,
    changePassword: changePasswordMutation.mutateAsync,
    isChangingPassword: changePasswordMutation.isPending,
    changePasswordError: changePasswordMutation.error?.message ?? null,
    passwordPolicy,
    isLoadingPasswordPolicy,
    passwordPolicyError: passwordPolicyErrorObj?.message ?? null,
    refetchPasswordPolicy,
    isPasswordExpired: !!profile?.isPasswordExpired,
    passwordLastChanged: profile?.passwordLastChanged ?? null,
    requireMfaEnrollment,
    emergencyLockdown: emergencyLockdownMutation.mutateAsync,
    isLockingDown: emergencyLockdownMutation.isPending,
  };
}
