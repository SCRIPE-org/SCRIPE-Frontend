/**
 * useRecoveryPolicyAndSession — Policy resolution, cooldown timer lifecycle,
 * and full active-session purge for `usePasswordRecoveryViewModel`.
 *
 * @module auth/password-reset/presentation/viewmodels
 */
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useI18n } from "@core/providers/i18n-provider";
import { useServices } from "@core/providers/service-provider";
import { useAppStore } from "@core/store/useAppStore";
import { secureTokenService } from "@core/common/secure-token-service";
import { authBroadcast } from "@core/common/broadcast-auth";
import type { PasswordPolicyDto, PasswordPolicyModel } from "@core/common/password-policy";
import type { ResetWorkspaceOption } from "@modules/auth/core/domain/interfaces/IPasswordResetRepository";
import { mergePasswordPolicies, normalizePolicyInput } from "../utils/recovery-helpers";
import type { PasswordRecoveryStep } from "./usePasswordRecoveryViewModel";

/** Hook encapsulating recovery policy resolution, cooldown management, and active session purge. */
export function useRecoveryPolicyAndSession(params: {
  step: PasswordRecoveryStep;
  selectedWorkspaces: ResetWorkspaceOption[];
  verifyPolicy: PasswordPolicyModel | null;
  brandingPolicy?: PasswordPolicyDto | PasswordPolicyModel | null;
  tenantId?: string | null;
  effectiveTenantCode?: string;
}) {
  const { step, selectedWorkspaces, verifyPolicy, brandingPolicy, tenantId, effectiveTenantCode } =
    params;
  const router = useRouter();
  const queryClient = useQueryClient();
  const { t } = useI18n();
  const { authRepository } = useServices();

  const authRepoRef = useRef(authRepository);
  authRepoRef.current = authRepository;
  const tRef = useRef(t);
  tRef.current = t;

  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const hasHydrated = useAppStore((s) => s._hasHydrated);
  const storeUser = useAppStore((s) => s.user);

  const [cooldown, setCooldown] = useState(0);
  const [fetchedPolicy, setFetchedPolicy] = useState<PasswordPolicyModel | null>(null);
  const [isPolicyLoading, setIsPolicyLoading] = useState(false);
  const [policyError, setPolicyError] = useState<string | null>(null);
  const [policyRetrySeed, setPolicyRetrySeed] = useState(0);
  const [sessionDismissed, setSessionDismissed] = useState(false);
  const [isSigningOutSession, setIsSigningOutSession] = useState(false);

  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const hasActiveSession =
    !sessionDismissed && hasHydrated && isAuthenticated && secureTokenService.hasToken();
  const activeSessionEmail = storeUser?.email || storeUser?.username || "";

  useEffect(() => {
    return () => {
      if (cooldownRef.current) {
        clearInterval(cooldownRef.current);
        cooldownRef.current = null;
      }
    };
  }, []);

  const clearCooldown = useCallback(() => {
    if (cooldownRef.current) {
      clearInterval(cooldownRef.current);
      cooldownRef.current = null;
    }
    setCooldown(0);
  }, []);

  const startCooldown = useCallback((seconds: number) => {
    const safeSeconds = Math.max(1, Math.ceil(seconds));
    setCooldown(safeSeconds);
    if (cooldownRef.current) clearInterval(cooldownRef.current);
    cooldownRef.current = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) {
          if (cooldownRef.current) {
            clearInterval(cooldownRef.current);
            cooldownRef.current = null;
          }
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  }, []);

  const purgeClientAndServerSession = useCallback(
    async (callServerLogout: boolean) => {
      if (callServerLogout || secureTokenService.hasToken() || useAppStore.getState().isAuthenticated) {
        try {
          await authRepoRef.current.logout();
        } catch {
          // Local cleanup still runs deterministically below.
        }
      }
      authRepoRef.current.clearSessionOnLoginMount();
      useAppStore.getState().logout();
      queryClient.clear();
      authBroadcast.broadcastLogout();
      setSessionDismissed(true);
    },
    [queryClient]
  );

  const signOutActiveSession = useCallback(async () => {
    setIsSigningOutSession(true);
    try {
      await purgeClientAndServerSession(true);
    } finally {
      setIsSigningOutSession(false);
    }
  }, [purgeClientAndServerSession]);

  const returnToDashboard = useCallback(() => {
    router.replace("/");
  }, [router]);

  const effectivePolicy =
    mergePasswordPolicies(selectedWorkspaces.map((w) => w.passwordPolicy)) ??
    verifyPolicy ??
    normalizePolicyInput(brandingPolicy) ??
    fetchedPolicy;

  const targetPolicyTenantId =
    selectedWorkspaces.length === 1 ? selectedWorkspaces[0].tenantId : tenantId ?? undefined;

  useEffect(() => {
    if (step !== "new-password" || effectivePolicy) return;
    let cancelled = false;
    (async () => {
      setIsPolicyLoading(true);
      setPolicyError(null);
      try {
        const fetched = await authRepoRef.current.getPasswordPolicy({
          isPublic: true,
          tenantId: targetPolicyTenantId,
          tenantCode: effectiveTenantCode,
        });
        if (!cancelled) setFetchedPolicy(fetched);
      } catch {
        if (!cancelled) setPolicyError(tRef.current("auth.recoveryPolicyLoadError"));
      } finally {
        if (!cancelled) setIsPolicyLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [step, effectivePolicy, targetPolicyTenantId, effectiveTenantCode, policyRetrySeed]);

  const retryPolicy = useCallback(() => {
    setPolicyError(null);
    setPolicyRetrySeed((n) => n + 1);
  }, []);

  return {
    cooldown,
    startCooldown,
    clearCooldown,
    effectivePolicy,
    isPolicyLoading,
    policyError,
    retryPolicy,
    setPolicyError,
    hasActiveSession,
    activeSessionEmail,
    isSigningOutSession,
    signOutActiveSession,
    returnToDashboard,
    purgeClientAndServerSession,
  };
}
