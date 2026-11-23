import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, renderHook, act } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { secureTokenService } from "@core/common/secure-token-service";
import { useAppStore } from "@core/store/useAppStore";
import type { PasswordPolicyModel } from "@core/common/password-policy";
import { PasswordChangeForm } from "../components/PasswordChangeForm";
import { useSecurityVaultViewModel } from "../viewmodels/useSecurityVaultViewModel";
import { useSovereignAccountContextSlice } from "../viewmodels/useSovereignContextAndDossierViewModel";

const mocks = vi.hoisted(() => ({
  replace: vi.fn(),
  getPasswordPolicy: vi.fn(),
  changePassword: vi.fn(),
  enable2FA: vi.fn(),
  confirm2FA: vi.fn(),
  refreshToken: vi.fn(),
  listPasskeys: vi.fn().mockResolvedValue([]),
  getProfile: vi.fn().mockResolvedValue({ isTwoFactorEnabled: false, backupCodesRemaining: 0 }),
  getSecurity: vi.fn().mockResolvedValue({
    isTwoFactorEnabled: false,
    backupCodesRemaining: 0,
    isPasswordExpired: false,
    daysUntilPasswordExpiry: null,
    passwordLastChangedUtc: null,
  }),
  getContext: vi.fn().mockResolvedValue({ principalContext: { email: "a@b.c" }, featureFlags: {} }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mocks.replace, push: vi.fn() }),
}));

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string, params?: Record<string, string | number>) =>
      params ? `${key}:${JSON.stringify(params)}` : key,
    direction: "ltr" as const,
  }),
}));

vi.mock("@core/providers/service-provider", () => ({
  useServices: () => ({
    authRepository: {
      logout: vi.fn(),
      refreshToken: () => mocks.refreshToken(),
    },
  }),
}));

vi.mock("@core/services/webauthn.service", () => ({
  isWebAuthnAvailable: () => Promise.resolve(false),
  isPlatformAuthenticatorAvailable: () => Promise.resolve(false),
  detectDeviceBadge: () => "platform",
}));

vi.mock("@modules/profile/di", () => ({
  container: {
    securityRepository: {
      listPasskeys: () => mocks.listPasskeys(),
      getPasswordPolicy: () => mocks.getPasswordPolicy(),
      changePassword: (data: unknown) => mocks.changePassword(data),
      enable2FA: () => mocks.enable2FA(),
      confirm2FA: (code: string) => mocks.confirm2FA(code),
    },
    profileRepository: {
      getProfile: () => mocks.getProfile(),
    },
    sovereignAccountRepository: {
      getContext: () => mocks.getContext(),
      getSecurity: () => mocks.getSecurity(),
    },
  },
}));

const POLICY: PasswordPolicyModel = {
  minLength: 10,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecial: false,
  historyCount: 5,
  checkBreachedPasswords: true,
  expiryDays: null,
};

function createWrapper() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client }, children);
  };
}

