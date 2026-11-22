/**
 * Pure login error classification and post-login redirect helpers.
 *
 * @module auth/signin/presentation/utils
 */

import {
  TwoFactorRequiredError,
  WorkspaceSelectionRequiredError,
} from "@modules/auth/core/domain/errors/AuthErrors";
import type { WorkspaceChoice } from "@modules/auth/core/domain/errors/AuthErrors";

/** Classified authentication failure outcomes surfaced to the login ViewModel. */
export type LoginErrorClassification =
  | { kind: "two_factor"; twoFactorPendingToken?: string | null; staySignedIn?: boolean }
  | { kind: "workspace_selection"; workspaces: WorkspaceChoice[] }
  | { kind: "unactivated"; message: string }
  | { kind: "error"; message: string };

interface ApiErrorDetails {
  code?: string;
  error?: string;
}

/**
 * Classifies login mutation errors into 2FA challenge, multi-workspace picker,
 * unactivated account notice, or displayable failure message.
 */
export function classifyLoginError(err: unknown): LoginErrorClassification {
  if (
    err instanceof TwoFactorRequiredError ||
    (err instanceof Error && err.name === "TwoFactorRequiredError")
  ) {
    const twoFaErr = err as TwoFactorRequiredError;
    return {
      kind: "two_factor",
      twoFactorPendingToken: twoFaErr.twoFactorPendingToken ?? null,
      staySignedIn: Boolean(twoFaErr.staySignedIn),
    };
  }

  if (
    err instanceof WorkspaceSelectionRequiredError ||
    (err instanceof Error && err.name === "WorkspaceSelectionRequiredError") ||
    (err instanceof Error &&
      "availableWorkspaces" in err &&
      Array.isArray((err as { availableWorkspaces?: unknown }).availableWorkspaces))
  ) {
    const workspaces =
      (err as WorkspaceSelectionRequiredError).availableWorkspaces ??
      ((err as { availableWorkspaces?: WorkspaceChoice[] }).availableWorkspaces ?? []);
    return { kind: "workspace_selection", workspaces };
  }

  const details = (err as { details?: ApiErrorDetails } | null | undefined)?.details;
  const code = details?.code || details?.error;
  const message = err instanceof Error ? err.message : "Login failed";
  const lower = message.toLowerCase();
  const isUnactivated =
    code === "AUTH_ACCOUNT_NOT_ACTIVATED" ||
    code === "AccountNotActivated" ||
    lower.includes("account setup link") ||
    lower.includes("not yet activated") ||
    lower.includes("activate your account");

  if (isUnactivated) {
    return { kind: "unactivated", message };
  }

  return { kind: "error", message };
}

/**
 * Resolves the optional development `_tenant` query override in uppercase.
 */
export function resolveDevTenantCode(): string | undefined {
  if (typeof window === "undefined") return undefined;
  const rawDevCode = new URLSearchParams(window.location.search).get("_tenant") ?? undefined;
  return rawDevCode ? rawDevCode.toUpperCase() : undefined;
}

/**
 * Computes the destination path after successful authentication.
 */
export function resolvePostLoginRedirectTarget(
  queryRedirect: string | null,
  backendTarget: string | null | undefined
): string {
  return queryRedirect || (backendTarget && backendTarget !== "/" ? backendTarget : "/");
}
