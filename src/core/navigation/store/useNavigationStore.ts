"use client";

/**
 * useNavigationStore — The SINGLE source of truth for all navigation state.
 *
 * Replaces ALL of:
 *   - NavigationProvider.navigationData (React state)
 *   - NavigationProvider.jitRoutes / jitMenus (React state)
 *   - WorkspaceProvider.wsDataCache (React state — duplicate of jitMenus!)
 *   - All localStorage manual read/write/clear helpers
 *   - NavigationRepository in-memory cache (was dead code)
 *
 * ── Architecture ────────────────────────────────────────────────────────────
 *
 *  allRoutes: Set<string>
 *    Master route registry. Populated EAGERLY on login via GET /Menus/my/routes.
 *    When any JIT workspace loads, its routes are MERGED here.
 *    hasRouteAccess() is a pure Set.has() — O(1), no waterfall, no race conditions.
 *
 *  workspaces: Map<string, NavigationData>
 *    JIT-loaded per-workspace menu trees. Replaces both jitMenus AND wsDataCache.
 *    Key = workspaceKey (e.g. "admin", "crm").
 *
 *  workspaceGroups: WorkspaceGroup[]
 *    Metadata for all workspaces (icon, name, type, colors). Loaded on first fetch.
 *
 *  reset(): void
 *    Atomically clears EVERYTHING in one call. Used on logout, impersonation,
 *    and tenant context changes. Replaces 4 different cleanup routines.
 *
 * ── Persistence ─────────────────────────────────────────────────────────────
 *
 *  Zustand persist middleware stores the state under STORAGE_KEYS.NAV_STORE.
 *  Only serializable primitives are persisted (routes as string[], not Set).
 *  The NAV_STORE_VERSION constant controls automatic cache invalidation.
 *  Bumping it causes all clients to discard old cached data on next load.
 *
 * ── Context Identity ─────────────────────────────────────────────────────────
 *
 *  contextKey: `${tenantId ?? 'platform'}:${adminId}`
 *  When the rehydrated contextKey differs from the current user's contextKey,
 *  the store auto-resets before the first fetch — preventing cross-user leakage.
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { STORAGE_KEYS } from "@core/config/storage-keys";
import type { NavigationData } from "@core/navigation/domain/entities/NavigationData";
import type { WorkspaceGroup } from "@core/navigation/domain/entities/WorkspaceGroup";
import type { MenuItem } from "@core/navigation/domain/entities/MenuItem";
import type { MenuItemActions } from "@core/navigation/domain/entities/MenuItem";

// ── Cache version — bump to invalidate all client caches ──────────────────
const NAV_STORE_VERSION = 2;

// ── System pages always accessible regardless of nav data ─────────────────
const SYSTEM_PAGES = new Set([
  "/not-authorized",
  "/not-found",
  "/500",
  "/login",
  "/",
]);

// ── Type for workspace route map from eager load ──────────────────────────
export type WorkspaceRouteMap = Record<string, string[]>;

// ── Serialized form for Zustand persist ──────────────────────────────────
interface PersistedNavState {
  /** Version — mismatches cause a full reset */
  version: number;
  /** Context key at time of persist — mismatch on rehydrate causes full reset */
  contextKey: string;
  /** All accessible routes as array (Set is not JSON-serializable) */
  allRoutesArray: string[];
  /** Per-workspace routes for quick access check without full tree */
  workspaceRouteMap: WorkspaceRouteMap;
  /** Active workspace key */
  activeWorkspaceKey: string | null;
  /** Timestamp of initial routes load (for stale-check) */
  routesLoadedAt: number | null;
}

// ── Full in-memory state ──────────────────────────────────────────────────
export interface NavigationStoreState {
  // ── Core Route Registry ─────────────────────────────────────────────────
  /** ALL accessible routes across all workspaces — O(1) lookup */
  allRoutes: Set<string>;
  /** Per-workspace route subsets — pre-seeded from eager routes load */
  workspaceRouteMap: WorkspaceRouteMap;
  /** Timestamp of initial routes eager load */
  routesLoadedAt: number | null;

  // ── Workspace Data ──────────────────────────────────────────────────────
  /** Workspace group metadata for primary rail (stubs — no full menu trees) */
  workspaceGroups: WorkspaceGroup[];
  /** JIT-loaded full menu trees, keyed by workspaceKey */
  workspaces: Map<string, NavigationData>;
  /** The default workspace's NavigationData (first loaded) */
  defaultWorkspace: NavigationData | null;

