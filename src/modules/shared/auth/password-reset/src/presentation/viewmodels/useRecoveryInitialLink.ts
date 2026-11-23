/**
 * useRecoveryInitialLink — Parses `#token=` / `?token=` / `?otp=` recovery
 * credentials on mount, immediately strips sensitive URL params via
 * `history.replaceState`, and auto-verifies `/reset-password` direct links.
 *
 * @module auth/password-reset/presentation/viewmodels
 */
"use client";

import type { Dispatch, MutableRefObject, SetStateAction } from "react";
import { useEffect, useRef } from "react";
import type { PasswordPolicyModel } from "@core/common/password-policy";
import type { IPasswordResetRepository } from "@modules/auth/core/domain/interfaces/IPasswordResetRepository";
import {
  extractRecoveryUrlContext,
  normalizePolicyInput,
  type ResetMethod,
} from "../utils/recovery-helpers";
import type {
  PasswordRecoveryMode,
  PasswordRecoveryStep,
  WorkspaceOption,
} from "../utils/recovery-types";

/** Input references and setters needed for mount-time recovery initialization. */
export interface UseRecoveryInitialLinkParams {
  mode: PasswordRecoveryMode;
  tenantId?: string | null;
  initialEmail?: string;
  initialOtp?: string;
  initialMethod?: ResetMethod | null;
  queryEmail: string;
  queryOtp: string;
  repoRef: MutableRefObject<IPasswordResetRepository>;
  resetCredentialMethodRef: MutableRefObject<ResetMethod>;
  setUrlTenantCode: Dispatch<SetStateAction<string | undefined>>;
  setSafeRedirectState: Dispatch<SetStateAction<string | null>>;
  setEmail: Dispatch<SetStateAction<string>>;
  setOtp: Dispatch<SetStateAction<string>>;
  setMethod: Dispatch<SetStateAction<ResetMethod>>;
  setStep: Dispatch<SetStateAction<PasswordRecoveryStep>>;
  setResetGrantToken: Dispatch<SetStateAction<string | null>>;
  setVerifyPolicy: Dispatch<SetStateAction<PasswordPolicyModel | null>>;
  setWorkspaces: Dispatch<SetStateAction<WorkspaceOption[]>>;
  setSelectedWorkspaces: Dispatch<SetStateAction<WorkspaceOption[]>>;
}

/** Runs initial recovery URL extraction, stripping, and link verification once per mount. */
export function useRecoveryInitialLink({
  mode,
  tenantId,
  initialEmail,
  initialOtp,
  initialMethod,
  queryEmail,
  queryOtp,
  repoRef,
  resetCredentialMethodRef,
  setUrlTenantCode,
  setSafeRedirectState,
  setEmail,
  setOtp,
  setMethod,
  setStep,
  setResetGrantToken,
  setVerifyPolicy,
  setWorkspaces,
  setSelectedWorkspaces,
}: UseRecoveryInitialLinkParams): void {
  const mountedRecoveryRef = useRef(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (mountedRecoveryRef.current) return;
    mountedRecoveryRef.current = true;

    const urlCtx =
      typeof window !== "undefined"
        ? extractRecoveryUrlContext(window.location.href, { stripEmailFromQuery: mode === "reset" })
        : null;

    if (urlCtx && typeof window !== "undefined" && urlCtx.hasSensitiveParams) {
      window.history.replaceState({}, document.title, urlCtx.cleanRelativeUrl);
    }
    if (urlCtx?.tenantCode) setUrlTenantCode(urlCtx.tenantCode);
    if (urlCtx?.redirect) setSafeRedirectState(urlCtx.redirect);

    const resolvedEmail = (initialEmail || urlCtx?.email || queryEmail).trim();
    const resolvedCredential = (initialOtp || urlCtx?.otp || queryOtp).trim();
    const detectedMethod: ResetMethod =
      initialMethod ??
      urlCtx?.method ??
      (urlCtx?.token && urlCtx.token === resolvedCredential ? "magic-link" : "otp");

    resetCredentialMethodRef.current = detectedMethod;
    if (resolvedEmail) setEmail(resolvedEmail);
    if (resolvedCredential) setOtp(resolvedCredential);
    setMethod(detectedMethod);

    if (mode !== "reset") return;
    if (!resolvedCredential || !resolvedEmail) {
      setStep("invalid-link");
      return;
    }

    (async () => {
      try {
        const result = await repoRef.current.verifyOtp(resolvedEmail, resolvedCredential, {
          method: detectedMethod,
          tenantId: tenantId ?? undefined,
        });
        if (!isMountedRef.current) return;
        if (result.isValid === false) {
          setStep("invalid-link");
          return;
        }
        if (result.resetGrantToken) setResetGrantToken(result.resetGrantToken);
        if (result.passwordPolicy) setVerifyPolicy(normalizePolicyInput(result.passwordPolicy));
        if (result.workspaces && result.workspaces.length > 1) {
          setWorkspaces(result.workspaces);
          setSelectedWorkspaces(result.workspaces);
          setStep("workspaces");
        } else {
          if (result.workspaces?.length === 1) {
            setWorkspaces(result.workspaces);
            setSelectedWorkspaces(result.workspaces);
          }
          setStep("new-password");
        }
      } catch {
        if (isMountedRef.current) setStep("invalid-link");
      }
    })();
  }, [
    mode,
    initialEmail,
    initialOtp,
    initialMethod,
    queryEmail,
    queryOtp,
    tenantId,
    repoRef,
    resetCredentialMethodRef,
    setUrlTenantCode,
    setSafeRedirectState,
    setEmail,
    setOtp,
    setMethod,
    setStep,
    setResetGrantToken,
    setVerifyPolicy,
    setWorkspaces,
    setSelectedWorkspaces,
  ]);
}
