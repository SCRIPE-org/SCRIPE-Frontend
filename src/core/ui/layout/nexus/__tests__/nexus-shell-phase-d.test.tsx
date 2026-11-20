import * as React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TooltipProvider } from "@core/ui/tooltip";
import { PageHeader } from "@core/ui/page-header";
import { Logo } from "@core/ui/logo";
import { LanguageSwitcher } from "@core/ui/layout/common/language-switcher";
import { NexusAppLauncher } from "../nexus-app-launcher";
import { NexusLayout } from "../nexus-layout";
import { NexusTopbar } from "../nexus-topbar";

let mockPathname = "/venue/resources";
let mockIsHubMode = false;
let mockDirection: "ltr" | "rtl" = "ltr";
let mockLanguage: "en" | "ar" = "en";
let mockLogoType: "sparkles" | "shield" | "image" = "sparkles";
let mockLogoIcon = "sparkles";
let mockTenantLogoUrl: string | null = null;

const mockSwitchWorkspace = vi.fn();
const mockTogglePin = vi.fn().mockResolvedValue(undefined);
const mockSetLanguage = vi.fn();
const mockPush = vi.fn();

const mockActiveWorkspace = {
  workspaceKey: "venue",
  workspaceNameEn: "Venue",
  workspaceNameAr: "المنشآت",
  abbreviation: "VN",
  icon: "Building2",
  isLocked: false,
  isPinned: true,
  isModuleWorkspace: true,
  isAdminWorkspace: false,
  homeRoute: "/venue",
  defaultHref: "/venue",
  displayOrder: 1,
  getLocalizedName: (lang: string) => (lang === "ar" ? "المنشآت" : "Venue"),
};

const mockOtherWorkspace = {
  workspaceKey: "academy",
  workspaceNameEn: "Academy",
  workspaceNameAr: "الأكاديمية",
  abbreviation: "AC",
  icon: "GraduationCap",
  isLocked: false,
  isPinned: false,
  isModuleWorkspace: true,
  isAdminWorkspace: false,
  homeRoute: "/academy",
  defaultHref: "/academy",
  displayOrder: 2,
  getLocalizedName: (lang: string) => (lang === "ar" ? "الأكاديمية" : "Academy"),
};

const mockLockedWorkspace = {
  workspaceKey: "crm",
  workspaceNameEn: "CRM",
  workspaceNameAr: "علاقات العملاء",
  abbreviation: "CR",
  icon: "Users",
  isLocked: true,
  isPinned: false,
  isModuleWorkspace: true,
  isAdminWorkspace: false,
  homeRoute: "/crm",
  defaultHref: "/crm",
  displayOrder: 3,
  getLocalizedName: (lang: string) => (lang === "ar" ? "علاقات العملاء" : "CRM"),
};

const mockRootMenu = [
  {
    id: "venue-spaces",
    slug: "venue-spaces",
    name: "Courts & Facilities",
    nameEn: "Courts & Facilities",
    nameAr: "الملاعب",
    href: "",
    icon: "LayoutGrid",
    order: 1,
    children: [
      {
        id: "venue-resources",
        slug: "venue-resources",
        name: "Courts & Spaces",
        nameEn: "Courts & Spaces",
        nameAr: "الملاعب والمساحات",
        href: "/venue/resources",
        icon: "MapPin",
        order: 1,
        children: [],
      },
    ],
  },
];

vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...rest
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

vi.mock("next/image", () => ({
  // Render standard img in unit tests so src & onError behave deterministically
  default: ({
    priority: _priority,
    unoptimized: _unoptimized,
    ...rest
  }: React.ImgHTMLAttributes<HTMLImageElement> & {
    priority?: boolean;
    unoptimized?: boolean;
  }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={rest.alt ?? ""} {...rest} />
  ),
}));

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    language: mockLanguage,
    direction: mockDirection,
    setLanguage: mockSetLanguage,
    t: (key: string, params?: Record<string, string | number>) =>
      params?.name ? `${key}:${params.name}` : key,
  }),
}));

