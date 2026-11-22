import * as React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { MenuItem } from "@core/navigation/domain/entities/MenuItem";
import {
  WorkspaceGroup,
  type WorkspaceGroupData,
} from "@core/navigation/domain/entities/WorkspaceGroup";
import { STORAGE_KEYS } from "@core/config/storage-keys";
import { useNavigationStore } from "@core/navigation/store/useNavigationStore";

const mockSetWorkspaceStartPage = vi.fn();
const mockResetWorkspaceStartPage = vi.fn();
const mockRefreshNavigation = vi.fn();
const mockRouterPush = vi.fn();
const mockToast = vi.fn();

let mockPathname = "/crm/accounts";
let mockLanguage: "en" | "ar" = "en";
let mockActiveWorkspace: WorkspaceGroup | null = null;
let mockActiveRootItem: MenuItem | null = null;
let mockRootMenuItems: MenuItem[] = [];
let mockIsSuperAdmin = false;
let mockIsPlatformSuperAdmin = false;
let mockIsTenantSuperAdmin = false;

vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
  useRouter: () => ({
    push: mockRouterPush,
    replace: vi.fn(),
  }),
}));

vi.mock("@core/di", () => ({
  getCoreContainer: () => ({
    navigationRepository: {
      setWorkspaceStartPage: mockSetWorkspaceStartPage,
      resetWorkspaceStartPage: mockResetWorkspaceStartPage,
    },
  }),
}));

vi.mock("@core/providers/workspace-provider", () => ({
  useWorkspace: () => ({
    activeWorkspace: mockActiveWorkspace,
    activeRootItem: mockActiveRootItem,
    rootMenuItems: mockRootMenuItems,
    isModuleMode: true,
    setActiveRootItemId: vi.fn(),
  }),
}));

vi.mock("@core/providers/navigation-provider", () => ({
  useOptionalNavigation: () => ({
    refreshNavigation: mockRefreshNavigation,
  }),
  useNavigation: () => ({
    refreshNavigation: mockRefreshNavigation,
  }),
}));

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    language: mockLanguage,
    direction: mockLanguage === "ar" ? "rtl" : "ltr",
    t: (key: string, params?: Record<string, string | number>) => {
      if (mockLanguage === "ar") {
        if (key === "chrome.setAsStartPage" && params) {
          return `تعيين كصفحة بداية ${params.workspace}`;
        }
        if (key === "chrome.currentStartPage") return "صفحة البداية الحالية";
        if (key === "chrome.resetStartPage") return "استعادة الافتراضي";
        if (key === "chrome.startPageLocked") return "صفحة البداية مقفولة";
        if (key === "chrome.workspaceOptions") return "خيارات مساحة العمل";
        if (key === "chrome.manageStartPages") return "إدارة صفحات البداية";
        if (key === "chrome.startPageIndicator") return "صفحة بداية مخصصة";
        if (key === "chrome.startPageEnforcedTooltip" && params) {
          return `مفروضة بواسطة دور ${params.role}`;
        }
        if (key === "chrome.startPageEnforcedGenericTooltip") return "مفروضة بواسطة سياسة الدور";
        if (key === "chrome.startPageSavedToast" && params) {
          return `أصبحت ${params.page} صفحة البداية لمساحة ${params.workspace}`;
        }
        if (key === "chrome.startPageResetToast" && params) {
          return `تمت استعادة صفحة البداية الافتراضية لمساحة ${params.workspace}`;
        }
        if (key === "chrome.startPageErrorToast") return "تعذر تحديث صفحة بداية مساحة العمل";
        return key;
      }

      if (key === "chrome.setAsStartPage" && params) {
        return `Set as ${params.workspace} start page`;
      }
      if (key === "chrome.currentStartPage") return "Current start page";
      if (key === "chrome.resetStartPage") return "Reset to default";
      if (key === "chrome.startPageLocked") return "Start page locked";
      if (key === "chrome.workspaceOptions") return "Workspace options";
      if (key === "chrome.manageStartPages") return "Manage start pages";
      if (key === "chrome.startPageIndicator") return "Custom start page";
      if (key === "chrome.startPageEnforcedTooltip" && params) {
        return `Enforced by ${params.role}`;
      }
      if (key === "chrome.startPageEnforcedGenericTooltip") return "Enforced by your role policy";
      if (key === "chrome.startPageSavedToast" && params) {
        return `${params.page} is now ${params.workspace}'s start page`;
      }
      if (key === "chrome.startPageResetToast" && params) {
        return `${params.workspace} start page reset to default`;
      }
      if (key === "chrome.startPageErrorToast") return "Could not update workspace start page";
      return key;
    },
  }),
}));

