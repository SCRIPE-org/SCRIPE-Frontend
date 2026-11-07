/**
 * Security Repository
 *
 * Implements ISecurityRepository via IApiService, transforming API DTOs
 * into domain entities (PasskeyCredential, WorkstationSession, SecurityAuditEntry).
 */
import type { IApiService } from "@core/interfaces/api.interface";
import { buildUrl } from "@/core/config/api-endpoints/_shared";
import { useAppStore } from "@core/store/useAppStore";
import { PROFILE_ENDPOINTS } from "../services/profile.endpoints";
import type {
  ISecurityRepository,
  SudoVerifyResult,
} from "../../domain/interfaces/ISecurityRepository";
import type { PasskeyCredential } from "../../domain/entities/PasskeyCredential";
import type { WorkstationSession } from "../../domain/entities/WorkstationSession";
import type { SecurityAuditEntry } from "../../domain/entities/SecurityAuditEntry";
import type {
  Enable2FAResult,
  ChangePasswordRequest,
} from "../../domain/interfaces/IProfileRepository";

interface PasskeyListDto {
  id: string;
  deviceName: string;
  createdAt: string;
  lastUsedAt?: string | null;
  transports?: string[];
  isDiscoverable?: boolean;
  aaguid?: string | null;
  modelName?: string | null;
}

interface ActiveSessionRawDto {
  id?: string;
  tokenId?: string;
  deviceInfo?: string;
  ipAddress?: string;
  createdAt: string;
  expiresAt: string;
  isCurrent: boolean;
  isImpersonated?: boolean;
  impersonatorAdminId?: string | null;
  city?: string | null;
  country?: string | null;
}

interface SecurityAuditRawDto {
  id: string;
  eventType: string;
  description?: string;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  details?: string | null;
  impersonatedBy?: string | null;
}

export class SecurityRepository implements ISecurityRepository {
  constructor(private readonly api: IApiService) {}

  // ── Passkey Vault ──────────────────────────────────────────

  async listPasskeys(): Promise<PasskeyCredential[]> {
    const dtos = await this.api.get<PasskeyListDto[]>(PROFILE_ENDPOINTS.PASSKEYS.LIST);
    return (dtos || []).map((d) => ({
      id: d.id,
      deviceName: d.deviceName || "Security Key",
      createdAt: new Date(d.createdAt),
      lastUsedAt: d.lastUsedAt ? new Date(d.lastUsedAt) : null,
      transports: d.transports || [],
      isDiscoverable: d.isDiscoverable,
      aaguid: d.aaguid,
      modelName: d.modelName,
      credentialIdMasked: `••••••••${d.id.slice(-6)}`,
    }));
  }

  async beginPasskeyRegistration(deviceName?: string): Promise<any> {
    return this.api.post(PROFILE_ENDPOINTS.PASSKEYS.REGISTER_BEGIN, { deviceName });
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
    transports?: string[];
    clientExtensionResults?: Record<string, unknown>;
  }): Promise<{ id: string; deviceName: string; createdAt: Date }> {
    const res = await this.api.post<{ id: string; deviceName: string; createdAt: string }>(
      PROFILE_ENDPOINTS.PASSKEYS.REGISTER_COMPLETE,
      data
    );
    return {
      id: res.id,
      deviceName: res.deviceName,
      createdAt: new Date(res.createdAt),
    };
  }

  async removePasskey(id: string): Promise<void> {
    await this.api.delete(PROFILE_ENDPOINTS.PASSKEYS.DELETE(id));
  }

  async renamePasskey(id: string, newName: string): Promise<void> {
    await this.api.patch(PROFILE_ENDPOINTS.PASSKEYS.RENAME(id), { newName });
  }

  // ── Biometric Sudo Mode ───────────────────────────────────

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
    return {
      sudoToken: res.sudoToken,
      expiresInSeconds:
        res.expiresInSeconds ??
        (res.expiresAt ? Math.max(1, Math.round((new Date(res.expiresAt).getTime() - Date.now()) / 1000)) : 300),
    };
  }

  // ── Workstations & Session Fleet ──────────────────────────

  async getSessions(): Promise<WorkstationSession[]> {
    const dtos = await this.api.get<ActiveSessionRawDto[]>(PROFILE_ENDPOINTS.SESSIONS);
    return (dtos || []).map((d) => {
      const dev = d.deviceInfo || "Unknown Workstation";
      const isMac = /macintosh|mac os x/i.test(dev);
      const isWindows = /windows/i.test(dev);
      const isLinux = /linux/i.test(dev);
      const os = isMac ? "macOS" : isWindows ? "Windows" : isLinux ? "Linux" : "Desktop";
      const browser = /chrome/i.test(dev)
        ? "Chrome"
        : /safari/i.test(dev)
          ? "Safari"
          : /firefox/i.test(dev)
            ? "Firefox"
            : /edge/i.test(dev)
              ? "Edge"
              : "Browser";

      return {
        id: d.id || d.tokenId || "",
        deviceInfo: dev,
        ipAddress: d.ipAddress || "127.0.0.1",
        createdAt: new Date(d.createdAt),
        expiresAt: new Date(d.expiresAt),
        isCurrent: !!d.isCurrent,
        isImpersonated: !!d.isImpersonated,
        impersonatorAdminId: d.impersonatorAdminId,
        city: d.city,
        country: d.country,
        browser,
        os,
      };
    });
  }

  async revokeSession(tokenId: string): Promise<void> {
    await this.api.delete(PROFILE_ENDPOINTS.REVOKE_SESSION(tokenId));
  }

  async revokeAllOtherSessions(): Promise<{ revokedCount: number }> {
    return this.api.post<{ revokedCount: number }>(PROFILE_ENDPOINTS.REVOKE_ALL_SESSIONS, {});
  }

  async emergencyLockdown(): Promise<void> {
    await this.api.post(PROFILE_ENDPOINTS.REVOKE_ALL_SESSIONS, {});
  }

  // ── 2FA ───────────────────────────────────────────────────

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

  // ── Password ──────────────────────────────────────────────

  async changePassword(data: ChangePasswordRequest): Promise<void> {
    const adminId = useAppStore.getState().user?.id;
    if (!adminId) throw new Error("User not authenticated");
    await this.api.post(PROFILE_ENDPOINTS.CHANGE_PASSWORD(adminId), {
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
      twoFactorCode: data.twoFactorCode,
    });
  }

  // ── SOC2 Audit Trail ──────────────────────────────────────

  async getAuditTrail(page: number = 1, pageSize: number = 50): Promise<SecurityAuditEntry[]> {
    const url = buildUrl(PROFILE_ENDPOINTS.SECURITY_LOG, { page, pageSize });
    const res = await this.api.get<SecurityAuditRawDto[] | { items?: SecurityAuditRawDto[] }>(url);
    const dtos = Array.isArray(res) ? res : res?.items || [];
    return dtos.map((d) => ({
      id: d.id,
      eventType: d.eventType || "Security.Event",
      timestamp: new Date(d.timestamp),
      ipAddress: d.ipAddress || "127.0.0.1",
      userAgent: d.userAgent || "Console/1.0",
      isSuccess: !d.eventType.toLowerCase().includes("failed"),
      details: d.details || d.description || null,
      impersonatedBy: d.impersonatedBy,
      rawPayload: d as unknown as Record<string, unknown>,
    }));
  }
}
