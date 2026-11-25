import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LoginRequestModel } from "../data/models/AuthModel";
import { Verify2FARequestModel } from "../data/models/TwoFactorModels";
import { AuthService } from "../data/services/AuthService";
import { SsoService } from "../data/services/SsoService";
import { SsoRepository } from "../data/repositories/SsoRepository";
import { ProfileService } from "@modules/profile/core/src/data/services/ProfileService";
import { ProfileRepository } from "@modules/profile/core/src/data/repositories/ProfileRepository";
import { SecurityRepository } from "@modules/profile/core/src/data/repositories/SecurityRepository";
import {
  handleOidcCallback,
  resolveSsoErrorOutcome,
  type SsoCallbackDeps,
  type SsoCallbackSetters,
} from "@modules/auth/signin/src/presentation/utils/ssoCallbackHandlers";
import type { IApiService } from "@core/interfaces/api.interface";
import type { IPublicApiService } from "@core/interfaces/public-api.interface";

function setBrowserUrl(urlStr: string) {
  const parsed = new URL(urlStr);
  Object.defineProperty(window, "location", {
    configurable: true,
    value: {
      ...window.location,
      href: parsed.toString(),
      origin: parsed.origin,
      protocol: parsed.protocol,
      hostname: parsed.hostname,
      port: parsed.port,
      pathname: parsed.pathname,
      search: parsed.search,
      hash: parsed.hash,
    },
  });
}

