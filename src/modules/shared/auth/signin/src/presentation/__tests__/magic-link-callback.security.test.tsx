import React from "react";
import { renderHook, render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import "@testing-library/jest-dom";
import { useMagicLinkCallbackViewModel } from "../viewmodels/useMagicLinkCallbackViewModel";
import { CredentialsForm } from "../components/CredentialsForm";
import { UnactivatedAccountAlert } from "../components/UnactivatedAccountAlert";

let mockSearchParams = new URLSearchParams();

const {
  mockVerifyMagicLink,
  mockVerify2FA,
  mockRouterReplace,
  mockInvalidateQueries,
  mockSetAuth,
  mockSetSubscriptionInfo,
  mockSetMustChangePassword,
  mockSetDefaultRedirectPath,
} = vi.hoisted(() => ({
  mockVerifyMagicLink: vi.fn(),
  mockVerify2FA: vi.fn(),
  mockRouterReplace: vi.fn(),
  mockInvalidateQueries: vi.fn(),
  mockSetAuth: vi.fn(),
  mockSetSubscriptionInfo: vi.fn(),
  mockSetMustChangePassword: vi.fn(),
  mockSetDefaultRedirectPath: vi.fn(),
}));

const stableServices = {
  authRepository: {
    verifyMagicLink: mockVerifyMagicLink,
    verify2FA: mockVerify2FA,
  },
};

const stableStoreState = {
  setAuth: mockSetAuth,
  setSubscriptionInfo: mockSetSubscriptionInfo,
  setMustChangePassword: mockSetMustChangePassword,
  setDefaultRedirectPath: mockSetDefaultRedirectPath,
};

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockRouterReplace }),
  useSearchParams: () => mockSearchParams,
}));

vi.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({ invalidateQueries: mockInvalidateQueries }),
}));

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string) => key,
    direction: "ltr" as const,
  }),
}));

vi.mock("@core/providers/service-provider", () => ({
  useServices: () => stableServices,
}));

vi.mock("@core/store/useAppStore", () => ({
  useAppStore: (selector: (s: typeof stableStoreState) => unknown) => selector(stableStoreState),
}));

vi.mock("@core/ui/checkbox", () => ({
  Checkbox: ({
    checked,
    onCheckedChange,
    id,
  }: {
    checked?: boolean;
    onCheckedChange?: (v: boolean) => void;
    id?: string;
  }) => (
    <input
      id={id}
      type="checkbox"
      checked={checked}
      onChange={(e) => onCheckedChange?.(e.target.checked)}
    />
  ),
}));

vi.mock("@core/ui/password-input", () => ({
  PasswordInput: (props: React.InputHTMLAttributes<HTMLInputElement>) => <input {...props} />,
}));

describe("Magic-link URL security & Signin recovery context continuity", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams = new URLSearchParams();
    window.history.replaceState({}, "", "/magic-link");
  });

  it("extracts #token= from URL fragment and immediately strips token via history.replaceState while keeping _tenant", async () => {
    window.history.replaceState(
      {},
      "",
      "/magic-link?_tenant=ahly&redirect=%2Fcrm#token=secret-magic-frag"
    );
    mockSearchParams = new URLSearchParams("_tenant=ahly&redirect=%2Fcrm");
    mockVerifyMagicLink.mockResolvedValueOnce({
      user: { id: "u-1", email: "admin@ahly.club", roles: ["TenantAdmin"], permissions: [] },
      mustChangePassword: false,
      subscriptionStatus: "Active",
    });

    const { result } = renderHook(() => useMagicLinkCallbackViewModel());

    await waitFor(() => {
      expect(result.current.state).toBe("success");
    });

    expect(mockVerifyMagicLink).toHaveBeenCalledWith("secret-magic-frag", "ahly");
    expect(window.location.hash).toBe("");
    expect(window.location.search).toBe("?_tenant=ahly&redirect=%2Fcrm");
  });

  it("strips ?token= query parameter cleanly via history.replaceState and handles missing tokens", async () => {
    window.history.replaceState({}, "", "/magic-link?token=secret-query-tok&tenantId=enc_1");
    mockSearchParams = new URLSearchParams("token=secret-query-tok&tenantId=enc_1");
    mockVerifyMagicLink.mockResolvedValueOnce({
      user: { id: "u-2", email: "u2@ahly.club", roles: ["TenantAdmin"], permissions: [] },
    });

    const { result } = renderHook(() => useMagicLinkCallbackViewModel());

    await waitFor(() => {
      expect(result.current.state).toBe("success");
    });
    expect(window.location.search).toBe("?tenantId=enc_1");

    vi.clearAllMocks();
    window.history.replaceState({}, "", "/magic-link");
    mockSearchParams = new URLSearchParams();
    const missing = renderHook(() => useMagicLinkCallbackViewModel());
    await waitFor(() => {
      expect(missing.result.current.state).toBe("error");
    });
    expect(mockVerifyMagicLink).not.toHaveBeenCalled();
  });

  it("renders password-reset success banner & context-preserving forgotPasswordHref in CredentialsForm, and localized keys in UnactivatedAccountAlert", () => {
    render(
      <>
        <CredentialsForm
          formData={{ identifier: "admin@ahly.club", password: "", staySignedIn: false }}
          showPassword={false}
          isLoading={false}
          isFormValid={false}
          error=""
          shakeKey={0}
          isRTL={false}
          updateField={vi.fn()}
          togglePasswordVisibility={vi.fn()}
          handleLogin={vi.fn()}
          isPasswordResetSuccess
          forgotPasswordHref="/forgot-password?email=admin%40ahly.club&_tenant=AHLY"
        />
        <UnactivatedAccountAlert
          t={(k) => k}
          cooldownSeconds={20}
          isLoading={false}
          onResendSetupEmail={vi.fn()}
        />
      </>
    );

    expect(screen.getByTestId("login-reset-success-banner")).toHaveTextContent(
      "auth.resetPasswordBannerTitle"
    );
    const forgotLink = screen.getByRole("link", { name: "auth.forgotPassword" });
    expect(forgotLink).toHaveAttribute(
      "href",
      "/forgot-password?email=admin%40ahly.club&_tenant=AHLY"
    );

    expect(screen.getByText("auth.accountSetup.activationRequiredTitle")).toBeInTheDocument();
    expect(screen.getByText("auth.accountSetup.resendAvailableIn")).toBeInTheDocument();
    expect(screen.getByText("auth.accountSetup.resendEmailAction")).toBeInTheDocument();
  });
});
