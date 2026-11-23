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

/** Result of a successful login, carrying subscription metadata alongside the User */
export interface LoginResult {
  user: User;
  mustChangePassword: boolean;
  subscriptionStatus: string | null;
  gracePhase: string | null;
  editionName: string | null;
  /** Backend-authoritative redirect path: "/" for dashboard, "/hub" for workspace hub */
  defaultRedirectPath: string;
}

export interface IAuthRepository {
  login(credentials: LoginRequest): Promise<LoginResult>;
  verify2FA(
    identifier: string,
    password: string | null,
    code: string,
    tenantId?: string,
    twoFactorPendingToken?: string | null,
    staySignedIn?: boolean
  ): Promise<LoginResult>;
  logout(): Promise<void>;
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
  /** Build backend `/oidc/logout` redirect URL with sanitized `/connect/authorize` returnUrl */
  buildOidcLogoutUrl(searchParams: URLSearchParams): string;
  /** Link an external SSO account to the current admin profile */
  linkExternalLogin(data: {
    identityProviderId: string;
    providerName: string;
    providerKey: string;
    email: string;
    displayName?: string;
  }): Promise<void>;
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
