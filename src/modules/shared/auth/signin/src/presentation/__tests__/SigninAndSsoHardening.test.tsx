import React from "react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  handleOidcCallback,
  handleSamlCallback,
  resolveSsoErrorOutcome,
  type SsoCallbackDeps,
  type SsoCallbackSetters,
} from "../utils/ssoCallbackHandlers";
import { useLoginViewModel } from "../viewmodels/use-login-viewmodel";
import { usePhoneOtpViewModel } from "../viewmodels/usePhoneOtpViewModel";
import { useSsoCallbackHandler } from "../viewmodels/useSsoCallbackHandler";
import { useTokenLogin } from "../viewmodels/useTokenLogin";

const {
  mockRouterReplace,
  mockRouterPush,
  mockRequestPhoneOtp,
  mockVerifyPhoneOtp,
  mockRedeemCallback,
  mockCompleteWorkspaceSelection,
  mockGetPrincipal,
  mockSetAccessToken,
  mockClearTokens,
  mockSetAuth,
  mockSetSubscriptionInfo,
  mockSetMustChangePassword,
  mockSetRequireMfaEnrollment,
  mockSetDefaultRedirectPath,
  mockRefreshNavigation,
  mockOperationSuccess,
} = vi.hoisted(() => ({
  mockRouterReplace: vi.fn(),
  mockRouterPush: vi.fn(),
  mockRequestPhoneOtp: vi.fn(),
  mockVerifyPhoneOtp: vi.fn(),
  mockRedeemCallback: vi.fn(),
  mockCompleteWorkspaceSelection: vi.fn(),
  mockGetPrincipal: vi.fn(),
  mockSetAccessToken: vi.fn(),
  mockClearTokens: vi.fn(),
  mockSetAuth: vi.fn(),
  mockSetSubscriptionInfo: vi.fn(),
  mockSetMustChangePassword: vi.fn(),
  mockSetRequireMfaEnrollment: vi.fn(),
  mockSetDefaultRedirectPath: vi.fn(),
  mockRefreshNavigation: vi.fn().mockResolvedValue(undefined),
  mockOperationSuccess: vi.fn(),
}));

let mockSearchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockRouterReplace, push: mockRouterPush }),
  useSearchParams: () => mockSearchParams,
}));

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({ t: (key: string) => key, direction: "ltr" as const }),
}));

vi.mock("@core/providers/navigation-provider", () => ({
  useNavigation: () => ({ refreshNavigation: mockRefreshNavigation }),
}));

vi.mock("@core/hooks/use-enhanced-toast", () => ({
  useEnhancedToast: () => ({ success: mockOperationSuccess, operationError: vi.fn() }),
}));

vi.mock("@core/common/secure-token-service", () => ({
  secureTokenService: {
    setAccessToken: (...args: unknown[]) => mockSetAccessToken(...args),
    clearTokens: (...args: unknown[]) => mockClearTokens(...args),
    hasToken: () => false,
  },
}));

vi.mock("@core/store/useAppStore", () => {
  const state = {
    isAuthenticated: false,
    _hasHydrated: true,
    mustChangePassword: false,
    requireMfaEnrollment: false,
    subscriptionStatus: null,
    tenantCode: null,
    user: null,
    setAuth: (...args: unknown[]) => mockSetAuth(...args),
    setSubscriptionInfo: (...args: unknown[]) => mockSetSubscriptionInfo(...args),
    setMustChangePassword: (...args: unknown[]) => mockSetMustChangePassword(...args),
    setRequireMfaEnrollment: (...args: unknown[]) => mockSetRequireMfaEnrollment(...args),
    setDefaultRedirectPath: (...args: unknown[]) => mockSetDefaultRedirectPath(...args),
  };
  return {
    useAppStore: Object.assign(
      (selector: (s: typeof state) => unknown) => selector(state),
      { getState: () => state }
    ),
  };
});

