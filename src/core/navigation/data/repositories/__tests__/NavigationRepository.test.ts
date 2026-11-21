import { describe, it, expect, vi } from "vitest";
import {
  NavigationRepository,
  parseLandingResolution,
  parseRouteDescriptors,
} from "../NavigationRepository";
import type { IApiService } from "@core/interfaces/api.interface";

describe("NavigationRepository - route descriptor fail-closed parsing", () => {
  it("parses known RouteAccessState values and skips unknown or missing accessState values instead of coercing to authorized", () => {
    const result = parseRouteDescriptors([
      {
        route: "/crm/",
        accessState: "authorized",
        workspaceKey: "crm",
        requiredFeature: null,
        requiresTenantContext: false,
      },
      {
        route: "/data-exchange",
        accessState: "tenant_context_required",
        workspaceKey: "admin",
        requiredFeature: "DataTransfer.Enabled",
        requiresTenantContext: true,
      },
      {
        route: "/tenants",
        accessState: "platform_context_required",
        workspaceKey: "admin",
        requiredFeature: null,
        requiresTenantContext: false,
      },
      {
        route: "/venue",
        accessState: "feature_disabled",
        workspaceKey: "venue",
        requiredFeature: "Venue.Core",
        requiresTenantContext: true,
      },
      {
        route: "/future-gate",
        accessState: "some_unknown_future_state",
        workspaceKey: "admin",
      },
      {
        route: "/malformed-missing-state",
        workspaceKey: "admin",
      },
      {
        route: "/malformed-nonstring-state",
        accessState: 42,
      },
    ]);

    expect(result).toHaveLength(4);
    expect(result.map((d) => [d.route, d.accessState])).toEqual([
      ["/crm", "authorized"],
      ["/data-exchange", "tenant_context_required"],
      ["/tenants", "platform_context_required"],
      ["/venue", "feature_disabled"],
    ]);
  });

  it("normalizes routes, workspaceRouteMap, and routeDescriptors in fetchRoutes()", async () => {
    const mockApi = {
      get: vi.fn().mockResolvedValue({
        data: {
          routes: ["/crm/", "/overview?tab=1"],
          workspaceRouteMap: { crm: ["/crm/accounts/"] },
          routeDescriptors: [
            { route: "/crm/", accessState: "authorized", requiresTenantContext: false },
            { route: "/secret-unknown", accessState: "unrecognized_state" },
          ],
        },
      }),
    } as unknown as IApiService;

    const repo = new NavigationRepository(mockApi);
    const res = await repo.fetchRoutes();

    expect(res.routes).toEqual(["/crm", "/overview"]);
    expect(res.workspaceRouteMap).toEqual({ crm: ["/crm/accounts"] });
    expect(res.routeDescriptors).toHaveLength(1);
    expect(res.routeDescriptors[0]).toEqual({
      route: "/crm",
      accessState: "authorized",
      workspaceKey: null,
      requiredFeature: null,
      requiresTenantContext: false,
    });
  });

  it("fetchNavigationBootstrap() calls GET /menus/navigation[?redirect=] and parses coalesced bootstrap payload", async () => {
    const getMock = vi.fn().mockResolvedValue({
      data: {
        menuItems: [
          {
            id: "crm-leads",
            slug: "crm-leads",
            nameEn: "Leads",
            nameAr: "العملاء",
            href: "/crm/leads",
            icon: "Users",
            order: 1,
            children: [],
          },
        ],
        routes: ["/crm/leads/"],
        authorizedRoutes: ["/crm/", "/crm/leads/", "/hub/"],
        workspaceRouteMap: { crm: ["/crm/", "/crm/leads/"] },
        routeDescriptors: [
          {
            route: "/crm/",
            accessState: "authorized",
            workspaceKey: "crm",
            requiredFeature: null,
            requiresTenantContext: false,
          },
          {
            route: "/tenants/",
            accessState: "platform_context_required",
            workspaceKey: "admin",
            requiredFeature: null,
            requiresTenantContext: false,
          },
        ],
        workspaceGroups: [
          {
            workspaceId: "ws-crm",
            workspaceKey: "crm",
            workspaceNameEn: "CRM",
            workspaceNameAr: "المبيعات",
            workspaceIcon: "Users",
            workspaceSortOrder: 2,
            workspaceType: "Module",
            homeRoute: "/crm",
            effectiveHomeRoute: "/crm",
            menuItems: [
              {
                id: "crm-leads",
                slug: "crm-leads",
                nameEn: "Leads",
                nameAr: "العملاء",
                href: "/crm/leads",
                icon: "Users",
                order: 1,
                children: [],
              },
            ],
            routes: ["/crm/leads"],
          },
        ],
        landing: {
          targetKind: "workspace",
          route: "/crm?view=board",
          workspaceKey: "crm",
          sourceReason: "RoleEnforced",
          isEnforced: true,
          enforcingRoleName: "Sales Rep",
          wasFallbackApplied: false,
          fallbackReason: null,
        },
      },
    });

    const repo = new NavigationRepository({ get: getMock } as unknown as IApiService);
    const boot = await repo.fetchNavigationBootstrap();

    expect(getMock).toHaveBeenCalledWith("/v1/menus/navigation");
    expect(boot.routes).toEqual(["/crm", "/crm/leads", "/hub"]);
    expect(boot.workspaceRouteMap).toEqual({ crm: ["/crm", "/crm/leads"] });
    expect(boot.routeDescriptors).toHaveLength(2);
    expect(boot.navigationData.menuItems).toHaveLength(1);
    expect(boot.navigationData.workspaceGroups[0].effectiveHomeRoute).toBe("/crm");
    expect(boot.landingResolution).toEqual({
      targetKind: "workspace",
      route: "/crm?view=board",
      workspaceKey: "crm",
      sourceReason: "RoleEnforced",
      isEnforced: true,
      enforcingRoleName: "Sales Rep",
      wasFallbackApplied: false,
      fallbackReason: null,
    });

    await repo.fetchNavigationBootstrap("/crm/leads?tab=open");
    expect(getMock).toHaveBeenLastCalledWith(
      `/v1/menus/navigation?redirect=${encodeURIComponent("/crm/leads?tab=open")}`
    );

    // Rejects external landing routes safely in parseLandingResolution
    const safeLanding = parseLandingResolution({
      targetKind: "deep_link",
      route: "https://evil.example/phish",
      workspaceKey: null,
      sourceReason: "ExplicitDeepLink",
      isEnforced: false,
    });
    expect(safeLanding?.route).toBe("/hub");
  });

  it("fetchWorkspaceMenu('admin') requests ?workspace=admin while fetchDefaultWorkspace() hits bare /v1/menus/navigation", async () => {
    const getMock = vi.fn().mockResolvedValue({
      data: {
        menuItems: [],
        routes: [],
        authorizedRoutes: [],
        workspaceGroups: [],
      },
    });
    const repo = new NavigationRepository({ get: getMock } as unknown as IApiService);

    await repo.fetchDefaultWorkspace();
    expect(getMock).toHaveBeenNthCalledWith(1, "/v1/menus/navigation");

    await repo.fetchWorkspaceMenu("admin");
    expect(getMock).toHaveBeenNthCalledWith(2, "/v1/menus/navigation?workspace=admin");

    await repo.fetchWorkspaceMenu("crm");
    expect(getMock).toHaveBeenNthCalledWith(3, "/v1/menus/navigation?workspace=crm");
  });
});
