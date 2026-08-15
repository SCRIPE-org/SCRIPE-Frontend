// FILE-EXCEPTION: file length
/**
 * sso-callback-handlers.ts — Pure async SSO callback processors.
 *
 * Extracted from useSsoCallbackHandler so the hook stays under 200 lines
 * and the handlers are independently testable (no React hooks).
 *
 * These functions are NOT React hooks — they are plain async functions
 * that accept all dependencies as parameters (dependency injection pattern).
 */
import { appLogger } from "@/core/common/logger";
import { secureTokenService } from "@core/common/secure-token-service";
import type { IAuthRepository } from "@modules/auth/core/domain/interfaces/IAuthRepository";
import type { ISsoRepository } from "@modules/auth/core/domain/interfaces/ISsoRepository";
import type { User } from "@modules/auth/core/domain/entities/User";
import type { PermissionCode, AdminRole } from "@core/common/types/permissions";
import type { SsoCallbackError, SsoCallbackState } from "./useSsoCallbackHandler";

// ── Types ──────────────────────────────────────────────────────────────────

/**
 * Interface defining property specifications, keys types, and structural contract rules for sso callback deps.
 */
export interface SsoCallbackDeps {
  authRepository: IAuthRepository;
  ssoRepository: ISsoRepository;
  setAuth: (
    user: User,
    permissions: PermissionCode[],
    roles: AdminRole[],
    isFreshLogin?: boolean
  ) => void;
  setSubscriptionInfo: (
    status: string | null,
    grace: string | null,
    edition: string | null
  ) => void;
  refreshNavigation: () => Promise<void>;
  invalidateQueries: () => void;
  operationSuccess: (msg: string) => void;
  t: (key: string) => string;
}

/**
 * Interface defining property specifications, keys types, and structural contract rules for sso callback setters.
 */
export interface SsoCallbackSetters {
  setState: (s: SsoCallbackState) => void;
  setErrorInfo: (e: SsoCallbackError | null) => void;
  redirectTo: (path: string) => void;
  setWorkspaceSelectionData?: (data: { workspaces: any[]; token: string; email?: string }) => void;
}

/**
 * Exported type defining parameters and fields for sso search params configurations.
 */
export type SsoSearchParams = {
  get: (key: string) => string | null;
};

interface LinkExternalLoginParams {
  identityProviderId?: string | null;
  providerName?: string | null;
  providerKey?: string | null;
  email?: string | null;
  displayName?: string | null;
}

// ── Shared helpers ─────────────────────────────────────────────────────────

/**
 * Exported function defining parameters and fields for is no linked account error configurations.
 */
export function isNoLinkedAccountError(error: unknown): boolean {
  const details = (error as { details?: { error?: string } })?.details;
  return (
    (error instanceof Error && error.message.includes("no_linked_account")) ||
    details?.error === "no_linked_account"
  );
}

/**
 * Exported function defining parameters and fields for complete admin login configurations.
 */
export async function completeAdminLogin(
  accessToken: string,
  subscription: { status?: string | null; gracePhase?: string | null; editionName?: string | null },
  deps: SsoCallbackDeps,
  setters: SsoCallbackSetters
) {
  secureTokenService.setAccessToken(accessToken);
  const user = await deps.authRepository.getMe();
  deps.setAuth(user, (user.permissions || []) as PermissionCode[], [], true);
  deps.setSubscriptionInfo(
    subscription.status ?? null,
    subscription.gracePhase ?? null,
    subscription.editionName ?? null
  );
  deps.operationSuccess(deps.t("auth.welcomeBack"));

  // v2: NavigationProvider auto-fetches when isAuthenticated changes
  deps.invalidateQueries();
  setters.setState("success");
  setTimeout(() => setters.redirectTo("/"), 300);
}

async function completeUserLogin(
  accessToken: string,
  deps: SsoCallbackDeps,
  setters: SsoCallbackSetters
) {
  secureTokenService.setAccessToken(accessToken);
  const user = await deps.authRepository.getMe();
  deps.setAuth(user, (user.permissions || []) as PermissionCode[], [], true);
  deps.operationSuccess(deps.t("auth.welcomeBack"));

  deps.invalidateQueries();
  setters.setState("success");
  setTimeout(() => setters.redirectTo("/dashboard"), 300);
}

async function tryLinkExternalLogin(
  params: LinkExternalLoginParams,
  deps: SsoCallbackDeps,
  setters: SsoCallbackSetters
): Promise<boolean> {
  const isAuthenticated = (await import("@core/store/useAppStore")).useAppStore.getState()
    .isAuthenticated;
  const isLinkingSession = sessionStorage.getItem("sso_linking") === "true";

  if (!isAuthenticated && !isLinkingSession) return false;
  if (!params.identityProviderId || !params.providerName || !params.providerKey || !params.email)
    return false;

  sessionStorage.removeItem("sso_linking");
  await deps.authRepository.linkExternalLogin({
    identityProviderId: params.identityProviderId,
    providerName: params.providerName,
    providerKey: params.providerKey,
    email: params.email,
    displayName: params.displayName ?? undefined,
  });
  deps.operationSuccess(deps.t("sso.accountLinkedSuccess"));
  setters.redirectTo("/profile");
  return true;
}

// ── OIDC Callback Handler ─────────────────────────────────────────────────

/**
 * Exported function defining parameters and fields for handle oidc callback configurations.
 */