vi.mock("@core/providers/settings-provider", () => ({
  useSettings: () => ({
    appName: "SCRIPE",
    showLogo: true,
    logoType: mockLogoType,
    logoText: "SCRIPE",
    logoIcon: mockLogoIcon,
    logoSize: "md",
    stickyHeader: true,
    showBreadcrumbs: true,
    showNotifications: true,
    collapsibleSidebar: true,
    sidebarCollapsed: false,
    darkCardStyle: "default",
    lightCardStyle: "default",
    colorScheme: "dark",
    updateSetting: vi.fn(),
  }),
}));

vi.mock("@core/providers/tenant-branding-provider", () => ({
  useTenantBranding: () => ({
    logoUrl: mockTenantLogoUrl,
    brandName: "SCRIPE",
  }),
}));

vi.mock("@core/providers/tenant-context-provider", () => ({
  useTenantContext: () => ({
    currentTenant: { id: "tenant-1", code: "AHLY" },
    isPlatformAdmin: false,
  }),
}));

vi.mock("@core/providers/workspace-provider", () => ({
  useWorkspace: () => ({
    activeWorkspace: mockActiveWorkspace,
    activeRootItem: mockRootMenu[0],
    rootMenuItems: mockRootMenu,
    isModuleMode: true,
    workspaceGroups: [mockActiveWorkspace, mockOtherWorkspace, mockLockedWorkspace],
    togglePin: mockTogglePin,
  }),
}));

vi.mock("@core/providers/permission-provider", () => ({
  usePermissions: () => ({
    canAccessPage: () => true,
  }),
}));

vi.mock("@core/store/useAppStore", () => ({
  useAppStore: (selector: (state: { tenantCode: string }) => unknown) =>
    selector({ tenantCode: "AHLY" }),
}));

vi.mock("@core/navigation/store/useNavigationStore", () => ({
  useNavigationStore: (
    selector?: (state: {
      isHubMode: boolean;
      activeWorkspaceKey: string | null;
      workspaceGroups: unknown[];
    }) => unknown
  ) => {
    const state = {
      isHubMode: mockIsHubMode,
      activeWorkspaceKey: mockIsHubMode ? null : "venue",
      workspaceGroups: mockIsHubMode
        ? []
        : [mockActiveWorkspace, mockOtherWorkspace, mockLockedWorkspace],
    };
    return selector ? selector(state) : state;
  },
}));

vi.mock("@modules/home", () => ({
  HubTopBar: () => <div data-testid="hub-topbar" />,
}));

vi.mock("@core/ui/user-profile-dropdown", () => ({
  UserProfileDropdown: () => <div data-testid="user-profile-dropdown" />,
}));

vi.mock("../_parts/nexus-footer", () => ({
  NexusFooter: () => <footer data-testid="nexus-footer" />,
}));

vi.mock("../nexus-primary-rail", () => ({
  NexusPrimaryRail: () => (
    <aside data-testid="nexus-primary-rail">
      <div data-testid="user-profile-dropdown" />
    </aside>
  ),
}));

vi.mock("../nexus-secondary-rail", () => ({
  NexusSecondaryRail: ({ mobileOpen }: { mobileOpen?: boolean }) => (
    <aside data-testid="nexus-secondary-rail" data-mobile-open={String(Boolean(mobileOpen))} />
  ),
}));

vi.mock("../nexus-search-palette", () => ({
  NexusSearchPalette: () => null,
}));

vi.mock("../nexus-workspace-loader", () => ({
  NexusWorkspaceLoader: () => null,
}));

vi.mock("../nexus-transition", () => ({
  NexusTransitionOverlay: () => null,
  useNexusReducedMotion: () => true,
}));

vi.mock("../use-workspace-transition", () => ({
  useWorkspaceTransition: () => ({
    loaderState: { show: false, workspaceName: "", workspaceAbbr: "" },
    handleLoaderExited: vi.fn(),
    switchWorkspace: mockSwitchWorkspace,
    goBackWorkspace: vi.fn(),
  }),
}));

