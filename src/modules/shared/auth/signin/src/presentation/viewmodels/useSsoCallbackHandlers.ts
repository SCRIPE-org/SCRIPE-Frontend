/**
 * useSsoCallbackHandlers — Pure async SSO callback processors (OIDC, OAuth 2.0, SAML 2.0).
 *
 * Plain async functions accepting injected dependencies (no React hooks) so they are
 * independently testable. Supports:
 *  - Federated account-linking callback (`{ linked: true }` on OIDC or `?linked=1` on SAML)
 *    redirecting to `/account/security?ssoLinked=success` without requiring in-memory JWT.
 *  - Hybrid IdP MFA step-up (`requires2FA + twoFactorPendingToken`) transitioning to `two_factor`.
 *  - Multi-workspace selection (`requiresWorkspaceSelection`).
 */
import { secureTokenService } from "@core/common/secure-token-service";
import type { IAuthRepository } from "@modules/auth/core/domain/interfaces/IAuthRepository";
import type { ISsoRepository } from "@modules/auth/core/domain/interfaces/ISsoRepository";
import type { SsoCallbackResult } from "@modules/auth/core/domain/entities/SsoProvider";
import type { User } from "@modules/auth/core/domain/entities/User";
import type { WorkspaceChoice } from "@modules/auth/core/domain/errors/AuthErrors";
import type { PermissionCode, AdminRole } from "@core/common/types/permissions";
import type { SsoCallbackError, SsoCallbackState } from "./useSsoCallbackHandler";
import { buildPostAuthEntryUrl } from "../utils/redirect-safety";

const SSO_LINKING_STORAGE_KEY = "sso_linking";

/** Pending passwordless 2FA state handed off from OIDC/SAML callback to the 2FA form. */
export interface SsoTwoFactorPendingData {
  token: string;
  staySignedIn: boolean;
  email?: string;
}

/** Injected dependencies for SSO callback handlers. */
export interface SsoCallbackDeps {
  authRepository: IAuthRepository;
  ssoRepository: ISsoRepository;
  setAuth: (user: User, permissions: PermissionCode[], roles: AdminRole[], isFreshLogin?: boolean) => void;
  setSubscriptionInfo: (status: string | null, grace: string | null, edition: string | null) => void;
  setMustChangePassword?: (mustChange: boolean) => void;
  refreshNavigation: () => Promise<void>;
  invalidateQueries: () => void;
  operationSuccess: (msg: string) => void;
  t: (key: string) => string;
}

/** UI state setters passed into SSO callback handlers. */
export interface SsoCallbackSetters {
  setState: (s: SsoCallbackState) => void;
  setErrorInfo: (e: SsoCallbackError | null) => void;
  redirectTo: (path: string) => void;
  setWorkspaceSelectionData?: (data: { workspaces: WorkspaceChoice[]; token: string; email?: string }) => void;
  setTwoFactorPending?: (data: SsoTwoFactorPendingData) => void;
}

/** Minimal search-params reader compatible with Next.js `ReadonlyURLSearchParams` and `URLSearchParams`. */
export type SsoSearchParams = { get: (key: string) => string | null };

function isLinkingFlowActive(): boolean {
  return typeof window !== "undefined" && sessionStorage.getItem(SSO_LINKING_STORAGE_KEY) === "true";
}

function clearLinkingFlag(): void {
  if (typeof window !== "undefined") sessionStorage.removeItem(SSO_LINKING_STORAGE_KEY);
}

/** Returns true when an API error indicates the external identity is not linked to any admin account. */
export function isNoLinkedAccountError(error: unknown): boolean {
  const details = (error as { details?: { error?: string } })?.details;
  return (
    (error instanceof Error && error.message.includes("no_linked_account")) ||
    details?.error === "no_linked_account"
  );
}

