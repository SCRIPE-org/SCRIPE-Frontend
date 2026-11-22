import * as React from "react";
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { WorkspaceProvider, useWorkspace } from "../workspace-provider";
import { useActiveRootSync } from "../hooks/useActiveRootSync";
import { useWorkspaceActions } from "../hooks/useWorkspaceActions";
import { useNavigationStore } from "@core/navigation/store/useNavigationStore";
import { NavigationData } from "@core/navigation/domain/entities/NavigationData";
import { WorkspaceGroup } from "@core/navigation/domain/entities/WorkspaceGroup";

let mockPathname = "/hub";
const mockPush = vi.fn();
const mockReplace = vi.fn();
const mockFetchWorkspaceMenu = vi.fn().mockResolvedValue(null);
const mockCanAccessPage = vi.fn((_path: string) => true);

vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
}));

vi.mock("@core/providers/navigation-provider", () => ({
  useNavigation: () => ({
    fetchWorkspaceMenu: mockFetchWorkspaceMenu,
  }),
}));

vi.mock("@core/providers/permission-provider", () => ({
  usePermissions: () => ({
    canAccessPage: (path: string) => mockCanAccessPage(path),
  }),
}));

vi.mock("@core/hooks/useAdminContext", () => ({
  useAdminContext: () => ({
    isPlatform: false,
  }),
}));

vi.mock("@core/di", () => ({
  getCoreContainer: () => ({
    navigationRepository: {
      toggleWorkspacePin: vi.fn().mockResolvedValue({ isPinned: true, pinSortOrder: 10 }),
    },
  }),
}));

vi.mock("@core/ui/routing-progress-bar", () => ({
  startRoutingProgress: vi.fn(),
}));

const adminGroup = new WorkspaceGroup({
  workspaceId: "ws-admin",
  workspaceKey: "admin",
  workspaceNameEn: "Admin",
  workspaceNameAr: "الإدارة",
  workspaceIcon: "Shield",
  workspaceSortOrder: 1,
  colorHue: null,
  colorChroma: null,
  workspaceType: "Admin",
  menuItems: [],
  isLocked: false,
  homeRoute: "/overview",
  platformHomeRoute: "/overview",
  isPinned: false,
  pinSortOrder: null,
  contextScope: "Both",
  accessibleItemCount: 2,
});

const crmGroup = new WorkspaceGroup({
  workspaceId: "ws-crm",
  workspaceKey: "crm",
  workspaceNameEn: "CRM",
  workspaceNameAr: "المبيعات",
  workspaceIcon: "Users",
  workspaceSortOrder: 2,
  colorHue: 180,
  colorChroma: 0.14,
  workspaceType: "Module",
  menuItems: [],
  isLocked: false,
  homeRoute: "/crm",
  platformHomeRoute: null,
  isPinned: true,
  pinSortOrder: 10,
  contextScope: "TenantOnly",
  accessibleItemCount: 4,
});

const defaultNavData = new NavigationData({
  routes: ["/overview", "/admins"],
  menuItems: [
    {
      id: "admin-overview",
      slug: "overview",
      name: "Overview",
      nameEn: "Overview",
      nameAr: "نظرة عامة",
      href: "/overview",
      icon: "LayoutDashboard",
      order: 1,
      resource: "dashboard",
      actions: null,
      children: [],
    },
  ],
  workspaceGroups: [adminGroup.toData(), crmGroup.toData()],
});

const crmNavData = new NavigationData({
  routes: ["/crm", "/crm/leads"],
  menuItems: [
    {
      id: "crm-leads",
      slug: "crm-leads",
      name: "Leads",
      nameEn: "Leads",
      nameAr: "العملاء",
      href: "/crm/leads",
      icon: "Users",
      order: 1,
      resource: "crm.leads",
      actions: null,
      children: [],
    },
  ],
  workspaceGroups: [adminGroup.toData(), crmGroup.toData()],
});