vi.mock("@core/providers/permission-provider", () => ({
  usePermissions: () => ({
    canAccessPage: () => true,
    isSuperAdmin: mockIsSuperAdmin,
    isPlatformSuperAdmin: mockIsPlatformSuperAdmin,
    isTenantSuperAdmin: mockIsTenantSuperAdmin,
  }),
}));

vi.mock("@core/hooks/use-enhanced-toast", () => ({
  toast: (...args: unknown[]) => mockToast(...args),
}));

vi.mock("../nexus-transition", () => ({
  useNexusReducedMotion: () => true,
}));

vi.mock("../nexus-layout", () => ({
  useWorkspaceTransitionContext: () => ({
    switchWorkspace: vi.fn(),
    goBackWorkspace: vi.fn(),
  }),
}));

import { NexusSecondaryRail } from "../nexus-secondary-rail";

function makeCrmWorkspace(overrides: Partial<WorkspaceGroupData> = {}): WorkspaceGroup {
  return new WorkspaceGroup({
    workspaceId: "ws-crm",
    workspaceKey: "crm",
    workspaceNameEn: "CRM",
    workspaceNameAr: "إدارة العملاء",
    workspaceIcon: "Briefcase",
    workspaceSortOrder: 2,
    colorHue: 200,
    colorChroma: 0.14,
    workspaceType: "Module",
    menuItems: [],
    isLocked: false,
    homeRoute: "/crm",
    platformHomeRoute: null,
    effectiveHomeRoute: "/crm/leads",
    effectiveHomeSource: "WorkspaceHome",
    effectiveHomeMenuSlug: "crm-leads",
    effectiveHomeLabelEn: "Leads",
    effectiveHomeLabelAr: "العملاء المحتملون",
    isEffectiveHomeEnforced: false,
    enforcingRoleName: null,
    isPinned: false,
    pinSortOrder: null,
    accessibleItemCount: 2,
    ...overrides,
  });
}