export async function handleOidcCallback(
  searchParams: SsoSearchParams,
  deps: SsoCallbackDeps,
  setters: SsoCallbackSetters
) {
  const code = searchParams.get("code");
  const stateParam = searchParams.get("state");

  if (!code || !stateParam) {
    setters.setState("error");
    setters.setErrorInfo({
      title: deps.t("auth.sso.callbackError"),
      message: deps.t("auth.sso.missingParams"),
    });
    return;
  }

  try {
    const result = await deps.ssoRepository.completeCallback(code, stateParam);

    if (result.requiresWorkspaceSelection && result.availableWorkspaces && result.token) {
      if (setters.setWorkspaceSelectionData) {
        setters.setWorkspaceSelectionData({
          workspaces: result.availableWorkspaces,
          token: result.token,
          email: result.email,
        });
        setters.setState("workspace_selection");
        return;
      }
    }

    if (result.type === "admin" && result.accessToken) {
      await completeAdminLogin(
        result.accessToken,
        {
          status: result.subscriptionStatus,
          gracePhase: result.gracePhase,
          editionName: result.editionName,
        },
        deps,
        setters
      );
      return;
    }

    if (result.type === "user" && result.accessToken) {
      await completeUserLogin(result.accessToken, deps, setters);
      return;
    }

    setters.setState("error");
    setters.setErrorInfo({
      title: deps.t("auth.sso.callbackError"),
      message: deps.t("auth.sso.unsupportedAccountType"),
    });
  } catch (error) {
    if (isNoLinkedAccountError(error)) {
      const details = (error as { details?: Record<string, string> })?.details;
      try {
        const linked = await tryLinkExternalLogin(
          {
            identityProviderId: details?.identityProviderId,
            providerName: details?.providerName || details?.provider,
            providerKey: details?.providerKey || details?.subject,
            email: details?.email,
            displayName: details?.name,
          },
          deps,
          setters
        );
        if (linked) return;
      } catch (linkError) {
        appLogger.error("Auto-link failed:", linkError);
      }
      setters.setState("no_linked_account");
      setters.setErrorInfo({
        title: deps.t("auth.sso.noLinkedAccount"),
        message: deps.t("auth.sso.noLinkedAccountDesc"),
      });
      return;
    }
    setters.setState("error");
    setters.setErrorInfo({
      title: deps.t("auth.sso.callbackError"),
      message: error instanceof Error ? error.message : deps.t("auth.sso.callbackErrorGeneric"),
    });
  }
}

// ── SAML Callback Handler ─────────────────────────────────────────────────

/**
 * Exported function defining parameters and fields for handle saml callback configurations.
 *
 * SECURITY (F-55): the SAML ACS redirect never carries access/refresh tokens in the URL —
 * only a short-lived, single-use opaque `code` (+ bound `state`). This handler exchanges
 * that code via a backend POST call to receive the actual JWTs in the response body,
 * mirroring handleOidcCallback()'s code+state exchange above.
 */
export async function handleSamlCallback(
  searchParams: SsoSearchParams,
  deps: SsoCallbackDeps,
  setters: SsoCallbackSetters
) {
  const errorParam = searchParams.get("error");

  if (errorParam) {
    const errorMessage = decodeURIComponent(errorParam);
    const isLinkingIssue =
      errorMessage.includes("no_linked_account") || errorMessage.includes("automatically linked");

    if (isLinkingIssue) {
      try {
        const linked = await tryLinkExternalLogin(
          {
            identityProviderId: searchParams.get("providerId"),
            providerName: searchParams.get("providerName"),
            providerKey: searchParams.get("subject"),
            email: searchParams.get("email"),
            displayName: searchParams.get("name"),
          },
          deps,
          setters
        );
        if (linked) return;
      } catch (linkError) {
        appLogger.error("SAML auto-link failed:", linkError);
      }
      setters.setState("no_linked_account");
      setters.setErrorInfo({
        title: deps.t("auth.sso.noLinkedAccount"),
        message: deps.t("auth.sso.noLinkedAccountDesc"),
      });
      return;
    }

    setters.setState("error");
    setters.setErrorInfo({ title: deps.t("auth.sso.callbackError"), message: errorMessage });
    return;
  }

  const code = searchParams.get("code");
  const state = searchParams.get("state");

  if (!code || !state) {
    setters.setState("error");
    setters.setErrorInfo({
      title: deps.t("auth.sso.callbackError"),
      message: deps.t("auth.sso.missingParams"),
    });
    return;
  }

  try {
    const result = await deps.ssoRepository.completeSamlCallback(code, state);

    if (result.type === "admin" && result.accessToken) {
      await completeAdminLogin(
        result.accessToken,
        {
          status: result.subscriptionStatus,
          gracePhase: result.gracePhase,
          editionName: result.editionName,
        },
        deps,
        setters
      );
      return;
    }

    if (result.type === "user" && result.accessToken) {
      await completeUserLogin(result.accessToken, deps, setters);
      return;
    }

    setters.setState("error");
    setters.setErrorInfo({
      title: deps.t("auth.sso.callbackError"),
      message: deps.t("auth.sso.unsupportedAccountType"),
    });
  } catch (error) {
    setters.setState("error");
    setters.setErrorInfo({
      title: deps.t("auth.sso.callbackError"),
      message: error instanceof Error ? error.message : deps.t("auth.sso.callbackErrorGeneric"),
    });
  }
}
