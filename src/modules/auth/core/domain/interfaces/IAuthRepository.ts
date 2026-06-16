import { LoginRequest, LoginResponse } from "../entities/Auth";
import { User } from "../entities/User";
import type { WorkspaceInfo } from "../entities/WorkspaceInfo";
import { Result } from "@core/common/types/result";
import type { LoginResponseModel } from "../types/AuthTypes";

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
    password: string,
    code: string,
    tenantId?: string
  ): Promise<LoginResult>;
  logout(): Promise<void>;
  getMe(): Promise<User>;
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
    accessToken: string
  ): { action: string; params: Record<string, string> };
  /** Link an external SSO account to the current admin profile */
  linkExternalLogin(data: {
    identityProviderId: string;
    providerName: string;
    providerKey: string;
    email: string;
    displayName?: string;
  }): Promise<void>;
  /** Begin WebAuthn authentication — get challenge from backend */
  beginPasskeyAuth(): Promise<{
    challengeId: string;
    options: PublicKeyCredentialRequestOptions;
  }>;
  /** Verify WebAuthn assertion — send attestation to backend, get tokens */
  verifyPasskeyAuth(data: {
    challengeId: string;
    credentialId: string;
    rawId: string;
    clientDataJSON: string;
    authenticatorData: string;
    signature: string;
    userHandle: string | null;
  }): Promise<{ accessToken: string; refreshToken: string }>;
  /** Request phone OTP for sign-in */
  requestPhoneOtp(phoneNumber: string): Promise<{ sent: boolean; retryAfterSeconds: number }>;
  /** Verify phone OTP code — returns full login response (supports multi-workspace) */
  verifyPhoneOtp(phoneNumber: string, code: string): Promise<LoginResponseModel>;
  /** Begin QR sign-in session */
  beginQrSignIn(): Promise<{ sessionId: string; qrData: string; expiresAt: string }>;
  /** Check QR sign-in session status */
  checkQrSignIn(sessionId: string): Promise<{
    status: "pending" | "scanned" | "approved" | "expired";
    accessToken?: string;
    refreshToken?: string;
  }>;
  /** Approve QR sign-in from mobile */
  approveQrSignIn(sessionId: string): Promise<void>;
  /** Reject QR sign-in from mobile */
  rejectQrSignIn(sessionId: string): Promise<void>;
  /** Verify a magic-link token from the email URL and issue a session. */
  verifyMagicLink(
    token: string,
    tenantId?: string
  ): Promise<{
    user?: User;
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
