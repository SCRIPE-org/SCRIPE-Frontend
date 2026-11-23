/**
 * Security Repository
 *
 * Implements ISecurityRepository via IApiService, transforming API DTOs
 * into domain entities (PasskeyCredential, WorkstationSession, SecurityAuditEntry).
 */
import type { IApiService } from "@core/interfaces/api.interface";
import { buildUrl } from "@/core/config/api-endpoints/_shared";
import { mapPasswordPolicyDto, type PasswordPolicyModel } from "@core/common/password-policy";
import { PROFILE_ENDPOINTS } from "../services/profile.endpoints";
import { ProfileService } from "../services/ProfileService";
import type { IProfileService } from "../../domain/interfaces/IProfileService";
import type {
  ISecurityRepository,
  PasskeyRegistrationBeginResponse,
  PasskeyRegistrationMode,
  SudoLockResponse,
  SudoPasskeyBeginResponse,
  SudoStatus,
  SudoVerifyResponse,
  SudoVerifyResult,
  VerifySudoStepUpRequest,
} from "../../domain/interfaces/ISecurityRepository";
import type { PasskeyCredential } from "../../domain/entities/PasskeyCredential";
import type { WorkstationSession } from "../../domain/entities/WorkstationSession";
import type { SecurityAuditEntry } from "../../domain/entities/SecurityAuditEntry";
import type {
  ChangePasswordRequest,
  ChangePasswordSessionResult,
  Enable2FAResult,
} from "../../domain/interfaces/IProfileRepository";
import {
  mapBiometricSudoResult,
  mapPasskeyCredentials,
  mapSecurityAuditTrail,
  mapSudoPasskeyBegin,
  mapSudoStatus,
  mapSudoVerifyResponse,
  mapWorkstationSessions,
  type ActiveSessionRawDto,
  type PasskeyListDto,
  type SecurityAuditRawDto,
} from "../mappers/SecurityRepositoryMapper";

/**
 * HTTP-backed repository implementing passkey vault, Sudo elevation, sessions, 2FA, and audit trail operations.
 */
export class SecurityRepository implements ISecurityRepository {
  private readonly profileService: IProfileService;

  constructor(
    private readonly api: IApiService,
    profileService?: IProfileService
  ) {
    this.profileService = profileService ?? new ProfileService(api);
  }

  async listPasskeys(): Promise<PasskeyCredential[]> {
    const dtos = await this.api.get<PasskeyListDto[]>(PROFILE_ENDPOINTS.PASSKEYS.LIST);
    return mapPasskeyCredentials(dtos);
  }

  async beginPasskeyRegistration(
    deviceName?: string,
    mode?: PasskeyRegistrationMode,
    sudoToken?: string
  ): Promise<PasskeyRegistrationBeginResponse> {
    const body = {
      deviceName,
      ...(mode ? { mode } : {}),
    };
    if (sudoToken) {
      return this.api.post<PasskeyRegistrationBeginResponse>(
        PROFILE_ENDPOINTS.PASSKEYS.REGISTER_BEGIN,
        body,
        undefined,
        { headers: { "X-Sudo-Token": sudoToken } }
      );
    }
    return this.api.post<PasskeyRegistrationBeginResponse>(
      PROFILE_ENDPOINTS.PASSKEYS.REGISTER_BEGIN,
      body
    );
  }

  async beginPasskeyAuth(
    identifier?: string,
    tenantId?: string
  ): Promise<{
    challenge: string;
    rpId: string;
    timeout?: number;
    allowCredentials?: Array<{ id: string; type: "public-key"; transports?: string[] }>;
    userVerification?: "required" | "preferred" | "discouraged";
  }> {
    return this.api.post(PROFILE_ENDPOINTS.PASSKEYS.AUTH_BEGIN, {
      identifier: identifier || "",
      tenantId: tenantId || null,
    });
  }

  async completePasskeyRegistration(data: {
    attestationObjectBase64: string;
    clientDataJsonBase64: string;
    deviceName: string;
    transports?: string[] | null;
    clientExtensionResults?: Record<string, unknown>;
    challengeToken?: string;
    attestationMode?: string;
    credentialIdBase64?: string;
  }, sudoToken?: string): Promise<{ id: string; deviceName: string; createdAt: Date }> {
    const res = sudoToken
      ? await this.api.post<{ id: string; deviceName: string; createdAt: string }>(
          PROFILE_ENDPOINTS.PASSKEYS.REGISTER_COMPLETE,
          data,
          undefined,
          { headers: { "X-Sudo-Token": sudoToken } }
        )
      : await this.api.post<{ id: string; deviceName: string; createdAt: string }>(
          PROFILE_ENDPOINTS.PASSKEYS.REGISTER_COMPLETE,
          data
        );
    return {
      id: res.id,
      deviceName: res.deviceName,
      createdAt: new Date(res.createdAt),
    };
  }

  async removePasskey(id: string, sudoToken?: string): Promise<void> {
    if (sudoToken) {
      await this.api.delete(PROFILE_ENDPOINTS.PASSKEYS.DELETE(id), undefined, {
        headers: { "X-Sudo-Token": sudoToken },
      });
      return;
    }
    await this.api.delete(PROFILE_ENDPOINTS.PASSKEYS.DELETE(id));
  }