describe("WorkspaceProvider, workspaceSlice & useActiveRootSync — /hub null-workspace invariants", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPathname = "/hub";
    mockCanAccessPage.mockImplementation(() => true);
    useNavigationStore.getState().reset();
    window.history.replaceState({}, "", "/hub");
  });

  it("returns [] for rootMenuItems and null for getActiveWorkspaceGroup when activeWorkspaceKey is null even if __default__ is populated", () => {
    useNavigationStore.setState({
      workspaceGroups: [adminGroup, crmGroup],
      defaultWorkspace: defaultNavData,
      workspaces: new Map<string, NavigationData>([
        ["__default__", defaultNavData],
        ["admin", defaultNavData],
      ]),
      activeWorkspaceKey: null,
      activeRootItemId: null,
      isInitialLoading: false,
      routesLoadedAt: Date.now(),
    });

    // Store-level slice invariant
    expect(useNavigationStore.getState().getActiveWorkspaceGroup()).toBeNull();
    expect(useNavigationStore.getState().getActiveRootMenuItems()).toEqual([]);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <WorkspaceProvider>{children}</WorkspaceProvider>
    );
    const { result } = renderHook(() => useWorkspace(), { wrapper });

    expect(result.current.activeWorkspace).toBeNull();
    expect(result.current.rootMenuItems).toEqual([]);
    expect(result.current.activeRootItem).toBeNull();
  });

  it("keeps activeWorkspaceKey and activeRootItemId null on /hub instead of falling back to admin workspace", () => {
    mockPathname = "/hub";
    useNavigationStore.setState({
      workspaceGroups: [adminGroup, crmGroup],
      workspaceRouteMap: {
        admin: ["/overview", "/admins"],
        crm: ["/crm", "/crm/leads"],
      },
      defaultWorkspace: defaultNavData,
      workspaces: new Map<string, NavigationData>([
        ["__default__", defaultNavData],
        ["admin", defaultNavData],
      ]),
      activeWorkspaceKey: null,
      activeRootItemId: null,
      isInitialLoading: false,
      routesLoadedAt: Date.now(),
    });

    renderHook(() => useActiveRootSync([]));

    expect(useNavigationStore.getState().activeWorkspaceKey).toBeNull();
    expect(useNavigationStore.getState().activeRootItemId).toBeNull();
    expect(mockFetchWorkspaceMenu).not.toHaveBeenCalled();
  });

  it("clears stale activeWorkspaceKey and activeRootItemId when navigating back to /hub", () => {
    mockPathname = "/hub/";
    useNavigationStore.setState({
      workspaceGroups: [adminGroup, crmGroup],
      workspaceRouteMap: {
        admin: ["/overview", "/admins"],
        crm: ["/crm", "/crm/leads"],
      },
      workspaces: new Map<string, NavigationData>([["crm", crmNavData]]),
      activeWorkspaceKey: "crm",
      activeRootItemId: "crm-leads",
      isInitialLoading: false,
      routesLoadedAt: Date.now(),
    });

    renderHook(() => useActiveRootSync(crmNavData.menuItems));

    expect(useNavigationStore.getState().activeWorkspaceKey).toBeNull();
    expect(useNavigationStore.getState().activeRootItemId).toBeNull();
    expect(mockFetchWorkspaceMenu).not.toHaveBeenCalled();
  });

  it("uses router.push (preserving browser Back to /hub) on explicit workspace switch", async () => {
    useNavigationStore.setState({
      workspaceGroups: [adminGroup, crmGroup],
      workspaces: new Map<string, NavigationData>([["crm", crmNavData]]),
      activeWorkspaceKey: null,
      isInitialLoading: false,
    });

    const { result } = renderHook(() => useWorkspaceActions());

    await act(async () => {
      await result.current.setActiveWorkspace("crm", true, { preserveHistory: true });
    });

    expect(mockPush).toHaveBeenCalledWith("/crm");
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("uses router.replace when preserveHistory is false and defaults to router.push when options are omitted", async () => {
    useNavigationStore.setState({
      workspaceGroups: [adminGroup, crmGroup],
      workspaces: new Map<string, NavigationData>([["crm", crmNavData]]),
      activeWorkspaceKey: null,
      isInitialLoading: false,
    });

    const { result } = renderHook(() => useWorkspaceActions());

    await act(async () => {
      await result.current.setActiveWorkspace("crm", true, { preserveHistory: false });
    });

    expect(mockReplace).toHaveBeenCalledWith("/crm");
    expect(mockPush).not.toHaveBeenCalled();

    mockPush.mockClear();
    mockReplace.mockClear();
    act(() => {
      useNavigationStore.getState().setActiveWorkspace(null);
    });

    await act(async () => {
      await result.current.setActiveWorkspace("crm", true);
    });

    expect(mockPush).toHaveBeenCalledWith("/crm");
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("initializeDefaultWorkspace keeps activeWorkspaceKey null on /hub and /hub/ instead of falling back to admin, and activates admin on /overview", () => {
    window.history.replaceState({}, "", "/hub");
    useNavigationStore.getState().initializeDefaultWorkspace(defaultNavData, [adminGroup, crmGroup]);
    expect(useNavigationStore.getState().activeWorkspaceKey).toBeNull();

    useNavigationStore.getState().reset();
    window.history.replaceState({}, "", "/hub/");
    useNavigationStore.getState().initializeDefaultWorkspace(defaultNavData, [adminGroup, crmGroup]);
    expect(useNavigationStore.getState().activeWorkspaceKey).toBeNull();

    useNavigationStore.getState().reset();
    window.history.replaceState({}, "", "/overview");
    useNavigationStore.getState().initializeDefaultWorkspace(defaultNavData, [adminGroup, crmGroup]);
    expect(useNavigationStore.getState().activeWorkspaceKey).toBe("admin");
  });

  it("navigates directly to venue effectiveHomeRoute (/venue) when canAccessPage permits it", async () => {
    const venueGroup = new WorkspaceGroup({
      workspaceId: "ws-venue",
      workspaceKey: "venue",
      workspaceNameEn: "Venue",
      workspaceNameAr: "المرافق",
      workspaceIcon: "Building2",
      workspaceSortOrder: 3,
      colorHue: 140,
      colorChroma: 0.14,
      workspaceType: "Module",
      menuItems: [],
      isLocked: false,
      homeRoute: "/venue",
      platformHomeRoute: null,
      isPinned: false,
      pinSortOrder: null,
      contextScope: "TenantOnly",
      accessibleItemCount: 3,
    });
    const venueNavData = new NavigationData({
      routes: ["/venue", "/venue/calendar"],
      menuItems: [
        {
          id: "venue-dashboard",
          slug: "venue-dashboard",
          name: "Dashboard",
          nameEn: "Dashboard",
          nameAr: "لوحة المرافق",
          href: "/venue",
          icon: "LayoutDashboard",
          order: 1,
          resource: "venue-dashboard",
          actions: null,
          children: [],
        },
      ],
      workspaceGroups: [adminGroup.toData(), venueGroup.toData()],
    });

    mockCanAccessPage.mockImplementation((path) => path === "/venue");
    useNavigationStore.setState({
      workspaceGroups: [adminGroup, venueGroup],
      workspaces: new Map<string, NavigationData>([["venue", venueNavData]]),
      activeWorkspaceKey: null,
      isInitialLoading: false,
    });

    const { result } = renderHook(() => useWorkspaceActions());
    await act(async () => {
      await result.current.setActiveWorkspace("venue", true);
    });

    expect(mockPush).toHaveBeenCalledWith("/venue");
    expect(mockReplace).not.toHaveBeenCalled();
  });
});
