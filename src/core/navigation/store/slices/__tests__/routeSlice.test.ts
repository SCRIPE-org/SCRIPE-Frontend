import { afterEach, describe, expect, it, vi } from "vitest";
import { createRouteSlice } from "../routeSlice";

function createTestRouteSlice() {
  let state: any = {};
  const set = (partial: any) => {
    const patch = typeof partial === "function" ? partial(state) : partial;
    state = { ...state, ...patch };
  };
  const get = () => state;
  state = createRouteSlice(set, get, {} as any);
  return {
    getState: () => state,
  };
}

describe("createRouteSlice (Option C unified fail-closed routing)", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("allows public and explicitly declared shell_authenticated routes before routesLoaded", () => {
    const store = createTestRouteSlice();
    const state = store.getState();

    expect(state.routesLoaded).toBe(false);
    expect(state.hasRouteAccess("/login")).toBe(true);
    expect(state.hasRouteAccess("/signup/finalize")).toBe(true);
    expect(state.hasRouteAccess("/not-authorized")).toBe(true);
    expect(state.hasRouteAccess("/")).toBe(true);
    expect(state.hasRouteAccess("/hub")).toBe(true);
    expect(state.hasRouteAccess("/settings")).toBe(true);
    expect(state.hasRouteAccess("/account/security")).toBe(true);
  });

  it("fails closed for menu-bound routes when routesLoaded is false or allRoutes is empty", () => {
    const store = createTestRouteSlice();

    // Unloaded store -> fail closed (no old allRoutes.size === 0 bypass)
    expect(store.getState().hasRouteAccess("/venue")).toBe(false);
    expect(store.getState().hasRouteAccess("/crm/leads")).toBe(false);
    expect(store.getState().hasRouteAccess("/roles")).toBe(false);
    expect(store.getState().hasRouteAccess("/settings/permissions")).toBe(false);

    // Loaded with legitimately empty route list -> still fail closed
    store.getState().setRouteData({
      routes: [],
      workspaceRouteMap: {},
      routeDescriptors: [],
      contextKey: "tenant-empty",
    });

    expect(store.getState().routesLoaded).toBe(true);
    expect(store.getState().hasRouteAccess("/venue")).toBe(false);
    expect(store.getState().hasRouteAccess("/crm")).toBe(false);
    expect(store.getState().hasRouteAccess("/settings/permissions")).toBe(false);
    // Non-existent route fails closed too
    expect(store.getState().hasRouteAccess("/does-not-exist")).toBe(false);
  });

  it("blocks devOnly /sileo-playground in production", () => {
    const store = createTestRouteSlice();
    expect(store.getState().hasRouteAccess("/sileo-playground")).toBe(true);

    vi.stubEnv("NODE_ENV", "production");
    expect(store.getState().hasRouteAccess("/sileo-playground")).toBe(false);
  });

  it("eliminates reverse-prefix escalation and /settings or /crm prefix bypasses", () => {
    const store = createTestRouteSlice();
    store.getState().setRouteData({
      routes: ["/crm/leads", "/roles", "/venue/calendar"],
      workspaceRouteMap: {
        crm: ["/crm/leads"],
        admin: ["/roles"],
        venue: ["/venue/calendar"],
      },
      routeDescriptors: [
        {
          route: "/crm/leads",
          accessState: "authorized",
          workspaceKey: "crm",
          requiredFeature: "CRM.Enabled",
          requiresTenantContext: false,
        },
        {
          route: "/roles",
          accessState: "authorized",
          workspaceKey: "admin",
          requiredFeature: null,
          requiresTenantContext: false,
        },
        {
          route: "/venue/calendar",
          accessState: "authorized",
          workspaceKey: "venue",
          requiredFeature: "Venue.Enabled",
          requiresTenantContext: false,
        },
      ],
      contextKey: "tenant-1",
    });

    // Reverse-prefix: holding /crm/leads MUST NOT grant /crm
    expect(store.getState().hasRouteAccess("/crm")).toBe(false);
    expect(store.getState().hasRouteAccess("/crm/settings")).toBe(false);
    expect(store.getState().hasRouteAccess("/venue")).toBe(false);
    // Holding /settings shell page MUST NOT grant /settings/permissions or /settings/oauth-apps
    expect(store.getState().hasRouteAccess("/settings")).toBe(true);
    expect(store.getState().hasRouteAccess("/settings/permissions")).toBe(false);
    expect(store.getState().hasRouteAccess("/settings/oauth-apps")).toBe(false);

    // Exact normalized path + manifest menuRouteKey lookup works for nested dynamic pages
    expect(store.getState().hasRouteAccess("/crm/leads/")).toBe(true);
    expect(store.getState().hasRouteAccess("/crm/leads/lead-42?tab=notes")).toBe(true);
    expect(store.getState().hasRouteAccess("/roles/role-1")).toBe(true);
    expect(store.getState().hasRouteAccess("/venue/bookings/res-99")).toBe(true);
  });

  it("resolves unified routeDescriptors for context and feature gating and supports error/clear lifecycle", () => {
    const store = createTestRouteSlice();
    store.getState().setRouteData({
      routes: ["/overview"],
      workspaceRouteMap: { admin: ["/overview"] },
      routeDescriptors: [
        {
          route: "/overview",
          accessState: "authorized",
          workspaceKey: "admin",
          requiredFeature: null,
          requiresTenantContext: false,
        },
        {
          route: "/data-exchange",
          accessState: "tenant_context_required",
          workspaceKey: "admin",
          requiredFeature: "DataTransfer.Access",
          requiresTenantContext: true,
        },
        {
          route: "/crm",
          accessState: "feature_disabled",
          workspaceKey: "crm",
          requiredFeature: "CRM.Enabled",
          requiresTenantContext: false,
        },
        {
          route: "/entitlements/editions",
          accessState: "platform_context_required",
          workspaceKey: "billing",
          requiredFeature: null,
          requiresTenantContext: false,
        },
      ],
      contextKey: "platform",
    });

    expect(store.getState().isNavSyncedForContext("platform")).toBe(true);
    expect(store.getState().isNavSyncedForContext("tenant:t1")).toBe(false);

    expect(store.getState().hasRouteAccess("/data-exchange")).toBe(false);
    expect(store.getState().getRouteDescriptor("/data-exchange/")).toEqual({
      route: "/data-exchange",
      accessState: "tenant_context_required",
      workspaceKey: "admin",
      requiredFeature: "DataTransfer.Access",
      requiresTenantContext: true,
    });

    expect(store.getState().hasRouteAccess("/crm")).toBe(false);
    expect(store.getState().getRouteDescriptor("/crm")?.accessState).toBe("feature_disabled");

    // Child route inherits parent menu descriptor via manifest menuRouteKey
    expect(
      store.getState().getRouteDescriptor("/entitlements/editions/ed-1/edit")?.accessState
    ).toBe("platform_context_required");

    // Error clears cached routes and fails closed
    store.getState().setRoutesError("Network timeout", "tenant:t1");
    expect(store.getState().routesLoaded).toBe(false);
    expect(store.getState().routesError).toBe("Network timeout");
    expect(store.getState().routesContextKey).toBe("tenant:t1");
    expect(store.getState().isNavSyncedForContext("tenant:t1")).toBe(false);
    expect(store.getState().hasRouteAccess("/crm/leads")).toBe(false);

    store.getState().clearRouteData();
    expect(store.getState().routesError).toBeNull();
    expect(store.getState().routesContextKey).toBeNull();
  });
});