  async renamePasskey(id: string, newName: string, sudoToken?: string): Promise<void> {
    if (sudoToken) {
      await this.api.patch(PROFILE_ENDPOINTS.PASSKEYS.RENAME(id), { newName }, undefined, {
        headers: { "X-Sudo-Token": sudoToken },
      });
      return;
    }
    await this.api.patch(PROFILE_ENDPOINTS.PASSKEYS.RENAME(id), { newName });
  }

  async beginSudoPasskey(): Promise<SudoPasskeyBeginResponse> {
    const raw = await this.api.post<Record<string, unknown>>(
      PROFILE_ENDPOINTS.SUDO.PASSKEY_BEGIN,
      {}
    );
    return mapSudoPasskeyBegin(raw);
  }

  async getSudoStatus(): Promise<SudoStatus> {
    const raw = await this.api.get<SudoStatus>(PROFILE_ENDPOINTS.SUDO.STATUS);
    return mapSudoStatus(raw);
  }

  async verifySudoStepUp(data: VerifySudoStepUpRequest): Promise<SudoVerifyResponse> {
    const res = await this.api.post<SudoVerifyResponse>(PROFILE_ENDPOINTS.SUDO.VERIFY, data);
    return mapSudoVerifyResponse(res, data);
  }

  async lockSudoSession(): Promise<SudoLockResponse> {
    return this.api.post<SudoLockResponse>(PROFILE_ENDPOINTS.SUDO.LOCK, {});
  }

  async sudoVerify(data: {
    credentialIdBase64: string;
    authenticatorDataBase64: string;
    clientDataJsonBase64: string;
    signatureBase64: string;
    clientExtensionResults?: Record<string, unknown>;
  }): Promise<SudoVerifyResult> {
    const res = await this.api.post<{
      sudoToken: string;
      expiresAt?: string;
      expiresInSeconds?: number;
      verified?: boolean;
    }>(PROFILE_ENDPOINTS.SUDO_VERIFY, data);
    return mapBiometricSudoResult(res);
  }

  async getSessions(): Promise<WorkstationSession[]> {
    const dtos = await this.api.get<ActiveSessionRawDto[]>(PROFILE_ENDPOINTS.SESSIONS);
    return mapWorkstationSessions(dtos);
  }

  async revokeSession(tokenId: string, sudoToken?: string): Promise<void> {
    if (sudoToken) {
      await this.api.delete(PROFILE_ENDPOINTS.REVOKE_SESSION(tokenId), undefined, {
        headers: { "X-Sudo-Token": sudoToken },
      });
      return;
    }
    await this.api.delete(PROFILE_ENDPOINTS.REVOKE_SESSION(tokenId));
  }

  async revokeAllOtherSessions(sudoToken?: string): Promise<{ revokedCount: number }> {
    if (sudoToken) {
      return this.api.post<{ revokedCount: number }>(
        PROFILE_ENDPOINTS.REVOKE_ALL_SESSIONS,
        {},
        undefined,
        { headers: { "X-Sudo-Token": sudoToken } }
      );
    }
    return this.api.post<{ revokedCount: number }>(PROFILE_ENDPOINTS.REVOKE_ALL_SESSIONS, {});
  }

  async emergencyLockdown(): Promise<void> {
    await this.api.put(PROFILE_ENDPOINTS.ACCOUNT.SECURITY, {
      triggerEmergencyLockdown: true,
      lockdownConfirmationPhrase: "LOCKDOWN",
    });
  }

  async enable2FA(): Promise<Enable2FAResult> {
    return this.api.post<Enable2FAResult>(PROFILE_ENDPOINTS.TWO_FA.ENABLE, {});
  }

  async confirm2FA(code: string): Promise<void> {
    await this.api.post(PROFILE_ENDPOINTS.TWO_FA.CONFIRM, { code });
  }

  async disable2FA(password: string, twoFactorCode: string): Promise<void> {
    await this.api.post(PROFILE_ENDPOINTS.TWO_FA.DISABLE, { password, twoFactorCode });
  }

  async regenerateBackupCodes(twoFactorCode: string): Promise<string[]> {
    const res = await this.api.post<{ backupCodes: string[] }>(
      PROFILE_ENDPOINTS.BACKUP_CODES_REGENERATE,
      { code: twoFactorCode }
    );
    return res.backupCodes;
  }

  async getPasswordPolicy(): Promise<PasswordPolicyModel> {
    const dto = await this.profileService.getPasswordPolicy();
    return mapPasswordPolicyDto(dto);
  }

  async changePassword(
    data: ChangePasswordRequest,
    sudoToken?: string
  ): Promise<ChangePasswordSessionResult | void> {
    return this.profileService.changePassword(
      {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        twoFactorCode: data.twoFactorCode,
      },
      sudoToken
    );
  }

  async getAuditTrail(page: number = 1, pageSize: number = 50): Promise<SecurityAuditEntry[]> {
    const url = buildUrl(PROFILE_ENDPOINTS.SECURITY_LOG, { page, pageSize });
    const res = await this.api.get<SecurityAuditRawDto[] | { items?: SecurityAuditRawDto[] }>(url);
    return mapSecurityAuditTrail(res);
  }
}
