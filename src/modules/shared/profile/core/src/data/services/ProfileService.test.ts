// ═══════════════════════════════════════════════════════════════════════════
// ProfileService — LEGACY endpoint elimination contract test (F-06)
//
// WHY THIS EXISTS
// ----------------
// ProfileService previously called `PROFILE_ENDPOINTS.LEGACY.*` (`/v1/profile/*`)
// for all 13 of its methods. No `ProfileController` exists anywhere in
// SCRIPE-Backend (verified: zero matches for "ProfileController" under
// SCRIPE-Backend/src/Host/API/Controllers) — every one of those calls was a
// guaranteed 404 for every admin who opened the Profile Settings page
// (SCRIPE-Frontend/src/modules/shared/profile/core/src/presentation/views/
// ProfileSettingsView.tsx), confirmed reachable via
// ProfileSettingsView -> useSecurityViewModel/useSessionsViewModel/
// useAvatarViewModel/useExternalLoginsViewModel -> ProfileRepository ->
// ProfileService.
//
// The SAME file already defined the CORRECT, live, already-implemented
// endpoints under the non-legacy top-level keys (ME, UPDATE_ME, AVATAR,
// CHANGE_PASSWORD, SESSIONS, REVOKE_SESSION, REVOKE_ALL_SESSIONS,
// BACKUP_CODES_REGENERATE, SECURITY_LOG, EXTERNAL_LOGINS,
// LINK_EXTERNAL_LOGIN, UNLINK_EXTERNAL_LOGIN) — each backed by a real
// controller action:
//   GET/PUT   /v1/admins/me                          AdminsController.GetMe / UpdateMyProfile
//   POST/DEL  /v1/admins/me/avatar                    AdminsController.UploadAvatar / RemoveAvatar
//   POST      /v1/admins/{id}/change-password         AdminsController.ChangePassword
//   GET       /v1/auth/admin/sessions                 AdminAuthController.GetSessions
//   DELETE    /v1/auth/admin/sessions/{tokenId}        AdminAuthController.RevokeSession
//   POST      /v1/auth/admin/sessions/revoke-all       AdminAuthController.RevokeAllSessions
//   POST      /v1/auth/admin/2fa/backup-codes/regenerate AdminAuthController.RegenerateBackupCodes
//   GET       /v1/auth/admin/security-log              AdminAuthController.GetSecurityLog
//   GET       /v1/auth/admin/external-logins           AdminAuthController.GetExternalLogins
//   POST      /v1/auth/admin/external-logins/link       AdminAuthController.LinkExternalAccount
//   DELETE    /v1/auth/admin/external-logins/{id}       AdminAuthController.UnlinkExternalAccount
//
// This test pins ProfileService to call those real endpoints (with the
// correct HTTP verb) instead of the dead `/v1/profile/*` family, so the
// LEGACY block cannot silently come back.
//
// `changePassword` needs the current admin's id to hit
// `/v1/admins/{id}/change-password` — ProfileService resolves it via a
// GET to PROFILE_ENDPOINTS.ME first (that response DTO already carries
// `id` — see AdminProfileDto in ../models/ProfileModels.ts).
//
// `revokeAllSessions` posts an empty body: AdminAuthController's
// RevokeAllSessions/Logout/RefreshToken actions all bind
// `RefreshTokenRequest.RefreshToken` from the httpOnly cookie via
// CookieAuthMiddleware, not from an explicit client-supplied value — this
// is the same pattern AuthService.logout()/refreshToken() already use
// (SCRIPE-Frontend/src/modules/shared/auth/core/data/services/AuthService.ts).
// ═══════════════════════════════════════════════════════════════════════════

import { describe, it, expect, vi } from "vitest";
import { ProfileService } from "./ProfileService";
import type { IApiService } from "@core/interfaces/api.interface";
import { PROFILE_ENDPOINTS } from "./profile.endpoints";

function mockApiService(overrides: Partial<IApiService> = {}): IApiService {
  return {
    get: vi.fn().mockResolvedValue({}),
    post: vi.fn().mockResolvedValue({}),
    put: vi.fn().mockResolvedValue({}),
    delete: vi.fn().mockResolvedValue({}),
    patch: vi.fn().mockResolvedValue({}),
    ...overrides,
  } as unknown as IApiService;
}

