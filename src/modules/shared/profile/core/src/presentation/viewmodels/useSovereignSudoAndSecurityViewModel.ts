/**
 * useSovereignSudoAndSecurityViewModel
 *
 * ViewModel hooks for biometric Sudo step-up elevation, IP/security posture,
 * and active workstation sessions telemetry.
 */
import { useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSudoStore } from "@core/store/useSudoStore";
import { assertPasskey } from "@core/services/webauthn.service";
import { container } from "@modules/profile/di";
import { invalidateOnConcurrencyConflict } from "../utils/concurrency";
import { sovereignAccountKeys } from "../utils/sovereignAccountKeys";

/** ViewModel hook coordinating WebAuthn passkey, TOTP, and password Sudo step-up elevation. */
export function useSudoViewModel() {
  const isActive = useSudoStore((s) => s.isActive);
  const expiresAtUtc = useSudoStore((s) => s.expiresAtUtc);
  const openModal = useSudoStore((s) => s.openModal);
  const hydrateStatus = useSudoStore((s) => s.hydrateStatus);
  const markVerified = useSudoStore((s) => s.markVerified);
  const markLocked = useSudoStore((s) => s.markLocked);

  const refreshStatus = useCallback(async () => {
    try {
      const status = await container.securityRepository.getSudoStatus();
      hydrateStatus(status);
      return status;
    } catch {
      return null;
    }
  }, [hydrateStatus]);

  const verifyWithPasskey = useCallback(async () => {
    const options = await container.securityRepository.beginSudoPasskey();
    const assertion = await assertPasskey({
      challenge: options.challenge,
      rpId:
        options.rpId || (typeof window !== "undefined" ? window.location.hostname : undefined),
      allowCredentials: options.allowCredentials,
      userVerification: "required",
    });
    const verified = await container.securityRepository.verifySudoStepUp({
      method: "passkey",
      passkeyAssertion: {
        credentialIdBase64: assertion.credentialIdBase64,
        authenticatorDataBase64: assertion.authenticatorDataBase64,
        clientDataJsonBase64: assertion.clientDataJsonBase64,
        signatureBase64: assertion.signatureBase64,
        userHandleBase64: assertion.userHandleBase64 ?? null,
        challengeToken: options.challengeToken,
        clientExtensionResults: assertion.clientExtensionResults,
      },
    });
    markVerified(verified);
    return verified;
  }, [markVerified]);

  const verifyWithTotp = useCallback(
    async (totpCode: string) => {
      const verified = await container.securityRepository.verifySudoStepUp({
        method: "totp",
        totpCode,
      });
      markVerified(verified);
      return verified;
    },
    [markVerified]
  );

  const verifyWithPassword = useCallback(
    async (password: string) => {
      const verified = await container.securityRepository.verifySudoStepUp({
        method: "password",
        password,
      });
      markVerified(verified);
      return verified;
    },
    [markVerified]
  );

  const lockSudo = useCallback(async () => {
    try {
      await container.securityRepository.lockSudoSession();
    } finally {
      markLocked();
    }
  }, [markLocked]);

  return {
    sudoActive: isActive,
    sudoExpiresAtUtc: expiresAtUtc,
    openSudoModal: openModal,
    refreshStatus,
    verifyWithPasskey,
    verifyWithTotp,
    verifyWithPassword,
    lockSudo,
  };
}

/** Queries security posture and mutates CIDR allowlists with optimistic concurrency checks. */
export function useSovereignSecuritySlice() {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: sovereignAccountKeys.security(),
    queryFn: () => container.sovereignAccountRepository.getSecurity(),
  });
  const updateMutation = useMutation({
    mutationFn: (
      data: Parameters<typeof container.sovereignAccountRepository.updateSecurityPosture>[0]
    ) => container.sovereignAccountRepository.updateSecurityPosture(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: sovereignAccountKeys.security() }),
    onError: (err) => {
      invalidateOnConcurrencyConflict(qc, sovereignAccountKeys.security(), err);
    },
  });
  return { ...query, updateMutation };
}

/** Presentation ViewModel exposing CIDR allowlist policy controls for the security view. */
export function useAccountSecuritySliceViewModel() {
  const { data, isLoading, isError, error, refetch, updateMutation } = useSovereignSecuritySlice();
  return {
    security: data
      ? {
          trustedCidrs: data.trustedCidrs,
          currentClientIp: data.currentClientIp,
          isCurrentIpAllowed: data.isCurrentIpAllowed,
          isTwoFactorFeatureEnabled: data.isTwoFactorFeatureEnabled,
          isSsoFeatureEnabled: data.isSsoFeatureEnabled,
          isSecurityPageEnabled: data.isSecurityPageEnabled,
          rowVersion: data.rowVersion,
        }
      : undefined,
    isLoadingSecurity: isLoading,
    isSecurityError: isError,
    securityError: error instanceof Error ? error.message : null,
    refetchSecurity: refetch,
    updateSecurityPolicy: (payload: { trustedCidrs?: string[]; rowVersion?: string }) =>
      updateMutation.mutateAsync({
        trustedCidrs: payload.trustedCidrs,
        rowVersion: payload.rowVersion ?? data?.rowVersion,
      }),
    isUpdatingPolicy: updateMutation.isPending,
    updatePolicyError: updateMutation.error,
  };
}

/** Queries active account sessions and exposes session RTT latency ping mutations. */
export function useSovereignSessionsSlice() {
  const query = useQuery({
    queryKey: sovereignAccountKeys.sessions(),
    queryFn: () => container.sovereignAccountRepository.getSessions(),
  });
  const pingMutation = useMutation({
    mutationFn: (sessionId: string) =>
      container.sovereignAccountRepository.pingSession(sessionId),
  });
  return { ...query, pingMutation };
}
