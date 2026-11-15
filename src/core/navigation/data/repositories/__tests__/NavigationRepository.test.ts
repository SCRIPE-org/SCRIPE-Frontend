import { describe, it, expect, vi } from "vitest";
import { NavigationRepository, parseRouteDescriptors } from "../NavigationRepository";
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
});
