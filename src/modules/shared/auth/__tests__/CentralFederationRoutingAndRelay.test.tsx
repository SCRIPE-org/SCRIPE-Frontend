import React from "react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  isAllowedCentralOrTenantOrigin,
  isExternalCustomDomain,
  isPlatformDomain,
  isPlatformOrigin,
} from "@core/common/origin-routing";
import {
  buildPostAuthEntryUrl,
  getSafeRedirectPath,
  isSafeRedirectTarget,
} from "@core/common/redirect-safety";
import {
  clearActivePrincipalKey,
  formatActivePrincipalKey,
  getActivePrincipalKey,
  syncActivePrincipalKey,
} from "@core/common/active-principal";
import { ApiService } from "@core/services/api.service";
import { AuthService } from "@modules/auth/core/data/services/AuthService";
import { SsoService } from "@modules/auth/core/data/services/SsoService";
import { SsoRepository } from "@modules/auth/core/data/repositories/SsoRepository";
import { AuthRepository } from "@modules/auth/core/data/repositories/AuthRepository";
import type { IAuthService } from "@modules/auth/core/domain/interfaces/IAuthService";
import type { IPublicApiService } from "@core/interfaces/public-api.interface";
import type { ISsoService } from "@modules/auth/core/data/interfaces/ISsoService";
import { LoginResponseModel } from "@modules/auth/core/data/models/AuthModel";
import { useAppStore } from "@core/store/useAppStore";
import { useSsoCallbackHandler } from "@modules/auth/signin/src/presentation/viewmodels/useSsoCallbackHandler";
import { useOAuthConsentViewModel } from "@modules/identity/oauth-apps/src/presentation/viewmodels/useOAuthConsentViewModel";
import { useAuthLogout } from "@modules/auth/core/src/presentation/viewmodels/useAuthLogout";
import { buildVerifiedCrossOriginCallbackUrl } from "@modules/auth/signin/src/presentation/utils/ssoCallbackHandlers";

const mockRouterReplace = vi.fn();
const mockRouterPush = vi.fn();
const mockInvalidateQueries = vi.fn();
const mockRefreshNavigation = vi.fn().mockResolvedValue(undefined);
const mockToastSuccess = vi.fn();
const mockToastError = vi.fn();
const mockCompleteWorkspaceSelection = vi.fn();
const mockVerify2FA = vi.fn();
const mockRedeemCallback = vi.fn();
const mockGetPrincipal = vi.fn();
const mockRepoLogout = vi.fn();
let mockSearchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: mockRouterReplace,
    push: mockRouterPush,
  }),
  useSearchParams: () => mockSearchParams,
  usePathname: () => "/overview",
}));

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string) => key,
    direction: "ltr" as const,
  }),
}));

vi.mock("@core/providers/navigation-provider", () => ({
  useNavigation: () => ({
    refreshNavigation: mockRefreshNavigation,
  }),
}));

vi.mock("@core/hooks/use-enhanced-toast", () => ({
  useEnhancedToast: () => ({
    success: mockToastSuccess,
    operationError: mockToastError,
  }),
}));

vi.mock("@core/providers/service-provider", () => ({
  useServices: () => ({
    authRepository: {
      verify2FA: (...args: unknown[]) => mockVerify2FA(...args),
      getCurrentPrincipal: (...args: unknown[]) => mockGetPrincipal(...args),
      refreshToken: vi.fn().mockResolvedValue({ kind: "err", error: new Error("unauthenticated") }),
      logout: (...args: unknown[]) => mockRepoLogout(...args),
      buildOidcConsentForm: vi.fn(() => ({ action: "http://localhost:5035/connect/authorize", params: {} })),
      buildOidcLogoutUrl: vi.fn(() => "http://localhost:5035/oidc/logout"),
    },
    ssoRepository: {
      completeCallback: (...args: unknown[]) => mockRedeemCallback(...args),
      completeSamlCallback: (...args: unknown[]) => mockRedeemCallback(...args),
      completeWorkspaceSelection: (...args: unknown[]) => mockCompleteWorkspaceSelection(...args),
    },
  }),
}));

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

function createQueryWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client }, children);
  };
}