describe("NexusSecondaryRail RailHeader start-page toggle", () => {
  const initialStore = useNavigationStore.getState();

  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.removeItem(STORAGE_KEYS.IMPERSONATING);
    mockLanguage = "en";
    mockPathname = "/crm/accounts";
    mockIsSuperAdmin = false;
    mockIsPlatformSuperAdmin = false;
    mockIsTenantSuperAdmin = false;

    const leadsItem = new MenuItem({
      id: "crm-leads",
      slug: "crm-leads",
      name: "Leads",
      nameEn: "Leads",
      nameAr: "العملاء المحتملون",
      href: "/crm/leads",
      icon: "Users",
      order: 1,
      resource: "leads.view",
      actions: null,
      children: [],
    });
    const accountsItem = new MenuItem({
      id: "crm-accounts",
      slug: "crm-accounts",
      name: "Accounts",
      nameEn: "Accounts",
      nameAr: "الحسابات",
      href: "/crm/accounts",
      icon: "Building",
      order: 2,
      resource: "accounts.view",
      actions: null,
      children: [],
    });
    const rootGroup = new MenuItem({
      id: "crm-root",
      slug: "crm-root",
      name: "Sales Pipeline",
      nameEn: "Sales Pipeline",
      nameAr: "مسار المبيعات",
      href: "",
      icon: "Target",
      order: 1,
      resource: null,
      actions: null,
      children: [leadsItem, accountsItem],
    });

    mockActiveRootItem = rootGroup;
    mockRootMenuItems = [rootGroup];
    mockActiveWorkspace = makeCrmWorkspace();

    useNavigationStore.setState({
      ...initialStore,
      workspaceGroups: [mockActiveWorkspace],
      activeWorkspaceKey: "crm",
    });

    mockSetWorkspaceStartPage.mockResolvedValue({
      workspaceKey: "crm",
      contextKey: "tenant-1",
      target: "menu:crm-accounts",
      menuItemSlug: "crm-accounts",
      menuItemNameEn: "Accounts",
      menuItemNameAr: "الحسابات",
      route: "/crm/accounts",
      updatedAt: "2026-11-22T15:00:00Z",
    });
    mockResetWorkspaceStartPage.mockResolvedValue(undefined);
    mockRefreshNavigation.mockResolvedValue(undefined);
  });

  afterEach(() => {
    sessionStorage.removeItem(STORAGE_KEYS.IMPERSONATING);
    useNavigationStore.setState(initialStore, true);
  });

  function openWorkspaceOptionsMenu() {
    const trigger = screen.getByTestId("rail-workspace-options-trigger");
    fireEvent.pointerDown(trigger, { button: 0, ctrlKey: false });
    fireEvent.click(trigger);
    return trigger;
  }

  it("keeps RailHeader calm at rest and sets start page via quiet overflow menu with optimistic update & refresh", async () => {
    render(<NexusSecondaryRail />);

    // Quiet at rest: zero inline start-page badges/buttons polluting the sidebar
    expect(screen.queryByRole("button", { name: "Set as CRM start page" })).not.toBeInTheDocument();
    expect(screen.queryByText("Current start page")).not.toBeInTheDocument();

    openWorkspaceOptionsMenu();

    const setItem = await screen.findByRole("menuitem", { name: "Set as CRM start page" });
    expect(setItem).toBeInTheDocument();
    expect(setItem.querySelector("bdi")).toHaveTextContent("CRM");

    fireEvent.click(setItem);

    expect(useNavigationStore.getState().workspaceGroups[0].effectiveHomeSource).toBe(
      "PersonalOverride"
    );
    expect(useNavigationStore.getState().workspaceGroups[0].effectiveHomeMenuSlug).toBe(
      "crm-accounts"
    );

    await waitFor(() => {
      expect(mockSetWorkspaceStartPage).toHaveBeenCalledWith("crm", "menu:crm-accounts");
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Accounts is now CRM's start page",
          variant: "success",
        })
      );
      expect(mockRefreshNavigation).toHaveBeenCalledTimes(1);
    });
  });

  it("rolls back optimistic store update and shows destructive toast when setWorkspaceStartPage fails", async () => {
    mockSetWorkspaceStartPage.mockRejectedValueOnce(new Error("403 Enforced"));
    render(<NexusSecondaryRail />);

    openWorkspaceOptionsMenu();
    const setItem = await screen.findByRole("menuitem", { name: "Set as CRM start page" });
    fireEvent.click(setItem);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Could not update workspace start page",
          variant: "destructive",
        })
      );
    });

    expect(useNavigationStore.getState().workspaceGroups[0].effectiveHomeSource).toBe(
      "WorkspaceHome"
    );
    expect(useNavigationStore.getState().workspaceGroups[0].effectiveHomeMenuSlug).toBe(
      "crm-leads"
    );
    expect(mockRefreshNavigation).not.toHaveBeenCalled();
  });

  it("shows subtle trailing home icon on custom start-page leaf and exposes status + Reset + Manage in overflow menu", async () => {
    mockPathname = "/crm/accounts";
    mockActiveWorkspace = makeCrmWorkspace({
      effectiveHomeRoute: "/crm/accounts",
      effectiveHomeSource: "PersonalOverride",
      effectiveHomeMenuSlug: "crm-accounts",
      effectiveHomeLabelEn: "Accounts",
      effectiveHomeLabelAr: "الحسابات",
    });

    render(<NexusSecondaryRail />);

    // Subtle trailing icon marks the active custom start page without inline pill clutter
    expect(screen.getByLabelText("Custom start page")).toBeInTheDocument();
    expect(screen.queryByText("Current start page")).not.toBeInTheDocument();

    openWorkspaceOptionsMenu();

    expect(await screen.findByTestId("rail-start-page-status")).toHaveTextContent(
      "Current start page"
    );
    expect(screen.queryByRole("menuitem", { name: "Set as CRM start page" })).not.toBeInTheDocument();

    const resetItem = screen.getByRole("menuitem", { name: "Reset to default" });
    fireEvent.click(resetItem);

    await waitFor(() => {
      expect(mockResetWorkspaceStartPage).toHaveBeenCalledWith("crm");
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "CRM start page reset to default",
          variant: "success",
        })
      );
      expect(mockRefreshNavigation).toHaveBeenCalledTimes(1);
    });
  });

  it("shows current start page status without Reset when matching a non-custom start page, plus Manage start pages link", async () => {
    mockPathname = "/crm/leads";
    mockActiveWorkspace = makeCrmWorkspace({
      effectiveHomeRoute: "/crm/leads",
      effectiveHomeSource: "RoleDefault",
      effectiveHomeMenuSlug: "crm-leads",
    });

    render(<NexusSecondaryRail />);

    expect(screen.queryByLabelText("Custom start page")).not.toBeInTheDocument();
    openWorkspaceOptionsMenu();

    expect(await screen.findByTestId("rail-start-page-status")).toHaveTextContent(
      "Current start page"
    );
    expect(screen.queryByRole("menuitem", { name: "Reset to default" })).not.toBeInTheDocument();
    expect(screen.queryByRole("menuitem", { name: "Set as CRM start page" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("menuitem", { name: "Manage start pages" }));
    expect(mockRouterPush).toHaveBeenCalledWith("/account/preferences");
  });

  it("shows locked policy info inside overflow menu for non-SuperAdmin while SuperAdmin stays unlocked", async () => {
    mockActiveWorkspace = makeCrmWorkspace({
      isEffectiveHomeEnforced: true,
      enforcingRoleName: "Sales Director",
    });

    const { rerender } = render(<NexusSecondaryRail />);

    // Zero permanent lock badge clutter at rest
    expect(
      screen.queryByLabelText("Start page locked — Enforced by Sales Director")
    ).not.toBeInTheDocument();

    openWorkspaceOptionsMenu();

    expect(
      await screen.findByLabelText("Start page locked — Enforced by Sales Director")
    ).toBeInTheDocument();
    expect(screen.queryByRole("menuitem", { name: "Set as CRM start page" })).not.toBeInTheDocument();

    fireEvent.keyDown(document.activeElement ?? document.body, { key: "Escape" });

    mockIsTenantSuperAdmin = true;
    rerender(<NexusSecondaryRail />);
    openWorkspaceOptionsMenu();
    expect(await screen.findByRole("menuitem", { name: "Set as CRM start page" })).toBeInTheDocument();
  });

  it("hides overflow trigger when impersonating, on /hub, on dynamic [id] routes, or when workspace is locked", () => {
    sessionStorage.setItem(STORAGE_KEYS.IMPERSONATING, "true");
    const { rerender } = render(<NexusSecondaryRail />);
    expect(screen.queryByTestId("rail-workspace-options-trigger")).not.toBeInTheDocument();

    sessionStorage.removeItem(STORAGE_KEYS.IMPERSONATING);
    mockPathname = "/crm/accounts/12345";
    rerender(<NexusSecondaryRail />);
    expect(screen.queryByTestId("rail-workspace-options-trigger")).not.toBeInTheDocument();

    mockPathname = "/hub";
    rerender(<NexusSecondaryRail />);
    expect(screen.queryByTestId("rail-workspace-options-trigger")).not.toBeInTheDocument();

    mockPathname = "/crm/accounts";
    mockActiveWorkspace = makeCrmWorkspace({ isLocked: true });
    rerender(<NexusSecondaryRail />);
    expect(screen.queryByTestId("rail-workspace-options-trigger")).not.toBeInTheDocument();
  });

  it("deduplicates redundant context kicker when title already contains it, and renders Arabic overflow menu with bidi isolation", async () => {
    mockLanguage = "en";
    mockActiveWorkspace = makeCrmWorkspace({ workspaceNameEn: "CRM" });
    mockActiveRootItem = new MenuItem({
      id: "crm-ops",
      slug: "crm-ops",
      name: "CRM Operations",
      nameEn: "CRM Operations",
      nameAr: "عمليات إدارة علاقات العملاء",
      href: "",
      icon: "Handshake",
      order: 1,
      resource: null,
      actions: null,
      children: mockActiveRootItem?.children ?? [],
    });

    const { rerender } = render(<NexusSecondaryRail />);
    // "CRM" is already part of "CRM Operations", so redundant uppercase kicker is omitted
    expect(screen.queryByText(/^CRM$/i)).not.toBeInTheDocument();

    mockLanguage = "ar";
    mockActiveWorkspace = makeCrmWorkspace({
      workspaceNameAr: "إدارة علاقات العملاء",
    });
    rerender(<NexusSecondaryRail />);

    const trigger = openWorkspaceOptionsMenu();
    expect(trigger).toHaveAttribute("aria-label", "خيارات مساحة العمل");
    const arItem = await screen.findByRole("menuitem", {
      name: "تعيين كصفحة بداية إدارة علاقات العملاء",
    });
    expect(arItem.querySelector("bdi")).toHaveTextContent("إدارة علاقات العملاء");
  });

  it("renders mobile drawer on opaque bg-nx-surface with overflow-hidden, animation isolation, and full-width stacked App Launcher & All Workspaces actions", () => {
    mockLanguage = "ar";
    render(
      <NexusSecondaryRail
        mobileOpen
        onMobileClose={vi.fn()}
        onOpenAppLauncher={vi.fn()}
        mobileFooter={<div>Account Footer</div>}
      />
    );

    const drawer = screen.getByRole("dialog");
    expect(drawer).toHaveAttribute("data-nexus-mobile-drawer", "true");
    expect(drawer.className).toContain("bg-nx-surface");
    expect(drawer.className).toContain("overflow-hidden");
    expect(drawer.className).not.toContain("bg-nx-popover");

    const launcherBtn = screen.getByRole("button", { name: "shell.launcher.title" });
    const allWorkspacesBtn = screen.getByRole("button", { name: "chrome.allWorkspaces" });

    expect(launcherBtn.parentElement?.className).toContain("flex-col");
    expect(launcherBtn.parentElement?.className).not.toContain("gap-2");
    expect(launcherBtn.className).toContain("w-full");
    expect(launcherBtn.className).toContain("!whitespace-normal");
    expect(launcherBtn.querySelector("span")?.className).not.toContain("truncate");

    expect(allWorkspacesBtn.className).toContain("w-full");
    expect(allWorkspacesBtn.className).toContain("!whitespace-normal");
    expect(allWorkspacesBtn.querySelector("span")?.className).not.toContain("truncate");
  });
});
