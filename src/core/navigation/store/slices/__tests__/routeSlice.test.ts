import { describe, it, expect } from "vitest";
import { createRouteSlice } from "../routeSlice";

describe("createRouteSlice", () => {
  it("allows access to system pages without routes loaded", () => {
    let state: any = {};
    const set = (partial: any) => {
      state = { ...state, ...partial };
    };
    const get = () => state;

    state = createRouteSlice(set, get, {} as any);

    expect(state.hasRouteAccess("/not-authorized")).toBe(true);
    expect(state.hasRouteAccess("/not-found")).toBe(true);
    expect(state.hasRouteAccess("/500")).toBe(true);
    expect(state.hasRouteAccess("/login")).toBe(true);
    expect(state.hasRouteAccess("/")).toBe(true);
  });

  it("does not contain bypasses for /venue or /party-kernel when routes are loaded", () => {
    let state: any = {};
    const set = (partial: any) => {
      state = { ...state, ...partial };
    };
    const get = () => state;

    state = createRouteSlice(set, get, {} as any);
    state.initializeRoutes(["/overview", "/settings"], {}, "test-user");

    // Routes not in allRoutes should be denied
    expect(state.hasRouteAccess("/venue")).toBe(false);
    expect(state.hasRouteAccess("/venue/courts")).toBe(false);
    expect(state.hasRouteAccess("/party-kernel")).toBe(false);

    // Routes in allRoutes should be allowed
    expect(state.hasRouteAccess("/overview")).toBe(true);
    expect(state.hasRouteAccess("/settings")).toBe(true);
  });
});
