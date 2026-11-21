import { describe, it, expect, beforeEach } from "vitest";
import { NAV_STORE_VERSION, useNavigationStore } from "../useNavigationStore";
import { NavigationData } from "@core/navigation/domain/entities/NavigationData";
import { WorkspaceGroup } from "@core/navigation/domain/entities/WorkspaceGroup";

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
  effectiveHomeRoute: "/overview",
  isPinned: false,
  pinSortOrder: null,
  contextScope: "Both",
  accessibleItemCount: 2,
});

const crmGroupWithMenus = new WorkspaceGroup({
  workspaceId: "ws-crm",
  workspaceKey: "crm",
  workspaceNameEn: "CRM",
  workspaceNameAr: "المبيعات",
  workspaceIcon: "Users",
  workspaceSortOrder: 2,
  colorHue: 180,
  colorChroma: 0.14,
  workspaceType: "Module",
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
  isLocked: false,
  homeRoute: "/crm",
  platformHomeRoute: null,
  effectiveHomeRoute: "/crm",
  isPinned: true,
  pinSortOrder: 10,
  contextScope: "TenantOnly",
  accessibleItemCount: 4,
});

describe("useNavigationStore v4 — single-pass bootstrap, migration & recent workspaces", () => {
  beforeEach(() => {
    localStorage.clear();
    useNavigationStore.getState().reset();
    window.history.replaceState({}, "", "/");
  });

  it("bumps NAV_STORE_VERSION to 4 and discards legacy v3 persisted state cleanly", () => {
    expect(NAV_STORE_VERSION).toBe(4);

    const merge = useNavigationStore.persist.getOptions().merge!;
    const mergedLegacy = merge(
      {
        version: 3,
        contextKey: "tenant-old:admin",
        routesContextKey: "tenant-old:admin",
        allRoutesArray: ["/legacy-stale-route"],
        workspaceRouteMap: { admin: ["/legacy-stale-route"] },
        routeDescriptorsArray: [],
        routesLoaded: true,
        activeWorkspaceKey: "admin",
        previousWorkspaceKey: null,
        routesLoadedAt: 123456,
      },
      useNavigationStore.getState()
    );

    expect(mergedLegacy.routesLoaded).toBe(false);
    expect(Array.from(mergedLegacy.allRoutes)).toEqual([]);
    expect(mergedLegacy.activeWorkspaceKey).toBeNull();
  });

  it("initializeBootstrap atomically commits routes, descriptors, landingResolution, and pre-hydrates target workspace", () => {
    const navData = new NavigationData({
      menuItems: crmGroupWithMenus.menuItems.map((m) => m.toData()),
      routes: ["/crm", "/crm/leads"],
      workspaceGroups: [adminGroup.toData(), crmGroupWithMenus.toData()],
    });

    useNavigationStore.getState().initializeBootstrap(
      {
        navigationData: navData,
        routes: ["/crm", "/crm/leads", "/hub"],
        workspaceRouteMap: { crm: ["/crm", "/crm/leads"] },
        routeDescriptors: [
          {
            route: "/crm",
            accessState: "authorized",
            workspaceKey: "crm",
            requiredFeature: "CRM.Core",
            requiresTenantContext: false,
          },
        ],
        landingResolution: {
          targetKind: "workspace",
          route: "/crm",
          workspaceKey: "crm",
          sourceReason: "RoleEnforced",
          isEnforced: true,
          enforcingRoleName: "Sales Rep",
          wasFallbackApplied: false,
          fallbackReason: null,
        },
      },
      "tenant-1:sales.rep"
    );

    const state = useNavigationStore.getState();
    expect(state.routesLoaded).toBe(true);
    expect(state.routesError).toBeNull();
    expect(state.routesContextKey).toBe("tenant-1:sales.rep");
    expect(state.isInitialLoading).toBe(false);
    expect(state.hasRouteAccess("/crm")).toBe(true);
    expect(state.hasWorkspaceData("crm")).toBe(true);
    expect(state.getActiveRootMenuItems()).toHaveLength(1);
    expect(state.activeWorkspaceKey).toBe("crm");
    expect(state.landingResolution).toMatchObject({
      route: "/crm",
      workspaceKey: "crm",
      isEnforced: true,
      enforcingRoleName: "Sales Rep",
    });

    // Persisted v4 snapshot stores version=4 & recentWorkspaceKeysByContext, never landingResolution
    const partialize = useNavigationStore.persist.getOptions().partialize!;
    const persistedSnapshot = partialize(useNavigationStore.getState()) as unknown as Record<
      string,
      unknown
    >;
    expect(persistedSnapshot.version).toBe(4);
    expect("landingResolution" in persistedSnapshot).toBe(false);
  });

  it("keeps activeWorkspaceKey null on /hub even when bootstrap hydrates a workspace", () => {
    window.history.replaceState({}, "", "/hub");
    const navData = new NavigationData({
      menuItems: crmGroupWithMenus.menuItems.map((m) => m.toData()),
      routes: ["/crm", "/crm/leads"],
      workspaceGroups: [adminGroup.toData(), crmGroupWithMenus.toData()],
    });

    useNavigationStore.getState().initializeBootstrap(
      {
        navigationData: navData,
        routes: ["/crm", "/crm/leads", "/hub"],
        workspaceRouteMap: { crm: ["/crm", "/crm/leads"] },
        routeDescriptors: [],
        landingResolution: {
          targetKind: "hub",
          route: "/hub",
          workspaceKey: null,
          sourceReason: "MultiWorkspaceHub",
          isEnforced: false,
          enforcingRoleName: null,
          wasFallbackApplied: false,
          fallbackReason: null,
        },
      },
      "tenant-1:admin"
    );

    expect(useNavigationStore.getState().activeWorkspaceKey).toBeNull();
    expect(useNavigationStore.getState().getActiveRootMenuItems()).toEqual([]);
  });

  it("fresh login on /login or / with /hub landingResolution keeps activeWorkspaceKey and previousWorkspaceKey null", () => {
    const navData = new NavigationData({
      menuItems: crmGroupWithMenus.menuItems.map((m) => m.toData()),
      routes: ["/crm", "/crm/leads"],
      workspaceGroups: [adminGroup.toData(), crmGroupWithMenus.toData()],
    });
    const hubBootstrap = {
      navigationData: navData,
      routes: ["/crm", "/crm/leads", "/hub"],
      workspaceRouteMap: { crm: ["/crm", "/crm/leads"] },
      routeDescriptors: [],
      landingResolution: {
        targetKind: "hub" as const,
        route: "/hub",
        workspaceKey: null,
        sourceReason: "MultiWorkspaceHub",
        isEnforced: false,
        enforcingRoleName: null,
        wasFallbackApplied: false,
        fallbackReason: null,
      },
    };

    window.history.replaceState({}, "", "/login");
    useNavigationStore.getState().initializeBootstrap(hubBootstrap, "tenant-1:admin");
    expect(useNavigationStore.getState().activeWorkspaceKey).toBeNull();
    expect(useNavigationStore.getState().previousWorkspaceKey).toBeNull();

    window.history.replaceState({}, "", "/");
    useNavigationStore.getState().initializeBootstrap(hubBootstrap, "tenant-1:admin");
    expect(useNavigationStore.getState().activeWorkspaceKey).toBeNull();
    expect(useNavigationStore.getState().previousWorkspaceKey).toBeNull();
  });

  it("recordRecentWorkspace deduplicates, keeps newest first, caps at 4 per contextKey, and clears cleanly", () => {
    const store = useNavigationStore.getState();

    store.recordRecentWorkspace("t1:a", "__default__");
    store.recordRecentWorkspace("t1:a", "crm");
    store.recordRecentWorkspace("t1:a", "venue");
    store.recordRecentWorkspace("t1:a", "academy");
    store.recordRecentWorkspace("t1:a", "hrms");
    store.recordRecentWorkspace("t1:a", "crm"); // deduplicates & promotes to index 0
    store.recordRecentWorkspace("t1:a", "admin"); // pushes oldest ("venue") out -> cap 4
    store.recordRecentWorkspace("platform:a", "plugins");

    expect(useNavigationStore.getState().recentWorkspaceKeysByContext["t1:a"]).toEqual([
      "admin",
      "crm",
      "hrms",
      "academy",
    ]);
    expect(useNavigationStore.getState().recentWorkspaceKeysByContext["platform:a"]).toEqual([
      "plugins",
    ]);

    useNavigationStore.getState().clearRecentWorkspaces();
    expect(useNavigationStore.getState().recentWorkspaceKeysByContext).toEqual({});
  });

  it("v4 merge resets activeWorkspaceKey to null when rehydrating on /hub and preserves it on /overview", () => {
    const merge = useNavigationStore.persist.getOptions().merge!;
    const v4Snapshot = {
      version: NAV_STORE_VERSION,
      contextKey: "t1:admin",
      routesContextKey: "t1:admin",
      allRoutesArray: ["/overview", "/hub"],
      workspaceRouteMap: { admin: ["/overview"] },
      routeDescriptorsArray: [],
      routesLoaded: true,
      activeWorkspaceKey: "admin",
      previousWorkspaceKey: "crm",
      routesLoadedAt: 1700000000000,
    };

    window.history.replaceState({}, "", "/hub");
    const hubMerged = merge(v4Snapshot, useNavigationStore.getState());
    expect(hubMerged.activeWorkspaceKey).toBeNull();
    expect(hubMerged.previousWorkspaceKey).toBe("crm");

    window.history.replaceState({}, "", "/overview");
    const overviewMerged = merge(v4Snapshot, useNavigationStore.getState());
    expect(overviewMerged.activeWorkspaceKey).toBe("admin");
  });
});