describe("ProfileService — no call site targets the dead /v1/profile/* LEGACY family", () => {
  it("getProfile() GETs /v1/admins/me, not /v1/profile", async () => {
    const api = mockApiService();
    await new ProfileService(api).getProfile();
    expect(api.get).toHaveBeenCalledWith(PROFILE_ENDPOINTS.ME);
    expect(PROFILE_ENDPOINTS.ME).toBe("/v1/Admins/me");
  });

  it("updateProfile() PUTs /v1/admins/me, not /v1/profile", async () => {
    const api = mockApiService();
    const data = { firstName: "A", lastName: "B", phoneNumber: "1" };
    await new ProfileService(api).updateProfile(data);
    expect(api.put).toHaveBeenCalledWith(PROFILE_ENDPOINTS.UPDATE_ME, data);
  });

  it("uploadAvatar() POSTs /v1/admins/me/avatar, not /v1/profile/avatar", async () => {
    const api = mockApiService();
    const file = new File(["x"], "a.png");
    await new ProfileService(api).uploadAvatar(file);
    expect((api.post as ReturnType<typeof vi.fn>).mock.calls[0][0]).toBe(PROFILE_ENDPOINTS.AVATAR);
  });

  it("removeAvatar() DELETEs /v1/admins/me/avatar, not /v1/profile/avatar", async () => {
    const api = mockApiService();
    await new ProfileService(api).removeAvatar();
    expect(api.delete).toHaveBeenCalledWith(PROFILE_ENDPOINTS.AVATAR);
  });

  it("changePassword() resolves the current admin id via ME then POSTs /v1/admins/{id}/change-password", async () => {
    const api = mockApiService({ get: vi.fn().mockResolvedValue({ id: "admin-123" }) });
    const data = { currentPassword: "old", newPassword: "new" };
    await new ProfileService(api).changePassword(data);
    expect(api.get).toHaveBeenCalledWith(PROFILE_ENDPOINTS.ME);
    expect(api.post).toHaveBeenCalledWith(PROFILE_ENDPOINTS.CHANGE_PASSWORD("admin-123"), data);
  });

  it("getSessions() GETs /v1/auth/admin/sessions, not /v1/profile/sessions", async () => {
    const api = mockApiService();
    await new ProfileService(api).getSessions();
    expect(api.get).toHaveBeenCalledWith(PROFILE_ENDPOINTS.SESSIONS);
  });

  it("revokeSession() DELETEs /v1/auth/admin/sessions/{tokenId}, not /v1/profile/sessions/{id}", async () => {
    const api = mockApiService();
    await new ProfileService(api).revokeSession("tok-1");
    expect(api.delete).toHaveBeenCalledWith(PROFILE_ENDPOINTS.REVOKE_SESSION("tok-1"));
  });

  it("revokeAllSessions() POSTs /v1/auth/admin/sessions/revoke-all (not a DELETE on /v1/profile/sessions)", async () => {
    const api = mockApiService();
    await new ProfileService(api).revokeAllSessions();
    expect(api.post).toHaveBeenCalledWith(PROFILE_ENDPOINTS.REVOKE_ALL_SESSIONS, {});
  });

  it("regenerateBackupCodes() POSTs /v1/auth/admin/2fa/backup-codes/regenerate, not /v1/profile/2fa/backup-codes", async () => {
    const api = mockApiService();
    await new ProfileService(api).regenerateBackupCodes("123456");
    expect(api.post).toHaveBeenCalledWith(PROFILE_ENDPOINTS.BACKUP_CODES_REGENERATE, {
      twoFactorCode: "123456",
    });
  });

  it("getSecurityLog() GETs /v1/auth/admin/security-log, not /v1/profile/security-log", async () => {
    const api = mockApiService();
    await new ProfileService(api).getSecurityLog(1, 10);
    expect((api.get as ReturnType<typeof vi.fn>).mock.calls[0][0]).toContain(
      PROFILE_ENDPOINTS.SECURITY_LOG
    );
  });

  it("getExternalLogins() GETs /v1/auth/admin/external-logins, not /v1/profile/external-logins", async () => {
    const api = mockApiService();
    await new ProfileService(api).getExternalLogins();
    expect(api.get).toHaveBeenCalledWith(PROFILE_ENDPOINTS.EXTERNAL_LOGINS);
  });

  it("linkExternalLogin() POSTs /v1/auth/admin/external-logins/link, not /v1/profile/external-logins", async () => {
    const api = mockApiService();
    const data = {
      identityProviderId: "p1",
      providerName: "google",
      providerKey: "k1",
      email: null,
      displayName: null,
    };
    await new ProfileService(api).linkExternalLogin(data);
    expect(api.post).toHaveBeenCalledWith(PROFILE_ENDPOINTS.LINK_EXTERNAL_LOGIN, data);
  });

  it("unlinkExternalLogin() DELETEs /v1/auth/admin/external-logins/{id}, not /v1/profile/external-logins/{id}", async () => {
    const api = mockApiService();
    await new ProfileService(api).unlinkExternalLogin("ext-1");
    expect(api.delete).toHaveBeenCalledWith(PROFILE_ENDPOINTS.UNLINK_EXTERNAL_LOGIN("ext-1"));
  });

  it("PROFILE_ENDPOINTS no longer exposes a LEGACY family (removed — dead, no backend ProfileController)", () => {
    expect((PROFILE_ENDPOINTS as Record<string, unknown>).LEGACY).toBeUndefined();
  });
});
