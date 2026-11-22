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
let mockCanSwitchContext = false;
let mockActiveTenantId: string | null = "tenant-1";
let mockDirection: "ltr" | "rtl" = "ltr";
let mockLanguage: "en" | "ar" = "en";
let mockLogoType: "sparkles" | "shield" | "image" = "sparkles";
let mockLogoIcon = "sparkles";
let mockTenantLogoUrl: string | null = null;

const mockSwitchWorkspace = vi.fn();
const mockTogglePin = vi.fn().mockResolvedValue(undefined);
const mockSetLanguage = vi.fn();
const mockPush = vi.fn();
const mockStartRoutingProgress = vi.fn();

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
  isTenantOnly: true,
  contextScope: "TenantOnly",
  lockReason: "TenantContextRequired",
  homeRoute: "/crm",
  defaultHref: "/crm",
  displayOrder: 3,
  getLocalizedName: (lang: string) => (lang === "ar" ? "علاقات العملاء" : "CRM"),
};

const mockAdminWorkspace = {
  workspaceKey: "admin",
  workspaceNameEn: "Administration",
  workspaceNameAr: "الإدارة",
  abbreviation: "AD",
  icon: "Shield",
  isLocked: false,
  isPinned: true,
  isModuleWorkspace: false,
  isAdminWorkspace: true,
  isTenantOnly: false,
  contextScope: "Both",
  lockReason: "None",
  homeRoute: "/overview",
  defaultHref: "/overview",
  displayOrder: 0,
  getLocalizedName: (lang: string) => (lang === "ar" ? "الإدارة" : "Administration"),
};

let mockWorkspaceGroups: Array<Record<string, unknown>> = [
  mockActiveWorkspace,
  mockOtherWorkspace,
  mockLockedWorkspace,
];

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
    activeWorkspace: mockIsHubMode ? null : mockActiveWorkspace,
    activeRootItem: mockIsHubMode ? null : mockRootMenu[0],
    rootMenuItems: mockIsHubMode ? [] : mockRootMenu,
    isModuleMode: !mockIsHubMode,
    workspaceGroups: mockWorkspaceGroups,
    togglePin: mockTogglePin,
  }),
}));

vi.mock("@core/providers/permission-provider", () => ({
  usePermissions: () => ({
    canAccessPage: () => true,
    hasPermission: () => mockCanSwitchContext,
  }),
}));

vi.mock("@core/hooks/useAdminContext", () => ({
  useAdminContext: () => ({
    activeTenantId: mockActiveTenantId,
    activeTenantName: mockActiveTenantId ? "Al Ahly SC" : null,
    isPlatform: mockActiveTenantId === null,
  }),
}));

vi.mock("@core/components/tenant-context", () => ({
  TenantContextSwitcherDialog: ({ open }: { open: boolean }) =>
    open ? <div data-testid="tenant-switcher-dialog" /> : null,
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
      workspaceGroups: mockWorkspaceGroups,
    };
    return selector ? selector(state) : state;
  },
}));

vi.mock("@core/ui/user-profile-dropdown", () => ({
  UserProfileDropdown: () => <div data-testid="user-profile-dropdown" />,
}));

