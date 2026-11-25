import { ALLOWED_OIDC_PARAMS, OIDC_KEYS } from "@core/config/oidc-keys";
import type {
  PasskeyAuthBeginOptions,
  VerifyPasskeyAuthRequestData,
} from "../../domain/types/AuthTypes";
import { AUTH_CORE_ENDPOINTS } from "./auth-core.endpoints";

export interface PhoneOtpVerifyResponseDto {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: string;
  requires2FA?: boolean;
  twoFactorPendingToken?: string | null;
  staySignedIn?: boolean;
  requiresWorkspaceSelection?: boolean;
  availableWorkspaces?: Array<{
    tenantId: string;
    tenantCode: string;
    tenantName: string;
    logoUrl: string | null;
    isPlatformAdmin: boolean;
    isActivated: boolean;
    isDisabled?: boolean;
    disabledReason?: string | null;
    isPasswordVerified?: boolean;
    isLocked?: boolean;
    lockedUntil?: string | null;
  }> | null;
  mustChangePassword?: boolean;
  requireMfaEnrollment?: boolean;
  subscriptionStatus?: string | null;
  gracePhase?: string | null;
  editionName?: string | null;
  defaultRedirectPath?: string;
}

export interface QrSignInStatusResponseDto {
  status: "pending" | "scanned" | "approved" | "rejected" | "expired" | "consumed";
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: string;
  approverName?: string | null;
  defaultRedirectPath?: string | null;
  subscriptionStatus?: string | null;
  gracePhase?: string | null;
  editionName?: string | null;
  mustChangePassword?: boolean;
  requireMfaEnrollment?: boolean;
}

const allowedOidcParams = new Set<string>(ALLOWED_OIDC_PARAMS);

/** Resolves the origin of the identity/backend OIDC server for form posts and top-level redirects. */
export function resolveOidcBackendOrigin(): string {
  const backendUrl =
    process.env.NEXT_PUBLIC_IDENTITY_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:5035/api";
  try {
    return new URL(backendUrl).origin;
  } catch {
    return backendUrl.replace(/\/(?:api|identity)\/?$/, "");
  }
}

/** Filters URL search parameters down to allowlisted OIDC authorize parameters. */
export function buildAllowedOidcQueryString(
  searchParams: URLSearchParams,
  excludeConsentTicket = true
): string {
  const authorizeParams = new URLSearchParams();
  searchParams.forEach((value, key) => {
    if (excludeConsentTicket && key === OIDC_KEYS.CONSENT_TICKET) return;
    if (allowedOidcParams.has(key)) {
      authorizeParams.set(key, value);
    }
  });
  return authorizeParams.toString();
}

/** Builds the OIDC consent form action and hidden inputs for `/connect/authorize`. */
export function buildOidcConsentFormPayload(
  searchParams: URLSearchParams,
  decision: "approve" | "deny" = "approve"
): { action: string; params: Record<string, string> } {
  const baseHost = resolveOidcBackendOrigin();
  const action = `${baseHost}${AUTH_CORE_ENDPOINTS.OIDC.AUTHORIZE}`;

  const params: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    if (allowedOidcParams.has(key)) {
      params[key] = value;
    }
  });
  params["decision"] = decision;

  return { action, params };
}

/** Normalizes flat or wrapped WebAuthn authentication challenge options from the backend. */
export function normalizePasskeyAuthBeginOptions(
  raw: Record<string, unknown> | null | undefined
): PasskeyAuthBeginOptions {
  const wrapped = (raw?.options as Record<string, unknown> | undefined) ?? undefined;
  const challengeRaw = raw?.challenge ?? wrapped?.challenge ?? "";
  const rawAllowCreds = (raw?.allowCredentials ?? wrapped?.allowCredentials) as
    | Array<{ id: string; type?: string; transports?: string[] }>
    | undefined;

  return {
    challenge: typeof challengeRaw === "string" ? challengeRaw : String(challengeRaw ?? ""),
    rpId:
      typeof raw?.rpId === "string"
        ? raw.rpId
        : typeof wrapped?.rpId === "string"
          ? wrapped.rpId
          : undefined,
    timeout:
      typeof raw?.timeout === "number"
        ? raw.timeout
        : typeof wrapped?.timeout === "number"
          ? wrapped.timeout
          : undefined,
    userVerification: (raw?.userVerification ??
      wrapped?.userVerification ??
      "required") as UserVerificationRequirement,
    challengeToken:
      typeof raw?.challengeToken === "string"
        ? raw.challengeToken
        : typeof raw?.challengeId === "string"
          ? raw.challengeId
          : null,
    challengeId: typeof raw?.challengeId === "string" ? raw.challengeId : undefined,
    allowCredentials: Array.isArray(rawAllowCreds)
      ? rawAllowCreds.map((cred) => ({
          id: String(cred.id),
          type: "public-key" as const,
          transports: Array.isArray(cred.transports) ? cred.transports : undefined,
        }))
      : undefined,
  };
}

/** Converts client WebAuthn base64url assertion fields into standard padded Base64 for the backend. */
export function buildVerifyPasskeyAuthBackendRequest(
  data: VerifyPasskeyAuthRequestData
): Record<string, unknown> {
  const toBase64 = (base64url: string) => {
    const base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
    const pad = (4 - (base64.length % 4)) % 4;
    return base64 + "=".repeat(pad);
  };

  return {
    credentialIdBase64: toBase64(data.rawId || data.credentialId),
    authenticatorDataBase64: toBase64(data.authenticatorData),
    clientDataJsonBase64: toBase64(data.clientDataJSON),
    signatureBase64: toBase64(data.signature),
    userHandleBase64: data.userHandle ? toBase64(data.userHandle) : null,
    tenantId: data.tenantId ?? null,
    deviceInfo: typeof window !== "undefined" ? window.navigator.userAgent : null,
    clientExtensionResults: data.clientExtensionResults ?? null,
    challengeToken: data.challengeToken ?? data.challengeId ?? null,
    staySignedIn: Boolean(data.staySignedIn),
  };
}
