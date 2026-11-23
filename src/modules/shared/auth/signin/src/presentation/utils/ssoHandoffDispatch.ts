/**
 * ssoHandoffDispatch — Shared SSO login completion, cross-origin handoff forwarding,
 * and cross-tab login broadcast helpers.
 */
import { syncActivePrincipalKey } from "@core/common/active-principal";
import { authBroadcast } from "@core/common/broadcast-auth";
import { isAllowedCentralOrTenantOrigin, resolvePostAuthTargetForOrigin } from "@core/common/origin-routing";
import { sanitizeHttpUrl } from "@core/common/sanitize";
import { secureTokenService } from "@core/common/secure-token-service";
import type { AdminRole, PermissionCode } from "@core/common/types/permissions";
import { useAppStore } from "@core/store/useAppStore";
import type { SsoCallbackResult } from "@modules/auth/core/domain/entities/SsoProvider";
import type { User } from "@modules/auth/core/domain/entities/User";
import type { WorkspaceChoice } from "@modules/auth/core/domain/errors/AuthErrors";
import type { IAuthRepository } from "@modules/auth/core/domain/interfaces/IAuthRepository";
import type { ISsoRepository } from "@modules/auth/core/domain/interfaces/ISsoRepository";
import type { SsoCallbackError, SsoCallbackState } from "../viewmodels/useSsoCallbackHandler";
import { buildPostAuthEntryUrl } from "./redirect-safety";

/** Pending passwordless 2FA state handed off from OIDC/SAML callback to the 2FA form. */
export interface SsoTwoFactorPendingData {
  token: string;
  staySignedIn: boolean;
  email?: string;
  returnOrigin?: string | null;
  returnPath?: string | null;
}

/** Injected dependencies for SSO callback handlers. */
export interface SsoCallbackDeps {
  authRepository: IAuthRepository;
  ssoRepository: ISsoRepository;
  setAuth: (user: User, permissions: PermissionCode[], roles: AdminRole[], isFreshLogin?: boolean) => void;
  setSubscriptionInfo: (status: string | null, grace: string | null, edition: string | null) => void;
  setMustChangePassword?: (mustChange: boolean) => void;
  setRequireMfaEnrollment?: (require: boolean) => void;
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
  setWorkspaceSelectionData?: (data: {
    workspaces: WorkspaceChoice[];
    token: string;
    email?: string;
    returnOrigin?: string | null;
    returnPath?: string | null;
  }) => void;
  setTwoFactorPending?: (data: SsoTwoFactorPendingData) => void;
}

/** Sets failure state and user-facing error info on SSO callback handlers. */
export function setSsoCallbackFailure(
  setters: SsoCallbackSetters,
  title: string,
  message: string,
  state: "error" | "no_linked_account" = "error"
): void {
  setters.setState(state);
  setters.setErrorInfo({ title, message });
}

function resolveCurrentTenantCode(): string | null {
  try {
    const storeRef = useAppStore as unknown as { getState?: () => { tenantCode?: string | null } };
    if (typeof storeRef?.getState === "function") {
      return storeRef.getState().tenantCode ?? null;
    }
  } catch {
    // Store may be mocked as selector-only in unit tests
  }
  return null;
}

/** Syncs the per-tab principal identity key and emits a scoped LOGIN_SUCCESS broadcast. */
export function emitSsoLoginBroadcast(
  user: User,
  principalType: "admin" | "user" = "admin"
): void {
  const principalId = user?.id ? String(user.id) : null;
  const tenantId = user?.tenantId ?? null;
  syncActivePrincipalKey({ principalType, tenantId, principalId });
  authBroadcast.broadcastLoginSuccess({
    origin: typeof window !== "undefined" ? window.location.origin : undefined,
    tenantId,
    tenantCode: resolveCurrentTenantCode(),
    principalId,
    principalType,
  });
}

/** Builds a verified cross-origin `/sso/callback?code=&state=` forwarding URL when safe. */
export function buildVerifiedCrossOriginCallbackUrl(
  returnOrigin: string | null | undefined,
  handoffCode: string | null | undefined,
  handoffState: string | null | undefined,
  returnPath?: string | null,
  allowedOrigins?: readonly string[]
): string | null {
  if (!returnOrigin || !handoffCode || !handoffState || typeof window === "undefined") {
    return null;
  }
  const safeOriginUrl = sanitizeHttpUrl(returnOrigin);
  if (!safeOriginUrl) return null;
  const parsedOrigin = new URL(safeOriginUrl).origin;
  if (parsedOrigin === window.location.origin) return null;

  if (!isAllowedCentralOrTenantOrigin(parsedOrigin, allowedOrigins)) {
    return null;
  }
  const nextUrl = new URL("/sso/callback", parsedOrigin);
  nextUrl.searchParams.set("code", handoffCode);
  nextUrl.searchParams.set("state", handoffState);
  if (returnPath) {
    nextUrl.searchParams.set("redirect", returnPath);
  }
  return nextUrl.toString();
}

function resolvePostSsoRedirect(returnPath?: string | null): string | null {
  if (returnPath?.trim()) {
    return returnPath.trim();
  }
  if (typeof window !== "undefined") {
    return new URLSearchParams(window.location.search).get("redirect");
  }
  return null;
}

