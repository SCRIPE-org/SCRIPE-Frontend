/**
 * useResetPasswordViewModel — Thin wrapper around `usePasswordRecoveryViewModel`
 * configured for the `/reset-password` callback journey.
 *
 * @module auth/password-reset/presentation/viewmodels
 */
"use client";

import type { PasswordPolicyDto, PasswordPolicyModel } from "@core/common/password-policy";
import {
  usePasswordRecoveryViewModel,
  type UsePasswordRecoveryViewModelReturn,
} from "./usePasswordRecoveryViewModel";

/** Canonical reset-link step type alias. */
export type ResetPasswordStep = UsePasswordRecoveryViewModelReturn["step"];

export interface UseResetPasswordOptions {
  email?: string;
  otp?: string;
  tenantId?: string | null;
  tenantCode?: string | null;
  brandingPolicy?: PasswordPolicyDto | PasswordPolicyModel | null;
  fallbackErrorMessage?: string;
}

/**
 * ViewModel hook for `/reset-password`, delegating to `usePasswordRecoveryViewModel`.
 */
export function useResetPasswordViewModel(
  params?: UseResetPasswordOptions
): UsePasswordRecoveryViewModelReturn {
  return usePasswordRecoveryViewModel({
    mode: "reset",
    initialEmail: params?.email,
    initialOtp: params?.otp,
    tenantId: params?.tenantId,
    tenantCode: params?.tenantCode,
    brandingPolicy: params?.brandingPolicy,
    fallbackErrorMessage: params?.fallbackErrorMessage,
  });
}
