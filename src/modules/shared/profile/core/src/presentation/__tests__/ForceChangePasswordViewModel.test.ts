import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import {
  evaluatePasswordRules,
  useForceChangePasswordViewModel,
} from "../viewmodels/useForceChangePasswordViewModel";

const mocks = vi.hoisted(() => ({
  replace: vi.fn(),
  invalidateQueries: vi.fn().mockResolvedValue(undefined),
  clearQueries: vi.fn(),
  operationSuccess: vi.fn(),
  operationError: vi.fn(),
  forceChangePassword: vi.fn(),
  refreshToken: vi.fn(),
  getCurrentPrincipal: vi.fn(),
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

vi.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({
    invalidateQueries: mocks.invalidateQueries,
    clear: mocks.clearQueries,
  }),
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

describe("ForceChangePasswordViewModel (MMC First-Login Parity)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
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

  it("evaluates all 5 password complexity rules accurately with a 12-character minimum", () => {
    expect(evaluatePasswordRules("abc")).toEqual({
      minLength: false,
      uppercase: false,
      lowercase: true,
      number: false,
      special: false,
      allMet: false,
    });

    // 9 characters: meets complexity classes, but fails 12-character minimum
    expect(evaluatePasswordRules("Pass#2026")).toEqual({
      minLength: false,
      uppercase: true,
      lowercase: true,
      number: true,
      special: true,
      allMet: false,
    });

    // 11 characters: boundary just below 12 characters
    expect(evaluatePasswordRules("StrongP@ss1")).toEqual({
      minLength: false,
      uppercase: true,
      lowercase: true,
      number: true,
      special: true,
      allMet: false,
    });

    // 12 characters: exact threshold meets all rules
    expect(evaluatePasswordRules("StrongP@ss12")).toEqual({
      minLength: true,
      uppercase: true,
      lowercase: true,
      number: true,
      special: true,
      allMet: true,
    });

    expect(evaluatePasswordRules("StrongPass#2026")).toEqual({
      minLength: true,
      uppercase: true,
      lowercase: true,
      number: true,
      special: true,
      allMet: true,
    });
  });

  it("rotates password with only newPassword + confirmPassword, refreshes session without logout, clears mcp, and navigates to workspace", async () => {
    const { result } = renderHook(() => useForceChangePasswordViewModel());

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

  it("blocks submit when passwords mismatch or complexity rules fail", async () => {
    const { result } = renderHook(() => useForceChangePasswordViewModel());

    act(() => {
      result.current.setNewPassword("StrongPass#2026");
      result.current.setConfirmPassword("Different#2026");
    });

    expect(result.current.canSubmit).toBe(false);
    expect(result.current.showMismatch).toBe(true);

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(mocks.forceChangePassword).not.toHaveBeenCalled();
    expect(result.current.submitError).toBe("profile.security.passwordMismatch");
  });

  it("allows explicit sign-out from the wrong-account recovery button and revokes server refresh cookie first", async () => {
    const callOrder: string[] = [];
    mocks.authLogout.mockImplementation(async () => {
      callOrder.push("authRepository.logout");
    });
    mocks.logout.mockImplementation(() => {
      callOrder.push("store.logout");
    });
    mocks.clearQueries.mockImplementation(() => {
      callOrder.push("queryClient.clear");
    });
    mocks.replace.mockImplementation(() => {
      callOrder.push("router.replace");
    });

    const { result } = renderHook(() => useForceChangePasswordViewModel());

    await act(async () => {
      await result.current.handleLogout();
    });

    expect(mocks.authLogout).toHaveBeenCalledTimes(1);
    expect(mocks.logout).toHaveBeenCalledTimes(1);
    expect(mocks.clearQueries).toHaveBeenCalledTimes(1);
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

    const { result } = renderHook(() => useForceChangePasswordViewModel());

    await act(async () => {
      await result.current.handleLogout();
    });

    expect(mocks.authLogout).toHaveBeenCalledTimes(1);
    expect(mocks.logout).toHaveBeenCalledTimes(1);
    expect(mocks.clearQueries).toHaveBeenCalledTimes(1);
    expect(mocks.replace).toHaveBeenCalledWith("/login");
  });
});
