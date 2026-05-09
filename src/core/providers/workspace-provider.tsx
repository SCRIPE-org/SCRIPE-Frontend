"use client";

/**
 * WorkspaceProvider — Pure UI State Manager (v2)
 *
 * Responsibilities (v2 — simplified):
 *  1. Reads workspace groups + active workspace key FROM useNavigationStore
 *  2. Provides computed values for the Nexus dual-rail layout (via useMemo)
 *  3. Handles workspace switch → delegates JIT fetch to NavigationProvider
 *  4. Manages activeRootItem selection (secondary rail panel content)
 *
 * What this provider does NOT do (v2):
 *  ❌ Maintain wsDataCache (store.workspaces Map handles this)
 *  ❌ Read/write WORKSPACE_KEY from localStorage (store persist handles this)
 *  ❌ Subscribe to authBroadcast (NavigationProvider handles this)
 *  ❌ Subscribe to tenant changes (NavigationProvider handles this)
 *
 * The full workspace context API surface is preserved for backwards compatibility
 * so existing consumers (layout, rail components) don't need changes.
 */

import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import type React from "react";
import { useRouter, usePathname } from "next/navigation";
import { useNavigation } from "@core/providers/navigation-provider";
import { useI18n } from "@core/providers/i18n-provider";
import { useNavigationStore } from "@core/navigation/store/useNavigationStore";
import type { WorkspaceGroup, MenuItem } from "@core/navigation";
import { appLogger } from "@core/common/logger";

// ── Context shape ──────────────────────────────────────────────────────────
interface WorkspaceContextType {
  /** All workspaces sorted by sortOrder */
  workspaceGroups: WorkspaceGroup[];
  /** Currently selected workspace, or null while loading */
  activeWorkspace: WorkspaceGroup | null;
  /**
   * Switch the active workspace. Triggers JIT fetch if not cached.
   * Also navigates to the workspace's first page if navigateTo is true.
   */
  setActiveWorkspace: (workspaceKey: string, navigateTo?: boolean) => void;
  /** Root-level menu items of the active workspace (for primary rail) */
  rootMenuItems: MenuItem[];
  /** The currently selected root item (secondary rail panel content) */
  activeRootItem: MenuItem | null;
  /** Select a root item by its ID */
  setActiveRootItemId: (id: string | null) => void;
  /** CSS oklch() color string for active workspace accent, or null */
  accentColor: string | null;
  /** True while initial navigation data is loading */
  isLoading: boolean;
  /** True while a JIT workspace fetch is in-flight */
  isWorkspaceLoading: boolean;
  /** True when active workspace is a Module-type (triggers layout mode switch) */
  isModuleMode: boolean;
  /** Previous admin workspace key for Back button */
  previousWorkspaceKey: string | null;
  /** Return to the previous admin workspace (exit module mode) */
  goBack: () => void;
  /** Switch to first available module workspace, saving current for goBack() */
  switchToModuleWorkspace: () => void;
  /** Switch to a specific module workspace by key, saving current for goBack() */
  switchToModuleWorkspaceByKey: (key: string) => void;
  /** @deprecated use workspaceGroups.filter(ws => ws.isAdminWorkspace) */
  adminWorkspaces: WorkspaceGroup[];
  /** @deprecated use workspaceGroups.filter(ws => ws.isModuleWorkspace) */
  moduleWorkspaces: WorkspaceGroup[];
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

// ── Helper: first navigable page of a workspace ────────────────────────────
// Accepts any object with a menuItems array — works with WorkspaceGroup AND NavigationData.
type WithMenuItems = { menuItems?: Array<{ href?: string | null; children?: Array<{ href?: string | null }> }> };
function firstPageOf(ws: WithMenuItems): string | null {
  for (const root of ws.menuItems ?? []) {
    if (root.href && !root.href.startsWith("#")) return root.href;
    for (const child of root.children ?? []) {
      if (child.href && !child.href.startsWith("#")) return child.href;
    }
  }
  return null;
}

// ── Helper: oklch accent color from workspace ──────────────────────────────
function getAccentColor(ws: WorkspaceGroup | null): string | null {
  if (!ws || ws.colorHue === null || ws.colorHue === undefined) return null;
  const chroma = ws.colorChroma ?? 0.18;
  return `oklch(0.6 ${chroma} ${ws.colorHue})`;
}

// ── Provider ──────────────────────────────────────────────────────────────
export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const { fetchWorkspaceMenu } = useNavigation();
  const { language } = useI18n();
  const router = useRouter();

