/**
 * Profile Repository
 *
 * Concrete implementation of IProfileRepository.
 * Makes API calls via IApiService and transforms DTOs to entities via ProfileMapper.
 */
import type { IApiService } from "@core/interfaces/api.interface";
import { API_ENDPOINTS, buildUrl } from "@core/config/api-endpoints";
import { useAppStore } from "@core/store/useAppStore";
import type {
  IProfileRepository,
  UpdateProfileRequest,
  ChangePasswordRequest,
} from "../../domain/interfaces/IProfileRepository";
import type { AdminProfile } from "../../domain/entities/AdminProfile";
import type { ActiveSession } from "../../domain/entities/ActiveSession";
import type { SecurityLogEntry } from "../../domain/entities/SecurityLogEntry";
import type {
  AdminProfileDto,
  ActiveSessionDto,
  SecurityLogEntryDto,
  Enable2FAResultDto,
  LinkExternalLoginDto,
  ExternalLoginDto,
} from "../models/ProfileModels";
import { ProfileMapper } from "../mappers/ProfileMapper";
import type { ExternalLogin } from "../../domain/entities/ExternalLogin";

export class ProfileRepository implements IProfileRepository {
  constructor(private readonly api: IApiService) {}

  // ── Profile ──────────────────────────────────────────

  async getProfile(): Promise<AdminProfile> {
    const dto = await this.api.get<AdminProfileDto>(API_ENDPOINTS.PROFILE.ME);
    return ProfileMapper.toAdminProfile(dto);
  }

  async updateProfile(data: UpdateProfileRequest): Promise<AdminProfile> {
    const dto = await this.api.put<AdminProfileDto>(API_ENDPOINTS.PROFILE.UPDATE_ME, data);
    return ProfileMapper.toAdminProfile(dto);
  }

  // ── Avatar ───────────────────────────────────────────

  async uploadAvatar(file: File): Promise<{ profileImageUrl: string }> {
    const formData = new FormData();
    formData.append("image", file);
    const response = await this.api.post<{ imageUrl: string }>(
      API_ENDPOINTS.PROFILE.AVATAR,
      formData
    );
    return { profileImageUrl: response.imageUrl };
  }

  async removeAvatar(): Promise<void> {
    await this.api.delete(API_ENDPOINTS.PROFILE.AVATAR);
  }

  // ── Password ─────────────────────────────────────────

  async changePassword(data: ChangePasswordRequest): Promise<void> {
    // Get the current admin's ID from the store — the backend endpoint requires it.
    // POST /v1/Admins/{id}/change-password is the correct route.
    const adminId = useAppStore.getState().user?.id;
    if (!adminId) throw new Error("User not authenticated");

    await this.api.post(API_ENDPOINTS.ADMINS.CHANGE_PASSWORD(adminId), {
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
      twoFactorCode: data.twoFactorCode,
    });
  }

  // ── Sessions ─────────────────────────────────────────

  async getSessions(): Promise<ActiveSession[]> {
    const dtos = await this.api.get<ActiveSessionDto[]>(API_ENDPOINTS.PROFILE.SESSIONS);
    return ProfileMapper.toActiveSessions(dtos);
  }

  async revokeSession(tokenId: string): Promise<void> {
    await this.api.delete(API_ENDPOINTS.PROFILE.REVOKE_SESSION(tokenId));
  }

  async revokeAllSessions(): Promise<{ revokedCount: number }> {
    return await this.api.post<{ revokedCount: number }>(API_ENDPOINTS.PROFILE.REVOKE_ALL_SESSIONS);
  }

  // ── 2FA Backup Codes ─────────────────────────────────

  async regenerateBackupCodes(twoFactorCode: string): Promise<string[]> {
    const result = await this.api.post<{ backupCodes: string[] }>(
      API_ENDPOINTS.PROFILE.BACKUP_CODES_REGENERATE,
      { username: "", password: "", code: twoFactorCode }
    );
    return result.backupCodes;
  }

  // ── 2FA Management ─────────────────────────────────────

  async enable2FA(): Promise<{
    qrCodeDataUri: string;
    manualEntryKey: string;
    backupCodes: string[];
  }> {
    return await this.api.post<Enable2FAResultDto>(API_ENDPOINTS.AUTH.TWO_FA.ENABLE);
  }

  async confirm2FA(code: string): Promise<void> {
    await this.api.post(API_ENDPOINTS.AUTH.TWO_FA.CONFIRM, { code });
  }

  async disable2FA(password: string, twoFactorCode: string): Promise<void> {
    await this.api.post(API_ENDPOINTS.AUTH.TWO_FA.DISABLE, { password, twoFactorCode });
  }

  // ── Security Log ─────────────────────────────────────

  async getSecurityLog(page: number = 1, pageSize: number = 50): Promise<SecurityLogEntry[]> {
    const url = buildUrl(API_ENDPOINTS.PROFILE.SECURITY_LOG, {
      page,
      pageSize,
    });
    const dtos = await this.api.get<SecurityLogEntryDto[]>(url);
    return ProfileMapper.toSecurityLog(dtos);
  }

  // ── External Logins ──────────────────────────────────

  async getExternalLogins(): Promise<ExternalLogin[]> {
    const dtos = await this.api.get<ExternalLoginDto[]>(API_ENDPOINTS.PROFILE.EXTERNAL_LOGINS);
    return ProfileMapper.toExternalLogins(dtos);
  }

  async linkExternalLogin(data: LinkExternalLoginDto): Promise<ExternalLogin> {
    const dto = await this.api.post<ExternalLoginDto>(
      API_ENDPOINTS.PROFILE.LINK_EXTERNAL_LOGIN,
      data
    );
    return ProfileMapper.toExternalLogin(dto);
  }

  async unlinkExternalLogin(externalLoginId: string): Promise<void> {
    await this.api.delete(API_ENDPOINTS.PROFILE.UNLINK_EXTERNAL_LOGIN(externalLoginId));
  }
}
