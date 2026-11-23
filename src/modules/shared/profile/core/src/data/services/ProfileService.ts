import { buildUrl } from "@/core/config/api-endpoints/_shared";
import type { PasswordPolicyDto } from "@core/common/password-policy";
import type { IApiService } from "@core/interfaces/api.interface";
import type { IProfileService } from "../../domain/interfaces/IProfileService";
import type { AdminProfile } from "../../domain/entities/AdminProfile";
import type { ActiveSession } from "../../domain/entities/ActiveSession";
import type { SecurityLogEntry } from "../../domain/entities/SecurityLogEntry";
import type { ExternalLogin } from "../../domain/entities/ExternalLogin";
import type {
  UpdateProfileRequest,
  ChangePasswordRequest,
  ChangePasswordSessionResult,
  Enable2FAResult,
  InitiateExternalLoginLinkRequest,
  InitiateExternalLoginLinkResponse,
} from "../../domain/interfaces/IProfileRepository";
import { PROFILE_ENDPOINTS } from "./profile.endpoints";

/**
 * Http API network service for profile.
 * Maps request properties to core endpoint paths and delegates HTTP client fetching calls.
 */
export class ProfileService implements IProfileService {
  constructor(private readonly api: IApiService) {}

  async getProfile(): Promise<AdminProfile> {
    return this.api.get<AdminProfile>(PROFILE_ENDPOINTS.DOSSIER);
  }

  async updateProfile(data: UpdateProfileRequest): Promise<AdminProfile> {
    return this.api.put<AdminProfile>(PROFILE_ENDPOINTS.UPDATE_DOSSIER, data);
  }

  async uploadAvatar(file: File): Promise<{ profileImageUrl: string }> {
    const formData = new FormData();
    formData.append("file", file);
    return this.api.post<{ profileImageUrl: string }>(PROFILE_ENDPOINTS.AVATAR, formData);
  }

  async removeAvatar(): Promise<void> {
    return this.api.delete<void>(PROFILE_ENDPOINTS.AVATAR);
  }

  async getPasswordPolicy(): Promise<PasswordPolicyDto> {
    return this.api.get<PasswordPolicyDto>(PROFILE_ENDPOINTS.PASSWORD_POLICY);
  }

  /**
   * AdminsController.ChangePassword is `POST /v1/admins/{id}/change-password` — it needs
   * the current admin's own id, which this service doesn't otherwise hold. Resolve it via
   * GET /v1/account/dossier (AdminProfileDto always carries `id`) before posting.
   */
  async changePassword(data: ChangePasswordRequest): Promise<ChangePasswordSessionResult | void> {
    const me = await this.api.get<{ id: string }>(PROFILE_ENDPOINTS.DOSSIER);
    return this.api.post<ChangePasswordSessionResult | void>(
      PROFILE_ENDPOINTS.CHANGE_PASSWORD(me.id),
      data
    );
  }

  async getSessions(): Promise<ActiveSession[]> {
    return this.api.get<ActiveSession[]>(PROFILE_ENDPOINTS.SESSIONS);
  }

  async revokeSession(tokenId: string): Promise<void> {
    return this.api.delete<void>(PROFILE_ENDPOINTS.REVOKE_SESSION(tokenId));
  }

  /**
   * AdminAuthController.RevokeAllSessions binds RefreshTokenRequest.RefreshToken from the
   * httpOnly refresh-token cookie via CookieAuthMiddleware — same pattern as
   * AuthService.logout()/refreshToken(), which also POST an empty body.
   */
  async revokeAllSessions(): Promise<{ revokedCount: number }> {
    return this.api.post<{ revokedCount: number }>(PROFILE_ENDPOINTS.REVOKE_ALL_SESSIONS, {});
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
    const res = await this.api.post<{ backupCodes: string[] }>(
      PROFILE_ENDPOINTS.BACKUP_CODES_REGENERATE,
      { code: twoFactorCode }
    );
    return res?.backupCodes ?? [];
  }

  async getSecurityLog(page: number = 1, pageSize: number = 10): Promise<SecurityLogEntry[]> {
    const url = buildUrl(PROFILE_ENDPOINTS.SECURITY_LOG, { page, pageSize });
    return this.api.get<SecurityLogEntry[]>(url);
  }

  async getExternalLogins(): Promise<ExternalLogin[]> {
    return this.api.get<ExternalLogin[]>(PROFILE_ENDPOINTS.EXTERNAL_LOGINS);
  }

  async initiateExternalLoginLink(
    data: InitiateExternalLoginLinkRequest,
    sudoToken?: string
  ): Promise<InitiateExternalLoginLinkResponse> {
    if (sudoToken) {
      return this.api.post<InitiateExternalLoginLinkResponse>(
        PROFILE_ENDPOINTS.INITIATE_EXTERNAL_LOGIN_LINK,
        data,
        undefined,
        { headers: { "X-Sudo-Token": sudoToken } }
      );
    }
    return this.api.post<InitiateExternalLoginLinkResponse>(
      PROFILE_ENDPOINTS.INITIATE_EXTERNAL_LOGIN_LINK,
      data
    );
  }

  async unlinkExternalLogin(externalLoginId: string, sudoToken?: string): Promise<void> {
    if (sudoToken) {
      return this.api.delete<void>(
        PROFILE_ENDPOINTS.UNLINK_EXTERNAL_LOGIN(externalLoginId),
        undefined,
        { headers: { "X-Sudo-Token": sudoToken } }
      );
    }
    return this.api.delete<void>(PROFILE_ENDPOINTS.UNLINK_EXTERNAL_LOGIN(externalLoginId));
  }
}