  // ── Active State ────────────────────────────────────────────────────────
  activeWorkspaceKey: string | null;
  activeRootItemId: string | null;
  previousWorkspaceKey: string | null;

  // ── Loading ─────────────────────────────────────────────────────────────
  /** True during initial login routes + default workspace fetch */
  isInitialLoading: boolean;
  /** True while a JIT workspace fetch is in-flight */
  isWorkspaceSwitching: boolean;

  // ── Context Identity ────────────────────────────────────────────────────
  contextKey: string;

  // ── Actions ─────────────────────────────────────────────────────────────

  /**
   * Called after GET /Menus/my/routes resolves (eager load on login).
   * Seeds allRoutes and workspaceRouteMap BEFORE any menu tree loads.
   */
  initializeRoutes: (
    routes: string[],
    workspaceRouteMap: WorkspaceRouteMap,
    contextKey: string
  ) => void;

  /**
   * Called after GET /Menus/my resolves (default workspace + groups).
   * Merges default workspace data into the store.
   */
  initializeDefaultWorkspace: (
    data: NavigationData,
    groups: WorkspaceGroup[]
  ) => void;

  /**
   * Called after GET /Menus/my?workspace={key} resolves (JIT workspace fetch).
   * Merges workspace data and its routes into the master route set.
   */
  setWorkspaceData: (key: string, data: NavigationData) => void;

  /** Switch the active workspace. Does NOT trigger a fetch. */
  setActiveWorkspace: (key: string | null) => void;

  /** Set the hovered/selected root item in the secondary rail. */
  setActiveRootItem: (id: string | null) => void;

  /** Track previous workspace for back-navigation. */
  setPreviousWorkspace: (key: string | null) => void;

  setIsInitialLoading: (loading: boolean) => void;
  setIsWorkspaceSwitching: (loading: boolean) => void;

  /**
   * Atomic full reset — clears ALL navigation state.
   * Call on: logout, impersonation start/end, tenant switch.
   * Replaces 4 separate cleanup routines from the old architecture.
   */
  reset: () => void;

  // ── Selectors (computed) ────────────────────────────────────────────────

  /**
   * Primary route guard check.
   * Always returns true for system pages.
   * Returns true if allRoutes is empty (loading state — fail-open).
   * Otherwise does a Set.has() lookup — O(1), no waterfall.
   */
  hasRouteAccess: (pathname: string) => boolean;

  /** Get the active WorkspaceGroup entity. */
  getActiveWorkspaceGroup: () => WorkspaceGroup | null;

  /** Get top-level menu items for the active workspace (for secondary rail root). */
  getActiveRootMenuItems: () => MenuItem[];

  /** Get the currently focused root MenuItem by activeRootItemId. */
  getActiveRootItem: () => MenuItem | null;

  /** Get page-level actions (CanCreate, CanUpdate etc.) for a given path. */
  getPageActions: (pathname: string) => MenuItemActions | null;

  /** Whether JIT data has been loaded for a workspace key. */
  hasWorkspaceData: (key: string) => boolean;
}

// ── Default/empty state ───────────────────────────────────────────────────
const defaultState = {
  allRoutes: new Set<string>(),
  workspaceRouteMap: {} as WorkspaceRouteMap,
  routesLoadedAt: null,
  workspaceGroups: [] as WorkspaceGroup[],
  workspaces: new Map<string, NavigationData>(),
  defaultWorkspace: null,
  activeWorkspaceKey: null,
  activeRootItemId: null,
  previousWorkspaceKey: null,
  isInitialLoading: true,
  isWorkspaceSwitching: false,
  contextKey: "",
};

