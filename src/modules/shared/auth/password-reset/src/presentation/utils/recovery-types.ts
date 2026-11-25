/**
 * Type contracts for the unified password recovery state machine
 * (`/forgot-password` and `/reset-password`).
 *
 * @module auth/password-reset/presentation/utils
 */
import type { FormEvent } from "react";
import type { PasswordPolicyDto, PasswordPolicyModel } from "@core/common/password-policy";
import type { ResetWorkspaceOption } from "@modules/auth/core/domain/interfaces/IPasswordResetRepository";
import type { ResetMethod } from "./recovery-helpers";

/** Recovery flow mode: multi-step `/forgot-password` or direct link `/reset-password`. */
export type PasswordRecoveryMode = "forgot" | "reset";

/** Canonical unified steps across forgot-password and reset-password flows. */
export type PasswordRecoveryStep =
  | "request"
  | "method"
  | "otp"
  | "verifying-link"
  | "workspaces"
  | "new-password"
  | "success"
  | "invalid-link";

/** Re-exported workspace option model. */
export type WorkspaceOption = ResetWorkspaceOption;

/** Input options for {@link usePasswordRecoveryViewModel}. */
export interface UsePasswordRecoveryOptions {
  mode: PasswordRecoveryMode;
  tenantId?: string | null;
  tenantCode?: string | null;
  brandingPolicy?: PasswordPolicyDto | PasswordPolicyModel | null;
  initialEmail?: string;
  initialOtp?: string;
  initialMethod?: ResetMethod | null;
  fallbackErrorMessage?: string;
}

/** Public ViewModel contract consumed by recovery views and step components. */
export interface UsePasswordRecoveryViewModelReturn {
  mode: PasswordRecoveryMode;
  step: PasswordRecoveryStep;
  successReason: "magic-link-sent" | "password-reset";
  email: string;
  method: ResetMethod;
  otp: string;
  resetGrantToken: string | null;
  newPassword: string;
  confirmPassword: string;
  isLoading: boolean;
  error: string;
  cooldown: number;
  workspaces: WorkspaceOption[];
  selectedWorkspaces: WorkspaceOption[];
  selectedWorkspace: WorkspaceOption | null;
  allSelected: boolean;
  effectivePolicy: PasswordPolicyModel | null;
  isPolicyLoading: boolean;
  policyError: string | null;
  retryPolicy: () => void;
  tenantCode?: string;
  safeRedirect: string | null;
  loginHref: string;
  forgotPasswordHref: string;
  hasActiveSession: boolean;
  activeSessionEmail: string | null;
  isSigningOutSession: boolean;
  signOutActiveSession: () => Promise<void>;
  returnToDashboard: () => void;
  goToLogin: () => Promise<void>;
  setEmail: (value: string) => void;
  setOtp: (value: string) => void;
  setNewPassword: (value: string) => void;
  setConfirmPassword: (value: string) => void;
  submitEmail: (e?: FormEvent) => Promise<void>;
  chooseMethod: (m: ResetMethod) => Promise<void>;
  submitOtp: (e?: FormEvent) => Promise<void>;
  toggleWorkspace: (w: WorkspaceOption) => void;
  selectAllWorkspaces: () => void;
  deselectAllWorkspaces: () => void;
  confirmWorkspaceSelection: () => void;
  submitNewPassword: (e?: FormEvent) => Promise<void>;
  resendCode: () => Promise<void>;
  goBack: () => void;
  restart: () => void;
  canSubmitEmail: boolean;
  canSubmitOtp: boolean;
  canSubmitNewPassword: boolean;
  canConfirmWorkspaces: boolean;
  passwordsMatch: boolean;
}
