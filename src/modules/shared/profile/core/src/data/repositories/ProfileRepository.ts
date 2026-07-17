/**
 * Profile Repository
 *
 * Concrete implementation of IProfileRepository.
 * Makes API calls via IApiService and transforms DTOs to entities via ProfileMapper.
 */
import type { IApiService } from "@core/interfaces/api.interface";
import { buildUrl } from "@/core/config/api-endpoints/_shared";
import { useAppStore } from "@core/store/useAppStore";
import { PROFILE_ENDPOINTS } from "../services/profile.endpoints";
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

/**
 * Repository layer implementing client request queries for profile.
 * Calls base API service routines and resolves DTO objects mapping to domain entities.
 */
export class ProfileRepository implements IProfileRepository {
  constructor(private readonly api: IApiService) {}

  // ── Profile ──────────────────────────────────────────

  async getProfile(): Promise<AdminProfile> {
    const dto = await this.api.get<AdminProfileDto>(PROFILE_ENDPOINTS.ME);
    return ProfileMapper.toAdminProfile(dto);
  }

  async updateProfile(data: UpdateProfileRequest): Promise<AdminProfile> {
    const dto = await this.api.put<AdminProfileDto>(PROFILE_ENDPOINTS.UPDATE_ME, data);
    return ProfileMapper.toAdminProfile(dto);
  }

  // ── Avatar ───────────────────────────────────────────

  async uploadAvatar(file: File): Promise<{ profileImageUrl: string }> {
    const formData = new FormData();
    formData.append("image", file);
    const response = await this.api.post<{ imageUrl: string }>(
      PROFILE_ENDPOINTS.AVATAR,
      formData
    );
    return { profileImageUrl: response.imageUrl };
  }

  async removeAvatar(): Promise<void> {
    await this.api.delete(PROFILE_ENDPOINTS.AVATAR);
  }

  // ── Password ─────────────────────────────────────────

  async changePassword(data: ChangePasswordRequest): Promise<void> {
    // Get the current admin's ID from the store — the backend endpoint requires it.
    // POST /v1/Admins/{id}/change-password is the correct route.
    const adminId = useAppStore.getState().user?.id;
    if (!adminId) throw new Error("User not authenticated");

    await this.api.post(PROFILE_ENDPOINTS.CHANGE_PASSWORD(adminId), {
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
      twoFactorCode: data.twoFactorCode,
    });
  }

  // ── Sessions ─────────────────────────────────────────

  async getSessions(): Promise<ActiveSession[]> {
    const dtos = await this.api.get<ActiveSessionDto[]>(PROFILE_ENDPOINTS.SESSIONS);
    return ProfileMapper.toActiveSessions(dtos);
  }

  async revokeSession(tokenId: string): Promise<void> {
    await this.api.delete(PROFILE_ENDPOINTS.REVOKE_SESSION(tokenId));
  }

  async revokeAllSessions(): Promise<{ revokedCount: number }> {
    return await this.api.post<{ revokedCount: number }>(PROFILE_ENDPOINTS.REVOKE_ALL_SESSIONS);
  }

  // ── 2FA Backup Codes ─────────────────────────────────

  async regenerateBackupCodes(twoFactorCode: string): Promise<string[]> {
    const result = await this.api.post<{ backupCodes: string[] }>(
      PROFILE_ENDPOINTS.BACKUP_CODES_REGENERATE,
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
    return await this.api.post<Enable2FAResultDto>(PROFILE_ENDPOINTS.TWO_FA.ENABLE);
  }

  async confirm2FA(code: string): Promise<void> {
    await this.api.post(PROFILE_ENDPOINTS.TWO_FA.CONFIRM, { code });
  }

  async disable2FA(password: string, twoFactorCode: string): Promise<void> {
    await this.api.post(PROFILE_ENDPOINTS.TWO_FA.DISABLE, { password, twoFactorCode });
  }

  // ── Security Log ─────────────────────────────────────

  async getSecurityLog(page: number = 1, pageSize: number = 50): Promise<SecurityLogEntry[]> {
    const url = buildUrl(PROFILE_ENDPOINTS.SECURITY_LOG, {
      page,
      pageSize,
    });
    const dtos = await this.api.get<SecurityLogEntryDto[]>(url);
    return ProfileMapper.toSecurityLog(dtos);
  }

  // ── External Logins ──────────────────────────────────

  async getExternalLogins(): Promise<ExternalLogin[]> {
    const dtos = await this.api.get<ExternalLoginDto[]>(PROFILE_ENDPOINTS.EXTERNAL_LOGINS);
    return ProfileMapper.toExternalLogins(dtos);
  }

  async linkExternalLogin(data: LinkExternalLoginDto): Promise<ExternalLogin> {
    const dto = await this.api.post<ExternalLoginDto>(
      PROFILE_ENDPOINTS.LINK_EXTERNAL_LOGIN,
      data
    );
    return ProfileMapper.toExternalLogin(dto);
  }

  async unlinkExternalLogin(externalLoginId: string): Promise<void> {
    await this.api.delete(PROFILE_ENDPOINTS.UNLINK_EXTERNAL_LOGIN(externalLoginId));
  }
}