describe("CentralFederationRoutingAndRelay (Stage 3B-4)", () => {
  const originalLocation = window.location;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
    sessionStorage.clear();
    localStorage.clear();
    useAppStore.getState().logout();
    clearActivePrincipalKey();
    mockSearchParams = new URLSearchParams();
  });

  afterEach(() => {
    Object.defineProperty(window, "location", {
      configurable: true,
      value: originalLocation,
    });
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("recognizes central auth.scripe.org & validates cross-origin central/tenant hops while blocking evil/nested hosts (FE-MED-05)", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://admin.scripe.org");
    vi.stubEnv("NEXT_PUBLIC_AUTH_URL", "https://auth.scripe.org");
    vi.stubEnv("NEXT_PUBLIC_API_URL", "https://api.scripe.org/api");

    expect(isPlatformDomain("auth.scripe.org")).toBe(true);
    expect(isPlatformDomain("admin.scripe.org")).toBe(true);
    expect(isPlatformDomain("ahly.admin.scripe.org")).toBe(false);
    expect(isPlatformDomain("portal.club.com")).toBe(false);

    expect(isPlatformOrigin("ahly.admin.scripe.org")).toBe(true);
    expect(isPlatformOrigin("evil.ahly.admin.scripe.org")).toBe(false);
    expect(isExternalCustomDomain("admin.scripe.org")).toBe(false);
    expect(isExternalCustomDomain("ahly.admin.scripe.org")).toBe(false);
    expect(isExternalCustomDomain("ahly.localhost")).toBe(false);
    expect(isExternalCustomDomain("portal.club.com")).toBe(true);

    expect(isSafeRedirectTarget("https://auth.scripe.org/login")).toBe(true);
    expect(isSafeRedirectTarget("https://ahly.admin.scripe.org/overview")).toBe(true);
    expect(isSafeRedirectTarget("https://evil.ahly.admin.scripe.org/overview")).toBe(false);
    expect(isSafeRedirectTarget("https://evil.com/steal")).toBe(false);
    expect(
      isSafeRedirectTarget("https://portal.club.com/crm", {
        allowedOrigins: ["https://portal.club.com"],
      })
    ).toBe(true);
    expect(
      isAllowedCentralOrTenantOrigin("https://evil.admin.scripe.org.attacker.com")
    ).toBe(false);
    expect(getSafeRedirectPath("javascript:alert(1)", "/overview")).toBe("/overview");
  });

  it("routes custom-domain session establish/refresh/logout via /api/auth/session/* and uses credentials:omit on CORS API calls (GAP-03)", async () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://admin.scripe.org");
    vi.stubEnv("NEXT_PUBLIC_AUTH_URL", "https://auth.scripe.org");
    vi.stubEnv("NEXT_PUBLIC_API_URL", "https://api.scripe.org/api");
    setBrowserUrl("https://portal.club.com/sso/callback?code=c1&state=s1");

    const fetchMock = vi.fn(async (url: string | URL | Request) => {
      const urlStr = String(url);
      if (urlStr === "/api/auth/session/establish") {
        return new Response(
          JSON.stringify({ type: "admin", accessToken: "custom-dom-jwt", returnPath: "/crm" }),
          { status: 200 }
        );
      }
      if (urlStr === "/api/auth/session/refresh") {
        return new Response(JSON.stringify({ accessToken: "refreshed-custom-jwt" }), { status: 200 });
      }
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    });
    vi.stubGlobal("fetch", fetchMock);

    const apiService = new ApiService("https://api.scripe.org/api");
    const resolver = (
      apiService as unknown as { resolveRequestWithCredentials: (u?: string) => boolean }
    ).resolveRequestWithCredentials.bind(apiService);
    expect(resolver("/v1/crm/leads")).toBe(false);

    const ssoService = new SsoService({ post: vi.fn(), get: vi.fn() } as unknown as IPublicApiService);
    const est = await ssoService.redeemHandoff({ code: "c1", state: "s1" });
    expect(est.accessToken).toBe("custom-dom-jwt");
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/auth/session/establish",
      expect.objectContaining({ method: "POST", credentials: "same-origin" })
    );

    const authService = new AuthService(apiService);
    const refreshed = await authService.refreshToken();
    expect(refreshed.accessToken).toBe("refreshed-custom-jwt");
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/auth/session/refresh",
      expect.objectContaining({ method: "POST", credentials: "same-origin" })
    );

    await authService.logout("app");
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/auth/session/logout",
      expect.objectContaining({
        method: "POST",
        credentials: "same-origin",
        body: JSON.stringify({ logoutScope: "app" }),
      })
    );
  });

  it("retires sessionStorage PKCE secrets on central OIDC challenge and forwards returnOrigin/returnPath/staySignedIn (OIDC + SAML) (FE-CRIT-02, SEC-FED-01, GAP-04)", async () => {
    setBrowserUrl("https://ahly.admin.scripe.org/login?redirect=%2Fportal%2Fbookings");
    const initiateOidcChallenge = vi.fn().mockResolvedValue({
      authorizationUrl: "https://idp.example.com/authorize?client_id=c",
      // codeVerifier intentionally omitted under central callback
    });
    const redeemHandoff = vi.fn().mockResolvedValue({
      purpose: "login",
      type: "admin",
      accessToken: "sso-jwt",
      returnPath: "/portal/bookings",
    });
    const buildSamlLoginUrl = vi.fn(
      ({ providerId, returnOrigin, returnPath, targetTenantId, staySignedIn }) =>
        `https://api.scripe.org/api/v1/auth/saml/login?providerId=${providerId}&returnOrigin=${encodeURIComponent(String(returnOrigin))}&returnPath=${encodeURIComponent(String(returnPath))}&targetTenantId=${encodeURIComponent(String(targetTenantId))}&staySignedIn=${staySignedIn ? "true" : "false"}`
    );
    const ssoService = {
      initiateOidcChallenge,
      redeemHandoff,
      buildSamlLoginUrl,
    } as unknown as ISsoService;

    const repo = new SsoRepository(ssoService);
    await repo.initiateLogin("idp-google", "oidc", {
      targetTenantId: "enc_ahly",
      staySignedIn: true,
    });

    expect(initiateOidcChallenge).toHaveBeenCalledWith(
      expect.objectContaining({
        providerId: "idp-google",
        returnOrigin: "https://ahly.admin.scripe.org",
        returnPath: "/portal/bookings",
        targetTenantId: "enc_ahly",
        staySignedIn: true,
      })
    );
    expect(sessionStorage.getItem("sso_code_verifier")).toBeNull();
    expect(sessionStorage.getItem("sso_state")).toBeNull();
    expect(sessionStorage.getItem("sso_provider_id")).toBeNull();

    // SAML initiation preserves returnOrigin, returnPath, targetTenantId, and staySignedIn
    await repo.initiateLogin("idp-okta-saml", "saml", {
      targetTenantId: "enc_ahly",
      staySignedIn: true,
    });
    expect(buildSamlLoginUrl).toHaveBeenCalledWith(
      expect.objectContaining({
        providerId: "idp-okta-saml",
        returnOrigin: "https://ahly.admin.scripe.org",
        returnPath: "/portal/bookings",
        targetTenantId: "enc_ahly",
        staySignedIn: true,
      })
    );
    expect(window.location.href).toContain("returnPath=%2Fportal%2Fbookings");

    // Even if tampered sso_linking exists in sessionStorage, server purpose governs callback
    sessionStorage.setItem("sso_linking", "true");
    const redeemed = await repo.completeCallback("handoff-c1", "handoff-s1");
    expect(redeemHandoff).toHaveBeenCalledWith({ code: "handoff-c1", state: "handoff-s1" });
    expect(redeemed.purpose).toBe("login");
    expect(redeemed.returnPath).toBe("/portal/bookings");
    expect(sessionStorage.getItem("sso_linking")).toBeNull();
  });

  it("handles central /sso/continue workspace selection -> cross-origin handoff forwarding & strips code/state from URL", async () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://admin.scripe.org");
    vi.stubEnv("NEXT_PUBLIC_AUTH_URL", "https://auth.scripe.org");
    setBrowserUrl("https://auth.scripe.org/sso/continue?code=c-secret&state=s-secret");
    mockSearchParams = new URLSearchParams("code=c-secret&state=s-secret");
    const replaceStateSpy = vi.spyOn(window.history, "replaceState");

    mockRedeemCallback.mockResolvedValueOnce({
      purpose: "login",
      requiresWorkspaceSelection: true,
      token: "ws-select-tok",
      email: "admin@club.com",
      returnOrigin: "https://ahly.admin.scripe.org",
      returnPath: "/venue/courts",
      availableWorkspaces: [
        {
          tenantId: "t-ahly",
          tenantCode: "AHLY",
          tenantName: "Al Ahly",
          logoUrl: null,
          isPlatformAdmin: false,
          isActivated: true,
          isDisabled: false,
          isPasswordVerified: true,
        },
      ],
    });
    mockCompleteWorkspaceSelection.mockResolvedValueOnce({
      handoffCode: "next-code",
      handoffState: "next-state",
      returnOrigin: "https://ahly.admin.scripe.org",
      returnPath: "/venue/courts",
    });

    const { result } = renderHook(() => useSsoCallbackHandler("continue"), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => {
      expect(result.current.state).toBe("workspace_selection");
    });
    expect(replaceStateSpy).toHaveBeenCalledWith({}, "", "/sso/continue");

    await act(async () => {
      await result.current.handleSelectWorkspace(result.current.workspaceData!.workspaces[0]);
    });

    await waitFor(() => {
      expect(result.current.state).toBe("success");
    });
    await new Promise((r) => setTimeout(r, 200));
    expect(window.location.href).toBe(
      "https://ahly.admin.scripe.org/sso/callback?code=next-code&state=next-state&redirect=%2Fvenue%2Fcourts"
    );
  });

  it("routes unauthenticated /authorize sessions through canonical /connect/authorize so OpenIddict mints consent_ticket (FE-HIGH-07)", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", "https://api.scripe.org/api");
    mockSearchParams = new URLSearchParams(
      "client_id=app-1&redirect_uri=https%3A%2F%2Frp.example%2Fcb&response_type=code&scope=openid&state=st1&consent_ticket=stale-ticket"
    );

    renderHook(() => useOAuthConsentViewModel(), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => {
      expect(mockRouterReplace).toHaveBeenCalledTimes(1);
    });
    const target = mockRouterReplace.mock.calls[0][0] as string;
    expect(target.startsWith("/login?redirect=")).toBe(true);
    const decodedRedirect = decodeURIComponent(target.slice("/login?redirect=".length));
    expect(decodedRedirect).toContain("https://api.scripe.org/connect/authorize?");
    expect(decodedRedirect).toContain("client_id=app-1");
    expect(decodedRedirect).not.toContain("consent_ticket");
    expect(decodedRedirect).not.toContain("stale-ticket");
  });

  it("supports split logoutScope ('app' vs 'central') without ?redirect= loop and isolates foreign-origin/foreign-tenant broadcasts (GAP-05)", async () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://admin.scripe.org");
    vi.stubEnv("NEXT_PUBLIC_AUTH_URL", "https://auth.scripe.org");
    setBrowserUrl("https://ahly.admin.scripe.org/overview");
    mockRepoLogout.mockResolvedValue(undefined);
    useAppStore.getState().setAuth(
      { id: "adm-1", tenantId: "t-ahly", username: "ahly_admin", roles: [], permissions: [] } as never,
      [],
      [],
      true
    );
    useAppStore.getState().setTenantCode("AHLY");

    const { result } = renderHook(() => useAuthLogout(), {
      wrapper: createQueryWrapper(),
    });

    await act(async () => {
      await result.current.logout();
    });
    expect(mockRepoLogout).toHaveBeenCalledWith("app");
    expect(mockRouterPush).toHaveBeenCalledWith("/login?logged_out=1");

    mockRepoLogout.mockClear();
    await act(async () => {
      await result.current.logout({ logoutScope: "central" });
    });
    expect(mockRepoLogout).toHaveBeenCalledWith("central");
    expect(window.location.href).toBe("https://auth.scripe.org/login?logged_out=1");

    // Cross-tab BroadcastChannel scoping + activePrincipalKey tracking
    const { authBroadcast } = await import("@core/common/broadcast-auth");
    const onLogoutSpy = vi.fn();
    const unsub = authBroadcast.onLogout(onLogoutSpy);

    useAppStore.getState().setAuth(
      { id: "adm-1", tenantId: "t-ahly", username: "ahly_admin", roles: [], permissions: [] } as never,
      [],
      [],
      true
    );
    useAppStore.getState().setTenantCode("AHLY");
    expect(getActivePrincipalKey()).toBe(
      formatActivePrincipalKey({ principalType: "admin", tenantId: "t-ahly", principalId: "adm-1" })
    );

    const handleMessage = (
      authBroadcast as unknown as { handleMessage: (evt: unknown) => void }
    ).handleMessage.bind(authBroadcast);

    // Foreign origin ignored
    handleMessage({
      type: "LOGOUT",
      scope: { origin: "https://other.club.com", tenantId: "t-ahly", principalId: "adm-1" },
    });
    expect(onLogoutSpy).not.toHaveBeenCalled();

    // Foreign tenant ignored
    handleMessage({
      type: "LOGOUT",
      scope: {
        origin: window.location.origin,
        tenantId: "t-other",
        tenantCode: "OTHER",
        principalId: "adm-2",
        logoutScope: "app",
      },
    });
    expect(onLogoutSpy).not.toHaveBeenCalled();

    // Matching origin/tenant/principal fires logout
    handleMessage({
      type: "LOGOUT",
      scope: {
        origin: window.location.origin,
        tenantId: "t-ahly",
        tenantCode: "AHLY",
        principalId: "adm-1",
        logoutScope: "app",
      },
    });
    expect(onLogoutSpy).toHaveBeenCalledTimes(1);
    unsub();
  });

  it("emits scoped logout broadcast from AuthRepository.logout and verifies buildPostAuthEntryUrl order", async () => {
    setBrowserUrl("https://admin.scripe.org/overview");
    syncActivePrincipalKey({ principalType: "admin", tenantId: "t-1", principalId: "adm-9" });
    useAppStore.getState().setAuth(
      { id: "adm-9", tenantId: "t-1", username: "nina", roles: [], permissions: [] } as never,
      [],
      [],
      true
    );
    useAppStore.getState().setTenantCode("AHLY");

    const svcLogout = vi.fn().mockResolvedValue(undefined);
    const { authBroadcast } = await import("@core/common/broadcast-auth");
    const broadcastSpy = vi.spyOn(authBroadcast, "broadcastLogout");
    const repo = new AuthRepository({
      logout: svcLogout,
      refreshToken: vi.fn().mockResolvedValue(new LoginResponseModel("tok")),
    } as unknown as IAuthService);

    await repo.logout("central");
    expect(svcLogout).toHaveBeenCalledWith("central");
    expect(getActivePrincipalKey()).toBeNull();
    expect(broadcastSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        origin: "https://admin.scripe.org",
        tenantId: "t-1",
        tenantCode: "AHLY",
        principalId: "adm-9",
        logoutScope: "central",
      })
    );

    expect(
      buildPostAuthEntryUrl({
        mustChangePassword: false,
        requireMfaEnrollment: false,
        subscriptionStatus: "Active",
        redirect: "/portal/schedule",
      })
    ).toBe("/?redirect=%2Fportal%2Fschedule");

    // Verify per-tab principal divergence detection when another tab mutates localStorage["app-storage"]
    const { detectPrincipalDivergence } = await import("@core/common/active-principal");
    syncActivePrincipalKey({ principalType: "admin", tenantId: "t-1", principalId: "adm-1" });
    vi.mocked(window.localStorage.getItem).mockReturnValueOnce(
      JSON.stringify({
        state: { isAuthenticated: true, user: { id: "adm-other", tenantId: "t-2" } },
      })
    );
    const div = detectPrincipalDivergence({
      storeUser: { id: "adm-1", tenantId: "t-1" },
    });
    expect(div.diverged).toBe(true);
    expect(div.persistedKey).toBe("admin:t-2:adm-other");

    // Verify divergence also triggers when another tab signs out via Zustand logout() (non-null logged-out JSON)
    const loggedOutJson = JSON.stringify({ state: { isAuthenticated: false, user: null } });
    vi.mocked(window.localStorage.getItem)
      .mockReturnValueOnce(loggedOutJson)
      .mockReturnValueOnce(loggedOutJson);
    const divAfterLogout = detectPrincipalDivergence({
      storeUser: { id: "adm-1", tenantId: "t-1" },
    });
    expect(divAfterLogout.diverged).toBe(true);
    expect(divAfterLogout.persistedKey).toBeNull();
  });

  it("blocks self-allowlist bypass, API origins, and non-localhost HTTP in cross-origin callback routing (#209 Defect 1)", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://admin.scripe.org");
    vi.stubEnv("NEXT_PUBLIC_AUTH_URL", "https://auth.scripe.org");
    vi.stubEnv("NEXT_PUBLIC_API_URL", "https://api.scripe.org/api");
    vi.stubEnv("NEXT_PUBLIC_IDENTITY_API_URL", "https://auth-id.scripe.org/api");
    setBrowserUrl("https://auth.scripe.org/sso/continue");

    expect(buildVerifiedCrossOriginCallbackUrl("https://evil.com", "c1", "s1")).toBeNull();
    expect(
      buildVerifiedCrossOriginCallbackUrl("https://api.scripe.org", "c1", "s1", "/portal", [
        "https://api.scripe.org",
      ])
    ).toBeNull();
    expect(
      buildVerifiedCrossOriginCallbackUrl("https://auth-id.scripe.org", "c1", "s1", "/portal", [
        "https://auth-id.scripe.org",
      ])
    ).toBeNull();
    expect(
      buildVerifiedCrossOriginCallbackUrl("http://portal.club.com", "c1", "s1", "/portal", [
        "http://portal.club.com",
      ])
    ).toBeNull();

    expect(
      buildVerifiedCrossOriginCallbackUrl("https://portal.club.com", "c1", "s1", "/portal", [
        "https://portal.club.com",
      ])
    ).toBe("https://portal.club.com/sso/callback?code=c1&state=s1&redirect=%2Fportal");
  });

  it("returns central /sso/continue 2FA and token-only workspace completions onto same-site returnOrigin instead of staying on auth.scripe.org (#209 Defect 2)", async () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://admin.scripe.org");
    vi.stubEnv("NEXT_PUBLIC_AUTH_URL", "https://auth.scripe.org");
    setBrowserUrl("https://auth.scripe.org/sso/continue?code=c-2fa&state=s-2fa");
    mockSearchParams = new URLSearchParams("code=c-2fa&state=s-2fa");

    mockRedeemCallback.mockResolvedValueOnce({
      purpose: "login",
      requires2FA: true,
      twoFactorPendingToken: "2fa-pend-tok",
      staySignedIn: true,
      email: "admin@club.com",
      returnOrigin: "https://ahly.admin.scripe.org",
      returnPath: "/portal/bookings",
    });
    mockVerify2FA.mockResolvedValueOnce({
      user: { id: "adm-1", tenantId: "t-ahly", permissions: [], roles: [] },
      subscriptionStatus: "Active",
    });

    const { result } = renderHook(() => useSsoCallbackHandler("continue"), {
      wrapper: createQueryWrapper(),
    });
    await waitFor(() => expect(result.current.state).toBe("two_factor"));

    act(() => result.current.setTwoFactorCode("123456"));
    await act(async () => {
      await result.current.handleVerify2FA();
    });

    await waitFor(() => expect(result.current.state).toBe("success"));
    await new Promise((r) => setTimeout(r, 250));
    expect(window.location.href).toBe("https://ahly.admin.scripe.org/?redirect=%2Fportal%2Fbookings");

    // Also verify handleSelectWorkspace completing directly with accessToken (no handoffCode) resolves onto returnOrigin
    setBrowserUrl("https://auth.scripe.org/sso/continue?code=c-ws&state=s-ws");
    mockSearchParams = new URLSearchParams("code=c-ws&state=s-ws");
    mockRedeemCallback.mockResolvedValueOnce({
      purpose: "login",
      requiresWorkspaceSelection: true,
      token: "ws-tok-2",
      email: "admin@club.com",
      returnOrigin: "https://ahly.admin.scripe.org",
      returnPath: "/portal/bookings",
      availableWorkspaces: [
        {
          tenantId: "t-ahly",
          tenantCode: "AHLY",
          tenantName: "Al Ahly",
          logoUrl: null,
          isPlatformAdmin: false,
          isActivated: true,
          isDisabled: false,
          isPasswordVerified: true,
        },
      ],
    });
    mockCompleteWorkspaceSelection.mockResolvedValueOnce({
      type: "admin",
      accessToken: "jwt-ws-2",
      subscriptionStatus: "Active",
      returnOrigin: "https://ahly.admin.scripe.org",
      returnPath: "/portal/bookings",
    });
    mockGetPrincipal.mockResolvedValueOnce({
      id: "adm-2",
      tenantId: "t-ahly",
      permissions: [],
      roles: [],
    });

    const { result: wsResult } = renderHook(() => useSsoCallbackHandler("continue"), {
      wrapper: createQueryWrapper(),
    });
    await waitFor(() => expect(wsResult.current.state).toBe("workspace_selection"));
    await act(async () => {
      await wsResult.current.handleSelectWorkspace(wsResult.current.workspaceData!.workspaces[0]);
    });
    await waitFor(() => expect(wsResult.current.state).toBe("success"));
    await new Promise((r) => setTimeout(r, 350));
    expect(window.location.href).toBe("https://ahly.admin.scripe.org/?redirect=%2Fportal%2Fbookings");
  });

  it("resolves central hybrid-2FA BEFORE custom-domain handoff after workspace selection and bridges post-MFA back to verified custom domain (#227/#228)", async () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://admin.scripe.org");
    vi.stubEnv("NEXT_PUBLIC_AUTH_URL", "https://auth.scripe.org");
    setBrowserUrl("https://auth.scripe.org/sso/continue?code=c-cd&state=s-cd");
    mockSearchParams = new URLSearchParams("code=c-cd&state=s-cd");

    mockRedeemCallback.mockResolvedValueOnce({
      purpose: "login",
      requiresWorkspaceSelection: true,
      token: "ws-cd-tok",
      email: "admin@cluba.com",
      returnOrigin: "https://portal.cluba.com",
      returnPath: "/billing?tab=invoices",
      availableWorkspaces: [
        {
          tenantId: "t-cluba",
          tenantCode: "CLUBA",
          tenantName: "Club A",
          logoUrl: null,
          isPlatformAdmin: false,
          isActivated: true,
          isDisabled: false,
          isPasswordVerified: true,
        },
      ],
    });

    // Even if a legacy payload included handoffCode alongside requires2FA, 2FA MUST win centrally on auth.scripe.org
    mockCompleteWorkspaceSelection.mockResolvedValueOnce({
      type: "admin",
      requires2FA: true,
      twoFactorPendingToken: "pending-mfa-cd",
      staySignedIn: true,
      handoffCode: "stale-should-not-redirect-yet",
      handoffState: "stale-state",
      returnOrigin: "https://portal.cluba.com",
      returnPath: "/billing?tab=invoices",
    });

    mockVerify2FA.mockResolvedValueOnce({
      user: null,
      mustChangePassword: false,
      requireMfaEnrollment: false,
      subscriptionStatus: "Active",
      gracePhase: null,
      editionName: "Enterprise",
      defaultRedirectPath: "/billing?tab=invoices",
      handoff: {
        code: "post-mfa-code-1",
        state: "post-mfa-state-1",
        returnOrigin: "https://portal.cluba.com",
        returnPath: "/billing?tab=invoices",
      },
    });

    const { result } = renderHook(() => useSsoCallbackHandler("continue"), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.state).toBe("workspace_selection"));

    await act(async () => {
      await result.current.handleSelectWorkspace(result.current.workspaceData!.workspaces[0]);
    });

    // Must transition to central 2FA step on auth.scripe.org (NOT jump to portal.cluba.com yet)
    await waitFor(() => expect(result.current.state).toBe("two_factor"));
    expect(window.location.href).toBe("https://auth.scripe.org/sso/continue?code=c-cd&state=s-cd");

    act(() => result.current.setTwoFactorCode("123456"));
    await act(async () => {
      await result.current.handleVerify2FA();
    });

    expect(mockVerify2FA).toHaveBeenCalledWith(
      "",
      null,
      "123456",
      undefined,
      "pending-mfa-cd",
      true,
      {
        returnOrigin: "https://portal.cluba.com",
        returnPath: "/billing?tab=invoices",
        principalType: "admin",
      }
    );
    await waitFor(() => expect(result.current.state).toBe("success"));
    await new Promise((r) => setTimeout(r, 200));
    expect(window.location.href).toBe(
      "https://portal.cluba.com/sso/callback?code=post-mfa-code-1&state=post-mfa-state-1&redirect=%2Fbilling%3Ftab%3Dinvoices"
    );
    // Must not establish an admin session on auth.scripe.org when bridging to custom domain
    expect(useAppStore.getState().isAuthenticated).toBe(false);
  });

  it("AuthRepository.verify2FA forwards returnOrigin/returnPath and returns post-MFA handoff without throwing on empty accessToken", async () => {
    const svcVerify2FA = vi.fn().mockResolvedValue({
      accessToken: "",
      expiresAt: "2026-11-24T00:00:00Z",
      mustChangePassword: false,
      requireMfaEnrollment: false,
      subscriptionStatus: "Active",
      gracePhase: null,
      editionName: "Enterprise",
      userProfile: null,
      defaultRedirectPath: "/billing",
      handoffCode: "hf-code-99",
      handoffState: "hf-state-99",
      returnOrigin: "https://portal.cluba.com",
      returnPath: "/billing",
    });

    const repo = new AuthRepository({
      verify2FA: svcVerify2FA,
    } as unknown as IAuthService);

    const res = await repo.verify2FA("", null, "654321", undefined, "pending-tok", true, {
      returnOrigin: "https://portal.cluba.com",
      returnPath: "/billing",
      principalType: "user",
    });

    expect(svcVerify2FA).toHaveBeenCalledWith(
      expect.objectContaining({
        twoFactorPendingToken: "pending-tok",
        returnOrigin: "https://portal.cluba.com",
        returnPath: "/billing",
        principalType: "user",
      })
    );
    expect(res.handoff).toEqual({
      code: "hf-code-99",
      state: "hf-state-99",
      returnOrigin: "https://portal.cluba.com",
      returnPath: "/billing",
    });
  });

  it("bridges direct user-principal hybrid-2FA (/api/v1/auth/user/2fa/verify) back to custom domain without setting central session (#227/#228)", async () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://admin.scripe.org");
    vi.stubEnv("NEXT_PUBLIC_AUTH_URL", "https://auth.scripe.org");
    setBrowserUrl("https://auth.scripe.org/sso/continue?code=c-usr&state=s-usr");
    mockSearchParams = new URLSearchParams("code=c-usr&state=s-usr");

    mockRedeemCallback.mockResolvedValueOnce({
      purpose: "login",
      type: "user",
      requires2FA: true,
      twoFactorPendingToken: "user-pending-tok",
      staySignedIn: false,
      email: "member@cluba.com",
      returnOrigin: "https://portal.cluba.com",
      returnPath: "/portal/passes",
    });

    mockVerify2FA.mockResolvedValueOnce({
      user: null,
      mustChangePassword: false,
      requireMfaEnrollment: false,
      subscriptionStatus: null,
      gracePhase: null,
      editionName: null,
      defaultRedirectPath: "/portal/passes",
      handoff: {
        code: "user-post-mfa-code",
        state: "user-post-mfa-state",
        returnOrigin: "https://portal.cluba.com",
        returnPath: "/portal/passes",
      },
    });

    const { result } = renderHook(() => useSsoCallbackHandler("continue"), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.state).toBe("two_factor"));

    act(() => result.current.setTwoFactorCode("654321"));
    await act(async () => {
      await result.current.handleVerify2FA();
    });

    expect(mockVerify2FA).toHaveBeenCalledWith(
      "",
      null,
      "654321",
      undefined,
      "user-pending-tok",
      false,
      {
        returnOrigin: "https://portal.cluba.com",
        returnPath: "/portal/passes",
        principalType: "user",
      }
    );
    await waitFor(() => expect(result.current.state).toBe("success"));
    await new Promise((r) => setTimeout(r, 200));
    expect(window.location.href).toBe(
      "https://portal.cluba.com/sso/callback?code=user-post-mfa-code&state=user-post-mfa-state&redirect=%2Fportal%2Fpasses"
    );
    expect(useAppStore.getState().isAuthenticated).toBe(false);
  });

  it("does not resurrect Club A returnOrigin when cross-tenant workspace selection returns returnOrigin: null before Hybrid-2FA (#276)", async () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://admin.scripe.org");
    vi.stubEnv("NEXT_PUBLIC_AUTH_URL", "https://auth.scripe.org");
    setBrowserUrl("https://auth.scripe.org/sso/continue?code=c-ab&state=s-ab");
    mockSearchParams = new URLSearchParams("code=c-ab&state=s-ab");

    mockRedeemCallback.mockResolvedValueOnce({
      purpose: "login",
      requiresWorkspaceSelection: true,
      token: "ws-ab-tok",
      email: "admin@multi.com",
      returnOrigin: "https://portal.cluba.com",
      returnPath: "/club-a/secret",
      availableWorkspaces: [
        {
          tenantId: "t-clubb",
          tenantCode: "CLUBB",
          tenantName: "Club B",
          logoUrl: null,
          isPlatformAdmin: false,
          isActivated: true,
          isDisabled: false,
          isPasswordVerified: true,
        },
      ],
    });

    // Backend explicitly clears returnOrigin/returnPath to null for cross-tenant selection
    mockCompleteWorkspaceSelection.mockResolvedValueOnce({
      type: "admin",
      requires2FA: true,
      twoFactorPendingToken: "pending-clubb-mfa",
      staySignedIn: false,
      returnOrigin: null,
      returnPath: null,
    });

    mockVerify2FA.mockResolvedValueOnce({
      user: { id: "adm-clubb", tenantId: "t-clubb", permissions: [], roles: [] },
      mustChangePassword: false,
      requireMfaEnrollment: false,
      subscriptionStatus: "Active",
      gracePhase: null,
      editionName: "Pro",
      defaultRedirectPath: "/",
    });

    const { result } = renderHook(() => useSsoCallbackHandler("continue"), {
      wrapper: createQueryWrapper(),
    });
    await waitFor(() => expect(result.current.state).toBe("workspace_selection"));

    await act(async () => {
      await result.current.handleSelectWorkspace(result.current.workspaceData!.workspaces[0]);
    });
    await waitFor(() => expect(result.current.state).toBe("two_factor"));

    act(() => result.current.setTwoFactorCode("123456"));
    await act(async () => {
      await result.current.handleVerify2FA();
    });

    // Must NOT forward Club A's returnOrigin to Club B's POST /2fa/verify
    expect(mockVerify2FA).toHaveBeenCalledWith(
      "",
      null,
      "123456",
      undefined,
      "pending-clubb-mfa",
      false
    );
    await waitFor(() => expect(result.current.state).toBe("success"));
  });
});
