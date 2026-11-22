import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import AccountLayout from "../layout";
import { useSudoStore } from "@core/store/useSudoStore";
import { usePatOneTimeSecretStore } from "@core/store/usePatOneTimeSecretStore";
import { useAppStore } from "@core/store/useAppStore";
import { useNavigationStore } from "@core/navigation/store/useNavigationStore";

const { mockHandleLogout, mockRouterPush, mockStopImpersonation, mockBannerState } = vi.hoisted(() => ({
  mockHandleLogout: vi.fn(),
  mockRouterPush: vi.fn(),
  mockStopImpersonation: vi.fn(),
  mockBannerState: {
    isImpersonating: false,
    activeTenantId: null as string | null,
    activeTenantName: null as string | null,
    isTenantOverride: false,
  },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockRouterPush, replace: vi.fn() }),
  usePathname: () => "/account/integrations",
}));

vi.mock("@core/providers/tenant-context-provider", () => ({
  useTenantContext: () => ({
    currentTenant: mockBannerState.activeTenantId
      ? { id: mockBannerState.activeTenantId, name: mockBannerState.activeTenantName ?? "Tenant" }
      : null,
    exitTenantWorld: vi.fn(),
  }),
}));

vi.mock("@core/hooks/useAdminContext", () => ({
  useAdminContext: () => ({
    activeTenantId: mockBannerState.activeTenantId,
    activeTenantName: mockBannerState.activeTenantName,
    isImpersonating: mockBannerState.isTenantOverride,
  }),
}));

vi.mock("@modules/auth/core/src/presentation/viewmodels/useImpersonation", () => ({
  useImpersonation: () => ({
    isImpersonating: mockBannerState.isImpersonating,
    stopImpersonation: mockStopImpersonation,
  }),
}));

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({ t: (key: string) => key, direction: "ltr" as const }),
}));

vi.mock("@modules/auth/core/src/presentation/viewmodels/useAuthLogout", () => ({
  useAuthLogout: () => ({
    logout: mockHandleLogout,
    handleLogout: mockHandleLogout,
    isLoading: false,
  }),
}));

vi.mock("@modules/profile/core/src/presentation/viewmodels/useSovereignAccountSlicesViewModel", () => ({
  useAccountPreferencesSliceViewModel: () => ({
    preferences: { broadcastPrivacyBlurDefault: false },
    updatePreferences: vi.fn(),
  }),
}));

vi.mock("@modules/profile/core/src/presentation/components/SovereignCommandBar", () => ({
  SovereignCommandBar: () => null,
}));

vi.mock("@core/ui/layout/common/language-switcher", () => ({
  LanguageSwitcher: () => null,
}));

vi.mock("@core/ui/layout/common/theme-switcher", () => ({
  NxThemeSwitcher: () => null,
}));

vi.mock("@core/ui/dropdown-menu", () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuItem: ({
    children,
    onClick,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
  }) => (
    <button type="button" onClick={onClick}>
      {children}
    </button>
  ),
  DropdownMenuLabel: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuSeparator: () => null,
}));

describe("AccountLayout Sign Out", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockBannerState.isImpersonating = false;
    mockBannerState.activeTenantId = null;
    mockBannerState.activeTenantName = null;
    mockBannerState.isTenantOverride = false;
    useNavigationStore.getState().reset();
    useAppStore.getState().setAuth(
      { id: "user-1", username: "seif", displayName: "Seif" } as never,
      [],
      [],
      true
    );
    useSudoStore.getState().markVerified({
      sudoToken: "sudo-jwt",
      expiresAtUtc: new Date(Date.now() + 300_000).toISOString(),
      methodUsed: "password",
    });
    usePatOneTimeSecretStore.getState().setPendingReceipt({
      tokenId: "pat-1",
      tokenName: "CI",
      plainTextSecret: "scr_pat_secret",
      fingerprintOrPrefix: "scr_pat",
      isRotated: false,
      ownerUserId: "user-1",
    });
  });

  it("resets sudo + PAT stores and delegates sign-out to useAuthLogout().handleLogout('/login')", () => {
    render(
      <AccountLayout>
        <div>Console body</div>
      </AccountLayout>
    );

    fireEvent.click(screen.getByText("profile.accountPortal.signOut"));

    expect(useSudoStore.getState().sudoToken).toBeNull();
    expect(useSudoStore.getState().isActive).toBe(false);
    expect(usePatOneTimeSecretStore.getState().pendingReceipt).toBeNull();
    expect(mockHandleLogout).toHaveBeenCalledWith("/login");
  });

  it("mounts TenantContextBanner so impersonation banner and Stop impersonating action are visible on /account/*", () => {
    mockBannerState.isImpersonating = true;

    render(
      <AccountLayout>
        <div>Console body</div>
      </AccountLayout>
    );

    expect(screen.getByText("chrome.tenantBanner.impersonating")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "chrome.tenantBanner.stopImpersonation" }));
    expect(mockStopImpersonation).toHaveBeenCalledTimes(1);
  });

  it("routes Back to Dashboard and brand link to resolved landingResolution route instead of hardcoded /overview", () => {
    useNavigationStore.setState({
      landingResolution: {
        targetKind: "workspace",
        route: "/venue",
        workspaceKey: "venue",
        sourceReason: "RoleDefault",
        isEnforced: false,
        enforcingRoleName: null,
        wasFallbackApplied: false,
        fallbackReason: null,
      },
    });

    const { container, rerender } = render(
      <AccountLayout>
        <div>Console body</div>
      </AccountLayout>
    );

    expect(container.querySelector('a[href="/venue"]')).not.toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "profile.accountPortal.backToDashboard" }));
    expect(mockRouterPush).toHaveBeenCalledWith("/venue");

    useNavigationStore.setState({ landingResolution: null });
    rerender(
      <AccountLayout>
        <div>Console body</div>
      </AccountLayout>
    );

    mockRouterPush.mockClear();
    expect(container.querySelector('a[href="/hub"]')).not.toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "profile.accountPortal.backToDashboard" }));
    expect(mockRouterPush).toHaveBeenCalledWith("/hub");
  });

  it("pins TenantContextBanner and data-account-topbar inside one opaque sticky chrome wrapper without double-offsetting header", () => {
    mockBannerState.isImpersonating = true;

    const { container } = render(
      <AccountLayout>
        <div>Console body</div>
      </AccountLayout>
    );

    const stickyChrome = container.querySelector('[data-account-sticky-chrome="true"]');
    const banner = screen.getByText("chrome.tenantBanner.impersonating");
    const header = container.querySelector('header[data-account-topbar="true"]');

    expect(stickyChrome).not.toBeNull();
    expect(stickyChrome?.className).toContain("sticky");
    expect(stickyChrome?.className).toContain("top-0");
    expect(stickyChrome?.className).toContain("z-header");
    expect(stickyChrome?.className).toContain("bg-nx-surface");
    expect(stickyChrome?.contains(banner)).toBe(true);
    expect(stickyChrome?.contains(header)).toBe(true);
    expect(header?.className).not.toContain("sticky");
  });
});
