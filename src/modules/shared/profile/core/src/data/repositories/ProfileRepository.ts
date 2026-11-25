/**
 * Profile Repository
 *
 * Concrete implementation of IProfileRepository.
 * Makes API calls via IApiService and transforms DTOs to entities via ProfileMapper.
 */
import type { IApiService } from "@core/interfaces/api.interface";
import { buildUrl } from "@/core/config/api-endpoints/_shared";
import { isExternalCustomDomain } from "@core/common/origin-routing";
import { secureTokenService } from "@core/common/secure-token-service";
import { postCustomDomainSessionRelay } from "@core/services/custom-domain-relay-client";
import { PROFILE_ENDPOINTS } from "../services/profile.endpoints";
import { ProfileService } from "../services/ProfileService";
import type { IProfileService } from "../../domain/interfaces/IProfileService";
import type {
  IProfileRepository,
  UpdateProfileRequest,
  ChangePasswordRequest,
  ChangePasswordSessionResult,
  InitiateExternalLoginLinkRequest,
  InitiateExternalLoginLinkResponse,
  ForceChangePasswordRequest,
  ForceChangePasswordResult,
} from "../../domain/interfaces/IProfileRepository";
import type { AdminProfile } from "../../domain/entities/AdminProfile";
import type { ActiveSession } from "../../domain/entities/ActiveSession";
import type { SecurityLogEntry } from "../../domain/entities/SecurityLogEntry";
import type {
  AdminProfileDto,
  ActiveSessionDto,
  SecurityLogEntryDto,
  Enable2FAResultDto,
  ExternalLoginDto,
  InitiateExternalLoginLinkResultDto,
} from "../models/ProfileModels";
import { ProfileMapper } from "../mappers/ProfileMapper";
import type { ExternalLogin } from "../../domain/entities/ExternalLogin";

/**
 * Repository layer implementing client request queries for profile.
 * Calls base API service routines and resolves DTO objects mapping to domain entities.
 */
export class ProfileRepository implements IProfileRepository {
  private readonly profileService: IProfileService;

  constructor(
    private readonly api: IApiService,
    profileService?: IProfileService
  ) {
    this.profileService = profileService ?? new ProfileService(api);
  }

  // ── Profile ──────────────────────────────────────────

  async getProfile(): Promise<AdminProfile> {
    const dto = await this.api.get<AdminProfileDto>(PROFILE_ENDPOINTS.DOSSIER);
    return ProfileMapper.toAdminProfile(dto);
  }

  async updateProfile(data: UpdateProfileRequest): Promise<AdminProfile> {
    const payload: UpdateProfileRequest = {
      ...data,
      ...(data.rowVersion !== undefined ? { rowVersion: data.rowVersion } : {}),
    };
    const dto = await this.api.put<AdminProfileDto>(PROFILE_ENDPOINTS.UPDATE_DOSSIER, payload);
    return ProfileMapper.toAdminProfile(dto);
  }

  // ── Avatar ───────────────────────────────────────────

  async uploadAvatar(file: File): Promise<{ profileImageUrl: string }> {
    const formData = new FormData();
    formData.append("image", file);
    const response = await this.api.post<{ imageUrl: string }>(PROFILE_ENDPOINTS.AVATAR, formData);
    return { profileImageUrl: response.imageUrl };
  }

  async removeAvatar(): Promise<void> {
    await this.api.delete(PROFILE_ENDPOINTS.AVATAR);
  }

  // ── Password ─────────────────────────────────────────

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

  // ── Sessions ─────────────────────────────────────────

  async getSessions(): Promise<ActiveSession[]> {
    const dtos = await this.api.get<ActiveSessionDto[]>(PROFILE_ENDPOINTS.SESSIONS);
    return ProfileMapper.toActiveSessions(dtos);
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

  async revokeAllSessions(sudoToken?: string): Promise<{ revokedCount: number }> {
    if (isExternalCustomDomain()) {
      return postCustomDomainSessionRelay<{ revokedCount: number }>(
        "/api/auth/session/establish",
        {
          mode: "revoke-other-sessions",
        },
        { includeAuth: true, sudoToken }
      );
    }
    if (sudoToken) {
      return await this.api.post<{ revokedCount: number }>(
        PROFILE_ENDPOINTS.REVOKE_ALL_SESSIONS,
        {},
        undefined,
        { headers: { "X-Sudo-Token": sudoToken } }
      );
    }
    return await this.api.post<{ revokedCount: number }>(PROFILE_ENDPOINTS.REVOKE_ALL_SESSIONS);
  }

  // ── 2FA Backup Codes ─────────────────────────────────

  async regenerateBackupCodes(twoFactorCode: string): Promise<string[]> {
    const result = await this.api.post<{ backupCodes: string[] }>(
      PROFILE_ENDPOINTS.BACKUP_CODES_REGENERATE,
      { code: twoFactorCode }
    );
    return result?.backupCodes ?? [];
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

  async initiateExternalLoginLink(
    data: InitiateExternalLoginLinkRequest,
    sudoToken?: string
  ): Promise<InitiateExternalLoginLinkResponse> {
    const options = sudoToken ? { headers: { "X-Sudo-Token": sudoToken } } : undefined;
    const dto = options
      ? await this.api.post<InitiateExternalLoginLinkResultDto>(
          PROFILE_ENDPOINTS.INITIATE_EXTERNAL_LOGIN_LINK,
          data,
          undefined,
          options
        )
      : await this.api.post<InitiateExternalLoginLinkResultDto>(
          PROFILE_ENDPOINTS.INITIATE_EXTERNAL_LOGIN_LINK,
          data
        );
    return {
      authorizationUrl: dto.authorizationUrl,
      protocol: dto.protocol,
      state: dto.state ?? null,
    };
  }

  async unlinkExternalLogin(externalLoginId: string, sudoToken?: string): Promise<void> {
    if (sudoToken) {
      await this.api.delete(
        PROFILE_ENDPOINTS.UNLINK_EXTERNAL_LOGIN(externalLoginId),
        undefined,
        { headers: { "X-Sudo-Token": sudoToken } }
      );
      return;
    }
    await this.api.delete(PROFILE_ENDPOINTS.UNLINK_EXTERNAL_LOGIN(externalLoginId));
  }

  async forceChangePassword(data: ForceChangePasswordRequest): Promise<ForceChangePasswordResult> {
    const result = isExternalCustomDomain()
      ? await postCustomDomainSessionRelay<ForceChangePasswordResult>(
          "/api/auth/session/establish",
          {
            mode: "force-change-password",
            ...data,
          }
        )
      : await this.api.post<ForceChangePasswordResult>(
          PROFILE_ENDPOINTS.FORCE_CHANGE_PASSWORD,
          data
        );
    if (result?.accessToken) {
      secureTokenService.setAccessToken(result.accessToken);
    }
    return result ?? {};
  }
}
