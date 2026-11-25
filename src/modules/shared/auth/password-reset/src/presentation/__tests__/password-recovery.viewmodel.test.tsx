import React from "react";
import { act, renderHook, render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import "@testing-library/jest-dom";
import type { PasswordPolicyModel } from "@core/common/password-policy";
import {
  extractRecoveryUrlContext,
  extractRecoveryApiError,
  mergePasswordPolicies,
} from "../utils/recovery-helpers";
import { usePasswordRecoveryViewModel } from "../viewmodels/usePasswordRecoveryViewModel";
import { PasswordRecoveryView } from "../views/PasswordRecoveryView";

let mockSearchParams = new URLSearchParams();
const {
  mockRouterReplace,
  mockRouterPush,
  mockQueryClear,
  mockRequestReset,
  mockVerifyOtp,
  mockResetPassword,
  mockLogout,
  mockClearSessionOnLoginMount,
  mockGetPasswordPolicy,
  mockBroadcastLogout,
  mockHasToken,
  mockStoreLogout,
  mockAppState,
} = vi.hoisted(() => {
  const mockStoreLogout = vi.fn();
  return {
    mockRouterReplace: vi.fn(),
    mockRouterPush: vi.fn(),
    mockQueryClear: vi.fn(),
    mockRequestReset: vi.fn(),
    mockVerifyOtp: vi.fn(),
    mockResetPassword: vi.fn(),
    mockLogout: vi.fn(),
    mockClearSessionOnLoginMount: vi.fn(),
    mockGetPasswordPolicy: vi.fn(),
    mockBroadcastLogout: vi.fn(),
    mockHasToken: vi.fn(() => false),
    mockStoreLogout,
    mockAppState: {
      isAuthenticated: false,
      _hasHydrated: true,
      user: { email: "signedin@ahly.club", username: "signedin" },
      tenantCode: null as string | null,
      logout: mockStoreLogout,
    },
  };
});

const stableServices = {
  passwordResetRepository: {
    requestReset: mockRequestReset,
    verifyOtp: mockVerifyOtp,
    resetPassword: mockResetPassword,
  },
  authRepository: {
    logout: mockLogout,
    clearSessionOnLoginMount: mockClearSessionOnLoginMount,
    getPasswordPolicy: mockGetPasswordPolicy,
  },
};

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: mockRouterReplace,
    push: mockRouterPush,
  }),
  useSearchParams: () => mockSearchParams,
}));

vi.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({
    clear: mockQueryClear,
  }),
}));

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string) => key,
    direction: "ltr" as const,
    language: "en" as const,
  }),
}));

vi.mock("@core/providers/service-provider", () => ({
  useServices: () => stableServices,
}));

vi.mock("@core/store/useAppStore", () => ({
  useAppStore: Object.assign(
    (selector: (s: typeof mockAppState) => unknown) => selector(mockAppState),
    { getState: () => mockAppState }
  ),
}));

vi.mock("@core/common/secure-token-service", () => ({
  secureTokenService: {
    hasToken: () => mockHasToken(),
  },
}));

vi.mock("@core/common/broadcast-auth", () => ({
  authBroadcast: {
    broadcastLogout: mockBroadcastLogout,
  },
}));

vi.mock("@core/ui/layout/common/language-switcher", () => ({
  LanguageSwitcher: () => <div data-testid="lang-switcher" />,
}));

vi.mock("@core/ui/layout/common/theme-switcher", () => ({
  ThemeSwitcher: () => <div data-testid="theme-switcher" />,
}));

vi.mock("@modules/auth/core", () => ({
  VaultBackground: () => <div data-testid="vault-bg" />,
}));

vi.mock("@modules/auth/core/src/presentation/viewmodels/useTenantResolution", () => ({
  useTenantResolution: () => ({
    tenantId: "enc_ahly",
    branding: {
      companyName: "Al Ahly SC",
      code: "AHLY",
      passwordPolicy: null,
      loginBrandingJson: null,
      slotConfigJson: null,
      isSafeMode: false,
    },
  }),
}));

vi.mock("@modules/auth/core/src/presentation/viewmodels/useLoginBrandingTokens", () => ({
  useLoginBrandingTokens: () => undefined,
}));

