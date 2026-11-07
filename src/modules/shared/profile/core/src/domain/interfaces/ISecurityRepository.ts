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

export interface SudoVerifyResult {
  sudoToken: string;
  expiresInSeconds: number;
}

export interface ISecurityRepository {
  // Passkey Vault
  listPasskeys(): Promise<PasskeyCredential[]>;
  beginPasskeyRegistration(deviceName?: string): Promise<any>;
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
    transports?: string[];
    clientExtensionResults?: Record<string, unknown>;
  }): Promise<{ id: string; deviceName: string; createdAt: Date }>;
  removePasskey(id: string): Promise<void>;
  renamePasskey(id: string, newName: string): Promise<void>;

  // Biometric Sudo Mode Step-Up
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