/** Returns true when an API error indicates the external identity is not linked to any admin account. */
export function isNoLinkedAccountError(error: unknown): boolean {
  const details = (error as { details?: { error?: string; code?: string } })?.details;
  return (
    (error instanceof Error && error.message.includes("no_linked_account")) ||
    details?.error === "no_linked_account" ||
    details?.code === "no_linked_account"
  );
}

interface SsoSessionMeta {
  status?: string | null;
  gracePhase?: string | null;
  editionName?: string | null;
  mustChangePassword?: boolean;
  requireMfaEnrollment?: boolean;
  returnPath?: string | null;
  returnOrigin?: string | null;
}

async function completeAuthenticatedSession(
  principalType: "admin" | "user",
  accessToken: string,
  meta: SsoSessionMeta,
  deps: SsoCallbackDeps,
  setters: SsoCallbackSetters
): Promise<void> {
  secureTokenService.setAccessToken(accessToken);
  const user = await deps.authRepository.getCurrentPrincipal();
  deps.setAuth(user, (user.permissions || []) as PermissionCode[], (user.roles || []) as AdminRole[], true);
  emitSsoLoginBroadcast(user, principalType);
  if (principalType === "admin") {
    deps.setSubscriptionInfo(meta.status ?? null, meta.gracePhase ?? null, meta.editionName ?? null);
  }
  const mustChange = Boolean(meta.mustChangePassword);
  const requireMfa = Boolean(meta.requireMfaEnrollment);
  deps.setMustChangePassword?.(mustChange);
  deps.setRequireMfaEnrollment?.(requireMfa);
  deps.operationSuccess(deps.t("auth.welcomeBack"));
  if (!mustChange && !requireMfa && (principalType !== "admin" || meta.status !== "PendingPayment")) {
    deps.invalidateQueries();
  }
  const targetPath = resolvePostAuthTargetForOrigin(
    buildPostAuthEntryUrl({
      mustChangePassword: mustChange,
      requireMfaEnrollment: requireMfa,
      subscriptionStatus: meta.status,
      redirect: resolvePostSsoRedirect(meta.returnPath),
      allowedOrigins: meta.returnOrigin ? [meta.returnOrigin] : undefined,
    }),
    meta.returnOrigin
  );
  setters.setState("success");
  setTimeout(() => setters.redirectTo(targetPath), 300);
}

/** Completes an authenticated admin session after OIDC or SAML callback redemption. */
export async function completeAdminLogin(
  accessToken: string,
  subscription: SsoSessionMeta,
  deps: SsoCallbackDeps,
  setters: SsoCallbackSetters
): Promise<void> {
  return completeAuthenticatedSession("admin", accessToken, subscription, deps, setters);
}

/** Routes a redeemed SSO handoff/callback result into link completion, continuation, or session start. */
export async function dispatchCallbackResult(
  result: SsoCallbackResult,
  deps: SsoCallbackDeps,
  setters: SsoCallbackSetters
): Promise<void> {
  if (result.purpose === "link" || result.linked) {
    if (result.linked) {
      deps.operationSuccess(deps.t("auth.sso.accountLinkedSuccess"));
      setters.setState("success");
      setters.redirectTo("/account/security?ssoLinked=success");
    } else {
      setters.redirectTo("/account/security?error=sso_link_failed");
    }
    return;
  }

  const crossOriginTarget = buildVerifiedCrossOriginCallbackUrl(
    result.returnOrigin,
    result.handoffCode,
    result.handoffState,
    result.returnPath,
    result.returnOrigin ? [result.returnOrigin] : undefined
  );
  if (crossOriginTarget) {
    setters.setState("success");
    setters.redirectTo(crossOriginTarget);
    return;
  }

  if (result.requires2FA && result.twoFactorPendingToken && setters.setTwoFactorPending) {
    setters.setTwoFactorPending({
      token: result.twoFactorPendingToken,
      staySignedIn: Boolean(result.staySignedIn),
      email: result.email,
      ...(result.returnOrigin ? { returnOrigin: result.returnOrigin } : {}),
      ...(result.returnPath ? { returnPath: result.returnPath } : {}),
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
      ...(result.returnOrigin ? { returnOrigin: result.returnOrigin } : {}),
      ...(result.returnPath ? { returnPath: result.returnPath } : {}),
    });
    setters.setState("workspace_selection");
    return;
  }

  if ((result.type === "admin" || result.type === "user") && result.accessToken) {
    await completeAuthenticatedSession(
      result.type,
      result.accessToken,
      {
        status: result.subscriptionStatus,
        gracePhase: result.gracePhase,
        editionName: result.editionName,
        mustChangePassword: result.mustChangePassword,
        requireMfaEnrollment: result.requireMfaEnrollment,
        returnPath: result.returnPath,
        returnOrigin: result.returnOrigin,
      },
      deps,
      setters
    );
    return;
  }

  setSsoCallbackFailure(
    setters,
    deps.t("auth.sso.callbackError"),
    deps.t("auth.sso.unsupportedAccountType")
  );
}
