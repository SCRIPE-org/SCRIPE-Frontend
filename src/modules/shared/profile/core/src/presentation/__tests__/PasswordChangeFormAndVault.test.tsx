import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, renderHook, act } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { secureTokenService } from "@core/common/secure-token-service";
import type { PasswordPolicyModel } from "@core/common/password-policy";
import { PasswordChangeForm } from "../components/PasswordChangeForm";
import { useSecurityVaultViewModel } from "../viewmodels/useSecurityVaultViewModel";

const mocks = vi.hoisted(() => ({
  getPasswordPolicy: vi.fn(),
  changePassword: vi.fn(),
  listPasskeys: vi.fn().mockResolvedValue([]),
  getProfile: vi.fn().mockResolvedValue({ isTwoFactorEnabled: false, backupCodesRemaining: 0 }),
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
    },
    profileRepository: {
      getProfile: () => mocks.getProfile(),
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
    mocks.getPasswordPolicy.mockResolvedValue(POLICY);
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
});
