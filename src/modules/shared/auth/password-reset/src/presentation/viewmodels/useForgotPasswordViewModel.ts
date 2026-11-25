/**
 * useForgotPasswordViewModel — Thin wrapper around `usePasswordRecoveryViewModel`
 * configured for the multi-step `/forgot-password` journey.
 *
 * @module auth/password-reset/presentation/viewmodels
 */
"use client";

import type { PasswordPolicyDto, PasswordPolicyModel } from "@core/common/password-policy";
import {
  usePasswordRecoveryViewModel,
  type ResetMethod,
  type UsePasswordRecoveryViewModelReturn,
  type WorkspaceOption,
} from "./usePasswordRecoveryViewModel";

export type { WorkspaceOption, ResetMethod };

/** Legacy step names preserved for callers using `useForgotPasswordViewModel`. */
export type ForgotPasswordStep =
  | "request"
  | "method"
  | "otp"
  | "workspaces"
  | "newPassword"
  | "success";

export interface UseForgotPasswordOptions {
  tenantId?: string | null;
  tenantCode?: string | null;
  brandingPolicy?: PasswordPolicyDto | PasswordPolicyModel | null;
}

export type UseForgotPasswordViewModelReturn = UsePasswordRecoveryViewModelReturn;

/**
 * ViewModel hook for `/forgot-password`, delegating to `usePasswordRecoveryViewModel`.
 */
export function useForgotPasswordViewModel(
  options?: UseForgotPasswordOptions
): UseForgotPasswordViewModelReturn {
  return usePasswordRecoveryViewModel({
    mode: "forgot",
    tenantId: options?.tenantId,
    tenantCode: options?.tenantCode,
    brandingPolicy: options?.brandingPolicy,
  });
}
