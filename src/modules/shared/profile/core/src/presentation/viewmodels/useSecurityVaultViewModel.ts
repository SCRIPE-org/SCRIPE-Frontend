"use client";

/**
 * useSecurityVaultViewModel
 *
 * ViewModel for the Security & Identity Vault view.
 * Coordinates FIDO2/WebAuthn Level 3 Passkeys, TOTP 2FA, Biometric Sudo Mode step-up,
 * Password Rotation, and Emergency Lockdown.
 */
import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { container } from "@modules/profile/di";
import {
  registerPasskey,
  assertPasskey,
  isWebAuthnAvailable,
  isPlatformAuthenticatorAvailable,
  detectDeviceBadge,
  type AuthenticatorMode,
} from "@core/services/webauthn.service";
import type { ChangePasswordRequest } from "../../domain/interfaces/IProfileRepository";
import type { PasskeyCredential } from "../../domain/entities/PasskeyCredential";

export const securityVaultKeys = {
  all: ["profile", "security"] as const,
  passkeys: () => [...securityVaultKeys.all, "passkeys"] as const,
  status2fa: () => [...securityVaultKeys.all, "2fa-status"] as const,
};

export function useSecurityVaultViewModel() {
  const securityRepo = container.securityRepository;
  const profileRepo = container.profileRepository;
  const queryClient = useQueryClient();

  // WebAuthn capability state
  const [webAuthnSupported, setWebAuthnSupported] = useState(false);
  const [platformSupported, setPlatformSupported] = useState(false);

  // Sudo mode state
  const [sudoToken, setSudoToken] = useState<string | null>(null);
  const [sudoExpiresAt, setSudoExpiresAt] = useState<Date | null>(null);

  // 2FA Setup state
  const [twoFaSetupData, setTwoFaSetupData] = useState<{
    qrCodeDataUri: string;
    manualEntryKey: string;
    backupCodes: string[];
  } | null>(null);

  useEffect(() => {
    isWebAuthnAvailable().then(setWebAuthnSupported);
    isPlatformAuthenticatorAvailable().then(setPlatformSupported);
  }, []);

  // Passkeys query
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

  // Profile data for 2FA status
  const { data: profile, refetch: refetchProfile } = useQuery({
    queryKey: ["profile", "me"],
    queryFn: () => profileRepo.getProfile(),
    staleTime: 60 * 1000,
  });

  // Passkey enrollment mutation
  const enrollPasskeyMutation = useMutation({
    mutationFn: async ({
      deviceName,
      mode = "platform",
    }: {
      deviceName: string;
      mode?: AuthenticatorMode;
    }) => {
      const options = await securityRepo.beginPasskeyRegistration(deviceName);
      const attestation = await registerPasskey(options, mode);
      return securityRepo.completePasskeyRegistration({
        attestationObjectBase64: attestation.attestationObjectBase64,
        clientDataJsonBase64: attestation.clientDataJsonBase64,
        deviceName,
        transports: attestation.transports,
        clientExtensionResults: attestation.clientExtensionResults,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: securityVaultKeys.passkeys() });
    },
  });

  // Passkey removal mutation
  const removePasskeyMutation = useMutation({
    mutationFn: (id: string) => securityRepo.removePasskey(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: securityVaultKeys.passkeys() });
    },
  });

  // Passkey rename mutation
  const renamePasskeyMutation = useMutation({
    mutationFn: ({ id, newName }: { id: string; newName: string }) =>
      securityRepo.renamePasskey(id, newName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: securityVaultKeys.passkeys() });
    },
  });

  // Biometric Sudo Mode Step-up
  const verifySudoMutation = useMutation({
    mutationFn: async () => {
      // Get challenge options for sudo authentication (authentication ceremony, NOT registration)
      const options = await securityRepo.beginPasskeyAuth();
      const assertion = await assertPasskey({
        challenge: options.challenge,
        rpId: options.rpId || (typeof window !== "undefined" ? window.location.hostname : undefined),
        allowCredentials: options.allowCredentials,
        userVerification: "required",
      });
      const result = await securityRepo.sudoVerify({
        credentialIdBase64: assertion.credentialIdBase64,
        authenticatorDataBase64: assertion.authenticatorDataBase64,
        clientDataJsonBase64: assertion.clientDataJsonBase64,
        signatureBase64: assertion.signatureBase64,
        clientExtensionResults: assertion.clientExtensionResults,
      });
      return result;
    },
    onSuccess: (res) => {
      setSudoToken(res.sudoToken);
      const seconds = res.expiresInSeconds || 300;
      const expiry = new Date(Date.now() + seconds * 1000);
      setSudoExpiresAt(expiry);
    },
  });

  // 2FA Setup
  const begin2FaSetupMutation = useMutation({
    mutationFn: () => securityRepo.enable2FA(),
    onSuccess: (data) => {
      setTwoFaSetupData(data);
    },
  });

  const confirm2FaMutation = useMutation({
    mutationFn: (code: string) => securityRepo.confirm2FA(code),
    onSuccess: () => {
      setTwoFaSetupData(null);
      refetchProfile();
    },
  });

  const disable2FaMutation = useMutation({
    mutationFn: ({ password, code }: { password: string; code: string }) =>
      securityRepo.disable2FA(password, code),
    onSuccess: () => {
      refetchProfile();
    },
  });

  const regenerateBackupCodesMutation = useMutation({
    mutationFn: (code: string) => securityRepo.regenerateBackupCodes(code),
  });

  // Password change mutation
  const changePasswordMutation = useMutation({
    mutationFn: (data: ChangePasswordRequest) => securityRepo.changePassword(data),
  });

  // Emergency lockdown mutation
  const emergencyLockdownMutation = useMutation({
    mutationFn: () => securityRepo.emergencyLockdown(),
    onSuccess: () => {
      queryClient.clear();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    },
  });

  const isSudoActive = useCallback(() => {
    if (!sudoToken || !sudoExpiresAt) return false;
    return sudoExpiresAt.getTime() > Date.now();
  }, [sudoToken, sudoExpiresAt]);

  const passkeysWithBadges: PasskeyCredential[] = passkeys.map((pk) => ({
    ...pk,
    badge: pk.badge ?? detectDeviceBadge(pk.aaguid || undefined),
  }));

  return {
    passkeys: passkeysWithBadges,
    isLoadingPasskeys,
    passkeysError: passkeysError?.message ?? null,
    refetchPasskeys,
    detectDeviceBadge,

    webAuthnSupported,
    platformSupported,

    // Passkey actions
    enrollPasskey: enrollPasskeyMutation.mutateAsync,
    isEnrollingPasskey: enrollPasskeyMutation.isPending,
    enrollError: enrollPasskeyMutation.error?.message ?? null,

    removePasskey: removePasskeyMutation.mutateAsync,
    isRemovingPasskey: removePasskeyMutation.isPending,

    renamePasskey: renamePasskeyMutation.mutateAsync,
    isRenamingPasskey: renamePasskeyMutation.isPending,

    // Sudo mode
    isSudoActive: isSudoActive(),
    sudoToken,
    sudoExpiresAt,
    verifySudo: verifySudoMutation.mutateAsync,
    isVerifyingSudo: verifySudoMutation.isPending,
    sudoError: verifySudoMutation.error?.message ?? null,

    // 2FA
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
    regenerateBackupCodes: regenerateBackupCodesMutation.mutateAsync,
    isRegeneratingCodes: regenerateBackupCodesMutation.isPending,

    // Password
    changePassword: changePasswordMutation.mutateAsync,
    isChangingPassword: changePasswordMutation.isPending,
    changePasswordError: changePasswordMutation.error?.message ?? null,
    isPasswordExpired: !!profile?.isPasswordExpired,
    passwordLastChanged: profile?.passwordLastChanged ?? null,

    // Emergency lockdown
    emergencyLockdown: emergencyLockdownMutation.mutateAsync,
    isLockingDown: emergencyLockdownMutation.isPending,
  };
}
