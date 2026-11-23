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
// The SAME file defines the sovereign endpoints under top-level keys
// (DOSSIER, UPDATE_DOSSIER, AVATAR, CHANGE_PASSWORD, SESSIONS, REVOKE_SESSION,
// REVOKE_ALL_SESSIONS, BACKUP_CODES_REGENERATE, SECURITY_LOG, EXTERNAL_LOGINS,
// LINK_EXTERNAL_LOGIN, UNLINK_EXTERNAL_LOGIN) — each backed by a real
// controller action:
//   GET/PUT   /v1/account/dossier                      AccountController.GetDossier / UpdateDossier
//   POST/DEL  /v1/account/dossier/avatar               AccountController.UploadAvatar / RemoveAvatar
//   POST      /v1/admins/{id}/change-password          AdminsController.ChangePassword
//   GET       /v1/auth/admin/sessions                  AdminAuthController.GetSessions
//   DELETE    /v1/auth/admin/sessions/{tokenId}        AdminAuthController.RevokeSession
//   POST      /v1/auth/admin/sessions/revoke-all       AdminAuthController.RevokeAllSessions
//   POST      /v1/auth/admin/2fa/backup-codes/regenerate AdminAuthController.RegenerateBackupCodes
//   GET       /v1/auth/admin/security-log              AdminAuthController.GetSecurityLog
//   GET       /v1/auth/admin/external-logins           AdminAuthController.GetExternalLogins
//   POST      /v1/auth/admin/external-logins/link      AdminAuthController.LinkExternalAccount
//   DELETE    /v1/auth/admin/external-logins/{id}      AdminAuthController.UnlinkExternalAccount
//
// This test pins ProfileService to call those real endpoints (with the
// correct HTTP verb) instead of the dead `/v1/profile/*` family, so the
// LEGACY block cannot silently come back.
//
// `changePassword` needs the current admin's id to hit
// `/v1/admins/{id}/change-password` — ProfileService resolves it via a
// GET to PROFILE_ENDPOINTS.DOSSIER first (that response DTO already carries
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
import { ProfileRepository } from "../repositories/ProfileRepository";
import { SecurityRepository } from "../repositories/SecurityRepository";
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

