import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  completeAdminLogin,
  handleOidcCallback,
  handleSamlCallback,
  type SsoCallbackDeps,
  type SsoCallbackSetters,
} from "../utils/ssoCallbackHandlers";
import { useTokenLogin } from "../viewmodels/useTokenLogin";
import { useQrSignInViewModel } from "../viewmodels/useQrSignInViewModel";
import { getSafeRedirectPath } from "../utils/redirect-safety";
import type { IAuthRepository } from "@modules/auth/core/domain/interfaces/IAuthRepository";
import type { ISsoRepository } from "@modules/auth/core/domain/interfaces/ISsoRepository";
import type { User } from "@modules/auth/core/domain/entities/User";

const {
  mockSetAccessToken,
  mockClearTokens,
  mockRouterReplace,
  mockSetAuth,
  mockSetSubscriptionInfo,
  mockSetMustChangePassword,
  mockSetDefaultRedirectPath,
  mockInvalidateQueries,
  mockGetCurrentPrincipal,
  mockBeginQrSignIn,
  mockCheckQrSignIn,
} = vi.hoisted(() => ({
  mockSetAccessToken: vi.fn(),
  mockClearTokens: vi.fn(),
  mockRouterReplace: vi.fn(),
  mockSetAuth: vi.fn(),
  mockSetSubscriptionInfo: vi.fn(),
  mockSetMustChangePassword: vi.fn(),
  mockSetDefaultRedirectPath: vi.fn(),
  mockInvalidateQueries: vi.fn(),
  mockGetCurrentPrincipal: vi.fn(),
  mockBeginQrSignIn: vi.fn(),
  mockCheckQrSignIn: vi.fn(),
}));

vi.mock("@core/common/secure-token-service", () => ({
  secureTokenService: {
    setAccessToken: (...args: unknown[]) => mockSetAccessToken(...args),
    clearTokens: (...args: unknown[]) => mockClearTokens(...args),
    hasToken: () => true,
  },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: mockRouterReplace,
  }),
}));

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string) => key,
    direction: "ltr" as const,
  }),
}));

vi.mock("@core/store/useAppStore", () => {
  const state = {
    setAuth: mockSetAuth,
    setSubscriptionInfo: mockSetSubscriptionInfo,
    setMustChangePassword: mockSetMustChangePassword,
    setDefaultRedirectPath: mockSetDefaultRedirectPath,
  };
  return {
    useAppStore: (selector: (s: typeof state) => unknown) => selector(state),
  };
});

vi.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({
    invalidateQueries: mockInvalidateQueries,
  }),
}));

vi.mock("@core/providers/service-provider", () => ({
  useServices: () => ({
    authRepository: {
      getCurrentPrincipal: (...args: unknown[]) => mockGetCurrentPrincipal(...args),
      beginQrSignIn: (...args: unknown[]) => mockBeginQrSignIn(...args),
      checkQrSignIn: (...args: unknown[]) => mockCheckQrSignIn(...args),
    },
  }),
}));

vi.mock("@modules/auth/di", () => ({
  authContainer: {
    authRepository: {
      getCurrentPrincipal: (...args: unknown[]) => mockGetCurrentPrincipal(...args),
      beginQrSignIn: (...args: unknown[]) => mockBeginQrSignIn(...args),
      checkQrSignIn: (...args: unknown[]) => mockCheckQrSignIn(...args),
    },
  },
}));

function buildDeps(): {
  deps: SsoCallbackDeps;
  setters: SsoCallbackSetters;
  completeCallback: ReturnType<typeof vi.fn>;
  completeSamlCallback: ReturnType<typeof vi.fn>;
  getCurrentPrincipal: ReturnType<typeof vi.fn>;
  setState: ReturnType<typeof vi.fn>;
  setErrorInfo: ReturnType<typeof vi.fn>;
  redirectTo: ReturnType<typeof vi.fn>;
  setTwoFactorPending: ReturnType<typeof vi.fn>;
} {
  const completeCallback = vi.fn();
  const completeSamlCallback = vi.fn();
  const getCurrentPrincipal = vi.fn();
  const setState = vi.fn();
  const setErrorInfo = vi.fn();
  const redirectTo = vi.fn();
  const setTwoFactorPending = vi.fn();

  const deps: SsoCallbackDeps = {
    authRepository: { getCurrentPrincipal } as unknown as IAuthRepository,
    ssoRepository: {
      completeCallback,
      completeSamlCallback,
    } as unknown as ISsoRepository,
    setAuth: vi.fn(),
    setSubscriptionInfo: vi.fn(),
    setMustChangePassword: vi.fn(),
    refreshNavigation: vi.fn().mockResolvedValue(undefined),
    invalidateQueries: vi.fn(),
    operationSuccess: vi.fn(),
    t: (key: string) => key,
  };

  const setters: SsoCallbackSetters = {
    setState,
    setErrorInfo,
    redirectTo,
    setTwoFactorPending,
    setWorkspaceSelectionData: vi.fn(),
  };

  return {
    deps,
    setters,
    completeCallback,
    completeSamlCallback,
    getCurrentPrincipal,
    setState,
    setErrorInfo,
    redirectTo,
    setTwoFactorPending,
  };
}