vi.mock("@core/providers/service-provider", () => ({
  useServices: () => ({
    authRepository: {
      clearSessionOnLoginMount: vi.fn(),
      login: vi.fn(),
      verify2FA: vi.fn(),
      getCurrentPrincipal: (...args: unknown[]) => mockGetPrincipal(...args),
    },
    ssoRepository: {
      completeCallback: (...args: unknown[]) => mockRedeemCallback(...args),
      completeSamlCallback: (...args: unknown[]) => mockRedeemCallback(...args),
      completeWorkspaceSelection: (...args: unknown[]) => mockCompleteWorkspaceSelection(...args),
    },
  }),
}));

vi.mock("@modules/auth/di", () => ({
  authContainer: {
    authRepository: {
      requestPhoneOtp: (...args: unknown[]) => mockRequestPhoneOtp(...args),
      verifyPhoneOtp: (...args: unknown[]) => mockVerifyPhoneOtp(...args),
      getCurrentPrincipal: (...args: unknown[]) => mockGetPrincipal(...args),
    },
  },
}));

function buildCallbackCtx() {
  const setState = vi.fn();
  const setErrorInfo = vi.fn();
  const redirectTo = vi.fn();
  const deps: SsoCallbackDeps = {
    authRepository: { getCurrentPrincipal: mockGetPrincipal } as unknown as SsoCallbackDeps["authRepository"],
    ssoRepository: {
      completeCallback: mockRedeemCallback,
      completeSamlCallback: mockRedeemCallback,
    } as unknown as SsoCallbackDeps["ssoRepository"],
    setAuth: vi.fn(),
    setSubscriptionInfo: vi.fn(),
    refreshNavigation: vi.fn().mockResolvedValue(undefined),
    invalidateQueries: vi.fn(),
    operationSuccess: vi.fn(),
    t: (key: string) => key,
  };
  const setters: SsoCallbackSetters = { setState, setErrorInfo, redirectTo };
  return { deps, setters, setState, setErrorInfo, redirectTo };
}

function createWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };
}