/** Completes an authenticated admin session after OIDC or SAML callback redemption. */
export async function completeAdminLogin(
  accessToken: string,
  subscription: {
    status?: string | null;
    gracePhase?: string | null;
    editionName?: string | null;
    mustChangePassword?: boolean;
  },
  deps: SsoCallbackDeps,
  setters: SsoCallbackSetters
): Promise<void> {
  secureTokenService.setAccessToken(accessToken);
  const user = await deps.authRepository.getCurrentPrincipal();
  deps.setAuth(user, (user.permissions || []) as PermissionCode[], (user.roles || []) as AdminRole[], true);
  deps.setSubscriptionInfo(subscription.status ?? null, subscription.gracePhase ?? null, subscription.editionName ?? null);
  const mustChange = Boolean(subscription.mustChangePassword);
  deps.setMustChangePassword?.(mustChange);
  deps.operationSuccess(deps.t("auth.welcomeBack"));
  if (!mustChange && subscription.status !== "PendingPayment") deps.invalidateQueries();
  const redirect = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("redirect") : null;
  const targetPath = buildPostAuthEntryUrl({ mustChangePassword: mustChange, subscriptionStatus: subscription.status, redirect });
  setters.setState("success");
  setTimeout(() => setters.redirectTo(targetPath), 300);
}

async function dispatchCallbackResult(
  result: SsoCallbackResult,
  deps: SsoCallbackDeps,
  setters: SsoCallbackSetters
): Promise<void> {
  // Hybrid IdP MFA step-up (BAM-01)
  if (result.requires2FA && result.twoFactorPendingToken && setters.setTwoFactorPending) {
    setters.setTwoFactorPending({
      token: result.twoFactorPendingToken,
      staySignedIn: Boolean(result.staySignedIn),
      email: result.email,
    });
    setters.setState("two_factor");
    return;
  }

  if (
    result.requiresWorkspaceSelection &&
    result.availableWorkspaces &&
    result.token &&
    setters.setWorkspaceSelectionData
  ) {
    setters.setWorkspaceSelectionData({
      workspaces: result.availableWorkspaces as WorkspaceChoice[],
      token: result.token,
      email: result.email,
    });
    setters.setState("workspace_selection");
    return;
  }

  if (result.type === "admin" && result.accessToken) {
    await completeAdminLogin(
      result.accessToken,
      {
        status: result.subscriptionStatus,
        gracePhase: result.gracePhase,
        editionName: result.editionName,
        mustChangePassword: result.mustChangePassword,
      },
      deps,
      setters
    );
    return;
  }

  if (result.type === "user" && result.accessToken) {
    secureTokenService.setAccessToken(result.accessToken);
    const user = await deps.authRepository.getCurrentPrincipal();
    deps.setAuth(
      user,
      (user.permissions || []) as PermissionCode[],
      (user.roles || []) as AdminRole[],
      true
    );
    const queryRedirect =
      typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("redirect") : null;
    const targetPath = buildPostAuthEntryUrl({
      mustChangePassword: Boolean(result.mustChangePassword),
      subscriptionStatus: result.subscriptionStatus,
      redirect: queryRedirect,
    });
    deps.operationSuccess(deps.t("auth.welcomeBack"));
    deps.invalidateQueries();
    setters.setState("success");
    setTimeout(() => setters.redirectTo(targetPath), 300);
    return;
  }

  setters.setState("error");
  setters.setErrorInfo({
    title: deps.t("auth.sso.callbackError"),
    message: deps.t("auth.sso.unsupportedAccountType"),
  });
}

/**
 * Processes an OIDC/OAuth 2.0 callback (`code` + `state`), supporting federated account linking,
 * hybrid IdP MFA step-up (`requires2FA + twoFactorPendingToken`), workspace selection, and login.
 */