describe("useSsoCallbackHandlers, useTokenLogin & useQrSignInViewModel (BAM-01, BAM-06, BAM-09, BAM-10)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  it("handles OIDC hybrid MFA (requires2FA + twoFactorPendingToken) without storing tokens", async () => {
    const ctx = buildDeps();
    ctx.completeCallback.mockResolvedValueOnce({
      type: "admin",
      accessToken: "",
      requires2FA: true,
      twoFactorPendingToken: "pending-oidc-2fa-ticket",
      staySignedIn: true,
      email: "admin@ahly.club",
    });

    await handleOidcCallback(
      new URLSearchParams("code=auth-code&state=state-1"),
      ctx.deps,
      ctx.setters
    );

    expect(ctx.setTwoFactorPending).toHaveBeenCalledWith({
      token: "pending-oidc-2fa-ticket",
      staySignedIn: true,
      email: "admin@ahly.club",
    });
    expect(ctx.setState).toHaveBeenCalledWith("two_factor");
    expect(mockSetAccessToken).not.toHaveBeenCalled();
    expect(ctx.getCurrentPrincipal).not.toHaveBeenCalled();
  });

  it("handles SAML hybrid MFA (requires2FA + twoFactorPendingToken) without storing tokens", async () => {
    const ctx = buildDeps();
    ctx.completeSamlCallback.mockResolvedValueOnce({
      type: "admin",
      accessToken: "",
      requires2FA: true,
      twoFactorPendingToken: "pending-saml-2fa-ticket",
      staySignedIn: false,
      email: "saml@ahly.club",
    });

    await handleSamlCallback(
      new URLSearchParams("code=opaque-saml-code&state=saml-state"),
      ctx.deps,
      ctx.setters
    );

    expect(ctx.setTwoFactorPending).toHaveBeenCalledWith({
      token: "pending-saml-2fa-ticket",
      staySignedIn: false,
      email: "saml@ahly.club",
    });
    expect(ctx.setState).toHaveBeenCalledWith("two_factor");
    expect(mockSetAccessToken).not.toHaveBeenCalled();
  });

  it("handles OIDC federated link completion ({ linked: true }) by redirecting to /account/security?ssoLinked=success", async () => {
    sessionStorage.setItem("sso_linking", "true");
    const ctx = buildDeps();
    ctx.completeCallback.mockResolvedValueOnce({
      type: "admin",
      accessToken: "",
      linked: true,
      providerName: "Google",
      email: "admin@scripe.org",
    });

    await handleOidcCallback(
      new URLSearchParams("code=link-code&state=link-state"),
      ctx.deps,
      ctx.setters
    );

    expect(sessionStorage.getItem("sso_linking")).toBeNull();
    expect(ctx.redirectTo).toHaveBeenCalledWith("/account/security?ssoLinked=success");
    expect(ctx.getCurrentPrincipal).not.toHaveBeenCalled();
  });

  it("handles SAML federated link completion (?linked=1) by redirecting to /account/security?ssoLinked=success", async () => {
    sessionStorage.setItem("sso_linking", "true");
    const ctx = buildDeps();

    await handleSamlCallback(new URLSearchParams("linked=1"), ctx.deps, ctx.setters);

    expect(sessionStorage.getItem("sso_linking")).toBeNull();
    expect(ctx.redirectTo).toHaveBeenCalledWith("/account/security?ssoLinked=success");
    expect(ctx.completeSamlCallback).not.toHaveBeenCalled();
  });

  it("routes link callback errors back to /account/security?error=...", async () => {
    sessionStorage.setItem("sso_linking", "true");
    const ctx = buildDeps();

    await handleOidcCallback(
      new URLSearchParams("error=access_denied"),
      ctx.deps,
      ctx.setters
    );

    expect(sessionStorage.getItem("sso_linking")).toBeNull();
    expect(ctx.redirectTo).toHaveBeenCalledWith("/account/security?error=access_denied");
  });

  it("useTokenLogin enforces Tier 0 gates and routes through / (preserving ?redirect=) instead of legacy /overview", async () => {
    mockGetCurrentPrincipal.mockResolvedValue({
      id: "u-1",
      email: "admin@ahly.club",
      permissions: ["tenants.view"],
      roles: ["TenantAdmin"],
    } as unknown as User);

    const { result } = renderHook(() => useTokenLogin());

    await act(async () => {
      await result.current.completeTokenLogin({
        accessToken: "jwt-123",
        mustChangePassword: false,
        subscriptionStatus: "Active",
        gracePhase: null,
        editionName: "Enterprise",
        defaultRedirectPath: "/legacy-should-be-ignored",
      });
    });

    expect(mockSetAccessToken).toHaveBeenCalledWith("jwt-123");
    expect(mockSetAuth).toHaveBeenCalledWith(
      expect.objectContaining({ id: "u-1" }),
      ["tenants.view"],
      ["TenantAdmin"],
      true
    );
    expect(mockSetSubscriptionInfo).toHaveBeenCalledWith("Active", null, "Enterprise");
    expect(mockSetMustChangePassword).toHaveBeenCalledWith(false);
    expect(mockSetDefaultRedirectPath).toHaveBeenCalledWith("/");
    expect(mockRouterReplace).toHaveBeenCalledWith("/");

    mockRouterReplace.mockClear();
    await act(async () => {
      await result.current.completeTokenLogin({
        accessToken: "jwt-pending",
        mustChangePassword: false,
        subscriptionStatus: "PendingPayment",
      });
    });
    expect(mockRouterReplace).toHaveBeenCalledWith("/activate-workspace");

    mockRouterReplace.mockClear();
    await act(async () => {
      await result.current.completeTokenLogin({
        accessToken: "jwt-mcp",
        mustChangePassword: true,
        subscriptionStatus: "PendingPayment",
      });
    });
    expect(mockRouterReplace).toHaveBeenCalledWith("/change-password");
  });

  it("useQrSignInViewModel forwards Tier 0 fields from QrSessionStatusResponse to onSuccess", async () => {
    vi.useFakeTimers();
    const onSuccess = vi.fn();
    mockBeginQrSignIn.mockResolvedValueOnce({
      sessionId: "enc-qr-session",
      qrData: "scripe://qr-login?token=opaque-token",
      expiresAt: new Date(Date.now() + 300_000).toISOString(),
    });
    mockCheckQrSignIn.mockResolvedValueOnce({
      status: "approved",
      accessToken: "qr-jwt-token",
      defaultRedirectPath: "/",
      subscriptionStatus: "PendingPayment",
      gracePhase: null,
      editionName: "Pro",
      mustChangePassword: true,
    });

    renderHook(() => useQrSignInViewModel(onSuccess, "enc_ahly"));

    // Flush mount microtask for createSession
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(mockBeginQrSignIn).toHaveBeenCalledWith("enc_ahly");

    // Advance 3s poll interval
    await act(async () => {
      await vi.advanceTimersByTimeAsync(3000);
    });

    expect(mockCheckQrSignIn).toHaveBeenCalledWith("enc-qr-session");
    expect(onSuccess).toHaveBeenCalledWith({
      accessToken: "qr-jwt-token",
      refreshToken: undefined,
      defaultRedirectPath: "/",
      subscriptionStatus: "PendingPayment",
      gracePhase: null,
      editionName: "Pro",
      mustChangePassword: true,
      requireMfaEnrollment: false,
    });
    vi.useRealTimers();
  });

  it("completeAdminLogin enforces Tier 0 gates and routes through '/' cleanly", async () => {
    vi.useFakeTimers();
    const ctx = buildDeps();
    ctx.getCurrentPrincipal.mockResolvedValue({
      id: "adm-sso",
      permissions: ["dashboard.view"],
      roles: ["TenantAdmin"],
    } as unknown as User);

    await completeAdminLogin(
      "sso-jwt-1",
      { status: "Active", mustChangePassword: false },
      ctx.deps,
      ctx.setters
    );
    await vi.advanceTimersByTimeAsync(350);
    expect(ctx.redirectTo).toHaveBeenCalledWith("/");

    ctx.redirectTo.mockClear();
    await completeAdminLogin(
      "sso-jwt-2",
      { status: "PendingPayment", mustChangePassword: false },
      ctx.deps,
      ctx.setters
    );
    await vi.advanceTimersByTimeAsync(350);
    expect(ctx.redirectTo).toHaveBeenCalledWith("/activate-workspace");

    ctx.redirectTo.mockClear();
    await completeAdminLogin(
      "sso-jwt-3",
      { status: "PendingPayment", mustChangePassword: true },
      ctx.deps,
      ctx.setters
    );
    await vi.advanceTimersByTimeAsync(350);
    expect(ctx.redirectTo).toHaveBeenCalledWith("/change-password");
    vi.useRealTimers();
  });

  it("redirect-safety allows validated backend OIDC/SAML resume paths while blocking arbitrary external and javascript URLs", () => {
    expect(
      getSafeRedirectPath("http://localhost:5035/connect/authorize?client_id=app1")
    ).toBe("http://localhost:5035/connect/authorize?client_id=app1");
    expect(getSafeRedirectPath("http://localhost:5035/api/v1/auth/saml/sso?id=1")).toBe(
      "http://localhost:5035/api/v1/auth/saml/sso?id=1"
    );
    expect(getSafeRedirectPath("/authorize?client_id=app1")).toBe("/authorize?client_id=app1");

    expect(getSafeRedirectPath("javascript:alert(1)")).toBe("/overview");
    expect(getSafeRedirectPath("https://evil.example/connect/authorize")).toBe("/overview");
    expect(getSafeRedirectPath("//evil.example/overview")).toBe("/overview");
    expect(getSafeRedirectPath("/\\evil.example")).toBe("/overview");
    expect(getSafeRedirectPath("http://localhost:5035/evil-path")).toBe("/overview");
  });

  it("handleOidcCallback routes user SSO logins through buildPostAuthEntryUrl and preserves safe ?redirect=", async () => {
    vi.useFakeTimers();
    const originalUrl = window.location.href;
    window.history.replaceState({}, "", "/sso/callback?redirect=%2Fportal%2Fbookings");

    const ctx = buildDeps();
    ctx.getCurrentPrincipal.mockResolvedValueOnce({
      id: "member-1",
      permissions: ["portal.view"],
      roles: ["Member"],
    } as unknown as User);
    ctx.completeCallback.mockResolvedValueOnce({
      type: "user",
      accessToken: "user-sso-jwt",
      mustChangePassword: false,
      subscriptionStatus: "Active",
    });

    await handleOidcCallback(
      new URLSearchParams("code=user-code&state=user-state"),
      ctx.deps,
      ctx.setters
    );
    await vi.advanceTimersByTimeAsync(350);

    expect(ctx.redirectTo).toHaveBeenCalledWith(
      `/?redirect=${encodeURIComponent("/portal/bookings")}`
    );

    window.history.replaceState({}, "", originalUrl);
    vi.useRealTimers();
  });

  it("handleOidcCallback enforces /account/security?mfa_enroll=true when requireMfaEnrollment=true", async () => {
    vi.useFakeTimers();
    const ctx = buildDeps();
    ctx.getCurrentPrincipal.mockResolvedValueOnce({
      id: "admin-1",
      permissions: ["Identity.Users.Read"],
      roles: ["TenantAdmin"],
    } as unknown as User);
    ctx.completeCallback.mockResolvedValueOnce({
      type: "admin",
      accessToken: "admin-sso-jwt",
      mustChangePassword: false,
      requireMfaEnrollment: true,
      subscriptionStatus: "PendingPayment",
    });

    await handleOidcCallback(
      new URLSearchParams("code=adm-code&state=adm-state"),
      ctx.deps,
      ctx.setters
    );
    await vi.advanceTimersByTimeAsync(350);

    expect(ctx.redirectTo).toHaveBeenCalledWith("/account/security?mfa_enroll=true");
    vi.useRealTimers();
  });
});