describe("Signin & SSO Hardening (FE-HIGH-04, FE-HIGH-05, FE-MED-04)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams = new URLSearchParams();
  });

  it("maps SAML/OIDC ?error= / ?error_code= safely without throwing or reflecting raw stack strings (FE-HIGH-04)", async () => {
    const { deps, setters, setState, setErrorInfo } = buildCallbackCtx();

    await handleSamlCallback(new URLSearchParams("error=account_locked"), deps, setters);
    expect(setState).toHaveBeenCalledWith("error");
    expect(setErrorInfo).toHaveBeenCalledWith({
      title: "auth.sso.callbackError",
      message: "auth.sso.errors.accountLocked",
    });

    await handleSamlCallback(
      new URLSearchParams("error_code=no_linked_account_saml"),
      deps,
      setters
    );
    expect(setState).toHaveBeenCalledWith("no_linked_account");
    expect(setErrorInfo).toHaveBeenCalledWith({
      title: "auth.sso.noLinkedAccount",
      message: "auth.sso.noLinkedAccountDesc",
    });

    // Malformed percent encoding or raw exception text MUST never throw or reflect raw text
    await handleOidcCallback(new URLSearchParams("error=%E0%A4%A"), deps, setters);
    expect(setErrorInfo).toHaveBeenLastCalledWith({
      title: "auth.sso.callbackError",
      message: "auth.sso.callbackErrorGeneric",
    });

    const rawOutcome = resolveSsoErrorOutcome(
      "System.NullReferenceException: internal stack <script>alert(1)</script>",
      (k) => k
    );
    expect(rawOutcome.message).toBe("auth.sso.callbackErrorGeneric");
    expect(rawOutcome.safeCode).toBe("sso_failed");

    // /login?error=account_locked displays localized inline alert; unknown raw text stays generic
    mockSearchParams = new URLSearchParams("error=account_locked");
    const { result } = renderHook(() => useLoginViewModel(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.error).toBe("auth.sso.errors.accountLocked"));

    mockSearchParams = new URLSearchParams("error=SqlException%3A+secret");
    const { result: sanitizedResult } = renderHook(() => useLoginViewModel(), {
      wrapper: createWrapper(),
    });
    await waitFor(() =>
      expect(sanitizedResult.current.error).toBe("auth.sso.callbackErrorGeneric")
    );
  });

  it("completes user-type workspace selection on /sso/continue cleanly & guards useTokenLogin Requires2FA (FE-MED-04 & FE-HIGH-05)", async () => {
    mockSearchParams = new URLSearchParams("code=c-user&state=s-user");
    mockRedeemCallback.mockResolvedValueOnce({
      purpose: "login",
      requiresWorkspaceSelection: true,
      token: "ws-user-tok",
      email: "member@club.com",
      availableWorkspaces: [
        {
          tenantId: "t-ahly",
          tenantCode: "AHLY",
          tenantName: "Al Ahly",
          logoUrl: null,
          isPlatformAdmin: false,
          isActivated: true,
          isDisabled: false,
        },
      ],
    });
    mockCompleteWorkspaceSelection.mockResolvedValueOnce({
      type: "user",
      accessToken: "portal-user-jwt",
      returnPath: "/portal",
    });
    mockGetPrincipal.mockResolvedValueOnce({
      id: "usr-1",
      tenantId: "t-ahly",
      permissions: [],
      roles: [],
    });

    const { result } = renderHook(() => useSsoCallbackHandler("continue"), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.state).toBe("workspace_selection"));

    await act(async () => {
      await result.current.handleSelectWorkspace(result.current.workspaceData!.workspaces[0]);
    });
    await waitFor(() => expect(result.current.state).toBe("success"));
    expect(mockSetAccessToken).toHaveBeenCalledWith("portal-user-jwt");

    const onTwoFactorRequired = vi.fn();
    const { result: tokenHook } = renderHook(() => useTokenLogin({ onTwoFactorRequired }), {
      wrapper: createWrapper(),
    });
    mockGetPrincipal.mockClear();
    mockSetAccessToken.mockClear();
    await act(async () => {
      await tokenHook.current.completeTokenLogin({
        accessToken: "",
        requires2FA: true,
        twoFactorPendingToken: "tok-pend-99",
        staySignedIn: true,
      });
    });
    expect(onTwoFactorRequired).toHaveBeenCalledWith("tok-pend-99", true);
    expect(mockSetAccessToken).not.toHaveBeenCalled();
    expect(mockGetPrincipal).not.toHaveBeenCalled();
  });

  it("handles async onSuccess rejections and unmounted state updates safely in usePhoneOtpViewModel (FE-MED-04)", async () => {
    mockVerifyPhoneOtp.mockResolvedValueOnce({
      accessToken: "otp-tok",
      requires2FA: false,
      requiresWorkspaceSelection: false,
    });
    const failingOnSuccess = vi.fn().mockRejectedValueOnce(new Error("Session hydrate failed"));

    const { result, unmount } = renderHook(() => usePhoneOtpViewModel(failingOnSuccess));
    act(() => {
      result.current.setPhone("+201001234567");
      result.current.setCode("123456");
    });

    await act(async () => {
      await result.current.verifyOtp();
    });

    expect(result.current.error).toBe("Session hydrate failed");
    expect(result.current.isLoading).toBe(false);

    // Unmount mid-request must not emit unhandled rejection or mutate unmounted state
    mockRequestPhoneOtp.mockImplementationOnce(
      () => new Promise((resolve) => setTimeout(() => resolve({ sent: true, retryAfterSeconds: 30 }), 20))
    );
    const pendingReq = result.current.requestOtp();
    unmount();
    await expect(pendingReq).resolves.toBeUndefined();
  });
});
