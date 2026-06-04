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
          : typeof window !== "undefined" && window.location.pathname === "/hub"
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
