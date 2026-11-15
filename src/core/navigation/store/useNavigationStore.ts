"use client";

/**
 * useNavigationStore — The SINGLE source of truth for all navigation state.
 *
 * Refactored to use the Zustand Slice Pattern for scalability.
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { STORAGE_KEYS } from "@core/config/storage-keys";
import type {
  AuthorizedRouteDescriptor,
  NavigationStoreState,
  WorkspaceRouteMap,
} from "./types";
import { createRouteSlice } from "./slices/routeSlice";
import { createWorkspaceSlice } from "./slices/workspaceSlice";
import { createUiSlice } from "./slices/uiSlice";

const NAV_STORE_VERSION = 3;

interface PersistedNavState {
  version: number;
  contextKey: string;
  routesContextKey: string | null;
  allRoutesArray: string[];
  workspaceRouteMap: WorkspaceRouteMap;
  routeDescriptorsArray?: [string, AuthorizedRouteDescriptor][];
  routesLoaded: boolean;
  activeWorkspaceKey: string | null;
  previousWorkspaceKey: string | null;
  routesLoadedAt: number | null;
}

export const useNavigationStore = create<NavigationStoreState>()(
  persist(
    (set, get, api) => ({
      ...createRouteSlice(set, get, api),
      ...createWorkspaceSlice(set, get, api),
      ...createUiSlice(set, get, api),
    }),
    {
      name: STORAGE_KEYS.NAV_STORE,
      storage: createJSONStorage(() =>
        typeof window !== "undefined"
          ? localStorage
          : {
              getItem: () => null,
              setItem: () => {},
              removeItem: () => {},
            }
      ),
      partialize: (state): PersistedNavState => ({
        version: NAV_STORE_VERSION,
        contextKey: state.contextKey,
        routesContextKey: state.routesContextKey,
        allRoutesArray: Array.from(state.allRoutes),
        workspaceRouteMap: state.workspaceRouteMap,
        routeDescriptorsArray: Array.from(state.routeDescriptors.entries()),
        routesLoaded: state.routesLoaded,
        activeWorkspaceKey: state.activeWorkspaceKey,
        previousWorkspaceKey: state.previousWorkspaceKey,
        routesLoadedAt: state.routesLoadedAt,
      }),
      merge: (persistedRaw, currentState) => {
        const persisted = persistedRaw as PersistedNavState | null;

        if (!persisted || persisted.version !== NAV_STORE_VERSION) {
          return currentState;
        }

        const arr = Array.isArray(persisted.allRoutesArray) ? persisted.allRoutesArray : [];
        const descriptorEntries = Array.isArray(persisted.routeDescriptorsArray)
          ? persisted.routeDescriptorsArray
          : [];
        return {
          ...currentState,
          allRoutes: new Set(arr),
          allRoutesSorted: [...new Set(arr)].sort((a, b) => b.length - a.length),
          workspaceRouteMap: persisted.workspaceRouteMap ?? {},
          routeDescriptors: new Map<string, AuthorizedRouteDescriptor>(descriptorEntries),
          routesLoaded: Boolean(persisted.routesLoaded),
          routesContextKey: persisted.routesContextKey ?? (persisted.contextKey || null),
          routesError: null,
          routesLoadedAt: persisted.routesLoadedAt ?? null,
          activeWorkspaceKey: persisted.activeWorkspaceKey ?? null,
          previousWorkspaceKey: persisted.previousWorkspaceKey ?? null,
          contextKey: persisted.contextKey ?? "",
        };
      },
    }
  )
);

// Convenience selectors
export const selectHasRouteAccess = (pathname: string) => (state: NavigationStoreState) =>
  state.hasRouteAccess(pathname);

export const selectActiveWorkspaceKey = (state: NavigationStoreState) => state.activeWorkspaceKey;

export const selectWorkspaceGroups = (state: NavigationStoreState) => state.workspaceGroups;

export const selectIsInitialLoading = (state: NavigationStoreState) => state.isInitialLoading;

export const selectIsWorkspaceSwitching = (state: NavigationStoreState) =>
  state.isWorkspaceSwitching;

export type { NavigationStoreState };
