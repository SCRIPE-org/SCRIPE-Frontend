import React from "react";
import { render, renderHook, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import "@testing-library/jest-dom";
import type { AdminProfile } from "../../domain/entities/AdminProfile";
import { ProfileRailLayout } from "../components/ProfileRailLayout";
import { AccountNotificationsView } from "../views/AccountNotificationsView";
import { useWorkstationPreferencesViewModel } from "../viewmodels/useWorkstationPreferencesViewModel";

vi.mock("../viewmodels/useSovereignAccountSlicesViewModel", () => ({
  sovereignAccountKeys: {
    preferences: () => ["sovereign-account", "preferences"],
  },
  useAccountNotificationsSliceViewModel: () => ({
    notifications: {
      quietHoursEnabled: true,
      quietHoursStartUtc: "22:00",
      quietHoursEndUtc: "07:00",
      categoryRules: [],
      recentNotifications: [],
      rowVersion: "1",
    },
    updateNotifications: vi.fn(),
    isUpdatingNotifications: false,
    sendTestNotification: vi.fn(),
    isSendingTestNotification: false,
    testNotificationSent: false,
    markNotificationAsRead: vi.fn(),
    markAllNotificationsAsRead: vi.fn(),
    deleteNotification: vi.fn(),
  }),
  useAccountPreferencesSliceViewModel: () => ({
    preferences: null,
    updatePreferences: vi.fn(),
    isUpdatingPreferences: false,
  }),
}));

vi.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({ invalidateQueries: vi.fn() }),
}));

vi.mock("next-themes", () => ({
  useTheme: () => ({ resolvedTheme: "dark", setTheme: vi.fn() }),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/account/dossier",
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string) => key,
    direction: "ltr" as const,
    language: "en" as const,
    isRtl: false,
    setLanguage: vi.fn(),
  }),
}));

vi.mock("@core/providers/settings-provider", () => ({
  useSettings: () => ({
    buttonStyle: "default",
    borderRadius: "default",
    animationLevel: "default",
  }),
}));

describe("Profile accessibility labels and workstation preference hardening", () => {
  beforeEach(() => {
    vi.mocked(localStorage.getItem).mockReset();
  });

  it("provides accessible labels for ProfileRailLayout switcher and AccountNotificationsView quiet hours", () => {
    const profile = {
      firstName: "Adel",
      lastName: "Moussa",
      username: "adel",
      staffCode: "STF-01",
      availableAcademies: [{ id: "ac-1", name: "Main Campus", isCurrent: true }],
    } as unknown as AdminProfile;

    render(
      <ProfileRailLayout profile={profile} selectedAcademyId="ac-1" onSwitchAcademy={vi.fn()}>
        <div>Body</div>
      </ProfileRailLayout>
    );
    expect(
      screen.getByRole("combobox", { name: "profile.rail.activeCampus" })
    ).toBeInTheDocument();

    render(<AccountNotificationsView />);
    expect(
      screen.getByRole("textbox", { name: /common\.from/i })
    ).toHaveValue("22:00");
    expect(
      screen.getByRole("textbox", { name: /common\.to/i })
    ).toHaveValue("07:00");
  });

  it("enforces scr_pref_accent allowlist validation in useWorkstationPreferencesViewModel", () => {
    vi.mocked(localStorage.getItem).mockImplementation((key) =>
      key === "scr_pref_accent" ? "injected-value" : null
    );
    const { result: tamperedResult } = renderHook(() => useWorkstationPreferencesViewModel());
    expect(tamperedResult.current.accent).toBe("signal-lime");

    vi.mocked(localStorage.getItem).mockImplementation((key) =>
      key === "scr_pref_accent" ? "electric-emerald" : null
    );
    const { result: validResult } = renderHook(() => useWorkstationPreferencesViewModel());
    expect(validResult.current.accent).toBe("electric-emerald");
  });
});
