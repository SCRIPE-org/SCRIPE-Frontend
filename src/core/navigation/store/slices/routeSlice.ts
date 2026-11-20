import { StateCreator } from "zustand";
import { matchAppRoute, normalizeRoutePath } from "@core/config/app-route-manifest";
import type { AuthorizedRouteDescriptor, NavigationStoreState, RouteSlice } from "../types";

export const createRouteSlice: StateCreator<NavigationStoreState, [], [], RouteSlice> = (
  set,
  get
) => ({
  allRoutes: new Set<string>(),
  allRoutesSorted: [] as string[],
  workspaceRouteMap: {},
  routeDescriptors: new Map<string, AuthorizedRouteDescriptor>(),
  routesLoaded: false,
  routesContextKey: null,
  routesError: null,
  routesLoadedAt: null,
  contextKey: "",

  setRouteData: ({ routes, workspaceRouteMap, routeDescriptors, contextKey }) => {
    const routeSet = new Set(
      (routes ?? []).filter((r): r is string => typeof r === "string" && r.trim().length > 0).map(normalizeRoutePath)
    );
    const descriptorMap = new Map<string, AuthorizedRouteDescriptor>();
    for (const descriptor of routeDescriptors ?? []) {
      if (!descriptor || typeof descriptor.route !== "string" || !descriptor.route.trim()) {
        continue;
      }
      const normalizedKey = normalizeRoutePath(descriptor.route);
      descriptorMap.set(normalizedKey, {
        ...descriptor,
        route: normalizedKey,
      });
    }
    const sorted = [...routeSet].sort((a, b) => b.length - a.length);

    set({
      allRoutes: routeSet,
      allRoutesSorted: sorted,
      workspaceRouteMap: workspaceRouteMap ?? {},
      routeDescriptors: descriptorMap,
      routesLoaded: true,
      routesContextKey: contextKey,
      routesError: null,
      routesLoadedAt: Date.now(),
      contextKey,
    });
  },

  setRoutesError: (message, contextKey) => {
    set({
      allRoutes: new Set<string>(),
      allRoutesSorted: [],
      workspaceRouteMap: {},
      routeDescriptors: new Map<string, AuthorizedRouteDescriptor>(),
      routesLoaded: false,
      routesContextKey: contextKey !== undefined ? contextKey : get().routesContextKey,
      routesError: message,
      routesLoadedAt: null,
    });
  },

  clearRouteData: () => {
    set({
      allRoutes: new Set<string>(),
      allRoutesSorted: [],
      workspaceRouteMap: {},
      routeDescriptors: new Map<string, AuthorizedRouteDescriptor>(),
      routesLoaded: false,
      routesContextKey: null,
      routesError: null,
      routesLoadedAt: null,
      contextKey: "",
    });
  },

  isNavSyncedForContext: (expectedContextKey) => {
    const { routesLoaded, routesError, routesContextKey } = get();
    if (!routesLoaded || routesError !== null) return false;
    if (!expectedContextKey) return true;
    return routesContextKey === expectedContextKey;
  },

  getRouteDescriptor: (pathname) => {
    const normalized = normalizeRoutePath(pathname);
    const { routeDescriptors } = get();

    const exact = routeDescriptors.get(normalized);
    if (exact) return exact;

    const manifestEntry = matchAppRoute(normalized);
    if (manifestEntry?.menuRouteKey) {
      const targetKey = normalizeRoutePath(manifestEntry.menuRouteKey);
      return routeDescriptors.get(targetKey) ?? null;
    }

    return null;
  },

  hasRouteAccess: (pathname) => {
    const normalized = normalizeRoutePath(pathname);
    const entry = matchAppRoute(normalized);

    if (!entry) {
      return false;
    }

    if (entry.devOnly && process.env.NODE_ENV === "production") {
      return false;
    }

    if (entry.binding === "public" || entry.binding === "shell_authenticated") {
      return true;
    }

    // Fail-closed: menu-bound routes require completed route loading and explicit authorization.
    const { routesLoaded, routesError, allRoutes, routeDescriptors } = get();
    if (!routesLoaded || routesError !== null) {
      return false;
    }

    const targetKey = normalizeRoutePath(entry.menuRouteKey ?? entry.pattern);
    const descriptor = routeDescriptors.get(normalized) ?? routeDescriptors.get(targetKey);
    if (descriptor) {
      return descriptor.accessState === "authorized";
    }

    if (allRoutes.size === 0) {
      return false;
    }

    return allRoutes.has(normalized) || allRoutes.has(targetKey);
  },
});
