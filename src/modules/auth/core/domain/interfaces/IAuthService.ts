/**
 * Auth Service Interface
 *
 * Contract for authentication API operations.
 * Implemented by AuthService in the data/services layer.
 *
 * @module auth/core/domain
 */
import type { LoginRequestModel, LoginResponseModel } from "../types/AuthTypes";
import type {
  DiscoverWorkspacesResponseDto,
  Verify2FARequestModel,
  Verify2FAResponseModel,
} from "../types/AuthTypes";

export interface IAuthService {
  login(request: LoginRequestModel): Promise<LoginResponseModel>;
  verify2FA(request: Verify2FARequestModel): Promise<Verify2FAResponseModel>;
  logout(): Promise<void>;
  refreshToken(): Promise<LoginResponseModel>;
  getMe<T>(): Promise<T>;
  discoverWorkspaces(email: string): Promise<DiscoverWorkspacesResponseDto>;
  impersonate(adminId: string): Promise<LoginResponseModel>;
  stopImpersonation(): Promise<LoginResponseModel>;
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

  /** Request a passwordless magic-link sign-in email (enumeration-safe, always resolves). */
  requestMagicLink(email: string, tenantId?: string): Promise<{ sent: boolean }>;

  /** Verify a magic-link token from the email URL and issue a session. */
  verifyMagicLink(
    token: string,
    tenantId?: string,
    deviceInfo?: string
  ): Promise<LoginResponseModel>;

  /** Begin WebAuthn/Passkey authentication — get challenge from backend. */
  beginPasskeyAuth(): Promise<{
    challengeId: string;
    options: PublicKeyCredentialRequestOptions;
  }>;

  /** Verify WebAuthn/Passkey assertion — send attestation to backend, get tokens. */
  verifyPasskeyAuth(data: {
    challengeId: string;
    credentialId: string;
    rawId: string;
    clientDataJSON: string;
    authenticatorData: string;
    signature: string;
    userHandle: string | null;
  }): Promise<{ accessToken: string; refreshToken: string }>;

  /** Request a phone OTP for sign-in (enumeration-safe, always resolves). */
  requestPhoneOtp(phoneNumber: string): Promise<{ sent: boolean; retryAfterSeconds: number }>;

  /** Verify a phone OTP code for sign-in. */
  verifyPhoneOtp(
    phoneNumber: string,
    code: string
  ): Promise<{ accessToken: string; refreshToken: string; expiresAt: string }>;

  /** Begin QR sign-in — generate a session token + QR code data. */
  beginQrSignIn(): Promise<{ sessionId: string; qrData: string; expiresAt: string }>;

  /** Check QR sign-in session status (polling). */
  checkQrSignIn(sessionId: string): Promise<{
    status: "pending" | "scanned" | "approved" | "expired";
    accessToken?: string;
    refreshToken?: string;
  }>;

  /** Approve a QR sign-in session from the mobile device. */
  approveQrSignIn(sessionId: string): Promise<void>;
}
