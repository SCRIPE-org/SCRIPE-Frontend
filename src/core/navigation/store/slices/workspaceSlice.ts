import { StateCreator } from "zustand";
import { NavigationStoreState, WorkspaceSlice } from "../types";
import type { NavigationData } from "@core/navigation/domain/entities/NavigationData";
import { WorkspaceGroup } from "@core/navigation/domain/entities/WorkspaceGroup";

export const createWorkspaceSlice: StateCreator<NavigationStoreState, [], [], WorkspaceSlice> = (
  set,
  get
) => ({
  workspaceGroups: [],
  workspaces: new Map<string, NavigationData>(),
  defaultWorkspace: null,

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
      // Only auto-set the workspace key when it hasn't been set yet (undefined).
      // If it's explicitly null (user navigated to Hub via logo click), preserve
      // that null so the sidebar stays collapsed on refresh.
      // However, on first load (pathname !== "/"), null means "not initialized yet",
      // so we DO set it. We distinguish via: if we're on "/" and key is null, keep null.
      activeWorkspaceKey:
        state.activeWorkspaceKey !== null
          ? state.activeWorkspaceKey  // Already set — preserve it
          : (typeof window !== "undefined" && window.location.pathname === "/")
            ? null                    // On Hub — keep null (user explicitly navigated here)
            : defaultKey,             // First load on a sub-page — auto-activate default
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
