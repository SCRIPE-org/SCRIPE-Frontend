import React from "react";
import { renderHook, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useOAuthConsentViewModel } from "../viewmodels/useOAuthConsentViewModel";

const {
  mockSearchParamsRef,
  mockRouterReplace,
  mockBuildOidcConsentForm,
  mockBuildOidcLogoutUrl,
  mockApiLogout,
  mockGetAccessToken,
  mockHasToken,
  mockClearTokens,
  mockOperationError,
  mockLogout,
} = vi.hoisted(() => ({
  mockSearchParamsRef: {
    current: new URLSearchParams(
      "client_id=test-client&redirect_uri=javascript:alert(document.domain)//&response_type=code&scope=openid&state=xyz&consent_ticket=signed-ticket"
    ),
  },
  mockRouterReplace: vi.fn(),
  mockBuildOidcConsentForm: vi.fn(),
  mockBuildOidcLogoutUrl: vi.fn(),
  mockApiLogout: vi.fn(),
  mockGetAccessToken: vi.fn(),
  mockHasToken: vi.fn(),
  mockClearTokens: vi.fn(),
  mockOperationError: vi.fn(),
  mockLogout: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useSearchParams: () => mockSearchParamsRef.current,
  useRouter: () => ({
    replace: mockRouterReplace,
    push: vi.fn(),
  }),
}));

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string) => key,
    direction: "ltr" as const,
  }),
}));

vi.mock("@core/hooks/use-enhanced-toast", () => ({
  useEnhancedToast: () => ({
    operationError: mockOperationError,
  }),
}));

vi.mock("@core/providers/service-provider", () => ({
  useServices: () => ({
    authRepository: {
      buildOidcConsentForm: (...args: unknown[]) => mockBuildOidcConsentForm(...args),
      buildOidcLogoutUrl: (...args: unknown[]) => mockBuildOidcLogoutUrl(...args),
      logout: (...args: unknown[]) => mockApiLogout(...args),
      refreshToken: vi.fn(),
      getCurrentPrincipal: vi.fn(),
    },
  }),
}));

vi.mock("@core/store/useAppStore", () => {
  const state = {
    isAuthenticated: true,
    setAuth: vi.fn(),
    logout: mockLogout,
    user: { displayName: "Admin User", username: "admin" },
    _hasHydrated: true,
  };
  return {
    useAppStore: (selector: (s: typeof state) => unknown) => selector(state),
  };
});

vi.mock("@core/common/secure-token-service", () => ({
  secureTokenService: {
    getAccessToken: () => mockGetAccessToken(),
    hasToken: () => mockHasToken(),
    clearTokens: () => mockClearTokens(),
  },
}));

vi.mock("@core/common/logger", () => ({
  appLogger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  },
}));

function createWrapper() {
  const client = new QueryClient();
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client }, children);
  };
}

