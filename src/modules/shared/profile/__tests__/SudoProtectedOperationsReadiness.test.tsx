/**
 * Lockstep readiness suite verifying end-to-end `ApiService` 403 (`Identity.SudoRequired` /
 * `Identity.SudoExpired`) Sudo step-up interception, single-shot replay with `X-Sudo-Token`,
 * policy-aware deactivation without hardcoded 6-digit TOTP assumptions, optimistic rollback,
 * and cancellation recovery across SUDO-02 protected operations.
 */
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, renderHook, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { AxiosError } from "axios";
import { ApiService } from "@core/services/api.service";
import { useSudoStore } from "@core/store/useSudoStore";
import { useAppStore } from "@core/store/useAppStore";
import { authBroadcast } from "@core/common/broadcast-auth";
import { secureTokenService } from "@core/common/secure-token-service";
import { ProfileService } from "../core/src/data/services/ProfileService";
import { ProfileRepository } from "../core/src/data/repositories/ProfileRepository";
import { SecurityRepository } from "../core/src/data/repositories/SecurityRepository";
import { SovereignAccountRepository } from "../core/src/data/repositories/SovereignAccountRepository";
import { AccountSessionsView } from "../core/src/presentation/views/AccountSessionsView";
import { AccountPlanView } from "../core/src/presentation/views/AccountPlanView";
import { AccountDossierView } from "../core/src/presentation/views/AccountDossierView";
import { SudoVerificationModal } from "../core/src/presentation/components/SudoVerificationModal";
import { useSecurityVaultViewModel } from "../core/src/presentation/viewmodels/useSecurityVaultViewModel";
import {
  useProfileDossierViewModel,
  dossierKeys,
} from "../core/src/presentation/viewmodels/useProfileDossierViewModel";
import { useSovereignPlanSlice } from "../core/src/presentation/viewmodels/useSovereignWorkstationSlicesViewModel";

const { mockToastError, mockAssertPasskey, mockReplace } = vi.hoisted(() => ({
  mockToastError: vi.fn(),
  mockAssertPasskey: vi.fn(),
  mockReplace: vi.fn(),
}));

const liveHarness: {
  profileRepository: ProfileRepository | null;
  securityRepository: SecurityRepository | null;
  sovereignAccountRepository: SovereignAccountRepository | null;
} = {
  profileRepository: null,
  securityRepository: null,
  sovereignAccountRepository: null,
};

vi.mock("@modules/profile/di", () => ({
  container: {
    get profileRepository() {
      return liveHarness.profileRepository!;
    },
    get securityRepository() {
      return liveHarness.securityRepository!;
    },
    get sovereignAccountRepository() {
      return liveHarness.sovereignAccountRepository!;
    },
  },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace, push: vi.fn() }),
  usePathname: () => "/account/security",
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string) => key,
    direction: "ltr" as const,
    language: "en" as const,
    isRtl: false,
    setLanguage: vi.fn(),
  }),
}));

vi.mock("@core/ui/sileo-toast", () => ({
  toast: {
    success: vi.fn(),
    error: (...args: unknown[]) => mockToastError(...args),
    info: vi.fn(),
    warning: vi.fn(),
  },
}));

vi.mock("@core/providers/service-provider", () => ({
  useServices: () => ({
    authRepository: {
      logout: vi.fn(),
      refreshToken: vi.fn().mockResolvedValue({ kind: "ok", value: {} }),
    },
  }),
}));

vi.mock("@core/services/webauthn.service", () => ({
  isWebAuthnAvailable: () => Promise.resolve(true),
  isPlatformAuthenticatorAvailable: () => Promise.resolve(true),
  isWebAuthnSupported: () => true,
  detectDeviceBadge: () => "platform",
  assertPasskey: (...args: unknown[]) => mockAssertPasskey(...args),
  createPasskeyCredential: vi.fn(),
}));

