import { StateCreator } from "zustand";
import { NavigationStoreState, UiSlice } from "../types";
import type { NavigationData } from "@core/navigation/domain/entities/NavigationData";

export const createUiSlice: StateCreator<NavigationStoreState, [], [], UiSlice> = (set, get) => ({
  activeWorkspaceKey: null,
  activeRootItemId: null,
  previousWorkspaceKey: null,
  isInitialLoading: true,
  isWorkspaceSwitching: false,
  transitionTargetRoute: null,

  setActiveWorkspace: (key) =>
    set((state) => {
      // Guard: clicking the already-active workspace must not overwrite
      // previousWorkspaceKey with itself — that would break the Back button
      // (goBack would loop back to the same workspace).
      if (state.activeWorkspaceKey === key) return {};
      return {
        activeWorkspaceKey: key,
        previousWorkspaceKey: state.activeWorkspaceKey,
        activeRootItemId: null,
      };
    }),

  setActiveRootItem: (id) => set({ activeRootItemId: id }),
  setPreviousWorkspace: (key) => set({ previousWorkspaceKey: key }),
  setIsInitialLoading: (loading) => set({ isInitialLoading: loading }),
  setIsWorkspaceSwitching: (loading) => set({ isWorkspaceSwitching: loading }),
  setTransitionTargetRoute: (route) => set({ transitionTargetRoute: route }),

  getActiveRootItem: () => {
    const { activeRootItemId, getActiveRootMenuItems } = get();
    if (!activeRootItemId) return null;
    const items = getActiveRootMenuItems();
    return items.find((m) => m.id === activeRootItemId) ?? null;
  },

  reset: () =>
    set({
      allRoutes: new Set<string>(),
      allRoutesSorted: [],
      workspaceRouteMap: {},
      routesLoadedAt: null,
      workspaceGroups: [],
      workspaces: new Map<string, NavigationData>(),
      defaultWorkspace: null,
      activeWorkspaceKey: null,
      activeRootItemId: null,
      previousWorkspaceKey: null,
      isInitialLoading: true,
      isWorkspaceSwitching: false,
      transitionTargetRoute: null,
      contextKey: "",
    }),
});
