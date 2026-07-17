import { buildUrl } from "@/core/config/api-endpoints/_shared";
import type { IApiService } from "@core/interfaces/api.interface";
import type { IProfileService } from "../../domain/interfaces/IProfileService";
import type { AdminProfile } from "../../domain/entities/AdminProfile";
import type { ActiveSession } from "../../domain/entities/ActiveSession";
import type { SecurityLogEntry } from "../../domain/entities/SecurityLogEntry";
import type { ExternalLogin } from "../../domain/entities/ExternalLogin";
import type { LinkExternalLoginDto } from "../../domain/types/ProfileTypes";
import type {
  UpdateProfileRequest,
  ChangePasswordRequest,
  Enable2FAResult,
} from "../../domain/interfaces/IProfileRepository";
import { PROFILE_ENDPOINTS } from "./profile.endpoints";

/**
 * Http API network service for profile.
 * Maps request properties to core endpoint paths and delegates HTTP client fetching calls.
 */
export class ProfileService implements IProfileService {
  constructor(private readonly api: IApiService) {}

  async getProfile(): Promise<AdminProfile> {
    return this.api.get<AdminProfile>(PROFILE_ENDPOINTS.LEGACY.ME);
  }

  async updateProfile(data: UpdateProfileRequest): Promise<AdminProfile> {
    return this.api.put<AdminProfile>(PROFILE_ENDPOINTS.LEGACY.ME, data);
  }

  async uploadAvatar(file: File): Promise<{ profileImageUrl: string }> {
    const formData = new FormData();
    formData.append("file", file);
    return this.api.post<{ profileImageUrl: string }>(PROFILE_ENDPOINTS.LEGACY.AVATAR, formData);
  }

  async removeAvatar(): Promise<void> {
    return this.api.delete<void>(PROFILE_ENDPOINTS.LEGACY.AVATAR);
  }

  async changePassword(data: ChangePasswordRequest): Promise<void> {
    return this.api.post<void>(PROFILE_ENDPOINTS.LEGACY.CHANGE_PASSWORD, data);
  }

  async getSessions(): Promise<ActiveSession[]> {
    return this.api.get<ActiveSession[]>(PROFILE_ENDPOINTS.LEGACY.SESSIONS);
  }

  async revokeSession(tokenId: string): Promise<void> {
    return this.api.delete<void>(PROFILE_ENDPOINTS.LEGACY.REVOKE_SESSION(tokenId));
  }

  async revokeAllSessions(): Promise<{ revokedCount: number }> {
    return this.api.delete<{ revokedCount: number }>(PROFILE_ENDPOINTS.LEGACY.SESSIONS);
  }

  async enable2FA(): Promise<Enable2FAResult> {
    return this.api.post<Enable2FAResult>(PROFILE_ENDPOINTS.TWO_FA.ENABLE, {});
  }

  async confirm2FA(code: string): Promise<void> {
    return this.api.post<void>(PROFILE_ENDPOINTS.TWO_FA.CONFIRM, { code });
  }

  async disable2FA(password: string, twoFactorCode: string): Promise<void> {
    return this.api.post<void>(PROFILE_ENDPOINTS.TWO_FA.DISABLE, { password, twoFactorCode });
  }

  async regenerateBackupCodes(twoFactorCode: string): Promise<string[]> {
    return this.api.post<string[]>(PROFILE_ENDPOINTS.LEGACY.BACKUP_CODES, { twoFactorCode });
  }

  async getSecurityLog(page: number = 1, pageSize: number = 10): Promise<SecurityLogEntry[]> {
    const url = buildUrl(PROFILE_ENDPOINTS.LEGACY.SECURITY_LOG, { page, pageSize });
    return this.api.get<SecurityLogEntry[]>(url);
  }

  async getExternalLogins(): Promise<ExternalLogin[]> {
    return this.api.get<ExternalLogin[]>(PROFILE_ENDPOINTS.LEGACY.EXTERNAL_LOGINS);
  }

  async linkExternalLogin(data: LinkExternalLoginDto): Promise<ExternalLogin> {
    return this.api.post<ExternalLogin>(PROFILE_ENDPOINTS.LEGACY.EXTERNAL_LOGINS, data);
  }

  async unlinkExternalLogin(externalLoginId: string): Promise<void> {
    return this.api.delete<void>(PROFILE_ENDPOINTS.LEGACY.UNLINK_EXTERNAL_LOGIN(externalLoginId));
  }
}
