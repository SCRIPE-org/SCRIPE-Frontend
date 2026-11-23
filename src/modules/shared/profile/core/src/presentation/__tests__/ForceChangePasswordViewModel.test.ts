import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { evaluatePasswordPolicy, type PasswordPolicyModel } from "@core/common/password-policy";
import { useForceChangePasswordViewModel } from "../viewmodels/useForceChangePasswordViewModel";

const mocks = vi.hoisted(() => ({
  replace: vi.fn(),
  invalidateQueries: vi.fn().mockResolvedValue(undefined),
  clearQueries: vi.fn(),
  operationSuccess: vi.fn(),
  operationError: vi.fn(),
  forceChangePassword: vi.fn(),
  refreshToken: vi.fn(),
  getCurrentPrincipal: vi.fn(),
  getPasswordPolicy: vi.fn(),
  authLogout: vi.fn(),
  setAuth: vi.fn(),
  setSubscriptionInfo: vi.fn(),
  setMustChangePassword: vi.fn(),
  setDefaultRedirectPath: vi.fn(),
  logout: vi.fn(),
  clearRouteData: vi.fn(),
  resetNavigation: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mocks.replace, push: vi.fn() }),
}));

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string) => key,
    direction: "ltr" as const,
  }),
}));

vi.mock("@core/providers/service-provider", () => ({
  useServices: () => ({
    authRepository: {
      refreshToken: mocks.refreshToken,
      getCurrentPrincipal: mocks.getCurrentPrincipal,
      getPasswordPolicy: mocks.getPasswordPolicy,
      logout: mocks.authLogout,
    },
  }),
}));

vi.mock("@core/hooks/use-enhanced-toast", () => ({
  useEnhancedToast: () => ({
    operationSuccess: mocks.operationSuccess,
    operationError: mocks.operationError,
  }),
}));

vi.mock("@modules/profile/di", () => ({
  container: {
    profileRepository: {
      forceChangePassword: (...args: unknown[]) => mocks.forceChangePassword(...args),
    },
  },
}));

vi.mock("@core/store/useAppStore", () => {
  const storeState = {
    user: {
      id: "adm-1",
      username: "platform.admin",
      email: "admin@scripe.test",
      permissions: ["Identity.Users.Read"],
      roles: ["SuperAdmin"],
    },
    defaultRedirectPath: "/overview",
    setAuth: mocks.setAuth,
    setSubscriptionInfo: mocks.setSubscriptionInfo,
    setMustChangePassword: mocks.setMustChangePassword,
    setDefaultRedirectPath: mocks.setDefaultRedirectPath,
    logout: mocks.logout,
  };
  return {
    useAppStore: (selector: (s: typeof storeState) => unknown) => selector(storeState),
  };
});

vi.mock("@core/navigation/store/useNavigationStore", () => ({
  useNavigationStore: {
    getState: () => ({
      clearRouteData: mocks.clearRouteData,
      reset: mocks.resetNavigation,
    }),
  },
}));

const STRICT_POLICY: PasswordPolicyModel = {
  minLength: 12,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecial: true,
  historyCount: 5,
  checkBreachedPasswords: true,
  expiryDays: null,
};

function createTestWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return {
    client,
    wrapper: function Wrapper({ children }: { children: React.ReactNode }) {
      return React.createElement(QueryClientProvider, { client }, children);
    },
  };
}

