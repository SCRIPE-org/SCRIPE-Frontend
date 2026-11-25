import { LoginRequest, LoginResponse } from "../entities/Auth";
import type { PasswordPolicyModel } from "@core/common/password-policy";
import { User } from "../entities/User";
import type { WorkspaceInfo } from "../entities/WorkspaceInfo";
import { Result } from "@core/common/types/result";
import type {
  LoginResponseModel,
  PasskeyAuthBeginOptions,
  PasskeyAuthVerifyResult,
  VerifyPasskeyAuthRequestData,
} from "../types/AuthTypes";

/** Post-MFA cross-origin handoff handle minted by backend for custom-domain/workspace session establishment. */
export interface PostMfaHandoffResult {
  code: string;
  state: string;
  returnOrigin: string;
  returnPath?: string | null;
}

/** Optional cross-origin bridging parameters for `verify2FA`. */
export interface Verify2FAOptions {
  returnOrigin?: string | null;
  returnPath?: string | null;
  principalType?: "admin" | "user";
}

/** Result of a successful login, carrying subscription metadata alongside the User */
export interface LoginResult {
  user: User;
  mustChangePassword: boolean;
  requireMfaEnrollment?: boolean;
  subscriptionStatus: string | null;
  gracePhase: string | null;
  editionName: string | null;
  /** Backend-authoritative redirect path: "/" for dashboard, "/hub" for workspace hub */
  defaultRedirectPath: string;
  /** Present when hybrid-2FA completed centrally and issued a single-use handoff back to a custom domain. */
  handoff?: PostMfaHandoffResult | null;
}

export interface IAuthRepository {
  login(credentials: LoginRequest): Promise<LoginResult>;
  verify2FA(
    identifier: string,
    password: string | null,
    code: string,
    tenantId?: string,
    twoFactorPendingToken?: string | null,
    staySignedIn?: boolean,
    options?: Verify2FAOptions
  ): Promise<LoginResult>;
  logout(logoutScope?: "app" | "central"): Promise<void>;
  getCurrentPrincipal(): Promise<User>;
  hasToken(): boolean;
  refreshToken(): Promise<Result<LoginResponse, Error>>;
  clearTokens(): void;
  isAuthenticated(): boolean;
  discoverWorkspaces(email: string): Promise<{
    workspaces: WorkspaceInfo[];
    hasPlatformAccess: boolean;
  }>;
  /** Start impersonation — sets httpOnly cookie, returns access token */
  impersonate(adminId: string): Promise<void>;
  /** Stop impersonation — restores original admin session */
  stopImpersonation(): Promise<void>;
  /** Abstract the OIDC Consent form parameters generation out of the Presentation layer */
  buildOidcConsentForm(
    searchParams: URLSearchParams,
    decision?: "approve" | "deny"
  ): { action: string; params: Record<string, string> };
  /** Build backend `/connect/authorize?...` URL without stale consent_ticket for fresh re-auth */
  buildOidcAuthorizeUrl(searchParams: URLSearchParams): string;
  /** Build backend `/oidc/logout` redirect URL with sanitized `/connect/authorize` returnUrl */
  buildOidcLogoutUrl(searchParams: URLSearchParams): string;
  /** Begin WebAuthn authentication — get challenge from backend */
  beginPasskeyAuth(
    identifier?: string,
    tenantId?: string | null
  ): Promise<PasskeyAuthBeginOptions>;
  /** Verify WebAuthn assertion — send assertion to backend, get tokens */
  verifyPasskeyAuth(data: VerifyPasskeyAuthRequestData): Promise<PasskeyAuthVerifyResult>;
  /** Request phone OTP for sign-in */
  requestPhoneOtp(
    identifier: string,
    tenantId?: string | null
  ): Promise<{ sent: boolean; retryAfterSeconds: number }>;
  /** Verify phone OTP code — returns full login response (supports multi-workspace & 2FA) */
  verifyPhoneOtp(
    identifier: string,
    code: string,
    tenantId?: string | null,
    staySignedIn?: boolean,
    isPlatformAdmin?: boolean
  ): Promise<LoginResponseModel>;
  /** Begin QR sign-in session */
  beginQrSignIn(tenantId?: string | null): Promise<{
    sessionId: string;
    sessionToken?: string;
    qrData: string;
    expiresAt: string;
  }>;
  /** Check QR sign-in session status */
  checkQrSignIn(sessionId: string): Promise<{
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
  }>;
  /** Approve QR sign-in from mobile */
  approveQrSignIn(sessionToken: string, deviceInfo?: string): Promise<void>;
  /** Reject QR sign-in from mobile */
  rejectQrSignIn(sessionToken: string): Promise<void>;
  /** Fetch effective tenant/system password policy for client validation and checklist UI. */
  getPasswordPolicy(params?: {
    tenantId?: string | null;
    tenantCode?: string | null;
    isPublic?: boolean;
  }): Promise<PasswordPolicyModel>;
  /** Request a passwordless magic-link sign-in email (enumeration-safe). */
  requestMagicLink(email: string, tenantId?: string): Promise<{ sent: boolean }>;
  /** Verify a magic-link token from the email URL and issue a session, workspace picker, or 2FA challenge. */
  verifyMagicLink(
    token: string,
    tenantId?: string,
    staySignedIn?: boolean,
    isPlatformAdmin?: boolean
  ): Promise<{
    user?: User;
    requires2FA?: boolean;
    twoFactorPendingToken?: string | null;
    staySignedIn?: boolean;
    requiresWorkspaceSelection: boolean;
    availableWorkspaces: LoginResponseModel["availableWorkspaces"];
    mustChangePassword: boolean;
    requireMfaEnrollment?: boolean;
    subscriptionStatus: string | null;
    gracePhase: string | null;
    editionName: string | null;
    defaultRedirectPath: string;
  }>;
  /** Clear Impersonation/tokens browser session flags on login page mount */
  clearSessionOnLoginMount(): void;
  /** Clear navigation cache and Zustand menu stores */
  clearNavigationCaches(): void;
}