  // ── Read all state from the single store ──────────────────────────────────
  const store = useNavigationStore();
  const {
    workspaceGroups,
    activeWorkspaceKey,
    activeRootItemId,
    previousWorkspaceKey,
    isInitialLoading,
    isWorkspaceSwitching,
  } = store;

  // ── Sorted workspace list ─────────────────────────────────────────────────
  const sortedGroups = useMemo(
    () => [...workspaceGroups].sort((a, b) => a.workspaceSortOrder - b.workspaceSortOrder),
    [workspaceGroups]
  );

  // ── Active workspace entity ───────────────────────────────────────────────
  const activeWorkspace = useMemo<WorkspaceGroup | null>(() => {
    if (!activeWorkspaceKey) return sortedGroups[0] ?? null;
    return sortedGroups.find((ws) => ws.workspaceKey === activeWorkspaceKey) ?? sortedGroups[0] ?? null;
  }, [activeWorkspaceKey, sortedGroups]);

  // ── Root menu items for active workspace ─────────────────────────────────
  // Use getState() inside the memo so we read the latest store data without
  // adding `store` (a new snapshot object every render) to the deps array.
  const rootMenuItems = useMemo<MenuItem[]>(() => {
    return useNavigationStore.getState().getActiveRootMenuItems();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeWorkspaceKey]);

  // ── Active root item entity ───────────────────────────────────────────────
  const activeRootItem = useMemo<MenuItem | null>(() => {
    if (!activeRootItemId) return null;
    return rootMenuItems.find((m) => m.id === activeRootItemId) ?? null;
  }, [activeRootItemId, rootMenuItems]);

