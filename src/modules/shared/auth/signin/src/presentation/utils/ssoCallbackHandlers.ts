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
  completePrincipalLogin,
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
  completePrincipalLogin,
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

const SSO_ERROR_LOCALE_KEYS: Record<string, string> = {
  account_locked: "auth.sso.errors.accountLocked",
  auth_account_locked: "auth.sso.errors.accountLocked",
  account_deactivated: "auth.sso.errors.accountDeactivated",
  sso_subject_mismatch: "auth.sso.errors.subjectMismatch",
  sso_identity_linked_elsewhere: "auth.sso.errors.linkedElsewhere",
  access_denied: "auth.sso.errors.accessDenied",
  invalid_credentials: "auth.sso.errors.invalidCredentials",
  invalid_provider: "auth.sso.errors.invalidProvider",
  provider_disabled: "auth.sso.errors.invalidProvider",
  unauthorized_client: "auth.sso.errors.invalidProvider",
  unsupported_response_type: "auth.sso.errors.invalidProvider",
  invalid_scope: "auth.sso.errors.invalidProvider",
  invalid_state: "auth.sso.errors.stateExpired",
  state_expired: "auth.sso.errors.stateExpired",
  sso_handoff_invalid: "auth.sso.errors.stateExpired",
  sso_handoff_state_mismatch: "auth.sso.errors.stateExpired",
  login_required: "auth.sso.errors.stateExpired",
  consent_required: "auth.sso.errors.stateExpired",
  interaction_required: "auth.sso.errors.stateExpired",
  server_error: "auth.sso.errors.temporarilyUnavailable",
  temporarily_unavailable: "auth.sso.errors.temporarilyUnavailable",
};

function safeNormalizeErrorCode(rawError: string | null | undefined): string {
  if (!rawError) return "";
  let decoded = rawError;
  try {
    decoded = decodeURIComponent(rawError);
  } catch {
    decoded = rawError;
  }
  return decoded.trim().toLowerCase();
}

/**
 * Maps URL `?error=` / `?error_code=` values from OIDC/SAML redirects into localized,
 * user-safe messages and never echoes untrusted free-text or internal stack strings.
 */
export function resolveSsoErrorOutcome(
  rawError: string | null | undefined,
  t: (key: string) => string
): {
  state: "error" | "no_linked_account";
  title: string;
  message: string;
  safeCode: string;
} {
  const normalized = safeNormalizeErrorCode(rawError);
  if (
    normalized === "no_linked_account" ||
    normalized === "no_linked_account_saml" ||
    normalized.includes("no_linked_account")
  ) {
    return {
      state: "no_linked_account",
      title: t("auth.sso.noLinkedAccount"),
      message: t("auth.sso.noLinkedAccountDesc"),
      safeCode: normalized === "no_linked_account_saml" ? "no_linked_account_saml" : "no_linked_account",
    };
  }
  const localeKey = SSO_ERROR_LOCALE_KEYS[normalized];
  if (localeKey) {
    return {
      state: "error",
      title: t("auth.sso.callbackError"),
      message: t(localeKey),
      safeCode: normalized,
    };
  }
  return {
    state: "error",
    title: t("auth.sso.callbackError"),
    message: t("auth.sso.callbackErrorGeneric"),
    safeCode: "sso_failed",
  };
}

function handleCallbackQueryError(
  errorParam: string,
  isQueryLink: boolean,
  deps: SsoCallbackDeps,
  setters: SsoCallbackSetters
): void {
  const hadLegacyLink = clearLegacySsoStorage();
  const outcome = resolveSsoErrorOutcome(errorParam, deps.t);
  if (isQueryLink || hadLegacyLink) {
    setters.redirectTo(`/account/security?error=${encodeURIComponent(outcome.safeCode)}`);
    return;
  }
  setSsoCallbackFailure(setters, outcome.title, outcome.message, outcome.state);
}

function mapApiErrorToSsoOutcome(
  error: unknown,
  t: (key: string) => string
): { state: "error" | "no_linked_account"; title: string; message: string; safeCode: string } {
  if (isNoLinkedAccountError(error)) {
    return resolveSsoErrorOutcome("no_linked_account", t);
  }
  const details = (error as { details?: { error?: unknown; code?: unknown } } | null)?.details;
  const candidate =
    typeof details?.code === "string"
      ? details.code
      : typeof details?.error === "string"
        ? details.error
        : error instanceof Error
          ? error.message
          : null;
  return resolveSsoErrorOutcome(candidate, t);
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
    handleCallbackQueryError(errorParam, isQueryLink, deps, setters);
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
    setSsoCallbackFailure(setters, deps.t("auth.sso.callbackError"), deps.t("auth.sso.missingParams"));
    return;
  }

  const hadLegacyLink =
    typeof window !== "undefined" && window.sessionStorage.getItem("sso_linking") === "true";

  try {
    const result = await deps.ssoRepository.completeCallback(code, stateParam);
    clearLegacySsoStorage();
    await dispatchCallbackResult(result, deps, setters);
  } catch (error) {
    clearLegacySsoStorage();
    const outcome = mapApiErrorToSsoOutcome(error, deps.t);
    if (isQueryLink || hadLegacyLink) {
      setters.redirectTo(`/account/security?error=${encodeURIComponent(outcome.safeCode)}`);
      return;
    }
    setSsoCallbackFailure(setters, outcome.title, outcome.message, outcome.state);
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
    handleCallbackQueryError(errorParam, isQueryLink, deps, setters);
    return;
  }

  const hadLegacyLink = clearLegacySsoStorage();
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  if (!code || !state) {
    if (isQueryLink || hadLegacyLink) {
      setters.redirectTo("/account/security?error=sso_missing_params");
      return;
    }
    setSsoCallbackFailure(setters, deps.t("auth.sso.callbackError"), deps.t("auth.sso.missingParams"));
    return;
  }

  try {
    const result = await deps.ssoRepository.completeSamlCallback(code, state);
    await dispatchCallbackResult(result, deps, setters);
  } catch (error) {
    const outcome = mapApiErrorToSsoOutcome(error, deps.t);
    if (isQueryLink || hadLegacyLink) {
      setters.redirectTo(`/account/security?error=${encodeURIComponent(outcome.safeCode)}`);
      return;
    }
    setSsoCallbackFailure(setters, outcome.title, outcome.message, outcome.state);
  }
}
