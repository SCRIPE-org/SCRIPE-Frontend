import { StateCreator } from "zustand";
import { normalizeRoutePath } from "@core/config/app-route-manifest";
import type { AuthorizedRouteDescriptor, NavigationStoreState, WorkspaceSlice } from "../types";
import { NavigationData } from "@core/navigation/domain/entities/NavigationData";
import { WorkspaceGroup } from "@core/navigation/domain/entities/WorkspaceGroup";

const MAX_RECENT_WORKSPACES = 4;

function resolveHydratedWorkspaceKey(
  groups: WorkspaceGroup[],
  landingWorkspaceKey: string | null | undefined
): string | null {
  const withMenus = groups.find((g) => !g.isLocked && g.hasMenuItems);
  if (withMenus) return withMenus.workspaceKey;

  if (landingWorkspaceKey) {
    const landingMatch = groups.find(
      (g) => !g.isLocked && g.workspaceKey.toLowerCase() === landingWorkspaceKey.toLowerCase()
    );
    if (landingMatch) return landingMatch.workspaceKey;
  }

  const defaultGroup =
    groups.find((g) => !g.isLocked && g.workspaceType === "Admin") ??
    groups.find((g) => !g.isLocked) ??
    groups[0];
  return defaultGroup?.workspaceKey ?? null;
}

