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
    push: vi.fn(),
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

  it("renders one Set as start page button in RailHeader, saves menu:<slug>, patches store optimistically, toasts, and calls refreshNavigation", async () => {
    render(<NexusSecondaryRail />);

    const setBtn = screen.getByRole("button", { name: "Set as CRM start page" });
    expect(setBtn).toBeInTheDocument();
    expect(setBtn.querySelector("bdi")).toHaveTextContent("CRM");

    // Zero per-row start page buttons inside sidebar links
    expect(screen.getAllByRole("button", { name: /start page/i })).toHaveLength(1);

    fireEvent.click(setBtn);

    // Optimistic store update happened immediately before API resolve
    expect(
      useNavigationStore.getState().workspaceGroups[0].effectiveHomeSource
    ).toBe("PersonalOverride");
    expect(
      useNavigationStore.getState().workspaceGroups[0].effectiveHomeMenuSlug
    ).toBe("crm-accounts");

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

    fireEvent.click(screen.getByRole("button", { name: "Set as CRM start page" }));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Could not update workspace start page",
          variant: "destructive",
        })
      );
    });

    expect(
      useNavigationStore.getState().workspaceGroups[0].effectiveHomeSource
    ).toBe("WorkspaceHome");
    expect(
      useNavigationStore.getState().workspaceGroups[0].effectiveHomeMenuSlug
    ).toBe("crm-leads");
    expect(mockRefreshNavigation).not.toHaveBeenCalled();
  });

  it("shows Current start page badge and Reset to default when on a PersonalOverride start page", async () => {
    mockPathname = "/crm/accounts";
    mockActiveWorkspace = makeCrmWorkspace({
      effectiveHomeRoute: "/crm/accounts",
      effectiveHomeSource: "PersonalOverride",
      effectiveHomeMenuSlug: "crm-accounts",
      effectiveHomeLabelEn: "Accounts",
      effectiveHomeLabelAr: "الحسابات",
    });

    render(<NexusSecondaryRail />);

    expect(screen.getByText("Current start page")).toBeInTheDocument();
    const resetBtn = screen.getByRole("button", { name: "Reset to default" });
    expect(resetBtn).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Set as CRM start page" })
    ).not.toBeInTheDocument();

    fireEvent.click(resetBtn);

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

  it("shows Current start page badge without Reset when matching a non-custom start page", () => {
    mockPathname = "/crm/leads";
    mockActiveWorkspace = makeCrmWorkspace({
      effectiveHomeRoute: "/crm/leads",
      effectiveHomeSource: "RoleDefault",
      effectiveHomeMenuSlug: "crm-leads",
    });

    render(<NexusSecondaryRail />);

    expect(screen.getByText("Current start page")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Reset to default" })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Set as CRM start page" })
    ).not.toBeInTheDocument();
  });

  it("shows locked indicator for non-SuperAdmin when role enforces start page, while SuperAdmin remains immune", () => {
    mockActiveWorkspace = makeCrmWorkspace({
      isEffectiveHomeEnforced: true,
      enforcingRoleName: "Sales Director",
    });

    const { rerender } = render(<NexusSecondaryRail />);

    expect(
      screen.getByLabelText("Start page locked — Enforced by Sales Director")
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Set as CRM start page" })
    ).not.toBeInTheDocument();

    // Platform or Tenant SuperAdmin bypasses role lock cleanly
    mockIsTenantSuperAdmin = true;
    rerender(<NexusSecondaryRail />);
    expect(screen.getByRole("button", { name: "Set as CRM start page" })).toBeInTheDocument();
  });

  it("hides mutation controls when impersonating, on /hub, on dynamic [id] routes, or when workspace is locked", () => {
    sessionStorage.setItem(STORAGE_KEYS.IMPERSONATING, "true");
    const { rerender } = render(<NexusSecondaryRail />);
    expect(
      screen.queryByRole("button", { name: /start page/i })
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Current start page")).not.toBeInTheDocument();

    sessionStorage.removeItem(STORAGE_KEYS.IMPERSONATING);
    mockPathname = "/crm/accounts/12345";
    rerender(<NexusSecondaryRail />);
    expect(
      screen.queryByRole("button", { name: /start page/i })
    ).not.toBeInTheDocument();

    mockPathname = "/hub";
    rerender(<NexusSecondaryRail />);
    expect(
      screen.queryByRole("button", { name: /start page/i })
    ).not.toBeInTheDocument();

    mockPathname = "/crm/accounts";
    mockActiveWorkspace = makeCrmWorkspace({ isLocked: true });
    rerender(<NexusSecondaryRail />);
    expect(
      screen.queryByRole("button", { name: /start page/i })
    ).not.toBeInTheDocument();
  });

  it("renders localized Arabic RailHeader action label with bidi isolation and multi-line wrapping without truncation", () => {
    mockLanguage = "ar";
    mockActiveWorkspace = makeCrmWorkspace({
      workspaceNameAr: "إدارة علاقات العملاء",
    });
    render(<NexusSecondaryRail />);

    const arButton = screen.getByRole("button", {
      name: "تعيين كصفحة بداية إدارة علاقات العملاء",
    });
    expect(arButton).toBeInTheDocument();
    expect(arButton.className).toContain("!whitespace-normal");
    expect(arButton.className).toContain("h-auto");
    const labelSpan = arButton.querySelector("span");
    expect(labelSpan?.className).toContain("whitespace-normal");
    expect(labelSpan?.className).not.toContain("truncate");
    expect(arButton.querySelector("bdi")).toHaveTextContent("إدارة علاقات العملاء");
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
