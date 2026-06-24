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

/**
 * API service for executing HTTP calls related to Profile endpoints.
 */
export class ProfileService implements IProfileService {
  constructor(private readonly api: IApiService) {}

  async getProfile(): Promise<AdminProfile> {
    return this.api.get<AdminProfile>("/api/v1/profile");
  }

  async updateProfile(data: UpdateProfileRequest): Promise<AdminProfile> {
    return this.api.put<AdminProfile>("/api/v1/profile", data);
  }

  async uploadAvatar(file: File): Promise<{ profileImageUrl: string }> {
    const formData = new FormData();
    formData.append("file", file);
    return this.api.post<{ profileImageUrl: string }>("/api/v1/profile/avatar", formData);
  }

  async removeAvatar(): Promise<void> {
    return this.api.delete<void>("/api/v1/profile/avatar");
  }

  async changePassword(data: ChangePasswordRequest): Promise<void> {
    return this.api.post<void>("/api/v1/profile/change-password", data);
  }

  async getSessions(): Promise<ActiveSession[]> {
    return this.api.get<ActiveSession[]>("/api/v1/profile/sessions");
  }

  async revokeSession(tokenId: string): Promise<void> {
    return this.api.delete<void>(`/api/v1/profile/sessions/${tokenId}`);
  }

  async revokeAllSessions(): Promise<{ revokedCount: number }> {
    return this.api.delete<{ revokedCount: number }>("/api/v1/profile/sessions");
  }

  async enable2FA(): Promise<Enable2FAResult> {
    return this.api.post<Enable2FAResult>("/api/v1/profile/2fa/enable", {});
  }

  async confirm2FA(code: string): Promise<void> {
    return this.api.post<void>("/api/v1/profile/2fa/confirm", { code });
  }

  async disable2FA(password: string, twoFactorCode: string): Promise<void> {
    return this.api.post<void>("/api/v1/profile/2fa/disable", { password, twoFactorCode });
  }

  async regenerateBackupCodes(twoFactorCode: string): Promise<string[]> {
    return this.api.post<string[]>("/api/v1/profile/2fa/backup-codes", { twoFactorCode });
  }

  async getSecurityLog(page: number = 1, pageSize: number = 10): Promise<SecurityLogEntry[]> {
    return this.api.get<SecurityLogEntry[]>(
      `/api/v1/profile/security-log?page=${page}&pageSize=${pageSize}`
    );
  }

  async getExternalLogins(): Promise<ExternalLogin[]> {
    return this.api.get<ExternalLogin[]>("/api/v1/profile/external-logins");
  }

  async linkExternalLogin(data: LinkExternalLoginDto): Promise<ExternalLogin> {
    return this.api.post<ExternalLogin>("/api/v1/profile/external-logins", data);
  }

  async unlinkExternalLogin(externalLoginId: string): Promise<void> {
    return this.api.delete<void>(`/api/v1/profile/external-logins/${externalLoginId}`);
  }
}