describe("ProfileService — no call site targets the dead /v1/profile/* or legacy /admins/me family", () => {
  it("getProfile() GETs /v1/account/dossier, not /v1/profile or /v1/admins/me", async () => {
    const api = mockApiService();
    await new ProfileService(api).getProfile();
    expect(api.get).toHaveBeenCalledWith(PROFILE_ENDPOINTS.DOSSIER);
    expect(PROFILE_ENDPOINTS.DOSSIER).toBe("/v1/account/dossier");
  });

  it("updateProfile() PUTs /v1/account/dossier, not /v1/profile", async () => {
    const api = mockApiService();
    const data = { firstName: "A", lastName: "B", phoneNumber: "1" };
    await new ProfileService(api).updateProfile(data);
    expect(api.put).toHaveBeenCalledWith(PROFILE_ENDPOINTS.UPDATE_DOSSIER, data);
    expect(PROFILE_ENDPOINTS.UPDATE_DOSSIER).toBe("/v1/account/dossier");
  });

  it("ProfileRepository.uploadAvatar() POSTs FormData field 'image' to /v1/account/dossier/avatar", async () => {
    const api = mockApiService({
      post: vi.fn().mockResolvedValue({ imageUrl: "https://cdn.scripe.test/avatar.png" }),
    });
    const file = new File(["x"], "a.png", { type: "image/png" });
    const res = await new ProfileRepository(api).uploadAvatar(file);
    const [endpoint, formData] = (api.post as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(endpoint).toBe(PROFILE_ENDPOINTS.AVATAR);
    expect(PROFILE_ENDPOINTS.AVATAR).toBe("/v1/account/dossier/avatar");
    expect((formData as FormData).get("image")).toBe(file);
    expect((formData as FormData).get("file")).toBeNull();
    expect(res).toEqual({ profileImageUrl: "https://cdn.scripe.test/avatar.png" });
  });

  it("removeAvatar() DELETEs /v1/account/dossier/avatar, not /v1/profile/avatar", async () => {
    const api = mockApiService();
    await new ProfileService(api).removeAvatar();
    expect(api.delete).toHaveBeenCalledWith(PROFILE_ENDPOINTS.AVATAR);
  });

  it("changePassword() resolves adminId (or legacy id fallback) via DOSSIER then POSTs /v1/admins/{id}/change-password", async () => {
    const data = { currentPassword: "old", newPassword: "new" };

    const apiWithAdminId = mockApiService({
      get: vi.fn().mockResolvedValue({ adminId: "admin-123" }),
    });
    await new ProfileService(apiWithAdminId).changePassword(data);
    expect(apiWithAdminId.get).toHaveBeenCalledWith(PROFILE_ENDPOINTS.DOSSIER);
    expect(apiWithAdminId.post).toHaveBeenCalledWith(PROFILE_ENDPOINTS.CHANGE_PASSWORD("admin-123"), data);

    const apiWithLegacyId = mockApiService({
      get: vi.fn().mockResolvedValue({ id: "admin-legacy" }),
    });
    await new ProfileService(apiWithLegacyId).changePassword(data);
    expect(apiWithLegacyId.post).toHaveBeenCalledWith(PROFILE_ENDPOINTS.CHANGE_PASSWORD("admin-legacy"), data);

    const apiMissingId = mockApiService({
      get: vi.fn().mockResolvedValue({}),
    });
    await expect(new ProfileService(apiMissingId).changePassword(data)).rejects.toThrow(
      "Unable to resolve administrator identifier"
    );
    expect(apiMissingId.post).not.toHaveBeenCalled();
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

  it("regenerateBackupCodes() POSTs { code } to /v1/auth/admin/2fa/backup-codes/regenerate and unwraps backupCodes[]", async () => {
    const api = mockApiService({
      post: vi.fn().mockResolvedValue({ backupCodes: ["CODE-1", "CODE-2"] }),
    });
    const codes = await new ProfileService(api).regenerateBackupCodes("123456");
    expect(api.post).toHaveBeenCalledWith(PROFILE_ENDPOINTS.BACKUP_CODES_REGENERATE, {
      code: "123456",
    });
    expect(codes).toEqual(["CODE-1", "CODE-2"]);
  });

  it("SecurityRepository.emergencyLockdown() PUTs /v1/account/security with triggerEmergencyLockdown and LOCKDOWN phrase", async () => {
    const api = mockApiService();
    await new SecurityRepository(api).emergencyLockdown();
    expect(api.put).toHaveBeenCalledWith(PROFILE_ENDPOINTS.ACCOUNT.SECURITY, {
      triggerEmergencyLockdown: true,
      lockdownConfirmationPhrase: "LOCKDOWN",
    });
  });

  it("SecurityRepository passkey registration forwards challengeToken, mode, transports, and credentialIdBase64", async () => {
    const api = mockApiService({
      post: vi
        .fn()
        .mockResolvedValueOnce({
          challenge: "ch-b64url",
          rpId: "localhost",
          challengeToken: "reg-challenge-token-abc",
          mode: "hybrid",
        })
        .mockResolvedValueOnce({
          id: "pk-1",
          deviceName: "Phone Passkey",
          createdAt: "2026-11-15T22:00:00Z",
        }),
    });
    const repo = new SecurityRepository(api);
    const begin = await repo.beginPasskeyRegistration("Phone Passkey", "hybrid");
    expect(begin.challengeToken).toBe("reg-challenge-token-abc");
    const completed = await repo.completePasskeyRegistration({
      attestationObjectBase64: "att-obj",
      clientDataJsonBase64: "client-data",
      deviceName: "Phone Passkey",
      transports: ["hybrid", "internal"],
      clientExtensionResults: { credProps: { rk: true } },
      challengeToken: begin.challengeToken,
      attestationMode: begin.mode,
      credentialIdBase64: "cred-raw-id",
    });
    expect(api.post).toHaveBeenNthCalledWith(2, PROFILE_ENDPOINTS.PASSKEYS.REGISTER_COMPLETE, {
      attestationObjectBase64: "att-obj",
      clientDataJsonBase64: "client-data",
      deviceName: "Phone Passkey",
      transports: ["hybrid", "internal"],
      clientExtensionResults: { credProps: { rk: true } },
      challengeToken: "reg-challenge-token-abc",
      attestationMode: "hybrid",
      credentialIdBase64: "cred-raw-id",
    });
    expect(completed.id).toBe("pk-1");
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

  it("initiateExternalLoginLink() POSTs /v1/auth/admin/external-logins/initiate-link with optional X-Sudo-Token header", async () => {
    const api = mockApiService();
    const data = {
      identityProviderId: "enc-idp-1",
      redirectUri: "http://localhost:3000/sso/callback",
    };
    await new ProfileService(api).initiateExternalLoginLink(data, "sudo-tok-123");
    expect(api.post).toHaveBeenCalledWith(
      PROFILE_ENDPOINTS.INITIATE_EXTERNAL_LOGIN_LINK,
      data,
      undefined,
      { headers: { "X-Sudo-Token": "sudo-tok-123" } }
    );
  });

  it("unlinkExternalLogin() DELETEs /v1/auth/admin/external-logins/{id} with optional X-Sudo-Token header", async () => {
    const api = mockApiService();
    await new ProfileService(api).unlinkExternalLogin("ext-1", "sudo-tok-456");
    expect(api.delete).toHaveBeenCalledWith(
      PROFILE_ENDPOINTS.UNLINK_EXTERNAL_LOGIN("ext-1"),
      undefined,
      { headers: { "X-Sudo-Token": "sudo-tok-456" } }
    );
  });

  it("PROFILE_ENDPOINTS no longer exposes a LEGACY family (removed — dead, no backend ProfileController)", () => {
    expect((PROFILE_ENDPOINTS as Record<string, unknown>).LEGACY).toBeUndefined();
  });

  it("getProfile() and updateProfile() preserve rowVersion across AdminProfileDto -> AdminProfile round-trips", async () => {
    const api = mockApiService();
    (api.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      id: "u1",
      firstName: "A",
      lastName: "B",
      email: "a@b.com",
      username: "ab",
      phoneNumber: "1",
      rowVersion: "rv-profile-get",
    });
    (api.put as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      id: "u1",
      firstName: "A",
      lastName: "B",
      email: "a@b.com",
      username: "ab",
      phoneNumber: "1",
      rowVersion: "rv-profile-put",
    });

    const service = new ProfileService(api);
    const loaded = await service.getProfile();
    expect(loaded.rowVersion).toBe("rv-profile-get");

    const updated = await service.updateProfile({
      firstName: "A",
      lastName: "B",
      phoneNumber: "1",
      rowVersion: loaded.rowVersion,
    });
    expect(api.put).toHaveBeenCalledWith(
      PROFILE_ENDPOINTS.UPDATE_DOSSIER,
      expect.objectContaining({ rowVersion: "rv-profile-get" })
    );
    expect(updated.rowVersion).toBe("rv-profile-put");
  });
});
