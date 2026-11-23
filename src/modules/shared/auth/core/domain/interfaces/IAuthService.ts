/**
 * Auth Service Interface
 *
 * Contract for authentication API operations.
 * Implemented by AuthService in the data/services layer.
 *
 * @module auth/core/domain
 */
import type { PasswordPolicyDto } from "@core/common/password-policy";
import type { LoginRequestModel, LoginResponseModel } from "../types/AuthTypes";
import type {
  DiscoverWorkspacesResponseDto,
  PasskeyAuthBeginOptions,
  PasskeyAuthVerifyResult,
  Verify2FARequestModel,
  Verify2FAResponseModel,
  VerifyPasskeyAuthRequestData,
} from "../types/AuthTypes";

export interface IAuthService {
  login(request: LoginRequestModel): Promise<LoginResponseModel>;
  verify2FA(request: Verify2FARequestModel): Promise<Verify2FAResponseModel>;
  logout(): Promise<void>;
  refreshToken(): Promise<LoginResponseModel>;
  getCurrentPrincipal<T>(): Promise<T>;
  discoverWorkspaces(email: string): Promise<DiscoverWorkspacesResponseDto>;
  impersonate(adminId: string): Promise<LoginResponseModel>;
  stopImpersonation(): Promise<LoginResponseModel>;
  buildOidcConsentForm(
    searchParams: URLSearchParams,
    decision?: "approve" | "deny"
  ): { action: string; params: Record<string, string> };
  buildOidcLogoutUrl(searchParams: URLSearchParams): string;
  /** Link an external SSO account to the current admin profile */
  linkExternalLogin(data: {
    identityProviderId: string;
    providerName: string;
    providerKey: string;
    email: string;
    displayName?: string;
  }): Promise<void>;

  /** Request a passwordless magic-link sign-in email (enumeration-safe, always resolves). */
  requestMagicLink(email: string, tenantId?: string): Promise<{ sent: boolean }>;

  /** Verify a magic-link token from the email URL and issue a session, workspace picker, or 2FA challenge. */
  verifyMagicLink(
    token: string,
    tenantId?: string,
    deviceInfo?: string,
    staySignedIn?: boolean,
    isPlatformAdmin?: boolean
  ): Promise<LoginResponseModel>;

  /** Begin WebAuthn/Passkey authentication — get challenge from backend. */
  beginPasskeyAuth(
    identifier?: string,
    tenantId?: string | null
  ): Promise<PasskeyAuthBeginOptions>;

  /** Verify WebAuthn/Passkey assertion — send assertion to backend, get tokens. */
  verifyPasskeyAuth(data: VerifyPasskeyAuthRequestData): Promise<PasskeyAuthVerifyResult>;

  /** Request a phone OTP for sign-in (enumeration-safe, always resolves). */
  requestPhoneOtp(
    identifier: string,
    tenantId?: string | null
  ): Promise<{ sent: boolean; retryAfterSeconds: number }>;

  /** Verify a phone OTP code for sign-in. Returns full login response (supports multi-workspace & 2FA). */
  verifyPhoneOtp(
    identifier: string,
    code: string,
    tenantId?: string | null,
    staySignedIn?: boolean,
    isPlatformAdmin?: boolean
  ): Promise<{
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
    subscriptionStatus?: string | null;
    gracePhase?: string | null;
    editionName?: string | null;
    defaultRedirectPath?: string;
  }>;

  /** Begin QR sign-in — generate a session token + QR code data scoped to optional tenantId. */
  beginQrSignIn(tenantId?: string | null): Promise<{
    sessionId: string;
    sessionToken?: string;
    qrData: string;
    expiresAt: string;
  }>;

  /** Check QR sign-in session status (polling). */
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

  /** Fetch the effective password policy for an optional tenantId/tenantCode or the signed-in admin's tenant. */
  getPasswordPolicy(params?: {
    tenantId?: string | null;
    tenantCode?: string | null;
    isPublic?: boolean;
  }): Promise<PasswordPolicyDto>;

  /** Approve a QR sign-in session from the mobile device. */
  approveQrSignIn(sessionToken: string, deviceInfo?: string): Promise<void>;
  /** Reject a QR sign-in session from the mobile device. */
  rejectQrSignIn(sessionToken: string): Promise<void>;
}
