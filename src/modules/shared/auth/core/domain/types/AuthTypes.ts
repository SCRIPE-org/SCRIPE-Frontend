/**
 * Auth Types - Domain Layer
 *
 * @module auth/core/domain
 */
export interface LoginRequestJson {
  identifier: string;
  password: string;
  tenantId?: string;
  deviceInfo?: string;
  isPlatformAdmin?: boolean;
}

export interface LoginRequestModel {
  toJson(): LoginRequestJson;
}

export interface LoginResponseJson {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: string;
  success?: boolean;
  userProfile?: unknown | null;
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
    /** TRUE = password matched this workspace; FALSE = wrong password (show inline form) */
    isPasswordVerified?: boolean;
    /** TRUE = account locked out (too many failed attempts) */
    isLocked?: boolean;
    /** UTC ISO string — when lockout expires */
    lockedUntil?: string | null;
  }> | null;
  mustChangePassword?: boolean;
  requireMfaEnrollment?: boolean;
  subscriptionStatus?: string | null;
  gracePhase?: string | null;
  editionName?: string | null;
  isSuccessful?: boolean;
  /** Backend-authoritative redirect path: "/" for dashboard, "/hub" for workspace picker */
  defaultRedirectPath?: string | null;
  /** Last active workspace key for seamless re-entry */
  lastWorkspaceKey?: string | null;
}

export interface LoginResponseModel extends LoginResponseJson {
  success: boolean;
  requires2FA: boolean;
  requiresWorkspaceSelection: boolean;
  availableWorkspaces: Array<{
    tenantId: string;
    tenantCode: string;
    tenantName: string;
    logoUrl: string | null;
    isPlatformAdmin: boolean;
    isActivated: boolean;
    isDisabled?: boolean;
    disabledReason?: string | null;
    /** TRUE = password matched this workspace; FALSE = wrong password (show inline form) */
    isPasswordVerified?: boolean;
    /** TRUE = account locked out (too many failed attempts) */
    isLocked?: boolean;
    /** UTC ISO string — when lockout expires */
    lockedUntil?: string | null;
  }> | null;
  mustChangePassword: boolean;
  requireMfaEnrollment?: boolean;
  subscriptionStatus: string | null;
  gracePhase: string | null;
  editionName: string | null;
  userProfile: unknown | null;
  isSuccessful: boolean;
  defaultRedirectPath: string;
  toJson(): LoginResponseJson;
}

export interface Verify2FARequestJson {
  identifier: string;
  password: string | null;
  code: string;
  tenantId?: string;
  twoFactorPendingToken?: string | null;
  staySignedIn?: boolean;
}

export interface Verify2FARequestModel {
  toJson(): Verify2FARequestJson;
}

export interface Verify2FAResponseJson {
  accessToken: string;
  expiresAt: string;
  mustChangePassword?: boolean;
  requireMfaEnrollment?: boolean;
  subscriptionStatus?: string | null;
  gracePhase?: string | null;
  editionName?: string | null;
  userProfile?: unknown;
  defaultRedirectPath?: string | null;
}

export interface Verify2FAResponseModel extends Verify2FAResponseJson {
  mustChangePassword: boolean;
  requireMfaEnrollment?: boolean;
  subscriptionStatus: string | null;
  gracePhase: string | null;
  editionName: string | null;
  defaultRedirectPath: string;
}

export interface WorkspaceInfoDto {
  tenantCode: string;
  tenantName: string;
  logoUrl: string | null;
  isPlatformAdmin: boolean;
  isActivated: boolean;
}

export interface DiscoverWorkspacesResponseDto {
  workspaces: WorkspaceInfoDto[];
  hasPlatformAccess: boolean;
}

export interface PasskeyAuthAllowCredential {
  id: string;
  type: "public-key";
  transports?: string[];
}

export interface PasskeyAuthBeginOptions {
  challenge: string;
  rpId?: string;
  timeout?: number;
  allowCredentials?: PasskeyAuthAllowCredential[];
  userVerification?: UserVerificationRequirement;
  challengeToken?: string | null;
  challengeId?: string;
  options?: PublicKeyCredentialRequestOptions;
}

export interface VerifyPasskeyAuthRequestData {
  credentialId: string;
  rawId?: string;
  clientDataJSON: string;
  authenticatorData: string;
  signature: string;
  userHandle: string | null;
  challengeToken?: string | null;
  clientExtensionResults?: Record<string, unknown>;
  tenantId?: string | null;
  challengeId?: string;
  staySignedIn?: boolean;
}

export interface PasskeyAuthVerifyResult {
  accessToken: string;
  refreshToken: string;
  expiresAt?: string;
  mustChangePassword?: boolean;
  requireMfaEnrollment?: boolean;
  requires2FA?: boolean;
  twoFactorPendingToken?: string | null;
  staySignedIn?: boolean;
  subscriptionStatus?: string | null;
  gracePhase?: string | null;
  editionName?: string | null;
  defaultRedirectPath?: string | null;
  lastWorkspaceKey?: string | null;
}