describe("PasswordChangeForm & SecurityVault rotated token handling", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    secureTokenService.clearTokens();
    useAppStore.getState().setRequireMfaEnrollment(false);
    mocks.getPasswordPolicy.mockResolvedValue(POLICY);
    mocks.getSecurity.mockResolvedValue({
      isTwoFactorEnabled: false,
      backupCodesRemaining: 0,
      isPasswordExpired: false,
      daysUntilPasswordExpiry: null,
      passwordLastChangedUtc: null,
    });
    mocks.enable2FA.mockResolvedValue({
      qrCodeUri: "otpauth://totp/SCRIPE:admin?secret=TESTSECRET",
      manualEntryKey: "TESTSECRET",
      backupCodes: ["ABCD-1111", "EFGH-2222"],
    });
    mocks.changePassword.mockResolvedValue({
      accessToken: "hdr.payload.rotatedsig",
      expiresAt: new Date(Date.now() + 900_000).toISOString(),
    });
  });

  it("stores rotated accessToken from /admins/{id}/change-password without logging out the active session", async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useSecurityVaultViewModel(), { wrapper });

    await waitFor(() => expect(result.current.passwordPolicy).toEqual(POLICY));

    await act(async () => {
      await result.current.changePassword({
        currentPassword: "OldPassword1",
        newPassword: "NewPassword123",
      });
    });

    expect(secureTokenService.getAccessToken()).toBe("hdr.payload.rotatedsig");
  });

  it("renders sibling-session sign-out confirmation on success and fail-closed error when policy missing", () => {
    const onRetry = vi.fn();
    const { rerender } = render(
      <PasswordChangeForm
        policy={null}
        policyError="Failed to load policy"
        onRetryPolicy={onRetry}
        isTwoFactorEnabled={false}
        onSubmit={vi.fn()}
        isSubmitting={false}
        submitError={null}
        success={false}
      />
    );

    expect(screen.getByTestId("password-policy-error")).toHaveTextContent("Failed to load policy");
    fireEvent.click(screen.getByTestId("password-policy-retry"));
    expect(onRetry).toHaveBeenCalledTimes(1);

    rerender(
      <PasswordChangeForm
        policy={POLICY}
        isTwoFactorEnabled={false}
        onSubmit={vi.fn()}
        isSubmitting={false}
        submitError={null}
        success={true}
      />
    );

    expect(screen.getByTestId("password-change-success")).toHaveTextContent(
      "profile.security.passwordChangedSessionsRevoked"
    );
  });

  it("keeps twoFaSetupData for backup codes step on confirm2Fa and clears requireMfaEnrollment when wizard closes", async () => {
    useAppStore.getState().setRequireMfaEnrollment(true);
    mocks.confirm2FA.mockResolvedValueOnce(undefined);
    mocks.refreshToken.mockResolvedValueOnce({
      kind: "ok",
      value: { requireMfaEnrollment: false },
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useSecurityVaultViewModel(), { wrapper });

    await waitFor(() => expect(result.current.passwordPolicy).toEqual(POLICY));

    await act(async () => {
      await result.current.begin2FaSetup();
    });
    expect(result.current.twoFaSetupData?.backupCodes).toEqual(["ABCD-1111", "EFGH-2222"]);

    await act(async () => {
      await result.current.confirm2Fa("123456");
    });

    expect(mocks.confirm2FA).toHaveBeenCalledWith("123456");
    expect(result.current.twoFaSetupData).not.toBeNull();
    expect(mocks.refreshToken).not.toHaveBeenCalled();

    await act(async () => {
      await result.current.clearTwoFaSetup();
    });

    expect(result.current.twoFaSetupData).toBeNull();
    expect(mocks.refreshToken).toHaveBeenCalledTimes(1);
    expect(useAppStore.getState().requireMfaEnrollment).toBe(false);
    expect(mocks.replace).toHaveBeenCalledWith("/");
  });

  it("accepts 8+ char backup codes (maxLength=20) on PasswordChangeForm when 2FA is enabled", () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(
      <PasswordChangeForm
        policy={POLICY}
        isTwoFactorEnabled={true}
        onSubmit={onSubmit}
        isSubmitting={false}
        submitError={null}
        success={false}
      />
    );

    const codeInput = screen.getByPlaceholderText(
      "profile.security.twoFactorCodePlaceholder"
    ) as HTMLInputElement;
    expect(codeInput.maxLength).toBe(20);
    fireEvent.change(codeInput, { target: { value: "ABCD-1234-EF" } });
    expect(codeInput.value).toBe("ABCD-1234-EF");
  });

  it("fails closed when refreshToken returns Result.err during mandatory 2FA enrollment completion", async () => {
    useAppStore.getState().setRequireMfaEnrollment(true);
    mocks.confirm2FA.mockResolvedValueOnce(undefined);
    mocks.refreshToken.mockResolvedValueOnce({
      kind: "err",
      error: new Error("Refresh failed"),
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useSecurityVaultViewModel(), { wrapper });

    await waitFor(() => expect(result.current.passwordPolicy).toEqual(POLICY));

    await act(async () => {
      await result.current.confirm2Fa("123456");
    });

    expect(mocks.refreshToken).not.toHaveBeenCalled();

    await act(async () => {
      await result.current.clearTwoFaSetup();
    });

    expect(mocks.refreshToken).toHaveBeenCalledTimes(1);
    expect(useAppStore.getState().requireMfaEnrollment).toBe(true);
    expect(mocks.replace).not.toHaveBeenCalled();
  });

  it("disables /account/context fetching while requireMfaEnrollment is active to prevent 403 retry stalls", async () => {
    useAppStore.getState().setRequireMfaEnrollment(true);
    const wrapper = createWrapper();
    const { result, unmount } = renderHook(() => useSovereignAccountContextSlice(), { wrapper });

    expect(result.current.isLoading).toBe(false);
    expect(mocks.getContext).not.toHaveBeenCalled();
    unmount();

    useAppStore.getState().setRequireMfaEnrollment(false);
    renderHook(() => useSovereignAccountContextSlice(), { wrapper: createWrapper() });
    await waitFor(() => expect(mocks.getContext).toHaveBeenCalledTimes(1));
  });
});