export const createWorkspaceSlice: StateCreator<NavigationStoreState, [], [], WorkspaceSlice> = (
  set,
  get
) => ({
  workspaceGroups: [],
  workspaces: new Map<string, NavigationData>(),
  defaultWorkspace: null,
  recentWorkspaceKeysByContext: {},

  initializeBootstrap: (result, contextKey) => {
    const groups = result.navigationData.workspaceGroups;
    const workspaceRouteMap = result.workspaceRouteMap ?? {};

    const routeSet = new Set<string>();
    for (const r of result.routes ?? []) {
      if (typeof r === "string" && r.trim()) routeSet.add(normalizeRoutePath(r));
    }
    for (const r of result.navigationData.routes ?? []) {
      if (typeof r === "string" && r.trim()) routeSet.add(normalizeRoutePath(r));
    }
    const sorted = [...routeSet].sort((a, b) => b.length - a.length);

    const descriptorMap = new Map<string, AuthorizedRouteDescriptor>();
    for (const descriptor of result.routeDescriptors ?? []) {
      if (!descriptor || typeof descriptor.route !== "string" || !descriptor.route.trim()) {
        continue;
      }
      const normalizedKey = normalizeRoutePath(descriptor.route);
      descriptorMap.set(normalizedKey, {
        ...descriptor,
        route: normalizedKey,
      });
    }

    const hydratedWsKey = resolveHydratedWorkspaceKey(
      groups,
      result.landingResolution?.workspaceKey
    );

    set((state) => {
      const nextWorkspaces = new Map(state.workspaces);
      const serializedGroups = groups.map((gr) => gr.toData());

      for (const group of groups) {
        if (!group.hasMenuItems) continue;
        if (hydratedWsKey && group.workspaceKey.toLowerCase() === hydratedWsKey.toLowerCase()) {
          nextWorkspaces.set(group.workspaceKey, result.navigationData);
        } else {
          nextWorkspaces.set(
            group.workspaceKey,
            new NavigationData({
              menuItems: group.menuItems.map((m) => m.toData()),
              routes: workspaceRouteMap[group.workspaceKey] ?? [],
              workspaceGroups: serializedGroups,
            })
          );
        }
      }

      if (hydratedWsKey && !nextWorkspaces.has(hydratedWsKey)) {
        nextWorkspaces.set(hydratedWsKey, result.navigationData);
      }

      const currentPath =
        typeof window !== "undefined" ? normalizeRoutePath(window.location.pathname) : "/";
      const existingUnlocked = state.activeWorkspaceKey
        ? groups.find((g) => !g.isLocked && g.workspaceKey === state.activeWorkspaceKey)
        : undefined;

      let nextActiveWorkspaceKey: string | null = null;
      if (currentPath.toLowerCase() === "/hub") {
        nextActiveWorkspaceKey = null;
      } else if (existingUnlocked) {
        nextActiveWorkspaceKey = existingUnlocked.workspaceKey;
      } else if (currentPath === "/") {
        nextActiveWorkspaceKey =
          result.landingResolution?.route === "/hub" && !result.landingResolution?.workspaceKey
            ? null
            : hydratedWsKey;
      } else {
        const ownerEntry = Object.entries(workspaceRouteMap).find(([wsKey, wsRoutes]) => {
          const isUnlocked = groups.some(
            (g) => !g.isLocked && g.workspaceKey.toLowerCase() === wsKey.toLowerCase()
          );
          if (!isUnlocked) return false;
          return wsRoutes.some((r) => normalizeRoutePath(r) === currentPath);
        });
        nextActiveWorkspaceKey = ownerEntry?.[0] ?? hydratedWsKey;
      }

      return {
        allRoutes: routeSet,
        allRoutesSorted: sorted,
        workspaceRouteMap,
        routeDescriptors: descriptorMap,
        routesLoaded: true,
        routesContextKey: contextKey,
        routesError: null,
        routesLoadedAt: Date.now(),
        contextKey,
        landingResolution: result.landingResolution ?? null,
        workspaceGroups: groups,
        defaultWorkspace: result.navigationData,
        workspaces: nextWorkspaces,
        activeWorkspaceKey: nextActiveWorkspaceKey,
        isInitialLoading: false,
      };
    });
  },

  recordRecentWorkspace: (contextKey, workspaceKey) => {
    if (!contextKey || !workspaceKey || workspaceKey === "__default__") return;
    set((state) => {
      const existing = state.recentWorkspaceKeysByContext[contextKey] ?? [];
      const updated = [workspaceKey, ...existing.filter((k) => k !== workspaceKey)].slice(
        0,
        MAX_RECENT_WORKSPACES
      );
      return {
        recentWorkspaceKeysByContext: {
          ...state.recentWorkspaceKeysByContext,
          [contextKey]: updated,
        },
      };
    });
  },

  clearRecentWorkspaces: () => set({ recentWorkspaceKeysByContext: {} }),

  initializeDefaultWorkspace: (data, groups) => {
    const current = get().allRoutes;
    const merged = new Set(current);
    data.routes.forEach((r) => {
      if (r) merged.add(r);
    });
    const sorted = [...merged].sort((a, b) => b.length - a.length);

    const defaultGroup = groups.find((g) => g.workspaceType === "Admin") ?? groups[0];
    const defaultKey = defaultGroup?.workspaceKey ?? null;

    set((state) => ({
      allRoutes: merged,
      allRoutesSorted: sorted,
      workspaceGroups: groups,
      defaultWorkspace: data,
      workspaces: new Map(state.workspaces).set(defaultKey ?? "__default__", data),
      // Auto-activate the default workspace when none is selected yet.
      // Previously this block tried to keep key=null when pathname="/", assuming
      // that "/" was the Hub page. But "/" is now the real dashboard — the hub
      // lives at "/hub" and sets activeWorkspaceKey=null itself on mount.
      //
      // Rules:
      //  - null (uninitialized) AND on /hub → keep null (hub is standalone, no workspace)
      //  - null (uninitialized) on ANY other page → auto-activate default workspace
      //  - has a value (user navigated)           → preserve as-is
      activeWorkspaceKey:
        state.activeWorkspaceKey !== null
          ? state.activeWorkspaceKey // Already chosen — preserve it
          : typeof window !== "undefined" &&
              window.location.pathname.toLowerCase().replace(/\/+$/, "") === "/hub"
            ? null // Explicitly on /hub — keep null (hub manages its own state)
            : defaultKey, // First load on dashboard or any module page — auto-activate
      isInitialLoading: false,
    }));
  },

  setWorkspaceData: (key, data) => {
    const current = get().allRoutes;
    const merged = new Set(current);
    data.routes.forEach((r) => {
      if (r) merged.add(r);
    });
    const sorted = [...merged].sort((a, b) => b.length - a.length);

    set((state) => ({
      allRoutes: merged,
      allRoutesSorted: sorted,
      workspaces: new Map(state.workspaces).set(key, data),
    }));
  },

  hasWorkspaceData: (key) => get().workspaces.has(key),

  getActiveWorkspaceGroup: () => {
    const { workspaceGroups, activeWorkspaceKey } = get();
    if (!activeWorkspaceKey) return null;
    return workspaceGroups.find((g) => g.workspaceKey === activeWorkspaceKey) ?? null;
  },

  getActiveRootMenuItems: () => {
    const { workspaces, activeWorkspaceKey } = get();
    if (!activeWorkspaceKey) return [];
    return workspaces.get(activeWorkspaceKey)?.menuItems ?? [];
  },

  getPageActions: (pathname) => {
    const items = get().getActiveRootMenuItems();
    const normalized =
      pathname.endsWith("/") && pathname !== "/" ? pathname.slice(0, -1) : pathname;

    const queue = [...items];
    while (queue.length > 0) {
      const item = queue.shift()!;
      if (item.href === normalized || item.href === pathname) {
        return item.actions ?? null;
      }
      if (item.children?.length) queue.push(...item.children);
    }
    return null;
  },

  toggleWorkspacePinLocal: (workspaceKey, isPinned, pinSortOrder) => {
    set((state) => {
      const updatedGroups = state.workspaceGroups.map((g) => {
        if (g.workspaceKey !== workspaceKey) return g;
        return new WorkspaceGroup({ ...g.toData(), isPinned, pinSortOrder });
      });
      return { workspaceGroups: updatedGroups };
    });
  },
});