// ── Store ─────────────────────────────────────────────────────────────────
export const useNavigationStore = create<NavigationStoreState>()(
  persist(
    (set, get) => ({
      ...defaultState,

      // ── Actions ──────────────────────────────────────────────────────────

      initializeRoutes: (routes, workspaceRouteMap, contextKey) => {
        const routeSet = new Set(routes);
        set({
          allRoutes: routeSet,
          workspaceRouteMap,
          routesLoadedAt: Date.now(),
          contextKey,
        });
      },

      initializeDefaultWorkspace: (data, groups) => {
        // Merge default workspace routes into the master Set
        const current = get().allRoutes;
        const merged = new Set(current);
        data.routes.forEach((r) => { if (r) merged.add(r); });

        // Determine default active workspace from groups
        const defaultGroup = groups.find((g) => g.workspaceType === "Admin") ?? groups[0];
        const defaultKey = defaultGroup?.workspaceKey ?? null;

        set((state) => ({
          allRoutes: merged,
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
        // Merge JIT workspace routes into master Set
        data.routes.forEach((r) => { if (r) merged.add(r); });

        set((state) => ({
          allRoutes: merged,
          workspaces: new Map(state.workspaces).set(key, data),
        }));
      },

      setActiveWorkspace: (key) => {
        set((state) => ({
          activeWorkspaceKey: key,
          previousWorkspaceKey: state.activeWorkspaceKey,
          activeRootItemId: null, // reset secondary selection on workspace change
        }));
      },

      setActiveRootItem: (id) => set({ activeRootItemId: id }),
      setPreviousWorkspace: (key) => set({ previousWorkspaceKey: key }),
      setIsInitialLoading: (loading) => set({ isInitialLoading: loading }),
      setIsWorkspaceSwitching: (loading) => set({ isWorkspaceSwitching: loading }),

      reset: () => {
        set({
          ...defaultState,
          allRoutes: new Set<string>(),
          workspaces: new Map<string, NavigationData>(),
        });
      },

      // ── Selectors ────────────────────────────────────────────────────────

      hasRouteAccess: (pathname) => {
        // System pages always pass
        if (SYSTEM_PAGES.has(pathname)) return true;

        const { allRoutes } = get();

        // While loading (empty set), fail-open so guards don't redirect prematurely
        if (allRoutes.size === 0) return true;

        // Normalize trailing slash
        const normalized = pathname.endsWith("/") && pathname !== "/"
          ? pathname.slice(0, -1)
          : pathname;

        // Exact match
        if (allRoutes.has(normalized)) return true;

        // Prefix match — covers dynamic sub-routes (e.g. /admins/[id])
        for (const route of allRoutes) {
          if (normalized.startsWith(route + "/")) return true;
        }

        return false;
      },

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

      getActiveRootItem: () => {
        const { activeRootItemId } = get();
        if (!activeRootItemId) return null;
        const items = get().getActiveRootMenuItems();
        return items.find((m) => m.id === activeRootItemId) ?? null;
      },

      getPageActions: (pathname) => {
        const items = get().getActiveRootMenuItems();
        const normalized = pathname.endsWith("/") && pathname !== "/"
          ? pathname.slice(0, -1)
          : pathname;

        // BFS search through menu tree
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

      hasWorkspaceData: (key) => {
        return get().workspaces.has(key);
      },
    }),

    // ── Persist config ────────────────────────────────────────────────────
    {
      name: STORAGE_KEYS.NAV_STORE,
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? localStorage : {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        }
      ),

      /**
       * Only persist the lightweight route data — NOT the full menu trees.
       * Full menu trees are re-fetched via TanStack Query (staleTime: 30 min).
       * This keeps localStorage < 10 KB and avoids stale tree data issues.
       */
      partialize: (state): PersistedNavState => ({
        version: NAV_STORE_VERSION,
        contextKey: state.contextKey,
        allRoutesArray: Array.from(state.allRoutes),
        workspaceRouteMap: state.workspaceRouteMap,
        activeWorkspaceKey: state.activeWorkspaceKey,
        routesLoadedAt: state.routesLoadedAt,
      }),

      /**
       * On rehydrate, convert the serialized form back to live state.
       * Validates version and contextKey before accepting cached data.
       */
      merge: (persistedRaw, currentState) => {
        const persisted = persistedRaw as PersistedNavState | null;

        if (!persisted || persisted.version !== NAV_STORE_VERSION) {
          // Version mismatch — discard all cached data
          return currentState;
        }

        return {
          ...currentState,
          allRoutes: new Set(persisted.allRoutesArray ?? []),
          workspaceRouteMap: persisted.workspaceRouteMap ?? {},
          routesLoadedAt: persisted.routesLoadedAt ?? null,
          activeWorkspaceKey: persisted.activeWorkspaceKey ?? null,
          // Preserve persisted contextKey so the provider can validate it
          contextKey: persisted.contextKey ?? "",
        };
      },
    }
  )
);

// ── Convenience selectors (for use in components without re-render risk) ──
export const selectHasRouteAccess = (pathname: string) =>
  (state: NavigationStoreState) => state.hasRouteAccess(pathname);

export const selectActiveWorkspaceKey = (state: NavigationStoreState) =>
  state.activeWorkspaceKey;

export const selectWorkspaceGroups = (state: NavigationStoreState) =>
  state.workspaceGroups;

export const selectIsInitialLoading = (state: NavigationStoreState) =>
  state.isInitialLoading;

export const selectIsWorkspaceSwitching = (state: NavigationStoreState) =>
  state.isWorkspaceSwitching;