export async function handleOidcCallback(
  searchParams: SsoSearchParams,
  deps: SsoCallbackDeps,
  setters: SsoCallbackSetters
): Promise<void> {
  const errorParam = searchParams.get("error");
  const isLinking = isLinkingFlowActive();

  if (errorParam) {
    clearLinkingFlag();
    if (isLinking) {
      setters.redirectTo(`/account/security?error=${encodeURIComponent(errorParam)}`);
      return;
    }
    setters.setState("error");
    setters.setErrorInfo({ title: deps.t("auth.sso.callbackError"), message: decodeURIComponent(errorParam) });
    return;
  }

  const code = searchParams.get("code");
  const stateParam = searchParams.get("state");
  if (!code || !stateParam) {
    clearLinkingFlag();
    if (isLinking) {
      setters.redirectTo("/account/security?error=sso_missing_params");
      return;
    }
    setters.setState("error");
    setters.setErrorInfo({ title: deps.t("auth.sso.callbackError"), message: deps.t("auth.sso.missingParams") });
    return;
  }

  try {
    const result = await deps.ssoRepository.completeCallback(code, stateParam);
    clearLinkingFlag();

    if (result.linked) {
      deps.operationSuccess(deps.t("auth.sso.accountLinkedSuccess"));
      setters.setState("success");
      setters.redirectTo("/account/security?ssoLinked=success");
      return;
    }

    await dispatchCallbackResult(result, deps, setters);
  } catch (error) {
    clearLinkingFlag();
    if (isLinking) {
      const codeParam = error instanceof Error ? encodeURIComponent(error.message) : "sso_link_failed";
      setters.redirectTo(`/account/security?error=${codeParam}`);
      return;
    }
    if (isNoLinkedAccountError(error)) {
      setters.setState("no_linked_account");
      setters.setErrorInfo({ title: deps.t("auth.sso.noLinkedAccount"), message: deps.t("auth.sso.noLinkedAccountDesc") });
      return;
    }
    setters.setState("error");
    setters.setErrorInfo({
      title: deps.t("auth.sso.callbackError"),
      message: error instanceof Error ? error.message : deps.t("auth.sso.callbackErrorGeneric"),
    });
  }
}

/**
 * Processes a SAML 2.0 ACS callback redirect (`?linked=1`, `?error=`, or opaque `?code=&state=`).
 */
export async function handleSamlCallback(
  searchParams: SsoSearchParams,
  deps: SsoCallbackDeps,
  setters: SsoCallbackSetters
): Promise<void> {
  const linkedParam = searchParams.get("linked") ?? searchParams.get("ssoLinked");
  const isLinking = isLinkingFlowActive();

  if (linkedParam === "1" || linkedParam === "true" || linkedParam === "success") {
    clearLinkingFlag();
    deps.operationSuccess(deps.t("auth.sso.accountLinkedSuccess"));
    setters.setState("success");
    setters.redirectTo("/account/security?ssoLinked=success");
    return;
  }

  const errorParam = searchParams.get("error");
  if (errorParam) {
    clearLinkingFlag();
    if (isLinking) {
      setters.redirectTo(`/account/security?error=${encodeURIComponent(errorParam)}`);
      return;
    }
    const errorMessage = decodeURIComponent(errorParam);
    if (errorMessage.includes("no_linked_account") || errorMessage.includes("automatically linked")) {
      setters.setState("no_linked_account");
      setters.setErrorInfo({ title: deps.t("auth.sso.noLinkedAccount"), message: deps.t("auth.sso.noLinkedAccountDesc") });
      return;
    }
    setters.setState("error");
    setters.setErrorInfo({ title: deps.t("auth.sso.callbackError"), message: errorMessage });
    return;
  }

  clearLinkingFlag();
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  if (!code || !state) {
    setters.setState("error");
    setters.setErrorInfo({ title: deps.t("auth.sso.callbackError"), message: deps.t("auth.sso.missingParams") });
    return;
  }

  try {
    const result = await deps.ssoRepository.completeSamlCallback(code, state);
    await dispatchCallbackResult(result, deps, setters);
  } catch (error) {
    setters.setState("error");
    setters.setErrorInfo({
      title: deps.t("auth.sso.callbackError"),
      message: error instanceof Error ? error.message : deps.t("auth.sso.callbackErrorGeneric"),
    });
  }
}
