/**
 * ssoCallbackHandlers — Pure async SSO callback processors (OIDC, OAuth 2.0, SAML 2.0).
 *
 * Plain async functions accepting injected dependencies (no React hooks) so they are
 * independently testable. Delegates session completion and handoff routing to `ssoHandoffDispatch`.
 */
import { resolvePostAuthTargetForOrigin } from "@core/common/origin-routing";
import {
  buildVerifiedCrossOriginCallbackUrl,
  completeAdminLogin,
  dispatchCallbackResult,
  emitSsoLoginBroadcast,
  isNoLinkedAccountError,
  setSsoCallbackFailure,
  type SsoCallbackDeps,
  type SsoCallbackSetters,
  type SsoTwoFactorPendingData,
} from "./ssoHandoffDispatch";

export {
  buildVerifiedCrossOriginCallbackUrl,
  completeAdminLogin,
  emitSsoLoginBroadcast,
  isNoLinkedAccountError,
  resolvePostAuthTargetForOrigin,
  type SsoCallbackDeps,
  type SsoCallbackSetters,
  type SsoTwoFactorPendingData,
};

const LEGACY_SSO_STORAGE_KEYS = [
  "sso_linking",
  "sso_linking_origin",
  "sso_code_verifier",
  "sso_state",
  "sso_provider_id",
] as const;

/** Minimal search-params reader compatible with Next.js `ReadonlyURLSearchParams` and `URLSearchParams`. */
export type SsoSearchParams = { get: (key: string) => string | null };

function clearLegacySsoStorage(): boolean {
  if (typeof window === "undefined") return false;
  let hadLegacyLinking = false;
  try {
    hadLegacyLinking = window.sessionStorage.getItem("sso_linking") === "true";
    for (const key of LEGACY_SSO_STORAGE_KEYS) {
      window.sessionStorage.removeItem(key);
    }
  } catch {
    // Ignore storage access errors in restricted browsing contexts
  }
  return hadLegacyLinking;
}

/**
 * Processes an OIDC/OAuth 2.0 callback (`code` + `state`), supporting server-authoritative linking,
 * hybrid IdP MFA step-up (`requires2FA + twoFactorPendingToken`), workspace selection, and login.
 */
export async function handleOidcCallback(
  searchParams: SsoSearchParams,
  deps: SsoCallbackDeps,
  setters: SsoCallbackSetters
): Promise<void> {
  const errorParam = searchParams.get("error") ?? searchParams.get("error_code");
  const isQueryLink = searchParams.get("purpose") === "link" || searchParams.get("linking") === "1";

  if (errorParam) {
    const hadLegacyLink = clearLegacySsoStorage();
    if (isQueryLink || hadLegacyLink) {
      setters.redirectTo(`/account/security?error=${encodeURIComponent(errorParam)}`);
      return;
    }
    const decoded = decodeURIComponent(errorParam);
    if (decoded === "no_linked_account") {
      setSsoCallbackFailure(
        setters,
        deps.t("auth.sso.noLinkedAccount"),
        deps.t("auth.sso.noLinkedAccountDesc"),
        "no_linked_account"
      );
      return;
    }
    setSsoCallbackFailure(setters, deps.t("auth.sso.callbackError"), decoded);
    return;
  }

  const code = searchParams.get("code");
  const stateParam = searchParams.get("state");
  if (!code || !stateParam) {
    const hadLegacyLink = clearLegacySsoStorage();
    if (isQueryLink || hadLegacyLink) {
      setters.redirectTo("/account/security?error=sso_missing_params");
      return;
    }
    setSsoCallbackFailure(
      setters,
      deps.t("auth.sso.callbackError"),
      deps.t("auth.sso.missingParams")
    );
    return;
  }

  try {
    const result = await deps.ssoRepository.completeCallback(code, stateParam);
    clearLegacySsoStorage();
    await dispatchCallbackResult(result, deps, setters);
  } catch (error) {
    clearLegacySsoStorage();
    if (isQueryLink) {
      const codeParam =
        error instanceof Error ? encodeURIComponent(error.message) : "sso_link_failed";
      setters.redirectTo(`/account/security?error=${codeParam}`);
      return;
    }
    if (isNoLinkedAccountError(error)) {
      setSsoCallbackFailure(
        setters,
        deps.t("auth.sso.noLinkedAccount"),
        deps.t("auth.sso.noLinkedAccountDesc"),
        "no_linked_account"
      );
      return;
    }
    setSsoCallbackFailure(
      setters,
      deps.t("auth.sso.callbackError"),
      error instanceof Error ? error.message : deps.t("auth.sso.callbackErrorGeneric")
    );
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
  const isQueryLink = searchParams.get("purpose") === "link" || searchParams.get("linking") === "1";

  if (linkedParam === "1" || linkedParam === "true" || linkedParam === "success") {
    clearLegacySsoStorage();
    deps.operationSuccess(deps.t("auth.sso.accountLinkedSuccess"));
    setters.setState("success");
    setters.redirectTo("/account/security?ssoLinked=success");
    return;
  }

  const errorParam = searchParams.get("error") ?? searchParams.get("error_code");
  if (errorParam) {
    const hadLegacyLink = clearLegacySsoStorage();
    if (isQueryLink || hadLegacyLink) {
      setters.redirectTo(`/account/security?error=${encodeURIComponent(errorParam)}`);
      return;
    }
    const errorMessage = decodeURIComponent(errorParam);
    if (errorMessage.includes("no_linked_account") || errorMessage.includes("automatically linked")) {
      setSsoCallbackFailure(
        setters,
        deps.t("auth.sso.noLinkedAccount"),
        deps.t("auth.sso.noLinkedAccountDesc"),
        "no_linked_account"
      );
      return;
    }
    setSsoCallbackFailure(setters, deps.t("auth.sso.callbackError"), errorMessage);
    return;
  }

  clearLegacySsoStorage();
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  if (!code || !state) {
    setSsoCallbackFailure(
      setters,
      deps.t("auth.sso.callbackError"),
      deps.t("auth.sso.missingParams")
    );
    return;
  }

  try {
    const result = await deps.ssoRepository.completeSamlCallback(code, state);
    await dispatchCallbackResult(result, deps, setters);
  } catch (error) {
    setSsoCallbackFailure(
      setters,
      deps.t("auth.sso.callbackError"),
      error instanceof Error ? error.message : deps.t("auth.sso.callbackErrorGeneric")
    );
  }
}
