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
  useMemo,
} from "react";
import type React from "react";
import { useRouter } from "next/navigation";
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
  const rootMenuItems = useMemo<MenuItem[]>(() => {
    return store.getActiveRootMenuItems();
  }, [store, activeWorkspaceKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Active root item entity ───────────────────────────────────────────────
  const activeRootItem = useMemo<MenuItem | null>(() => {
    if (!activeRootItemId) return null;
    return rootMenuItems.find((m) => m.id === activeRootItemId) ?? null;
  }, [activeRootItemId, rootMenuItems]);

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

  const setActiveRootItemId = useCallback(
    (id: string | null) => {
      store.setActiveRootItem(id);
    },
    [store]
  );

  const setActiveWorkspace = useCallback(
    async (workspaceKey: string, navigateTo = false) => {
      appLogger.debug(`[WorkspaceProvider] Switching to workspace: ${workspaceKey}`);

      // Update active key immediately — UI reacts right away
      store.setActiveWorkspace(workspaceKey);
      store.setActiveRootItem(null);

      // JIT fetch if not cached
      if (!store.hasWorkspaceData(workspaceKey)) {
        await fetchWorkspaceMenu(workspaceKey);
      }

      // Navigate to workspace's first page using replace() — kills history stack
      // so the browser Back button cannot jump between workspaces.
      if (navigateTo) {
        const ws = store.workspaces.get(workspaceKey) ?? null;
        const firstHref = ws ? firstPageOf(ws) : null;
        if (firstHref) {
          router.replace(firstHref);
          return;
        }
      }
    },
    [store, fetchWorkspaceMenu, router]
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
