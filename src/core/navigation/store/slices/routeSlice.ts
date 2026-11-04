import { StateCreator } from "zustand";
import { NavigationStoreState, RouteSlice } from "../types";

const SYSTEM_PAGES = new Set(["/not-authorized", "/not-found", "/500", "/login", "/"]);

export const createRouteSlice: StateCreator<NavigationStoreState, [], [], RouteSlice> = (
  set,
  get
) => ({
  allRoutes: new Set<string>(),
  allRoutesSorted: [] as string[],
  workspaceRouteMap: {},
  routesLoadedAt: null,
  contextKey: "",

  initializeRoutes: (routes, workspaceRouteMap, contextKey) => {
    const routeSet = new Set(routes);
    const sorted = [...routeSet].sort((a, b) => b.length - a.length);
    set({
      allRoutes: routeSet,
      allRoutesSorted: sorted,
      workspaceRouteMap,
      routesLoadedAt: Date.now(),
      contextKey,
    });
  },

  hasRouteAccess: (pathname) => {
    if (SYSTEM_PAGES.has(pathname)) return true;

    const { allRoutes, allRoutesSorted } = get();
    if (allRoutes.size === 0) return true;

    const normalized =
      pathname.endsWith("/") && pathname !== "/" ? pathname.slice(0, -1) : pathname;

    if (allRoutes.has(normalized)) return true;

    return allRoutesSorted.some(
      (route) => normalized.startsWith(route + "/") || route.startsWith(normalized + "/")
    );
  },
});
