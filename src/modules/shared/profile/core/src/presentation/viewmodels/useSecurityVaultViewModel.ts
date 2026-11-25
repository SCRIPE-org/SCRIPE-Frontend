"use client";

/**
 * useSecurityVaultViewModel
 *
 * ViewModel for the Security & Identity Vault view.
 * Coordinates FIDO2/WebAuthn Level 3 Passkeys, TOTP 2FA, Biometric Sudo Mode step-up,
 * Password Rotation, and Emergency Lockdown.
 */
import { useState, useEffect, useCallback, useRef } from "react";
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
import { isSudoCancelledError } from "../utils/sudoElevation";

/** React Query key factory for security vault queries (passkeys & 2FA status). */
export const securityVaultKeys = {
  all: ["profile", "security"] as const,
  passkeys: () => [...securityVaultKeys.all, "passkeys"] as const,
  status2fa: () => [...securityVaultKeys.all, "2fa-status"] as const,
};

/** ViewModel coordinating passkeys, 2FA, sudo elevation, password rotation, and lockdown. */
export function useSecurityVaultViewModel() {
  const securityRepo = container.securityRepository;
  const { authRepository } = useServices();
  const queryClient = useQueryClient();
  const router = useRouter();
  const requireMfaEnrollment = useAppStore((s) => s.requireMfaEnrollment);
  const hasConfirmed2FaRef = useRef(false);

  const finalizeMfaEnrollmentIfRequired = useCallback(async () => {
    if (!useAppStore.getState().requireMfaEnrollment) return;
    try {
      const refreshRes = await authRepository.refreshToken();
      if (refreshRes.kind !== "ok") return;
      const stillRequired = Boolean(refreshRes.value.requireMfaEnrollment);
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

  const { data: securitySlice, refetch: refetchSecuritySlice } = useQuery({
    queryKey: sovereignAccountKeys.security(),
    queryFn: async () => {
      const repo = container.sovereignAccountRepository;
      if (repo && typeof repo.getSecurity === "function") {
        return repo.getSecurity();
      }
      return null;
    },
    staleTime: 30 * 1000,
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
    void refetchSecuritySlice();
    queryClient.invalidateQueries({ queryKey: sovereignAccountKeys.context() });
    queryClient.invalidateQueries({ queryKey: sovereignAccountKeys.security() });
  };

  const begin2FaSetupMutation = useMutation({
    mutationFn: () => securityRepo.enable2FA(),
    onSuccess: (data) => {
      hasConfirmed2FaRef.current = false;
      setTwoFaSetupData(data);
    },
  });

  const confirm2FaMutation = useMutation({
    mutationFn: (code: string) => securityRepo.confirm2FA(code),
    onSuccess: () => {
      // Preserve twoFaSetupData so TwoFactorWizardModal advances to the BACKUP step
      // and lets the user copy/download recovery codes before clearing mfa_enroll.
      hasConfirmed2FaRef.current = true;
      invalidateContextAndSecurity();
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
      invalidateContextAndSecurity();
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: (data: ChangePasswordRequest) =>
      securityRepo.changePassword(
        data,
        useSudoStore.getState().getValidSudoToken() ?? undefined
      ),
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
      invalidateContextAndSecurity();
      queryClient.invalidateQueries({ queryKey: sovereignAccountKeys.sessions() });
    },
  });

  const emergencyLockdownMutation = useMutation({
    mutationFn: () => securityRepo.emergencyLockdown(),
    onSuccess: () => finalizeEmergencyLockdownCleanup(queryClient, authRepository, markLocked),
  });

  const sudoExpiresAt = sudoExpiresAtUtc ? new Date(sudoExpiresAtUtc) : null;
  const parsedPasswordLastChanged = securitySlice?.passwordLastChangedUtc
    ? new Date(securitySlice.passwordLastChangedUtc)
    : null;
  const passwordLastChanged =
    parsedPasswordLastChanged && !Number.isNaN(parsedPasswordLastChanged.getTime())
      ? parsedPasswordLastChanged
      : null;
  const clearTwoFaSetup = useCallback(async () => {
    const confirmed = hasConfirmed2FaRef.current;
    hasConfirmed2FaRef.current = false;
    setTwoFaSetupData(null);
    if (confirmed) {
      await finalizeMfaEnrollmentIfRequired();
    }
  }, [finalizeMfaEnrollmentIfRequired]);

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
    enrollError:
      enrollPasskeyMutation.error && !isSudoCancelledError(enrollPasskeyMutation.error)
        ? enrollPasskeyMutation.error.message
        : null,
    resetEnrollError: enrollPasskeyMutation.reset,
    removePasskey: removePasskeyMutation.mutateAsync,
    isRemovingPasskey: removePasskeyMutation.isPending,
    removePasskeyError:
      removePasskeyMutation.error && !isSudoCancelledError(removePasskeyMutation.error)
        ? removePasskeyMutation.error
        : null,
    renamePasskey: renamePasskeyMutation.mutateAsync,
    isRenamingPasskey: renamePasskeyMutation.isPending,
    renamePasskeyError:
      renamePasskeyMutation.error && !isSudoCancelledError(renamePasskeyMutation.error)
        ? renamePasskeyMutation.error.message
        : null,
    isSudoActive,
    sudoToken,
    sudoExpiresAt,
    sudoMethodUsed,
    openSudoModal,
    lockSudoSession,
    verifySudo: verifySudoMutation.mutateAsync,
    isVerifyingSudo: verifySudoMutation.isPending,
    sudoError: verifySudoMutation.error?.message ?? null,
    isTwoFactorEnabled: Boolean(securitySlice?.isTwoFactorEnabled),
    backupCodesRemaining: securitySlice?.backupCodesRemaining ?? null,
    twoFaSetupData,
    clearTwoFaSetup,
    begin2FaSetup: begin2FaSetupMutation.mutateAsync,
    isBeginning2Fa: begin2FaSetupMutation.isPending,
    confirm2Fa: confirm2FaMutation.mutateAsync,
    isConfirming2Fa: confirm2FaMutation.isPending,
    disable2Fa: disable2FaMutation.mutateAsync,
    isDisabling2Fa: disable2FaMutation.isPending,
    disable2FaError:
      disable2FaMutation.error && !isSudoCancelledError(disable2FaMutation.error)
        ? disable2FaMutation.error.message
        : null,
    regenerateBackupCodes: regenerateBackupCodesMutation.mutateAsync,
    isRegeneratingCodes: regenerateBackupCodesMutation.isPending,
    regenerateCodesError:
      regenerateBackupCodesMutation.error &&
      !isSudoCancelledError(regenerateBackupCodesMutation.error)
        ? regenerateBackupCodesMutation.error.message
        : null,
    changePassword: changePasswordMutation.mutateAsync,
    isChangingPassword: changePasswordMutation.isPending,
    changePasswordError:
      changePasswordMutation.error && !isSudoCancelledError(changePasswordMutation.error)
        ? changePasswordMutation.error.message
        : null,
    passwordPolicy,
    isLoadingPasswordPolicy,
    passwordPolicyError: passwordPolicyErrorObj?.message ?? null,
    refetchPasswordPolicy,
    isPasswordExpired: Boolean(securitySlice?.isPasswordExpired),
    daysUntilPasswordExpiry: securitySlice?.daysUntilPasswordExpiry ?? null,
    passwordLastChanged,
    requireMfaEnrollment,
    emergencyLockdown: emergencyLockdownMutation.mutateAsync,
    isLockingDown: emergencyLockdownMutation.isPending,
  };
}
