import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import "@testing-library/jest-dom";
import { WorkspaceGroup } from "@core/navigation/domain/entities/WorkspaceGroup";
import { MenuItem } from "@core/navigation/domain/entities/MenuItem";
import { NavigationData } from "@core/navigation/domain/entities/NavigationData";
import { STORAGE_KEYS } from "@core/config/storage-keys";
import { NexusSearchPalette } from "../nexus-search-palette";

const mockPush = vi.fn();
const mockSetActiveWorkspace = vi.fn();
const mockSetActiveRootItemId = vi.fn();
const mockRecordRecentWorkspace = vi.fn();
const mockSetWorkspaceStartPage = vi.fn();
const mockResetWorkspaceStartPage = vi.fn();
const mockRefreshNavigation = vi.fn();
const mockToast = vi.fn();

let mockLanguage = "en";
let mockPathname = "/venue/courts";
let mockWorkspaceGroups: WorkspaceGroup[] = [];
let mockActiveWorkspace: WorkspaceGroup | null = null;
let mockActiveRootItem: MenuItem | null = null;
let mockRootMenuItems: MenuItem[] = [];
let mockCachedWorkspaces = new Map<string, NavigationData>();
let mockRouteDescriptors = new Map<
  string,
  {
    route: string;
    accessState: "authorized" | "tenant_context_required" | "platform_context_required" | "feature_disabled";
    workspaceKey?: string | null;
    requiresTenantContext: boolean;
  }
>();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => mockPathname,
}));

vi.mock("@core/di", () => ({
  getCoreContainer: () => ({
    navigationRepository: {
      setWorkspaceStartPage: mockSetWorkspaceStartPage,
      resetWorkspaceStartPage: mockResetWorkspaceStartPage,
    },
  }),
}));

vi.mock("@core/providers/navigation-provider", () => ({
  useOptionalNavigation: () => ({
    refreshNavigation: mockRefreshNavigation,
  }),
}));

vi.mock("@core/providers/permission-provider", () => ({
  usePermissions: () => ({
    canAccessPage: () => true,
    isSuperAdmin: false,
    isPlatformSuperAdmin: false,
    isTenantSuperAdmin: false,
  }),
}));

vi.mock("@core/hooks/use-enhanced-toast", () => ({
  toast: (...args: unknown[]) => mockToast(...args),
}));

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string, params?: Record<string, string | number>) => mockTranslate(key, params),
    language: mockLanguage,
    direction: mockLanguage === "ar" ? "rtl" : "ltr",
  }),
}));

let mockTranslate = (key: string, params?: Record<string, string | number>) =>
  params ? `${key}:${JSON.stringify(params)}` : key;

vi.mock("@core/providers/workspace-provider", () => ({
  useWorkspace: () => ({
    workspaceGroups: mockWorkspaceGroups,
    activeWorkspace: mockActiveWorkspace,
    activeRootItem: mockActiveRootItem,
    rootMenuItems: mockRootMenuItems,
    setActiveWorkspace: mockSetActiveWorkspace,
    setActiveRootItemId: mockSetActiveRootItemId,
  }),
}));

vi.mock("@core/navigation/store/useNavigationStore", () => ({
  useNavigationStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({
      workspaces: mockCachedWorkspaces,
      routeDescriptors: mockRouteDescriptors,
      contextKey: "tenant:demo",
      recordRecentWorkspace: mockRecordRecentWorkspace,
    }),
}));

vi.mock("@core/ui/routing-progress-bar", () => ({
  startRoutingProgress: vi.fn(),
}));