vi.mock("@core/components/tenant-context", () => ({
  FeatureUnavailableGate: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

type RecordedRequest = {
  method: string;
  url: string;
  sudoToken: string | null;
  data: unknown;
};

type RouteHandler = (
  req: RecordedRequest,
  config: InternalAxiosRequestConfig
) => { status: number; data: unknown };

function readHeader(config: InternalAxiosRequestConfig, name: string): string | null {
  const headers = config.headers as
    | { get?: (key: string) => unknown; [key: string]: unknown }
    | undefined;
  if (!headers) return null;
  if (typeof headers.get === "function") {
    const val = headers.get(name) ?? headers.get(name.toLowerCase());
    return val != null ? String(val) : null;
  }
  const direct = headers[name] ?? headers[name.toLowerCase()];
  return direct != null ? String(direct) : null;
}

function createRealApiWithAdapter(handler: RouteHandler) {
  const api = new ApiService("/api");
  const requests: RecordedRequest[] = [];
  const axiosInstance = (api as unknown as { axiosInstance: AxiosInstance }).axiosInstance;

  axiosInstance.defaults.adapter = async (config) => {
    const rawData =
      typeof config.data === "string" && config.data.length > 0
        ? JSON.parse(config.data)
        : config.data;
    const req: RecordedRequest = {
      method: String(config.method ?? "get").toUpperCase(),
      url: String(config.url ?? ""),
      sudoToken: readHeader(config, "X-Sudo-Token"),
      data: rawData,
    };
    requests.push(req);

    const res = handler(req, config);
    const response = {
      status: res.status,
      statusText: res.status >= 400 ? "Forbidden" : "OK",
      headers: {},
      config,
      data: res.data,
    };
    if (res.status >= 400) {
      throw new AxiosError(
        String((res.data as { message?: string } | undefined)?.message ?? "Request failed"),
        AxiosError.ERR_BAD_REQUEST,
        config,
        undefined,
        response
      );
    }
    return response;
  };

  return { api, requests };
}

function createWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return {
    client,
    Wrapper: ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    ),
  };
}

describe("SUDO-02 Lockstep FE Readiness & 403 Step-Up Replay Suite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useSudoStore.getState().reset();
    secureTokenService.clearTokens();
    useAppStore.setState({
      requireMfaEnrollment: false,
      user: null,
      tenantCode: null,
    });
  });

  it("replays RevokeSession, ChangeAdminPassword, RotateSupportPin, UpdateAccountDossier, and IdentityProvider CRUD on 403 Identity.SudoRequired", async () => {
    const { api, requests } = createRealApiWithAdapter((req) => {
      if (req.method === "GET") {
        if (req.url === "/v1/account/dossier") {
          return {
            status: 200,
            data: {
              adminId: "adm-42",
              username: "exec.admin",
              email: "exec@scripe.org",
              firstName: "Exec",
              lastName: "Admin",
              rowVersion: "v1",
            },
          };
        }
        if (req.url === "/v1/auth/passkeys") return { status: 200, data: [] };
        if (req.url === "/v1/account/security") return { status: 200, data: {} };
        if (req.url === "/v1/auth/admin/password-policy") return { status: 200, data: { minLength: 12 } };
        if (req.url === "/v1/account/plan") return { status: 200, data: { quotas: [], entitledFeatures: [] } };
        return { status: 200, data: {} };
      }

      if (!req.sudoToken) {
        return {
          status: 403,
          data: {
            statusCode: 403,
            errorCode: "Identity.SudoRequired",
            message: "Step-up verification is required for this sensitive operation.",
          },
        };
      }

      if (req.url === "/v1/admins/adm-42/change-password") {
        return {
          status: 200,
          data: {
            accessToken: "rotated.jwt.token",
            expiresAt: new Date(Date.now() + 900_000).toISOString(),
          },
        };
      }
      if (req.url === "/v1/auth/admin/sessions/revoke-all") {
        return { status: 200, data: { revokedCount: 3 } };
      }
      if (req.url === "/v1/account/dossier" && req.method === "PUT") {
        return { status: 200, data: { adminId: "adm-42", firstName: "Updated" } };
      }
      return { status: 200, data: { ok: true } };
    });

    const profileService = new ProfileService(api);
    liveHarness.profileRepository = new ProfileRepository(api, profileService);
    liveHarness.securityRepository = new SecurityRepository(api, profileService);
    liveHarness.sovereignAccountRepository = new SovereignAccountRepository(api);

    const completeSudoChallengeWhenOpen = async (token: string) => {
      await waitFor(() => expect(useSudoStore.getState().modalOpen).toBe(true));
      act(() => {
        useSudoStore.getState().markVerified({
          sudoToken: token,
          expiresAtUtc: new Date(Date.now() + 600_000).toISOString(),
          methodUsed: "passkey",
          mandatoryFactorPolicy: "PasskeyRequired",
        });
      });
    };

    // 1. RevokeSession (DELETE /v1/auth/admin/sessions/{id})
    const revokePromise = liveHarness.securityRepository.revokeSession("sess-77");
    await completeSudoChallengeWhenOpen("sudo-tok-revoke");
    await expect(revokePromise).resolves.toBeUndefined();

    // Expire elevation before next operation to force fresh 403 -> replay cycle
    useSudoStore.getState().markLocked();

    // 2. RevokeAllOtherSessions (POST /v1/auth/admin/sessions/revoke-all)
    const revokeAllPromise = liveHarness.securityRepository.revokeAllOtherSessions();
    await completeSudoChallengeWhenOpen("sudo-tok-revoke-all");
    await expect(revokeAllPromise).resolves.toEqual({ revokedCount: 3 });

    useSudoStore.getState().markLocked();

    // 3. ChangeAdminPassword (POST /v1/admins/{id}/change-password via useSecurityVaultViewModel)
    const { Wrapper } = createWrapper();
    const { result: vaultVm } = renderHook(() => useSecurityVaultViewModel(), { wrapper: Wrapper });
    const pwPromise = vaultVm.current.changePassword({
      currentPassword: "OldPassword!1",
      newPassword: "NewStrongPassword!2",
    });
    await completeSudoChallengeWhenOpen("sudo-tok-pw");
    await pwPromise;
    expect(secureTokenService.getAccessToken()).toBe("rotated.jwt.token");

    useSudoStore.getState().markLocked();

    // 4. RotateSupportPin (POST /v1/account/plan/request)
    const { result: planSlice } = renderHook(() => useSovereignPlanSlice(), { wrapper: Wrapper });
    const pinPromise = planSlice.current.requestMutation.mutateAsync({
      type: "RotateSupportPin",
      code: "SupportPin",
    });
    await completeSudoChallengeWhenOpen("sudo-tok-pin");
    await expect(pinPromise).resolves.toBeUndefined();

    useSudoStore.getState().markLocked();

    // 5. UpdateAccountDossier (PUT /v1/account/dossier)
    const updatePromise = liveHarness.profileRepository.updateProfile({
      firstName: "Updated",
      lastName: "Admin",
    });
    await completeSudoChallengeWhenOpen("sudo-tok-dossier");
    await expect(updatePromise).resolves.toBeDefined();

    useSudoStore.getState().markLocked();

    // 6. IdentityProvider CRUD (PUT/DELETE /v1/identity-providers/{id})
    const idpUpdatePromise = api.put("/v1/identity-providers/idp-1", { isActive: false });
    await completeSudoChallengeWhenOpen("sudo-tok-idp");
    await expect(idpUpdatePromise).resolves.toEqual({ ok: true });

    const sensitiveRetries = requests.filter((r) => r.method !== "GET" && r.sudoToken !== null);
    expect(sensitiveRetries.map((r) => [r.url, r.sudoToken])).toEqual([
      ["/v1/auth/admin/sessions/sess-77", "sudo-tok-revoke"],
      ["/v1/auth/admin/sessions/revoke-all", "sudo-tok-revoke-all"],
      ["/v1/admins/adm-42/change-password", "sudo-tok-pw"],
      ["/v1/account/plan", "sudo-tok-pin"],
      ["/v1/account/dossier", "sudo-tok-dossier"],
      ["/v1/identity-providers/idp-1", "sudo-tok-idp"],
    ]);
  });

  it("rolls back optimistic availability toggle cleanly and suppresses raw Sudo cancel errors across Sessions, Plan, and Dossier", async () => {
    const { api } = createRealApiWithAdapter((req) => {
      if (req.url === "/v1/account/profile" || req.url === "/v1/account/dossier") {
        if (req.method === "GET") {
          return {
            status: 200,
            data: {
              adminId: "adm-42",
              username: "exec.admin",
              email: "exec@scripe.org",
              firstName: "Exec",
              lastName: "Admin",
              isAvailableForOperations: true,
              rowVersion: "v1",
            },
          };
        }
        return {
          status: 403,
          data: { statusCode: 403, errorCode: "Identity.SudoRequired", message: "Sudo required" },
        };
      }
      if (req.url === "/v1/account/context" && req.method === "GET") {
        return {
          status: 200,
          data: {
            adminId: "adm-42",
            username: "exec.admin",
            principalContext: {
              principalKind: "TenantUser",
              isSuperAdmin: false,
              isSolePrimaryOwner: false,
            },
          },
        };
      }
      if (req.url === "/v1/account/plan" && req.method === "GET") {
        return {
          status: 200,
          data: {
            editionName: "Sports Ultra",
            editionCode: "sports-ultra",
            quotas: [],
            capabilities: [
              {
                capabilityCode: "CRM.Automation",
                displayName: "CRM Automation",
                moduleName: "CRM",
                accessState: "LockedUpgrade",
              },
            ],
          },
        };
      }
      if (req.url === "/v1/auth/admin/sessions" && req.method === "GET") {
        return {
          status: 200,
          data: [
            {
              id: "sess-1",
              tokenId: "sess-1",
              deviceInfo: "Chrome on Windows 11",
              ipAddress: "10.0.0.1",
              createdAt: "2026-11-23T08:00:00Z",
              expiresAt: "2026-11-24T08:00:00Z",
              isCurrent: true,
            },
            {
              id: "sess-2",
              tokenId: "sess-2",
              deviceInfo: "Safari on macOS Workstation",
              ipAddress: "10.0.0.2",
              createdAt: "2026-11-23T07:00:00Z",
              expiresAt: "2026-11-24T07:00:00Z",
              isCurrent: false,
            },
          ],
        };
      }
      if (req.url === "/v1/account/sessions" && req.method === "GET") {
        return { status: 200, data: { sessions: [] } };
      }
      return {
        status: 403,
        data: { statusCode: 403, errorCode: "Identity.SudoRequired", message: "Sudo required" },
      };
    });

    const profileService = new ProfileService(api);
    liveHarness.profileRepository = new ProfileRepository(api, profileService);
    liveHarness.securityRepository = new SecurityRepository(api, profileService);
    liveHarness.sovereignAccountRepository = new SovereignAccountRepository(api);

    // 1. Dossier optimistic availability toggle rolls back to true on Sudo cancel with null updateError
    const { Wrapper: DossierWrapper, client: dossierClient } = createWrapper();
    const { result: dossierVm } = renderHook(() => useProfileDossierViewModel(), {
      wrapper: DossierWrapper,
    });
    await waitFor(() => expect(dossierVm.current.profile?.isAvailableForOperations).toBe(true));

    act(() => {
      dossierVm.current.toggleAvailability(false);
    });
    await waitFor(() => expect(useSudoStore.getState().modalOpen).toBe(true));

    act(() => {
      useSudoStore.getState().closeModal();
    });

    await waitFor(() => {
      const cached = dossierClient.getQueryData<{ isAvailableForOperations: boolean }>(
        dossierKeys.profile()
      );
      expect(cached?.isAvailableForOperations).toBe(true);
    });
    expect(dossierVm.current.updateError).toBeNull();

    // 2. AccountSessionsView suppresses raw English Sudo cancel alert/toast
    const { Wrapper: SessionsWrapper } = createWrapper();
    render(
      <SessionsWrapper>
        <AccountSessionsView />
      </SessionsWrapper>
    );
    await waitFor(() => expect(screen.getByText(/Safari on macOS Workstation/i)).toBeInTheDocument());

    const revokeButtons = screen.getAllByRole("button");
    const terminateBtn = revokeButtons.find((btn) =>
      btn.textContent?.includes("profile.sessions.revokeSessionBtn")
    );
    expect(terminateBtn).toBeDefined();
    fireEvent.click(terminateBtn!);

    await waitFor(() => expect(useSudoStore.getState().modalOpen).toBe(true));
    act(() => {
      useSudoStore.getState().closeModal();
    });

    await waitFor(() => expect(useSudoStore.getState().modalOpen).toBe(false));
    expect(screen.queryByText(/Sudo verification was cancelled/i)).not.toBeInTheDocument();
    expect(mockToastError).not.toHaveBeenCalled();

    // 3. AccountPlanView suppresses raw English Sudo cancel alert/toast on RotateSupportPin / UPGRADE
    const { Wrapper: PlanWrapper } = createWrapper();
    render(
      <PlanWrapper>
        <AccountPlanView />
      </PlanWrapper>
    );
    const upgradeBtn = await screen.findByRole("button", {
      name: /profile\.plan\.requestUpgradeBtn/i,
    });
    fireEvent.click(upgradeBtn);

    await waitFor(() => expect(useSudoStore.getState().modalOpen).toBe(true));
    act(() => {
      useSudoStore.getState().closeModal();
    });

    await waitFor(() => expect(useSudoStore.getState().modalOpen).toBe(false));
    expect(screen.queryByTestId("plan-request-error-alert")).not.toBeInTheDocument();
    expect(mockToastError).not.toHaveBeenCalled();
  });

  it("AccountDossierView completes DeactivateAccount via Passkey SudoVerificationModal with zero 6-digit TOTP input", async () => {
    const postedPayloads: Array<{ url: string; sudoToken: string | null; body: unknown }> = [];
    const { api } = createRealApiWithAdapter((req) => {
      if (req.url === "/v1/account/context" && req.method === "GET") {
        return {
          status: 200,
          data: {
            adminId: "adm-42",
            username: "exec.admin",
            principalContext: {
              principalKind: "TenantUser",
              isSuperAdmin: true,
              isSolePrimaryOwner: false,
            },
          },
        };
      }
      if (req.url === "/v1/account/profile" || (req.url === "/v1/account/dossier" && req.method === "GET")) {
        return {
          status: 200,
          data: {
            adminId: "adm-42",
            username: "exec.admin",
            email: "exec@scripe.org",
            firstName: "Exec",
            lastName: "Admin",
            clubAffiliation: "City Club",
            isEmailVerified: true,
            clubMemberships: [],
            customFields: [],
            rowVersion: "v1",
          },
        };
      }
      if (req.url === "/v1/auth/sudo/status") {
        return {
          status: 200,
          data: {
            isActive: false,
            expiresAtUtc: null,
            methodUsed: null,
            availableMethods: ["passkey"],
            mandatoryFactorPolicy: "PasskeyRequired",
            allowsPasswordFallback: false,
            remainingSeconds: 0,
          },
        };
      }
      if (req.url === "/v1/auth/sudo/passkey/begin") {
        return {
          status: 200,
          data: {
            challenge: "c2VyLWNoYWxsZW5nZQ",
            rpId: "localhost",
            challengeToken: "chg-tok-deactivate",
            allowCredentials: [{ id: "cred-1", type: "public-key", transports: ["internal"] }],
          },
        };
      }
      if (req.url === "/v1/auth/sudo/verify") {
        return {
          status: 200,
          data: {
            sudoToken: "sudo-jwt-passkey-deactivate",
            expiresAtUtc: new Date(Date.now() + 600_000).toISOString(),
            methodUsed: "passkey",
            mandatoryFactorPolicy: "PasskeyRequired",
            expiresInSeconds: 600,
            verified: true,
          },
        };
      }
      if (req.url === "/v1/account/dossier/deactivate") {
        postedPayloads.push({ url: req.url, sudoToken: req.sudoToken, body: req.data });
        return { status: 200, data: { deactivated: true } };
      }
      return { status: 200, data: {} };
    });

    mockAssertPasskey.mockResolvedValue({
      credentialIdBase64: "cred-1",
      authenticatorDataBase64: "auth-data",
      clientDataJsonBase64: "client-data",
      signatureBase64: "sig-data",
      userHandleBase64: "dXNlci1oYW5kbGU",
      clientExtensionResults: {},
    });

    secureTokenService.setAccessToken("active.jwt.before.deactivate");
    useAppStore.setState({ isAuthenticated: true });
    const broadcastLogoutSpy = vi.spyOn(authBroadcast, "broadcastLogout");

    const profileService = new ProfileService(api);
    liveHarness.profileRepository = new ProfileRepository(api, profileService);
    liveHarness.securityRepository = new SecurityRepository(api, profileService);
    liveHarness.sovereignAccountRepository = new SovereignAccountRepository(api);

    const { Wrapper } = createWrapper();
    render(
      <Wrapper>
        <AccountDossierView />
        <SudoVerificationModal />
      </Wrapper>
    );

    const openBtn = await screen.findByTestId("open-deactivate-account-btn");
    fireEvent.click(openBtn);

    expect(screen.queryByTestId("deactivate-sudo-code-input")).not.toBeInTheDocument();
    fireEvent.change(screen.getByTestId("deactivate-confirm-username-input"), {
      target: { value: "exec.admin" },
    });
    fireEvent.click(screen.getByTestId("confirm-deactivate-account-btn"));

    // Policy-aware SudoVerificationModal appears in PasskeyRequired mode (no hardcoded 6-digit TOTP)
    const verifyBtn = await screen.findByTestId("sudo-verify-submit-btn");
    await waitFor(() => expect(verifyBtn).toBeEnabled());
    expect(screen.queryByTestId("sudo-totp-input")).not.toBeInTheDocument();

    fireEvent.click(verifyBtn);

    await waitFor(() => {
      expect(postedPayloads).toHaveLength(1);
    });
    expect(postedPayloads[0]).toEqual({
      url: "/v1/account/dossier/deactivate",
      sudoToken: "sudo-jwt-passkey-deactivate",
      body: {},
    });

    await waitFor(() => {
      expect(useAppStore.getState().isAuthenticated).toBe(false);
      expect(secureTokenService.getAccessToken()).toBeNull();
      expect(broadcastLogoutSpy).toHaveBeenCalledWith(
        expect.objectContaining({ principalType: "admin", logoutScope: "app" })
      );
      expect(mockReplace).toHaveBeenCalledWith("/login");
    });
  });

  it("AccountPlanView guards mfa_enroll=true and PlatformAdmin without firing wasted /v1/account/plan requests", async () => {
    const requestedUrls: string[] = [];
    const { api } = createRealApiWithAdapter((req) => {
      requestedUrls.push(req.url);
      if (req.url === "/v1/account/context") {
        return {
          status: 200,
          data: {
            adminId: "plat-1",
            principalContext: {
              principalKind: "PlatformAdmin",
              isSuperAdmin: true,
              isSolePrimaryOwner: false,
            },
          },
        };
      }
      return { status: 200, data: {} };
    });

    const profileService = new ProfileService(api);
    liveHarness.profileRepository = new ProfileRepository(api, profileService);
    liveHarness.securityRepository = new SecurityRepository(api, profileService);
    liveHarness.sovereignAccountRepository = new SovereignAccountRepository(api);

    // 1. mfa_enroll=true redirects immediately to /account/security?mfa_enroll=1 without hitting /plan
    useAppStore.setState({ requireMfaEnrollment: true });
    const { Wrapper } = createWrapper();
    render(
      <Wrapper>
        <AccountPlanView />
      </Wrapper>
    );
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/account/security?mfa_enroll=1");
    });
    expect(requestedUrls).not.toContain("/v1/account/plan");

    // 2. PlatformAdmin redirects to /account/dossier cleanly without 403 /v1/account/plan
    mockReplace.mockClear();
    useAppStore.setState({ requireMfaEnrollment: false });
    const { Wrapper: PlatformWrapper } = createWrapper();
    render(
      <PlatformWrapper>
        <AccountPlanView />
      </PlatformWrapper>
    );
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/account/dossier");
    });
    expect(requestedUrls).not.toContain("/v1/account/plan");
  });
});