vi.mock("@core/ui/layout/common", async () => {
  const actual = await vi.importActual<typeof import("@core/ui/layout/common")>(
    "@core/ui/layout/common"
  );
  return {
    ...actual,
    NxThemeSwitcher: () => (
      <button type="button" data-testid="nx-theme-switcher" aria-label="Theme" />
    ),
  };
});

describe("Nexus Shell Phase D — A11y, Hierarchy, Branding & Deduplication", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPathname = "/venue/resources";
    mockIsHubMode = false;
    mockDirection = "ltr";
    mockLanguage = "en";
    mockLogoType = "sparkles";
    mockLogoIcon = "sparkles";
    mockTenantLogoUrl = null;
  });

  describe("1. NexusLayout Skip Link & Main Landmark", () => {
    it("renders accessible skip-to-content link targeting #nexus-content in normal dual-rail mode", () => {
      render(
        <TooltipProvider>
          <NexusLayout>
            <div>Page Body</div>
          </NexusLayout>
        </TooltipProvider>
      );

      const skipLink = screen.getByRole("link", { name: "nav.skipToContent" });
      expect(skipLink).toHaveAttribute("href", "#nexus-content");
      expect(skipLink.className).toContain("sr-only");
      expect(skipLink.className).toContain("focus:not-sr-only");
      expect(skipLink.className).toContain("bg-nx-accent-fill");

      const main = screen.getByRole("main");
      expect(main).toHaveAttribute("id", "nexus-content");
      expect(main).toHaveAttribute("tabindex", "-1");
    });

    it("also renders accessible skip link and <main id='nexus-content' tabIndex={-1}> in Hub Mode", () => {
      mockIsHubMode = true;
      mockPathname = "/hub";
      render(
        <TooltipProvider>
          <NexusLayout>
            <div>Hub Body</div>
          </NexusLayout>
        </TooltipProvider>
      );

      const skipLink = screen.getByRole("link", { name: "nav.skipToContent" });
      expect(skipLink).toHaveAttribute("href", "#nexus-content");

      const main = screen.getByRole("main");
      expect(main).toHaveAttribute("id", "nexus-content");
      expect(main).toHaveAttribute("tabindex", "-1");
      expect(screen.getByTestId("hub-topbar")).toBeInTheDocument();
    });
  });

  describe("2. NexusTopbar Single-Source Identity, Panel Toggle & Search Controls", () => {
    it("does not duplicate UserProfileDropdown in topbar and preserves accessible search & toggle controls", () => {
      render(
        <TooltipProvider>
          <NexusTopbar
            onMobileMenuOpen={vi.fn()}
            onTogglePanel={vi.fn()}
            isPanelCollapsed={false}
            isMobileMenuOpen={false}
            onOpenSearch={vi.fn()}
          />
        </TooltipProvider>
      );

      // Identity dropdown lives solely in NexusPrimaryRail — never duplicated in NexusTopbar
      expect(screen.queryByTestId("user-profile-dropdown")).toBeNull();

      // Panel toggle reflects expanded desktop panel state and uses subdued resting ink
      const toggleBtn = screen.getByRole("button", { name: "navigation.togglePanel" });
      expect(toggleBtn).toHaveAttribute("aria-expanded", "true");
      expect(toggleBtn.className).toContain("text-nx-ink-2");
      expect(toggleBtn.className).toContain("h-9");
      expect(toggleBtn.className).toContain("w-9");

      // Search renders both desktop command bar and mobile quick-trigger icon button
      const searchTriggers = screen.getAllByRole("button", {
        name: /navigation\.searchPlaceholder/i,
      });
      expect(searchTriggers.length).toBeGreaterThanOrEqual(2);
    });

    it("renders non-clipping LanguageSwitcher trigger with >=36px hit target", () => {
      render(
        <TooltipProvider>
          <LanguageSwitcher buttonClassName="h-9 min-w-[36px] px-2" />
        </TooltipProvider>
      );

      const trigger = screen.getByRole("button", { name: "chrome.language.change" });
      expect(trigger.className).toContain("min-w-[36px]");
      expect(trigger.className).not.toContain("w-[46px]");
    });
  });

  describe("3. NexusAppLauncher Semantic Card Buttons & Keyboard Focus", () => {
    it("renders sibling card and pin <button> controls (zero nested buttons) and closes on Escape", async () => {
      const opener = document.createElement("button");
      opener.textContent = "Launcher Opener";
      document.body.appendChild(opener);
      opener.focus();

      const onOpenChange = vi.fn();

      const { rerender } = render(
        <TooltipProvider>
          <NexusAppLauncher open={true} onOpenChange={onOpenChange} />
        </TooltipProvider>
      );

      const dialog = screen.getByTestId("nexus-app-launcher");
      expect(dialog).toHaveAttribute("role", "dialog");
      expect(dialog).toHaveAttribute("aria-modal", "true");

      // Verify zero interactive element is nested inside another button or [role='button']
      const buttons = Array.from(dialog.querySelectorAll("button"));
      expect(buttons.length).toBeGreaterThan(2);
      for (const btn of buttons) {
        expect(btn.querySelector("button, [role='button'], a[href]")).toBeNull();
      }

      // Shift+Tab while dialog container itself holds focus wraps cleanly to last focusable control
      dialog.focus();
      expect(document.activeElement).toBe(dialog);
      fireEvent.keyDown(dialog, { key: "Tab", shiftKey: true });
      expect(document.activeElement).toBe(buttons[buttons.length - 1]);

      // Sibling pin action works cleanly without invoking switchWorkspace
      const pinButtons = screen.getAllByRole("button", {
        name: "shell.launcher.pin",
      });
      expect(pinButtons.length).toBeGreaterThanOrEqual(1);
      await act(async () => {
        fireEvent.click(pinButtons[0]);
      });
      expect(mockTogglePin).toHaveBeenCalled();
      expect(mockSwitchWorkspace).not.toHaveBeenCalled();

      // Pre-prevented Escape is respected
      const prevented = new KeyboardEvent("keydown", { key: "Escape", cancelable: true });
      prevented.preventDefault();
      await act(async () => {
        document.dispatchEvent(prevented);
      });
      expect(onOpenChange).not.toHaveBeenCalled();

      // Normal Escape closes launcher & open=false restores focus to opener
      await act(async () => {
        fireEvent.keyDown(document, { key: "Escape" });
      });
      expect(onOpenChange).toHaveBeenCalledWith(false);

      rerender(
        <TooltipProvider>
          <NexusAppLauncher open={false} onOpenChange={onOpenChange} />
        </TooltipProvider>
      );
      expect(document.activeElement).toBe(opener);

      opener.remove();
    });
  });

  describe("4. PageHeader Heading Wrapping & Logo Brand Fallback", () => {
    it("allows PageHeader <h1> to wrap cleanly without premature truncate clipping", () => {
      render(
        <PageHeader
          title="Multi-Tenant Sports Complex Operational Command Center"
          description="Manage courts, bookings, and scheduling rules"
          actions={<button type="button">New Resource</button>}
        />
      );

      const heading = screen.getByRole("heading", { level: 1 });
      expect(heading.className).not.toContain("truncate");
      expect(heading.className).toContain("break-words");
    });

    it("renders /brand/app-logo.svg default mark (not Sparkles/Shield icons) and falls back cleanly on image error", () => {
      mockLogoType = "sparkles";
      mockLogoIcon = "sparkles";
      const { rerender } = render(<Logo disableLink />);

      const brandImg = screen.getByAltText("SCRIPE");
      expect(brandImg).toHaveAttribute("src", "/brand/app-logo.svg");

      // External tenant logo error must fall back to /brand/app-logo.svg instead of display:none
      mockLogoType = "image";
      mockTenantLogoUrl = "https://cdn.example.com/missing-logo.png";
      rerender(<Logo disableLink />);

      const tenantImg = screen.getByAltText("SCRIPE");
      expect(tenantImg).toHaveAttribute("src", "https://cdn.example.com/missing-logo.png");
      fireEvent.error(tenantImg);

      const fallbackImg = screen.getByAltText("SCRIPE");
      expect(fallbackImg).toHaveAttribute("src", "/brand/app-logo.svg");
      expect(fallbackImg).not.toHaveStyle({ display: "none" });
    });
  });
});