describe("Custom-Domain Session Establish Relay & SSO Login CSRF Binding (#508)", () => {
  const originalLocation = window.location;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
    sessionStorage.clear();
    localStorage.clear();
  });

  afterEach(() => {
    Object.defineProperty(window, "location", {
      configurable: true,
      value: originalLocation,
    });
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("routes all AuthService, SsoService, and Profile session-establishing flows via /api/auth/session/establish on external custom domains", async () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://admin.scripe.org");
    vi.stubEnv("NEXT_PUBLIC_AUTH_URL", "https://auth.scripe.org");
    vi.stubEnv("NEXT_PUBLIC_API_URL", "https://api.scripe.org/api");
    setBrowserUrl("https://portal.club.com/login");

    const relayBodies: Array<Record<string, unknown>> = [];
    const fetchMock = vi.fn(async (url: string | URL | Request, init?: RequestInit) => {
      const urlStr = String(url);
      if (urlStr === "/api/auth/session/establish" && init?.body) {
        const parsed = JSON.parse(String(init.body)) as Record<string, unknown>;
        relayBodies.push(parsed);
        if (parsed.mode === "qr-status") {
          return new Response(
            JSON.stringify({ status: "approved", accessToken: "qr-jwt" }),
            { status: 200 }
          );
        }
        if (parsed.mode === "revoke-other-sessions") {
          return new Response(JSON.stringify({ revokedCount: 3 }), { status: 200 });
        }
        return new Response(
          JSON.stringify({ accessToken: `jwt-${String(parsed.mode ?? "handoff")}` }),
          { status: 200 }
        );
      }
      return new Response(JSON.stringify({}), { status: 200 });
    });
    vi.stubGlobal("fetch", fetchMock);

    const mockApi = {
      get: vi.fn().mockResolvedValue({ adminId: "adm-custom-1" }),
      post: vi.fn(),
      postPublic: vi.fn(),
      getPublic: vi.fn(),
    } as unknown as IApiService;

    const authService = new AuthService(mockApi);

    const loginRes = await authService.login(
      new LoginRequestModel("admin@club.com", "StrongP@ss12", "t-1", "Chrome", true)
    );
    expect(loginRes.accessToken).toBe("jwt-admin-login");

    const tfaAdminRes = await authService.verify2FA(
      new Verify2FARequestModel("", null, "123456", undefined, "pend-adm", true, null, null, "admin")
    );
    expect(tfaAdminRes.accessToken).toBe("jwt-admin-2fa");

    const tfaUserRes = await authService.verify2FA(
      new Verify2FARequestModel("", null, "654321", undefined, "pend-usr", false, null, null, "user")
    );
    expect(tfaUserRes.accessToken).toBe("jwt-user-2fa");

    const mlRes = await authService.verifyMagicLink("ml-tok", "t-1", "Chrome", true, false);
    expect(mlRes.accessToken).toBe("jwt-magic-link-verify");

    const otpRes = await authService.verifyPhoneOtp("+201000000000", "112233", "t-1", false, false);
    expect(otpRes.accessToken).toBe("jwt-phone-otp-verify");

    const pkRes = await authService.verifyPasskeyAuth({
      credentialId: "Y3JlZC0x",
      rawId: "Y3JlZC0x",
      authenticatorData: "YXV0aC1kYXRh",
      clientDataJSON: "Y2xpZW50LWRhdGE",
      signature: "c2lnbmF0dXJl",
      userHandle: null,
      challengeToken: "chal-1",
      staySignedIn: true,
    });
    expect(pkRes.accessToken).toBe("jwt-passkey-verify");

    const qrRes = await authService.checkQrSignIn("qr-sess-12345678");
    expect(qrRes.status).toBe("approved");
    expect(qrRes.accessToken).toBe("qr-jwt");

    const impRes = await authService.impersonate("adm-target-99");
    expect(impRes.accessToken).toBe("jwt-impersonate");

    const stopImpRes = await authService.stopImpersonation();
    expect(stopImpRes.accessToken).toBe("jwt-stop-impersonation");

    const ssoService = new SsoService(mockApi as unknown as IPublicApiService);
    const wsRes = await ssoService.completeWorkspaceSelection({
      token: "ws-sel-tok",
      tenantId: "t-1",
    });
    expect(wsRes.accessToken).toBe("jwt-workspace-selection");

    const profileService = new ProfileService(mockApi);
    const profileRepo = new ProfileRepository(mockApi, profileService);
    const securityRepo = new SecurityRepository(mockApi, profileService);

    const forceRes = await profileRepo.forceChangePassword({
      newPassword: "NewStrongPassword!123",
      confirmPassword: "NewStrongPassword!123",
    });
    expect(forceRes.accessToken).toBe("jwt-force-change-password");

    const changeRes = await profileService.changePassword({
      currentPassword: "OldPassword!123",
      newPassword: "NewStrongPassword!123",
    });
    expect((changeRes as { accessToken?: string })?.accessToken).toBe("jwt-change-password");

    const revokeRes = await securityRepo.revokeAllOtherSessions();
    expect(revokeRes.revokedCount).toBe(3);

    expect(relayBodies.map((b) => b.mode)).toEqual([
      "admin-login",
      "admin-2fa",
      "user-2fa",
      "magic-link-verify",
      "phone-otp-verify",
      "passkey-verify",
      "qr-status",
      "impersonate",
      "stop-impersonation",
      "workspace-selection",
      "force-change-password",
      "change-password",
      "revoke-other-sessions",
    ]);
    expect(mockApi.postPublic).not.toHaveBeenCalled();
  });

  it("binds first-party SSO browser nonce on OIDC/SAML initiation and consumes it on handoff redemption (ASVS V10.2.2)", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", "https://api.scripe.org/api");
    setBrowserUrl("https://ahly.admin.scripe.org/login?redirect=%2Foverview");

    const mockHash = "A".repeat(43);
    const mockNonce = "B".repeat(43);
    const fetchMock = vi.fn(async (url: string | URL | Request) => {
      const urlStr = String(url);
      if (urlStr === "/api/auth/sso/bind") {
        return new Response(JSON.stringify({ browserBindingHash: mockHash }), { status: 200 });
      }
      if (urlStr === "/api/auth/sso/consume-binding") {
        return new Response(JSON.stringify({ browserBindingNonce: mockNonce }), { status: 200 });
      }
      return new Response(JSON.stringify({}), { status: 200 });
    });
    vi.stubGlobal("fetch", fetchMock);

    const apiPost = vi.fn().mockResolvedValue({
      purpose: "login",
      type: "admin",
      accessToken: "handoff-jwt",
    });
    const ssoService = new SsoService({
      get: vi.fn(),
      post: apiPost,
    } as unknown as IPublicApiService);
    const repo = new SsoRepository(ssoService);

    // OIDC with real SsoService navigates top-level to /v1/auth/oidc/start with browserBindingHash
    await repo.initiateLogin("idp-google", "oidc", {
      targetTenantId: "enc_ahly",
      staySignedIn: true,
    });
    expect(window.location.href).toContain("https://api.scripe.org/api/v1/auth/oidc/start?");
    expect(window.location.href).toContain(`browserBindingHash=${mockHash}`);

    // SAML attaches browserBindingHash to /v1/auth/saml/login
    await repo.initiateLogin("idp-saml", "saml", {
      targetTenantId: "enc_ahly",
      staySignedIn: false,
    });
    expect(window.location.href).toContain("https://api.scripe.org/api/v1/auth/saml/login?");
    expect(window.location.href).toContain(`browserBindingHash=${mockHash}`);

    // Handoff redemption on platform origin preserves nonce when requires2FA is true, and clears on terminal completion (#518 F-CSR-01)
    apiPost.mockResolvedValueOnce({
      purpose: "login",
      type: "admin",
      requires2FA: true,
      twoFactorPendingToken: "pend-tfa-1",
    });
    await repo.completeCallback("code-1a", "state-1a");
    expect(apiPost).toHaveBeenCalledWith("/v1/auth/sso/handoff", {
      code: "code-1a",
      state: "state-1a",
      browserBindingNonce: mockNonce,
    });

    await repo.completeCallback("code-1b", "state-1b");
    expect(apiPost).toHaveBeenCalledWith("/v1/auth/sso/handoff", {
      code: "code-1b",
      state: "state-1b",
      browserBindingNonce: mockNonce,
    });
  });

  it("maps sso_login_csrf_mismatch, sso_csrf_failed, and missing_caller_origin error codes in ssoCallbackHandlers", async () => {
    const t = (k: string) => k;
    expect(resolveSsoErrorOutcome("sso_login_csrf_mismatch", t)).toEqual({
      state: "error",
      title: "auth.sso.callbackError",
      message: "auth.sso.errors.csrfMismatch",
      safeCode: "sso_login_csrf_mismatch",
    });
    expect(resolveSsoErrorOutcome("sso_csrf_failed", t)).toEqual({
      state: "error",
      title: "auth.sso.callbackError",
      message: "auth.sso.errors.csrfMismatch",
      safeCode: "sso_csrf_failed",
    });
    expect(resolveSsoErrorOutcome("missing_caller_origin", t)).toEqual({
      state: "error",
      title: "auth.sso.callbackError",
      message: "auth.sso.errors.originMismatch",
      safeCode: "missing_caller_origin",
    });

    const setErrorInfo = vi.fn();
    const setErrorCode = vi.fn();
    const setState = vi.fn();
    const apiErr = Object.assign(new Error("CSRF binding mismatch"), {
      status: 403,
      details: { statusCode: 403, errorCode: "SSO_LOGIN_CSRF_MISMATCH" },
    });
    await handleOidcCallback(
      new URLSearchParams("code=c1&state=s1"),
      {
        ssoRepository: {
          completeCallback: vi.fn().mockRejectedValue(apiErr),
        },
        t,
      } as unknown as SsoCallbackDeps,
      {
        setState,
        setErrorInfo,
        setErrorCode,
        setWorkspaceData: vi.fn(),
        setTwoFactorPending: vi.fn(),
        redirectTo: vi.fn(),
      } as unknown as SsoCallbackSetters
    );
    expect(setState).toHaveBeenCalledWith("error");
    expect(setErrorInfo).toHaveBeenCalledWith({
      title: "auth.sso.callbackError",
      message: "auth.sso.errors.csrfMismatch",
    });
    expect(setErrorCode).toHaveBeenCalledWith("sso_login_csrf_mismatch");
  });
});