vi.mock("@core/ui/routing-progress-bar", () => ({
  startRoutingProgress: (...args: unknown[]) => mockStartRoutingProgress(...args),
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
  NexusSecondaryRail: ({
    mobileOpen,
    isCollapsed,
  }: {
    mobileOpen?: boolean;
    isCollapsed?: boolean;
  }) => (
    <aside
      data-testid="nexus-secondary-rail"
      data-mobile-open={String(Boolean(mobileOpen))}
      data-collapsed={String(Boolean(isCollapsed))}
    />
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

describe("Nexus Shell — Accessibility, Hierarchy, Branding & Deduplication", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPathname = "/venue/resources";
    mockIsHubMode = false;
    mockCanSwitchContext = false;
    mockActiveTenantId = "tenant-1";
    mockWorkspaceGroups = [mockActiveWorkspace, mockOtherWorkspace, mockLockedWorkspace];
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

    it("renders /hub inside unified NexusLayout with single <main id='nexus-content'>, collapsed secondary rail, and zero HubTopBar/HubFooter", () => {
      mockIsHubMode = true;
      mockPathname = "/hub";
      const { container } = render(
        <TooltipProvider>
          <NexusLayout>
            <div>Hub Body</div>
          </NexusLayout>
        </TooltipProvider>
      );

      const skipLink = screen.getByRole("link", { name: "nav.skipToContent" });
      expect(skipLink).toHaveAttribute("href", "#nexus-content");

      const mains = screen.getAllByRole("main");
      expect(mains).toHaveLength(1);
      expect(mains[0]).toHaveAttribute("id", "nexus-content");
      expect(mains[0]).toHaveAttribute("tabindex", "-1");

      // Unified Nexus shell chrome renders instead of orphan HubTopBar/HubFooter
      expect(screen.getByTestId("nexus-primary-rail")).toBeInTheDocument();
      expect(container.querySelector("[data-nexus-topbar]")).toBeInTheDocument();
      expect(screen.getByTestId("nexus-secondary-rail")).toHaveAttribute("data-collapsed", "true");
      expect(screen.queryByTestId("hub-topbar")).toBeNull();
      expect(screen.queryByTestId("hub-footer")).toBeNull();
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

    it("renders interactive TopbarContextPill on mobile (<640px) when canSwitchContext is true and opens switcher dialog", () => {
      mockCanSwitchContext = true;
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

      const switcherTrigger = screen.getByTestId("topbar-tenant-switcher-trigger");
      expect(switcherTrigger.className).toContain("inline-flex");
      expect(switcherTrigger.className).not.toContain("hidden");

      fireEvent.click(switcherTrigger);
      expect(screen.getByTestId("tenant-switcher-dialog")).toBeInTheDocument();
    });

    it("uses !rounded-full and compact mobile width cap on TopbarContextPill, preserves Level-1 <li> with shrink-0, and allows deeper crumbs to shrink", () => {
      mockCanSwitchContext = true;
      mockPathname = "/venue/resources";
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

      const switcherTrigger = screen.getByTestId("topbar-tenant-switcher-trigger");
      expect(switcherTrigger.className).toContain("!rounded-full");
      expect(switcherTrigger.className).toContain("max-w-[100px]");

      const breadcrumbNav = screen.getByRole("navigation", { name: "nav.breadcrumb" });
      const firstCrumbItem = breadcrumbNav.querySelector("ol > li");
      expect(firstCrumbItem).not.toBeNull();
      expect(firstCrumbItem!.getAttribute("class")).toContain("min-w-0");
      expect(firstCrumbItem!.getAttribute("class")).toContain("shrink-0");

      const lastCrumbItem = breadcrumbNav.querySelector("ol > li:last-child");
      expect(lastCrumbItem).not.toBeNull();
      expect(lastCrumbItem!.getAttribute("class")).toContain("min-w-0");
      expect(lastCrumbItem!.getAttribute("class")).toContain("shrink");
      expect(lastCrumbItem!.getAttribute("class")).toContain("max-w-[120px]");
    });

    it("hides TopbarHomeButton on /hub when activeWorkspace is null and skips startRoutingProgress/router.push on already-/hub Level-1 click", () => {
      mockIsHubMode = true;
      mockPathname = "/hub";
      const { rerender } = render(
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

      expect(screen.queryByRole("button", { name: "chrome.goToHome" })).toBeNull();

      const hubCrumbBtn = screen
        .getByRole("navigation", { name: "nav.breadcrumb" })
        .querySelector("ol > li button");
      expect(hubCrumbBtn).not.toBeNull();
      fireEvent.click(hubCrumbBtn!);

      expect(mockStartRoutingProgress).not.toHaveBeenCalled();
      expect(mockPush).not.toHaveBeenCalled();

      // From a non-/hub null-workspace route, clicking the Level-1 crumb navigates to /hub
      mockPathname = "/profile";
      rerender(
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

      const nonHubCrumbBtn = screen
        .getByRole("navigation", { name: "nav.breadcrumb" })
        .querySelector("ol > li button");
      expect(nonHubCrumbBtn).not.toBeNull();
      fireEvent.click(nonHubCrumbBtn!);

      expect(mockStartRoutingProgress).toHaveBeenCalledTimes(1);
      expect(mockPush).toHaveBeenCalledWith("/hub");
    });

    it("keeps TopbarPanelToggle visible on mobile (<768px) via md:hidden even when !hasSubmenu", () => {
      mockIsHubMode = true;
      mockPathname = "/hub";
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

      const toggleBtn = screen.getByRole("button", { name: "navigation.togglePanel" });
      expect(toggleBtn.className).toContain("md:hidden");
      expect(toggleBtn.className).not.toBe(
        toggleBtn.className.replace("flex md:hidden", "")
      );
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

    it("hides TenantOnly and locked upgrade workspaces from NexusAppLauncher in Platform context while keeping launcher operational", () => {
      mockActiveTenantId = null;
      mockIsHubMode = true;
      mockWorkspaceGroups = [
        mockAdminWorkspace,
        { ...mockOtherWorkspace, isTenantOnly: true, contextScope: "TenantOnly" },
        mockLockedWorkspace,
      ];

      render(
        <TooltipProvider>
          <NexusAppLauncher open={true} onOpenChange={vi.fn()} />
        </TooltipProvider>
      );

      const launcher = screen.getByTestId("nexus-app-launcher");
      expect(launcher).toHaveTextContent("Administration");
      expect(launcher).not.toHaveTextContent("Academy");
      expect(launcher).not.toHaveTextContent("CRM");
      expect(screen.queryByText("shell.launcher.legend.locked")).not.toBeInTheDocument();
    });

    it("renders UpgradeDialog via standard @core/ui/dialog and dismisses it on outside click without closing NexusAppLauncher", async () => {
      const onOpenChange = vi.fn();

      render(
        <TooltipProvider>
          <NexusAppLauncher open={true} onOpenChange={onOpenChange} />
        </TooltipProvider>
      );

      // Flush mount microtasks scheduled by NexusAppLauncher open effect before clicking
      await act(async () => {
        await Promise.resolve();
      });

      const crmBtn = screen.getByRole("button", { name: /^CRM/i });
      await act(async () => {
        fireEvent.click(crmBtn);
      });

      // Standard Dialog (role="dialog") — NOT AlertDialog
      const upgradeTitle = screen.getByText("shell.launcher.upgrade.title");
      const upgradeDialog = upgradeTitle.closest("[role='dialog']");
      expect(upgradeDialog).not.toBeNull();
      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
      expect(upgradeDialog?.querySelector("button span.sr-only")).toHaveTextContent("common.close");

      // Outside click (pointerDown + click outside DialogContent) closes UpgradeDialog cleanly
      await act(async () => {
        fireEvent.pointerDown(document.body, { button: 0 });
        fireEvent.click(document.body);
      });

      expect(screen.queryByText("shell.launcher.upgrade.title")).not.toBeInTheDocument();
      expect(screen.getByTestId("nexus-app-launcher")).toBeInTheDocument();
      expect(onOpenChange).not.toHaveBeenCalledWith(false);
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