  // ── Auto-sync activeRootItem from URL ─────────────────────────────────────
  // When the user navigates (hard-nav, refresh, or workspace switch lands on a
  // page), derive the best-matching root item from the current pathname so that
  // the primary rail icon and the secondary rail panel are always in sync with
  // the actual URL — even if no root item was explicitly clicked.
  const pathname = usePathname();
  useEffect(() => {
    if (!rootMenuItems.length) return;

    // Helper: clean path (same logic as secondary rail)
    const clean = (p: string | undefined | null) => {
      if (!p) return "";
      const c = p.split("?")[0].split("#")[0];
      return c.length > 1 && c.endsWith("/") ? c.slice(0, -1) : c;
    };

    const cleanedPathname = clean(pathname);

    // Check if current activeRootItem already covers this pathname
    if (activeRootItemId) {
      const current = rootMenuItems.find((m) => m.id === activeRootItemId);
      if (current) {
        const containsCurrent = (items: MenuItem[]): boolean =>
          items.some((item) => {
            if (item.href && !item.href.startsWith("#")) {
              const h = clean(item.href);
              if (cleanedPathname === h) return true;
              if (h !== "/" && cleanedPathname.startsWith(h + "/")) return true;
            }
            return item.children?.length ? containsCurrent(item.children) : false;
          });
        // If current root item still covers the pathname, leave it alone
        if (
          (current.href && clean(current.href) === cleanedPathname) ||
          containsCurrent(current.children ?? [])
        ) {
          return;
        }
      }
    }

    // Find the best-matching root item for the current pathname
    let bestRootId: string | null = null;
    let bestLen = -1;

    const scoreRoot = (root: MenuItem) => {
      const check = (items: MenuItem[]): number => {
        let score = -1;
        for (const item of items) {
          if (item.href && !item.href.startsWith("#")) {
            const h = clean(item.href);
            if (cleanedPathname === h) return h.length; // exact wins
            if (h !== "/" && cleanedPathname.startsWith(h + "/")) {
              score = Math.max(score, h.length);
            }
          }
          if (item.children?.length) {
            const childScore = check(item.children);
            if (childScore > score) score = childScore;
          }
        }
        return score;
      };

      // Also check the root item's own href
      if (root.href && !root.href.startsWith("#")) {
        const h = clean(root.href);
        if (cleanedPathname === h) return h.length;
        if (h !== "/" && cleanedPathname.startsWith(h + "/")) return h.length;
      }
      return check(root.children ?? []);
    };

    for (const root of rootMenuItems) {
      const score = scoreRoot(root);
      if (score > bestLen) {
        bestLen = score;
        bestRootId = root.id;
      }
    }

    if (bestRootId && bestRootId !== activeRootItemId) {
      store.setActiveRootItem(bestRootId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, rootMenuItems]);

  // ── Legacy splits ─────────────────────────────────────────────────────────
  const adminWorkspaces = useMemo(
    () => sortedGroups.filter((ws) => ws.isAdminWorkspace),
    [sortedGroups]
  );
  const moduleWorkspaces = useMemo(
    () => sortedGroups.filter((ws) => ws.isModuleWorkspace),
    [sortedGroups]
  );

  // ── Accent color ──────────────────────────────────────────────────────────
  const accentColor = useMemo(() => getAccentColor(activeWorkspace), [activeWorkspace]);

  // ── isModuleMode ──────────────────────────────────────────────────────────
  const isModuleMode = useMemo(
    () => activeWorkspace?.isModuleWorkspace ?? false,
    [activeWorkspace]
  );

  // ── Actions ───────────────────────────────────────────────────────────────

  // Zustand action functions are stable references — no wrapper needed.
  const setActiveRootItemId = useNavigationStore((s) => s.setActiveRootItem);

  const setActiveWorkspace = useCallback(
    async (workspaceKey: string, navigateTo = false) => {
      appLogger.debug(`[WorkspaceProvider] Switching to workspace: ${workspaceKey}`);

      // All store WRITES use getState() so we always hit the live store,
      // not a stale React-render snapshot captured in the closure.
      useNavigationStore.getState().setActiveWorkspace(workspaceKey);
      useNavigationStore.getState().setActiveRootItem(null);

      // JIT fetch if not cached — also via getState() to avoid stale cache check.
      if (!useNavigationStore.getState().hasWorkspaceData(workspaceKey)) {
        await fetchWorkspaceMenu(workspaceKey);
      }

      // Navigate to workspace's first page using replace() — kills history stack
      // so the browser Back button cannot jump between workspaces.
      //
      // Must read FRESH state here: fetchWorkspaceMenu() has written the new
      // workspace data into the store, but `store` (React render snapshot) still
      // has the old state. getState() always returns the current live state.
      if (navigateTo) {
        const freshState = useNavigationStore.getState();
        const wsData = freshState.workspaces.get(workspaceKey) ?? null;
        const firstHref = wsData ? firstPageOf(wsData) : null;
        if (firstHref) {
          router.replace(firstHref);
          return;
        }
        // Fallback: workspace has no JIT data yet — use WorkspaceGroup menuItems
        // (populated from the initial eagerly-loaded groups response)
        const wsGroup = freshState.workspaceGroups.find(
          (g) => g.workspaceKey === workspaceKey
        ) ?? null;
        const groupFirstHref = wsGroup ? firstPageOf(wsGroup) : null;
        if (groupFirstHref) {
          router.replace(groupFirstHref);
        }
      }
    },
    // `store` intentionally excluded — all reads/writes go through getState().
    // Only truly external dependencies that can change belong here.
    [fetchWorkspaceMenu, router]
  );


  const goBack = useCallback(async () => {
    const prev = previousWorkspaceKey ?? adminWorkspaces[0]?.workspaceKey;
    if (prev) {
      // Navigate to the first page of the destination workspace using replace()
      // so there's no dangling module-workspace history entry.
      await setActiveWorkspace(prev, true);
    }
    store.setPreviousWorkspace(null);
  }, [previousWorkspaceKey, adminWorkspaces, setActiveWorkspace, store]);


  const switchToModuleWorkspaceByKey = useCallback(
    (key: string) => {
      // Save current workspace for goBack()
      store.setPreviousWorkspace(activeWorkspaceKey ?? adminWorkspaces[0]?.workspaceKey ?? null);
      setActiveWorkspace(key, true);
    },
    [store, activeWorkspaceKey, adminWorkspaces, setActiveWorkspace]
  );

  const switchToModuleWorkspace = useCallback(() => {
    const firstModule = moduleWorkspaces[0];
    if (firstModule) {
      switchToModuleWorkspaceByKey(firstModule.workspaceKey);
    }
  }, [moduleWorkspaces, switchToModuleWorkspaceByKey]);

  // ── Context value ─────────────────────────────────────────────────────────
  const value: WorkspaceContextType = {
    workspaceGroups: sortedGroups,
    activeWorkspace,
    setActiveWorkspace,
    rootMenuItems,
    activeRootItem,
    setActiveRootItemId,
    accentColor,
    isLoading: isInitialLoading,
    isWorkspaceLoading: isWorkspaceSwitching,
    isModuleMode,
    previousWorkspaceKey,
    goBack,
    switchToModuleWorkspace,
    switchToModuleWorkspaceByKey,
    adminWorkspaces,
    moduleWorkspaces,
  };

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
}

// ── Hooks ──────────────────────────────────────────────────────────────────
export function useWorkspace(): WorkspaceContextType {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) {
    throw new Error("useWorkspace must be used within WorkspaceProvider");
  }
  return ctx;
}