describe("ForceChangePasswordViewModel (Dynamic PasswordPolicy & Session Rotation)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getPasswordPolicy.mockResolvedValue(STRICT_POLICY);
    mocks.forceChangePassword.mockResolvedValue({
      defaultRedirectPath: "/",
      subscriptionStatus: "Active",
      gracePhase: null,
      editionName: "Enterprise",
    });
    mocks.refreshToken.mockResolvedValue({
      kind: "ok",
      value: {
        user: {
          id: "adm-1",
          username: "platform.admin",
          permissions: ["Identity.Users.Read"],
          roles: ["SuperAdmin"],
        },
        defaultRedirectPath: "/",
        subscriptionStatus: "Active",
        gracePhase: null,
        editionName: "Enterprise",
      },
    });
    mocks.getCurrentPrincipal.mockResolvedValue({
      id: "adm-1",
      username: "platform.admin",
      permissions: ["Identity.Users.Read", "Profile.Manage"],
      roles: ["SuperAdmin"],
    });
    mocks.authLogout.mockResolvedValue(undefined);
  });

  it("evaluates candidate passwords dynamically against the loaded PasswordPolicyModel", () => {
    expect(evaluatePasswordPolicy("abc", STRICT_POLICY).allMet).toBe(false);
    expect(evaluatePasswordPolicy("Pass#2026", STRICT_POLICY).allMet).toBe(false);
    expect(evaluatePasswordPolicy("StrongP@ss1", STRICT_POLICY).allMet).toBe(false);
    expect(evaluatePasswordPolicy("StrongP@ss12", STRICT_POLICY).allMet).toBe(true);

    // Tenant disabling lowercase & special must not reject valid uppercase+digits passwords
    const relaxedPolicy: PasswordPolicyModel = {
      ...STRICT_POLICY,
      minLength: 8,
      requireLowercase: false,
      requireSpecial: false,
    };
    expect(evaluatePasswordPolicy("UPPER123", relaxedPolicy).allMet).toBe(true);
  });

  it("loads backend policy dynamically, rotates session without logout, clears mcp, and navigates to workspace", async () => {
    const { wrapper } = createTestWrapper();
    const { result } = renderHook(() => useForceChangePasswordViewModel(), { wrapper });

    await waitFor(() => expect(result.current.policy).toEqual(STRICT_POLICY));

    act(() => {
      result.current.setNewPassword("StrongPass#2026");
      result.current.setConfirmPassword("StrongPass#2026");
    });

    expect(result.current.canSubmit).toBe(true);

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(mocks.forceChangePassword).toHaveBeenCalledWith({
      newPassword: "StrongPass#2026",
      confirmPassword: "StrongPass#2026",
    });
    expect(mocks.refreshToken).toHaveBeenCalledTimes(1);
    expect(mocks.getCurrentPrincipal).toHaveBeenCalledTimes(1);
    expect(mocks.setAuth).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "adm-1",
        permissions: ["Identity.Users.Read", "Profile.Manage"],
      }),
      ["Identity.Users.Read", "Profile.Manage"],
      ["SuperAdmin"],
      false
    );
    expect(mocks.setMustChangePassword).toHaveBeenCalledWith(false);
    expect(mocks.clearRouteData).toHaveBeenCalledTimes(1);
    expect(mocks.resetNavigation).toHaveBeenCalledTimes(1);
    expect(mocks.logout).not.toHaveBeenCalled();
    expect(mocks.operationSuccess).toHaveBeenCalledWith("profile.security.passwordChanged");
    expect(mocks.replace).toHaveBeenCalledWith("/");
  });

  it("blocks submit without weak fallback when policy fails to load or passwords mismatch", async () => {
    mocks.getPasswordPolicy.mockRejectedValueOnce(new Error("Policy endpoint unavailable"));
    const { wrapper } = createTestWrapper();
    const { result } = renderHook(() => useForceChangePasswordViewModel(), { wrapper });

    await waitFor(() => expect(result.current.policyError).toBe("Policy endpoint unavailable"));

    act(() => {
      result.current.setNewPassword("StrongPass#2026");
      result.current.setConfirmPassword("StrongPass#2026");
    });

    expect(result.current.canSubmit).toBe(false);

    await act(async () => {
      await result.current.handleSubmit();
    });
    expect(mocks.forceChangePassword).not.toHaveBeenCalled();
    expect(result.current.submitError).toBe("Policy endpoint unavailable");
  });

  it("allows explicit sign-out from the wrong-account recovery button and revokes server refresh cookie first", async () => {
    const callOrder: string[] = [];
    mocks.authLogout.mockImplementation(async () => {
      callOrder.push("authRepository.logout");
    });
    mocks.logout.mockImplementation(() => {
      callOrder.push("store.logout");
    });
    mocks.replace.mockImplementation(() => {
      callOrder.push("router.replace");
    });

    const { wrapper, client } = createTestWrapper();
    vi.spyOn(client, "clear").mockImplementation(() => {
      callOrder.push("queryClient.clear");
    });

    const { result } = renderHook(() => useForceChangePasswordViewModel(), { wrapper });

    await act(async () => {
      await result.current.handleLogout();
    });

    expect(mocks.authLogout).toHaveBeenCalledTimes(1);
    expect(mocks.logout).toHaveBeenCalledTimes(1);
    expect(mocks.replace).toHaveBeenCalledWith("/login");
    expect(callOrder).toEqual([
      "authRepository.logout",
      "store.logout",
      "queryClient.clear",
      "router.replace",
    ]);
  });

  it("still clears local auth state and redirects to /login when authRepository.logout fails", async () => {
    mocks.authLogout.mockRejectedValueOnce(new Error("Network failure"));

    const { wrapper, client } = createTestWrapper();
    const clearSpy = vi.spyOn(client, "clear");
    const { result } = renderHook(() => useForceChangePasswordViewModel(), { wrapper });

    await act(async () => {
      await result.current.handleLogout();
    });

    expect(mocks.authLogout).toHaveBeenCalledTimes(1);
    expect(mocks.logout).toHaveBeenCalledTimes(1);
    expect(clearSpy).toHaveBeenCalledTimes(1);
    expect(mocks.replace).toHaveBeenCalledWith("/login");
  });
});