describe("NexusSearchPalette — unlocked workspaces, unhydrated routes & <bdi> isolation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.removeItem(STORAGE_KEYS.IMPERSONATING);
    mockLanguage = "ar";
    mockPathname = "/venue/courts";
    mockActiveWorkspace = null;
    mockActiveRootItem = null;
    mockRootMenuItems = [];
    mockTranslate = (key: string, params?: Record<string, string | number>) => {
      if (key === "chrome.setAsStartPage" && params) {
        return `Set as ${params.workspace} start page`;
      }
      if (key === "chrome.resetStartPage") return "Reset to default";
      if (key === "chrome.manageStartPages") return "Manage start pages";
      if (key === "chrome.paletteActionsGroup") return "Actions";
      return key;
    };
    mockSetWorkspaceStartPage.mockResolvedValue({
      workspaceKey: "venue",
      contextKey: "tenant:demo",
      target: "menu:venue-courts",
      menuItemSlug: "venue-courts",
      menuItemNameEn: "Courts",
      menuItemNameAr: "الملاعب",
      route: "/venue/courts",
      updatedAt: "2026-11-22T15:00:00Z",
    });
    mockResetWorkspaceStartPage.mockResolvedValue(undefined);
    mockRefreshNavigation.mockResolvedValue(undefined);
    mockCachedWorkspaces = new Map();
    mockRouteDescriptors = new Map([
      [
        "/academy/athletes",
        {
          route: "/academy/athletes",
          accessState: "authorized",
          workspaceKey: "academy",
          requiresTenantContext: true,
        },
      ],
    ]);

    const venueMenu = new MenuItem({
      id: "m-courts",
      slug: "venue-courts",
      name: "Courts",
      nameEn: "Courts",
      nameAr: "الملاعب",
      href: "/venue/courts",
      icon: "Calendar",
      order: 1,
      resource: "courts",
      actions: null,
      children: [],
    });

    mockWorkspaceGroups = [
      new WorkspaceGroup({
        workspaceId: "ws-venue",
        workspaceKey: "venue",
        workspaceNameEn: "Venue Ops",
        workspaceNameAr: "عمليات المنشآت",
        workspaceIcon: "Building2",
        workspaceSortOrder: 1,
        colorHue: 145,
        colorChroma: 0.14,
        workspaceType: "Module",
        menuItems: [venueMenu],
        isLocked: false,
        homeRoute: "/venue/courts",
        platformHomeRoute: null,
        effectiveHomeRoute: "/venue/courts",
        isPinned: true,
        pinSortOrder: 1,
        accessibleItemCount: 1,
      }),
      new WorkspaceGroup({
        workspaceId: "ws-academy",
        workspaceKey: "academy",
        workspaceNameEn: "Academy",
        workspaceNameAr: "الأكاديمية",
        workspaceIcon: "Users",
        workspaceSortOrder: 2,
        colorHue: 210,
        colorChroma: 0.12,
        workspaceType: "Module",
        menuItems: [],
        isLocked: false,
        homeRoute: "/academy/overview",
        platformHomeRoute: null,
        effectiveHomeRoute: "/academy/overview",
        isPinned: false,
        pinSortOrder: null,
        accessibleItemCount: 2,
      }),
      new WorkspaceGroup({
        workspaceId: "ws-locked",
        workspaceKey: "finance",
        workspaceNameEn: "Locked Finance",
        workspaceNameAr: "المالية المقفلة",
        workspaceIcon: "Wallet",
        workspaceSortOrder: 3,
        colorHue: 180,
        colorChroma: 0.12,
        workspaceType: "Module",
        menuItems: [],
        isLocked: true,
        homeRoute: "/finance",
        platformHomeRoute: null,
        effectiveHomeRoute: "/finance",
        isPinned: false,
        pinSortOrder: null,
        accessibleItemCount: 0,
      }),
    ];
  });

  it("indexes unlocked workspaces + unhydrated routeDescriptors, omits locked workspaces, and isolates routes in <bdi dir=\"ltr\">", () => {
    const onOpenChange = vi.fn();
    render(<NexusSearchPalette open={true} onOpenChange={onOpenChange} />);

    const venueRouteBadges = screen.getAllByText("/venue/courts");
    expect(venueRouteBadges.length).toBeGreaterThanOrEqual(1);
    for (const el of venueRouteBadges) {
      expect(el.closest("bdi")).toHaveAttribute("dir", "ltr");
    }
    expect(screen.getByText("/academy/athletes").closest("bdi")).toHaveAttribute("dir", "ltr");
    expect(screen.queryByText("Locked Finance")).not.toBeInTheDocument();

    const academyItem = screen.getByText("Athletes").closest("[cmdk-item]") as HTMLElement;
    fireEvent.click(academyItem);

    expect(mockSetActiveWorkspace).toHaveBeenCalledWith("academy");
    expect(mockRecordRecentWorkspace).toHaveBeenCalledWith("tenant:demo", "academy");
    expect(mockPush).toHaveBeenCalledWith("/academy/athletes");
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("deduplicates workspaceHref for unhydrated workspaces, localizes segments, and keeps parent context for generic leaves", () => {
    mockLanguage = "ar";
    mockTranslate = (key: string) => {
      const arMap: Record<string, string> = {
        "nav.routeSegments.venue": "المنشآت",
        "nav.routeSegments.bookings": "الحجوزات",
        "nav.routeSegments.new": "جديد",
        "nav.routeSegments.athletes": "الرياضيون",
      };
      return arMap[key] ?? key;
    };
    mockRouteDescriptors = new Map([
      [
        "/venue",
        {
          route: "/venue",
          accessState: "authorized",
          workspaceKey: "venue",
          requiresTenantContext: true,
        },
      ],
      [
        "/venue/bookings/new",
        {
          route: "/venue/bookings/new",
          accessState: "authorized",
          workspaceKey: "venue",
          requiresTenantContext: true,
        },
      ],
      [
        "/academy/athletes",
        {
          route: "/academy/athletes",
          accessState: "authorized",
          workspaceKey: "academy",
          requiresTenantContext: true,
        },
      ],
    ]);

    mockWorkspaceGroups = [
      new WorkspaceGroup({
        workspaceId: "ws-venue-unhydrated",
        workspaceKey: "venue",
        workspaceNameEn: "Venue",
        workspaceNameAr: "المنشآت",
        workspaceIcon: "Building2",
        workspaceSortOrder: 1,
        colorHue: 145,
        colorChroma: 0.14,
        workspaceType: "Module",
        menuItems: [],
        isLocked: false,
        homeRoute: "/venue",
        platformHomeRoute: null,
        effectiveHomeRoute: "/venue",
        isPinned: false,
        pinSortOrder: null,
        accessibleItemCount: 2,
      }),
      mockWorkspaceGroups[1],
    ];

    render(<NexusSearchPalette open={true} onOpenChange={vi.fn()} />);

    // Unhydrated workspace homeRoute (/venue) must appear only once, never duplicated by descriptor entry
    expect(screen.getAllByText("/venue")).toHaveLength(1);
    // Generic leaf /venue/bookings/new renders localized parent context ("الحجوزات / جديد") instead of bare "New"
    expect(screen.getByText("الحجوزات")).toBeInTheDocument();
    expect(screen.getByText("جديد")).toBeInTheDocument();
    // Localized route leaf replaces English raw segment in Arabic
    expect(screen.getByText("الرياضيون")).toBeInTheDocument();
  });

  afterEach(() => {
    sessionStorage.removeItem(STORAGE_KEYS.IMPERSONATING);
  });

  it("exposes start-page set/reset/manage commands in Command Palette and hides them during impersonation", async () => {
    mockLanguage = "en";
    mockPathname = "/venue/courts";
    const activeGroup = mockWorkspaceGroups[0];
    mockActiveWorkspace = new WorkspaceGroup({
      workspaceId: "ws-venue",
      workspaceKey: "venue",
      workspaceNameEn: "Venue Ops",
      workspaceNameAr: "عمليات المنشآت",
      workspaceIcon: "Building2",
      workspaceSortOrder: 1,
      colorHue: 145,
      colorChroma: 0.14,
      workspaceType: "Module",
      menuItems: activeGroup.menuItems,
      isLocked: false,
      homeRoute: "/venue",
      platformHomeRoute: null,
      effectiveHomeRoute: "/venue",
      effectiveHomeSource: "WorkspaceHome",
      effectiveHomeMenuSlug: null,
      isPinned: true,
      pinSortOrder: 1,
      accessibleItemCount: 1,
    });
    mockRootMenuItems = activeGroup.menuItems;

    const onOpenChange = vi.fn();
    const { rerender } = render(<NexusSearchPalette open={true} onOpenChange={onOpenChange} />);

    const setAction = screen.getByText("Set as Venue Ops start page").closest("[cmdk-item]") as HTMLElement;
    fireEvent.click(setAction);

    await waitFor(() => {
      expect(mockSetWorkspaceStartPage).toHaveBeenCalledWith("venue", "menu:venue-courts");
    });
    expect(onOpenChange).toHaveBeenCalledWith(false);

    // Manage start pages routes cleanly to /account/preferences
    const manageAction = screen.getByText("Manage start pages").closest("[cmdk-item]") as HTMLElement;
    fireEvent.click(manageAction);
    expect(mockPush).toHaveBeenCalledWith("/account/preferences");

    // PersonalOverride enables Reset to default
    mockActiveWorkspace = new WorkspaceGroup({
      ...activeGroup.toData(),
      effectiveHomeRoute: "/venue/courts",
      effectiveHomeSource: "PersonalOverride",
      effectiveHomeMenuSlug: "venue-courts",
    });
    rerender(<NexusSearchPalette open={true} onOpenChange={onOpenChange} />);
    const resetAction = screen.getByText("Reset to default").closest("[cmdk-item]") as HTMLElement;
    fireEvent.click(resetAction);
    await waitFor(() => {
      expect(mockResetWorkspaceStartPage).toHaveBeenCalledWith("venue");
    });

    // Impersonation hides start-page palette commands
    sessionStorage.setItem(STORAGE_KEYS.IMPERSONATING, "true");
    rerender(<NexusSearchPalette open={true} onOpenChange={onOpenChange} />);
    expect(screen.queryByText("Reset to default")).not.toBeInTheDocument();
    expect(screen.queryByText("Manage start pages")).not.toBeInTheDocument();
  });
});
