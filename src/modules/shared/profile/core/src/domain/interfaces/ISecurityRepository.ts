/**
 * Security Repository Interface
 *
 * Contract for Passkeys, Multi-Factor Authentication, Session Management,
 * Biometric Sudo Mode, and Security Compliance Auditing.
 */
import type { PasskeyCredential } from "../entities/PasskeyCredential";
import type { WorkstationSession } from "../entities/WorkstationSession";
import type { SecurityAuditEntry } from "../entities/SecurityAuditEntry";
import type { Enable2FAResult, ChangePasswordRequest } from "./IProfileRepository";

/** Supported FIDO2/WebAuthn registration mode sent during passkey enrollment. */
export type PasskeyRegistrationMode = "platform" | "hybrid" | "cross-platform";

/** Short-lived sudo verification token payload returned after step-up authentication. */
export interface SudoVerifyResult {
  sudoToken: string;
  expiresInSeconds: number;
}

/** Current sudo session elevation status and active factor policy. */
export interface SudoStatus {
  isActive: boolean;
  expiresAtUtc: string | null;
  methodUsed: string | null;
  availableMethods: string[];
  mandatoryFactorPolicy: string;
  allowsPasswordFallback: boolean;
  remainingSeconds: number;
}

/** WebAuthn challenge parameters for initiating a passkey sudo assertion. */
export interface SudoPasskeyBeginResponse {
  challenge: string;
  rpId?: string;
  timeout?: number;
  userVerification?: string;
  challengeToken: string;
  allowCredentials?: Array<{ id: string; type: "public-key"; transports?: string[] }>;
}

/** Step-up sudo verification request payload across passkey, TOTP, or password factors. */
export interface VerifySudoStepUpRequest {
  method: "passkey" | "totp" | "password";
  password?: string;
  totpCode?: string;
  passkeyAssertion?: {
    credentialIdBase64: string;
    authenticatorDataBase64: string;
    clientDataJsonBase64: string;
    signatureBase64: string;
    userHandleBase64?: string | null;
    challengeToken: string;
    clientExtensionResults?: Record<string, unknown>;
  };
}

/** Response returned once a step-up sudo verification succeeds. */
export interface SudoVerifyResponse {
  sudoToken: string;
  expiresAtUtc: string;
  methodUsed: string;
  mandatoryFactorPolicy: string;
  expiresInSeconds: number;
  verified: boolean;
}

/** Response returned when locking an elevated sudo session early. */
export interface SudoLockResponse {
  locked: boolean;
  lockedAtUtc: string;
}

/** WebAuthn creation options and challenge metadata returned to initiate passkey enrollment. */
export interface PasskeyRegistrationBeginResponse {
  challenge: string;
  rp?: { id?: string; name?: string };
  rpId?: string;
  rpName?: string;
  user?: { id?: string; name?: string; displayName?: string };
  userId?: string;
  userName?: string;
  userDisplayName?: string;
  pubKeyCredParams?: Array<{ type: "public-key"; alg: number }>;
  timeout?: number;
  excludeCredentials?: Array<{ id: string; type: "public-key"; transports?: string[] }>;
  authenticatorSelection?: {
    authenticatorAttachment?: "platform" | "cross-platform";
    residentKey?: "discouraged" | "preferred" | "required";
    requireResidentKey?: boolean;
    userVerification?: "required" | "preferred" | "discouraged";
  };
  attestation?: "none" | "indirect" | "direct" | "enterprise";
  hints?: ("client-device" | "hybrid" | "security-key")[];
  challengeToken?: string;
  mode?: string;
  attachmentMode?: string;
}

/** Security repository contract covering passkeys, sudo step-up, sessions, 2FA, passwords, and audit trails. */
export interface ISecurityRepository {
  // Passkey Vault
  listPasskeys(): Promise<PasskeyCredential[]>;
  beginPasskeyRegistration(
    deviceName?: string,
    mode?: PasskeyRegistrationMode
  ): Promise<PasskeyRegistrationBeginResponse>;
  beginPasskeyAuth(
    identifier?: string,
    tenantId?: string
  ): Promise<{
    challenge: string;
    rpId: string;
    timeout?: number;
    allowCredentials?: Array<{ id: string; type: "public-key"; transports?: string[] }>;
    userVerification?: "required" | "preferred" | "discouraged";
  }>;
  completePasskeyRegistration(data: {
    attestationObjectBase64: string;
    clientDataJsonBase64: string;
    deviceName: string;
    transports?: string[] | null;
    clientExtensionResults?: Record<string, unknown>;
    challengeToken?: string;
    attestationMode?: string;
    credentialIdBase64?: string;
  }): Promise<{ id: string; deviceName: string; createdAt: Date }>;
  removePasskey(id: string): Promise<void>;
  renamePasskey(id: string, newName: string): Promise<void>;

  // Unified Sudo Step-Up Lifecycle
  getSudoStatus(): Promise<SudoStatus>;
  beginSudoPasskey(): Promise<SudoPasskeyBeginResponse>;
  verifySudoStepUp(data: VerifySudoStepUpRequest): Promise<SudoVerifyResponse>;
  lockSudoSession(): Promise<SudoLockResponse>;
  sudoVerify(data: {
    credentialIdBase64: string;
    authenticatorDataBase64: string;
    clientDataJsonBase64: string;
    signatureBase64: string;
    clientExtensionResults?: Record<string, unknown>;
  }): Promise<SudoVerifyResult>;

  // Workstations & Session Fleet
  getSessions(): Promise<WorkstationSession[]>;
  revokeSession(tokenId: string): Promise<void>;
  revokeAllOtherSessions(): Promise<{ revokedCount: number }>;
  emergencyLockdown(): Promise<void>;

  // 2FA Management
  enable2FA(): Promise<Enable2FAResult>;
  confirm2FA(code: string): Promise<void>;
  disable2FA(password: string, twoFactorCode: string): Promise<void>;
  regenerateBackupCodes(twoFactorCode: string): Promise<string[]>;

  // Password Management
  changePassword(data: ChangePasswordRequest): Promise<void>;

  // SOC2 Audit Trail
  getAuditTrail(page?: number, pageSize?: number): Promise<SecurityAuditEntry[]>;
}
