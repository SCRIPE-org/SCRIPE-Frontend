import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import AccountLayout from "../layout";
import { useSudoStore } from "@core/store/useSudoStore";
import { usePatOneTimeSecretStore } from "@core/store/usePatOneTimeSecretStore";
import { useAppStore } from "@core/store/useAppStore";

const { mockHandleLogout } = vi.hoisted(() => ({
  mockHandleLogout: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => "/account/integrations",
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
});
