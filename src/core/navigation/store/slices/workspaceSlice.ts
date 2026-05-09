import { StateCreator } from "zustand";
import { NavigationStoreState, WorkspaceSlice } from "../types";
import type { NavigationData } from "@core/navigation/domain/entities/NavigationData";

export const createWorkspaceSlice: StateCreator<NavigationStoreState, [], [], WorkspaceSlice> = (set, get) => ({
  workspaceGroups: [],
  workspaces: new Map<string, NavigationData>(),
  defaultWorkspace: null,

  initializeDefaultWorkspace: (data, groups) => {
    const current = get().allRoutes;
    const merged = new Set(current);
    data.routes.forEach((r) => { if (r) merged.add(r); });
    const sorted = [...merged].sort((a, b) => b.length - a.length);

    const defaultGroup = groups.find((g) => g.workspaceType === "Admin") ?? groups[0];
    const defaultKey = defaultGroup?.workspaceKey ?? null;

    set((state) => ({
      allRoutes: merged,
      allRoutesSorted: sorted,
      workspaceGroups: groups,
      defaultWorkspace: data,
      workspaces: new Map(state.workspaces).set(
        defaultKey ?? "__default__",
        data
      ),
      activeWorkspaceKey: state.activeWorkspaceKey ?? defaultKey,
      isInitialLoading: false,
    }));
  },

  setWorkspaceData: (key, data) => {
    const current = get().allRoutes;
    const merged = new Set(current);
    data.routes.forEach((r) => { if (r) merged.add(r); });
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
    if (!activeWorkspaceKey) return workspaceGroups[0] ?? null;
    return workspaceGroups.find((g) => g.workspaceKey === activeWorkspaceKey) ?? null;
  },

  getActiveRootMenuItems: () => {
    const { workspaces, activeWorkspaceKey, defaultWorkspace } = get();
    const key = activeWorkspaceKey ?? "__default__";
    const data = workspaces.get(key) ?? defaultWorkspace;
    return data?.menuItems ?? [];
  },

  getPageActions: (pathname) => {
    const items = get().getActiveRootMenuItems();
    const normalized = pathname.endsWith("/") && pathname !== "/"
      ? pathname.slice(0, -1)
      : pathname;

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
});