describe("useOAuthConsentViewModel (SEC-03)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockHasToken.mockReturnValue(true);
    mockGetAccessToken.mockReturnValue("valid-jwt-token");
    mockBuildOidcConsentForm.mockImplementation(
      (_params: URLSearchParams, decision: "approve" | "deny" = "approve") => ({
        action: "http://localhost:5035/connect/authorize",
        params: {
          client_id: "test-client",
          consent_ticket: "signed-ticket",
          decision,
        },
      })
    );
  });

  it("blocks javascript: DOM-XSS on handleDeny by submitting decision=deny to backend /connect/authorize instead of navigating window.location.href", () => {
    vi.useFakeTimers();
    const initialHref = window.location.href;
    mockSearchParamsRef.current = new URLSearchParams(
      "client_id=test-client&redirect_uri=javascript:alert(document.domain)//&response_type=code&scope=openid&state=s1&consent_ticket=signed-ticket"
    );

    const { result } = renderHook(() => useOAuthConsentViewModel(), {
      wrapper: createWrapper(),
    });

    const mockSubmit = vi.fn();
    (result.current.formRef as { current: HTMLFormElement | null }).current = {
      submit: mockSubmit,
    } as unknown as HTMLFormElement;

    act(() => {
      result.current.handleDeny();
    });

    expect(mockBuildOidcConsentForm).toHaveBeenCalledWith(
      mockSearchParamsRef.current,
      "deny"
    );
    expect(result.current.formAction).toBe("http://localhost:5035/connect/authorize");
    expect(result.current.formParams.decision).toBe("deny");
    expect(window.location.href).toBe(initialHref);

    act(() => {
      vi.runAllTimers();
    });

    expect(mockSubmit).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });

  it("blocks external open redirect on handleDeny even for https://evil.example redirect_uri", () => {
    vi.useFakeTimers();
    const initialHref = window.location.href;
    mockSearchParamsRef.current = new URLSearchParams(
      "client_id=test-client&redirect_uri=https://evil.example/phish&response_type=code&scope=openid&consent_ticket=signed-ticket"
    );

    const { result } = renderHook(() => useOAuthConsentViewModel(), {
      wrapper: createWrapper(),
    });

    const mockSubmit = vi.fn();
    (result.current.formRef as { current: HTMLFormElement | null }).current = {
      submit: mockSubmit,
    } as unknown as HTMLFormElement;

    act(() => {
      result.current.handleDeny();
    });

    expect(mockBuildOidcConsentForm).toHaveBeenCalledWith(
      mockSearchParamsRef.current,
      "deny"
    );
    expect(window.location.href).toBe(initialHref);

    act(() => {
      vi.runAllTimers();
    });
    expect(mockSubmit).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });

  it("redirects to /login (never to attacker redirect_uri) when access token is missing on handleDeny", () => {
    mockGetAccessToken.mockReturnValue(null);
    mockSearchParamsRef.current = new URLSearchParams(
      "client_id=test-client&redirect_uri=javascript:alert(1)&response_type=code"
    );

    const { result } = renderHook(() => useOAuthConsentViewModel(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.handleDeny();
    });

    expect(mockBuildOidcConsentForm).not.toHaveBeenCalled();
    expect(mockRouterReplace).toHaveBeenCalledWith(expect.stringContaining("/login?redirect="));
  });

  it("submits decision=approve via backend /connect/authorize on handleApprove", () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useOAuthConsentViewModel(), {
      wrapper: createWrapper(),
    });
    const mockSubmit = vi.fn();
    (result.current.formRef as { current: HTMLFormElement | null }).current = {
      submit: mockSubmit,
    } as unknown as HTMLFormElement;

    act(() => {
      result.current.handleApprove();
    });

    expect(mockBuildOidcConsentForm).toHaveBeenCalledWith(
      mockSearchParamsRef.current,
      "approve"
    );
    expect(result.current.formParams.decision).toBe("approve");
    act(() => {
      vi.runAllTimers();
    });
    expect(mockSubmit).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });

  it("strips consent_ticket from redirect param when missing token triggers login redirect", () => {
    mockGetAccessToken.mockReturnValue(null);
    mockSearchParamsRef.current = new URLSearchParams(
      "client_id=test-client&response_type=code&scope=openid&consent_ticket=stale-ticket"
    );

    const { result } = renderHook(() => useOAuthConsentViewModel(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.handleDeny();
    });

    expect(mockRouterReplace).toHaveBeenCalledTimes(1);
    const [target] = mockRouterReplace.mock.calls[0] as [string];
    expect(target).toContain("/login?redirect=");
    expect(decodeURIComponent(target)).not.toContain("consent_ticket");
    expect(decodeURIComponent(target)).not.toContain("stale-ticket");
  });

  it("revokes session and navigates via backend /oidc/logout on handleSwitchAccount without reusing consent_ticket", async () => {
    mockApiLogout.mockResolvedValueOnce(undefined);
    mockBuildOidcLogoutUrl.mockReturnValueOnce(
      "http://localhost:5035/oidc/logout?returnUrl=%2Fconnect%2Fauthorize%3Fclient_id%3Dtest-client"
    );

    const originalLocation = window.location;
    let assignedHref = "";
    Object.defineProperty(window, "location", {
      configurable: true,
      value: {
        ...originalLocation,
        get href() {
          return assignedHref;
        },
        set href(val: string) {
          assignedHref = val;
        },
      },
    });

    try {
      const { result } = renderHook(() => useOAuthConsentViewModel(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        result.current.handleSwitchAccount();
        await Promise.resolve();
      });

      expect(mockApiLogout).toHaveBeenCalledTimes(1);
      expect(mockClearTokens).toHaveBeenCalled();
      expect(mockLogout).toHaveBeenCalled();
      expect(mockBuildOidcLogoutUrl).toHaveBeenCalledWith(mockSearchParamsRef.current);
      expect(assignedHref).toBe(
        "http://localhost:5035/oidc/logout?returnUrl=%2Fconnect%2Fauthorize%3Fclient_id%3Dtest-client"
      );
      expect(mockRouterReplace).not.toHaveBeenCalled();
    } finally {
      Object.defineProperty(window, "location", {
        configurable: true,
        value: originalLocation,
      });
    }
  });
});