const ENTERPRISE_POLICY: PasswordPolicyModel = {
  minLength: 12,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecial: true,
  historyCount: 5,
  checkBreachedPasswords: true,
  expiryDays: 90,
};

const STARTER_POLICY: PasswordPolicyModel = {
  minLength: 8,
  maxLength: 64,
  requireUppercase: false,
  requireLowercase: true,
  requireNumber: true,
  requireSpecial: false,
  historyCount: 0,
  checkBreachedPasswords: false,
  expiryDays: null,
};

describe("Password recovery helpers & consolidated ViewModel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams = new URLSearchParams();
    mockAppState.isAuthenticated = false;
    mockHasToken.mockReturnValue(false);
    window.history.replaceState({}, "", "/forgot-password");
  });

  it("extractRecoveryUrlContext extracts #token= fragments cleanly, rejects unsafe redirects, and preserves _tenant", () => {
    const ctx = extractRecoveryUrlContext(
      "https://scripe.app/reset-password?_tenant=ahly&redirect=https://evil.com#token=frag-secret&email=admin@ahly.club",
      { stripEmailFromQuery: true }
    );
    expect(ctx.token).toBe("frag-secret");
    expect(ctx.otp).toBe("frag-secret");
    expect(ctx.email).toBe("admin@ahly.club");
    expect(ctx.tenantCode).toBe("AHLY");
    expect(ctx.redirect).toBeNull();
    expect(ctx.hasSensitiveParams).toBe(true);
    expect(ctx.cleanRelativeUrl).toBe("/reset-password?_tenant=ahly");

    const queryFallback = extractRecoveryUrlContext(
      "https://scripe.app/reset-password?otp=123456&email=u@test.com&redirect=%2Fcrm%2Fleads&_tenant=pro"
    );
    expect(queryFallback.otp).toBe("123456");
    expect(queryFallback.redirect).toBe("/crm/leads");
    expect(queryFallback.cleanRelativeUrl).toBe(
      "/reset-password?email=u%40test.com&redirect=%2Fcrm%2Fleads&_tenant=pro"
    );
  });

  it("extractRecoveryApiError classifies HTTP 429 retryAfterSeconds, 422 FluentValidation errors, and network failures", () => {
    const rateErr = Object.assign(new Error("Too many requests"), {
      status: 429,
      details: { retryAfterSeconds: 45 },
    });
    expect(extractRecoveryApiError(rateErr)).toEqual({
      kind: "rate-limit",
      status: 429,
      retryAfterSeconds: 45,
      message: "Too many requests",
    });

    const valErr = Object.assign(new Error("Unprocessable"), {
      status: 422,
      details: { errors: { NewPassword: ["Must not reuse recent passwords"] } },
    });
    expect(extractRecoveryApiError(valErr)).toEqual({
      kind: "validation",
      status: 422,
      message: "Must not reuse recent passwords",
    });

    const netErr = Object.assign(new Error("Network Error"), { code: "ERR_NETWORK" });
    expect(extractRecoveryApiError(netErr)).toEqual({
      kind: "network",
      message: "Network Error",
    });
  });

  it("mergePasswordPolicies combines multiple policies into the strictest bounds", () => {
    const merged = mergePasswordPolicies([STARTER_POLICY, ENTERPRISE_POLICY]);
    expect(merged).toEqual({
      minLength: 12,
      maxLength: 64,
      requireUppercase: true,
      requireLowercase: true,
      requireNumber: true,
      requireSpecial: true,
      historyCount: 5,
      checkBreachedPasswords: true,
      expiryDays: 90,
    });
  });

  it("completes multi-workspace OTP flow, enforces dynamic policy, retains grant on 422 retry, and purges session on success", async () => {
    mockSearchParams = new URLSearchParams("_tenant=ahly&redirect=%2Fcrm%2Fleads");
    mockRequestReset.mockResolvedValueOnce({ sent: true, retryAfterSeconds: 30 });
    mockVerifyOtp.mockResolvedValueOnce({
      isValid: true,
      resetGrantToken: "grant-xyz",
      passwordPolicy: ENTERPRISE_POLICY,
      workspaces: [
        { tenantId: "t1", tenantName: "Al Ahly", tenantCode: "AHLY", isPlatformAdmin: false },
        { tenantId: "t2", tenantName: "Ahly Youth", tenantCode: "AHLYY", isPlatformAdmin: false },
      ],
    });
    mockResetPassword
      .mockRejectedValueOnce(
        Object.assign(new Error("Password appeared in breach corpus"), { status: 422 })
      )
      .mockResolvedValueOnce(undefined);

    const { result } = renderHook(() =>
      usePasswordRecoveryViewModel({ mode: "forgot", tenantId: "enc_ahly" })
    );

    act(() => {
      result.current.setEmail("admin@ahly.club");
    });
    await act(async () => {
      await result.current.submitEmail();
    });
    expect(result.current.step).toBe("method");

    await act(async () => {
      await result.current.chooseMethod("otp");
    });
    expect(result.current.step).toBe("otp");
    expect(result.current.cooldown).toBe(30);

    act(() => {
      result.current.setOtp("654321");
    });
    await act(async () => {
      await result.current.submitOtp();
    });
    expect(result.current.step).toBe("workspaces");
    expect(result.current.resetGrantToken).toBe("grant-xyz");

    act(() => {
      result.current.confirmWorkspaceSelection();
    });
    expect(result.current.step).toBe("new-password");

    // Starter-length 8-char password cannot satisfy Enterprise 12-char special policy
    act(() => {
      result.current.setNewPassword("Pass1234");
      result.current.setConfirmPassword("Pass1234");
    });
    expect(result.current.canSubmitNewPassword).toBe(false);

    // Satisfying Enterprise policy enables submit
    act(() => {
      result.current.setNewPassword("StrongClub!2026");
      result.current.setConfirmPassword("StrongClub!2026");
    });
    expect(result.current.canSubmitNewPassword).toBe(true);

    // 422 breach rejection preserves resetGrantToken & OTP for non-destructive retry
    await act(async () => {
      await result.current.submitNewPassword();
    });
    expect(result.current.step).toBe("new-password");
    expect(result.current.error).toBe("Password appeared in breach corpus");
    expect(result.current.resetGrantToken).toBe("grant-xyz");
    expect(result.current.otp).toBe("654321");

    // Second submission succeeds -> full session purge & loginHref context continuity
    act(() => {
      result.current.setNewPassword("UniqueClub!2026");
      result.current.setConfirmPassword("UniqueClub!2026");
    });
    await act(async () => {
      await result.current.submitNewPassword();
    });
    expect(result.current.step).toBe("success");
    expect(result.current.successReason).toBe("password-reset");
    expect(mockClearSessionOnLoginMount).toHaveBeenCalled();
    expect(mockStoreLogout).toHaveBeenCalled();
    expect(mockQueryClear).toHaveBeenCalled();
    expect(mockBroadcastLogout).toHaveBeenCalled();
    expect(result.current.loginHref).toBe(
      "/login?reset=success&email=admin%40ahly.club&_tenant=AHLY&redirect=%2Fcrm%2Fleads"
    );
  });

  it("surfaces HTTP 429 and network errors honestly without faking OTP sent, and cleans interval on unmount", async () => {
    const clearSpy = vi.spyOn(globalThis, "clearInterval");
    mockRequestReset.mockRejectedValueOnce(
      Object.assign(new Error("Too fast"), {
        status: 429,
        details: { retryAfterSeconds: 45 },
      })
    );

    const { result, unmount } = renderHook(() =>
      usePasswordRecoveryViewModel({ mode: "forgot" })
    );

    act(() => {
      result.current.setEmail("user@scripe.test");
    });
    await act(async () => {
      await result.current.submitEmail();
    });
    await act(async () => {
      await result.current.chooseMethod("otp");
    });

    expect(result.current.step).toBe("method");
    expect(result.current.cooldown).toBe(45);
    expect(result.current.error).toBe("auth.rateLimitedRetryAfter");

    unmount();
    expect(clearSpy).toHaveBeenCalled();
    clearSpy.mockRestore();
  });

  it("extracts #token= magic-link on /reset-password, scrubs URL immediately, and handles fail-closed policy loading with retry", async () => {
    window.history.replaceState(
      {},
      "",
      "/reset-password?_tenant=ahly#token=secret-reset-tok&email=coach@ahly.club"
    );
    mockSearchParams = new URLSearchParams("_tenant=ahly");
    mockVerifyOtp.mockResolvedValueOnce({
      isValid: true,
      resetGrantToken: "grant-magic",
      passwordPolicy: null,
      workspaces: [],
    });
    mockGetPasswordPolicy
      .mockRejectedValueOnce(new Error("Temporary error"))
      .mockResolvedValueOnce(ENTERPRISE_POLICY);
    mockResetPassword.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() =>
      usePasswordRecoveryViewModel({ mode: "reset", tenantId: "enc_ahly" })
    );

    await waitFor(() => {
      expect(result.current.step).toBe("new-password");
    });

    // URL scrubbed via replaceState cleanly leaving only safe context
    expect(window.location.hash).toBe("");
    expect(window.location.search).toBe("?_tenant=ahly");
    expect(mockVerifyOtp).toHaveBeenCalledWith("coach@ahly.club", "secret-reset-tok", {
      method: "magic-link",
      tenantId: "enc_ahly",
    });

    // Policy failed initially -> fail closed
    await waitFor(() => {
      expect(result.current.policyError).toBe("auth.recoveryPolicyLoadError");
    });
    act(() => {
      result.current.setNewPassword("Valid!2026Pass");
      result.current.setConfirmPassword("Valid!2026Pass");
    });
    expect(result.current.canSubmitNewPassword).toBe(false);

    // Retry policy loads Enterprise policy cleanly
    act(() => {
      result.current.retryPolicy();
    });
    await waitFor(() => {
      expect(result.current.effectivePolicy).toEqual(ENTERPRISE_POLICY);
    });
    expect(result.current.canSubmitNewPassword).toBe(true);

    await act(async () => {
      await result.current.submitNewPassword();
    });
    expect(result.current.step).toBe("success");
    expect(result.current.successReason).toBe("password-reset");
  });

  it("renders PasswordRecoveryView active-session sign-out choice and dynamic policy checklist for authenticated users", async () => {
    mockAppState.isAuthenticated = true;
    mockHasToken.mockReturnValue(true);
    mockLogout.mockResolvedValueOnce(undefined);
    window.history.replaceState({}, "", "/forgot-password?email=signedin@ahly.club");
    mockSearchParams = new URLSearchParams("email=signedin@ahly.club");

    render(<PasswordRecoveryView mode="forgot" />);

    expect(screen.getByTestId("recovery-active-session-notice")).toBeInTheDocument();
    const signOutBtn = screen.getByRole("button", { name: "auth.recoverySignOutAndContinue" });
    await act(async () => {
      fireEvent.click(signOutBtn);
    });

    expect(mockLogout).toHaveBeenCalled();
    expect(mockClearSessionOnLoginMount).toHaveBeenCalled();
    expect(mockBroadcastLogout).toHaveBeenCalled();
    await waitFor(() => {
      expect(screen.queryByTestId("recovery-active-session-notice")).not.toBeInTheDocument();
    });
  });

  it("transitions /reset-password#token= out of verifying-link under React.StrictMode double-invocation", async () => {
    window.history.replaceState(
      {},
      "",
      "/reset-password#token=strict-magic-tok&email=coach@ahly.club&method=magic-link"
    );
    mockSearchParams = new URLSearchParams();
    let resolveVerify!: (val: unknown) => void;
    mockVerifyOtp.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveVerify = resolve;
      })
    );
    mockGetPasswordPolicy.mockResolvedValue(ENTERPRISE_POLICY);

    render(
      <React.StrictMode>
        <PasswordRecoveryView mode="reset" />
      </React.StrictMode>
    );

    expect(mockVerifyOtp).toHaveBeenCalledTimes(1);
    expect(screen.getByText("auth.verifyingLink")).toBeInTheDocument();

    await act(async () => {
      resolveVerify({
        isValid: true,
        resetGrantToken: "strict-grant-tok",
        passwordPolicy: ENTERPRISE_POLICY,
        workspaces: [],
      });
    });

    await waitFor(() => {
      expect(document.getElementById("fp-new-password")).toBeInTheDocument();
    });
    expect(mockVerifyOtp).toHaveBeenCalledTimes(1);
  });
});
