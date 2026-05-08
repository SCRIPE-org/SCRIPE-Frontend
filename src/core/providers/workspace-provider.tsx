"use client";

/**
 * WorkspaceProvider
 *
 * Provides the active workspace state AND active root-item state for the Nexus dual-rail layout.
 *
 * JIT Architecture:
 *  - On first load the default workspace menu is already in NavigationContext (fetched at login).
 *  - When the user switches to a different workspace, we call fetchWorkspaceMenu(key) from
 *    NavigationContext which either returns a cached result instantly OR makes a single network
 *    request for that workspace's menu items and caches them for the session.
 *  - No workspace data is fetched until the user explicitly switches to it.
 *
 * Exports:
 *  - workspaceGroups     — all workspaces ordered by sortOrder
 *  - activeWorkspace     — currently selected WorkspaceGroup
 *  - setActiveWorkspace  — switch workspace (JIT fetch + persisted to localStorage)
 *  - rootMenuItems       — root menu items of the active workspace (for primary rail)
 *  - activeRootItem      — selected root item (for secondary rail panel)
 *  - setActiveRootItemId — select which root item's children to show
 *  - accentColor         — CSS oklch() string or null
 *  - isModuleMode        — true when active workspace is classified as Module
 *  - isWorkspaceLoading  — true while the JIT fetch for the active workspace is in-flight
 *  - previousWorkspaceKey — set when entering module mode (for Back button)
 *  - goBack              — exit module mode, restore previous admin workspace
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { useRouter } from "next/navigation";
import { useNavigation } from "@core/providers/navigation-provider";
import { useI18n } from "@core/providers/i18n-provider";
import { usePathname } from "next/navigation";
import type { WorkspaceGroup, MenuItem } from "@core/navigation";
import { NavigationData } from "@core/navigation";
import { appLogger } from "@core/common/logger";

// ── Storage keys ───────────────────────────────────────────────────────────────
const WORKSPACE_KEY = "nexora:active-workspace";
const ROOT_ITEM_KEY = "nexora:active-root-item";

// ── Context shape ─────────────────────────────────────────────────────────────
interface WorkspaceContextType {
  /** All workspaces sorted by sortOrder */
  workspaceGroups: WorkspaceGroup[];
  /** Currently selected workspace, or null while loading */
  activeWorkspace: WorkspaceGroup | null;
  /**
   * Switch the active workspace. Triggers JIT fetch if not cached.
   * Also navigates to the workspace's first page.
   */
  setActiveWorkspace: (workspaceKey: string) => void;
  /**
   * Root-level menu items of the active workspace.
   * These are rendered as icon buttons in the primary rail.
   */
  rootMenuItems: MenuItem[];
  /**
   * The currently selected root item. Its children appear in the secondary rail.
   * Null when no root item is selected yet.
   */
  activeRootItem: MenuItem | null;
  /** Select a root item by its ID */
  setActiveRootItemId: (id: string) => void;
  /** CSS oklch() color string for active workspace accent, or null */
  accentColor: string | null;
  /** True while navigation data is still loading (initial) */
  isLoading: boolean;
  /** True while the JIT network request for a workspace is in-flight */
  isWorkspaceLoading: boolean;
  /**
   * True when the active workspace is a Module-type workspace.
   * Triggers layout mode switch (back button etc.)
   */
  isModuleMode: boolean;
  /** Previous admin workspace key, set when entering module mode */
  previousWorkspaceKey: string | null;
  /** Return to the previous admin workspace (exit module mode) */
  goBack: () => void;
  /**
   * Switch to the first available module workspace (e.g. CRM),
   * saving the current workspace so goBack() can return to it.
   */
  switchToModuleWorkspace: () => void;
  /**
   * Switch to a specific module workspace by its key,
   * saving the current workspace so goBack() can return to it.
   */
  switchToModuleWorkspaceByKey: (key: string) => void;
  /** @deprecated use rootMenuItems + activeRootItem instead */
  adminWorkspaces: WorkspaceGroup[];
  /** @deprecated use rootMenuItems + activeRootItem instead */
  moduleWorkspaces: WorkspaceGroup[];
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

// ── Helper: first page of a workspace ─────────────────────────────────────────
function firstPageOf(ws: WorkspaceGroup): string | null {
  for (const root of ws.menuItems ?? []) {
    if (root.href && !root.href.startsWith("#")) return root.href;
    for (const child of root.children ?? []) {
      if (child.href && !child.href.startsWith("#")) return child.href;
    }
  }
  return null;
}

// ── Provider ──────────────────────────────────────────────────────────────────
export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const { navigationData, fetchWorkspaceMenu } = useNavigation();
  const { language } = useI18n();
  const pathname = usePathname();
  const router = useRouter();

  // ── Sorted workspace list ──────────────────────────────────────────────────
  const workspaceGroups = useMemo<WorkspaceGroup[]>(() => {
    if (!navigationData) return [];
    return [...navigationData.workspaceGroups].sort(
      (a, b) => a.workspaceSortOrder - b.workspaceSortOrder
    );
  }, [navigationData]);

  // ── Legacy compat: split by backend classification ─────────────────────────
  const adminWorkspaces = useMemo(
    () => workspaceGroups.filter((ws) => ws.isAdminWorkspace),
    [workspaceGroups]
  );
  const moduleWorkspaces = useMemo(
    () => workspaceGroups.filter((ws) => ws.isModuleWorkspace),
    [workspaceGroups]
  );

  // ── Active workspace key (persisted) ───────────────────────────────────────
  const [activeKey, setActiveKey] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(WORKSPACE_KEY) ?? null;
  });

  // ── Previous workspace key for Back button ─────────────────────────────────
  const [previousWorkspaceKey, setPreviousWorkspaceKey] = useState<string | null>(null);

  // ── Active root item id (persisted) ───────────────────────────────────────
  const [activeRootItemId, setActiveRootItemIdState] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(ROOT_ITEM_KEY) ?? null;
  });

  /**
   * Per-workspace NavigationData cache — populated by JIT fetches.
   * The default workspace data comes from the global navigationData,
   * while other workspaces land here when fetched on demand.
   */
  const [wsDataCache, setWsDataCache] = useState<Record<string, NavigationData>>({});

  /** True while we're doing a JIT network request for a workspace */
  const [isWorkspaceLoading, setIsWorkspaceLoading] = useState(false);

  // ── Resolve WorkspaceGroup ─────────────────────────────────────────────────
  const activeWorkspace = useMemo<WorkspaceGroup | null>(() => {
    if (workspaceGroups.length === 0) return null;
    const found = workspaceGroups.find((g) => g.workspaceKey === activeKey);
    return found ?? workspaceGroups[0] ?? null;
  }, [workspaceGroups, activeKey]);

  // ── Root menu items of the active workspace ────────────────────────────────
  // JIT: if the workspace was loaded on-demand, use its menu items from the cache.
  // Otherwise fall back to what came with the default workspace response.
  const rootMenuItems = useMemo<MenuItem[]>(() => {
    if (!activeWorkspace) return [];
    const jitData = activeWorkspace ? wsDataCache[activeWorkspace.workspaceKey] : null;
    if (jitData) {
      const jitGroup = jitData.workspaceGroups.find(
        (g) => g.workspaceKey === activeWorkspace.workspaceKey
      );
      if (jitGroup && jitGroup.menuItems.length > 0) return jitGroup.menuItems;
    }
    return activeWorkspace.menuItems;
  }, [activeWorkspace, wsDataCache]);


  // ── Resolve activeRootItem ─────────────────────────────────────────────────
  const activeRootItem = useMemo<MenuItem | null>(() => {
    if (rootMenuItems.length === 0) return null;
    const found = rootMenuItems.find((item) => item.id === activeRootItemId);
    // Auto-select: prefer the item whose children contain the current pathname
    if (!found && pathname) {
      const matchByPath = rootMenuItems.find((root) =>
        root.children.some(
          (child) =>
            child.href === pathname ||
            (child.href && pathname.startsWith(child.href + "/"))
        )
      );
      if (matchByPath) return matchByPath;
    }
    return found ?? rootMenuItems[0] ?? null;
  }, [rootMenuItems, activeRootItemId, pathname]);

  /** True when the active workspace is a Module-type workspace */
  const isModuleMode = activeWorkspace?.isModuleWorkspace ?? false;

  // ── CSS injection ──────────────────────────────────────────────────────────
  const htmlRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (typeof document === "undefined") return;
    htmlRef.current = document.documentElement;
  }, []);

  useEffect(() => {
    const html = htmlRef.current ?? document.documentElement;
    if (activeWorkspace?.colorHue != null) {
      html.style.setProperty("--workspace-hue", String(activeWorkspace.colorHue));
      html.style.setProperty(
        "--workspace-chroma",
        String(activeWorkspace.colorChroma ?? 0.18)
      );
    } else {
      html.style.removeProperty("--workspace-hue");
      html.style.removeProperty("--workspace-chroma");
    }
    html.setAttribute("data-nexus-mode", isModuleMode ? "module" : "admin");
  }, [activeWorkspace, isModuleMode]);

  // ── JIT fetch on workspace switch ─────────────────────────────────────────

  /**
   * Internal: switch workspace key, trigger JIT fetch, navigate to first page.
   */
  const doSwitchWorkspace = useCallback(
    async (workspaceKey: string, navigate = true) => {
      // Persist immediately for instant visual feedback
      setActiveKey(workspaceKey);
      setActiveRootItemIdState(null);
      try {
        localStorage.setItem(WORKSPACE_KEY, workspaceKey);
        localStorage.removeItem(ROOT_ITEM_KEY);
      } catch { /* ignore */ }

      // Check if already in cache
      if (wsDataCache[workspaceKey]) {
        appLogger.debug(`Workspace "${workspaceKey}" already in memory cache`);
        if (navigate) {
          const cached = wsDataCache[workspaceKey];
          const targetGroup = cached.workspaceGroups.find((g) => g.workspaceKey === workspaceKey);
          if (targetGroup) {
            const page = firstPageOf(targetGroup);
            if (page) router.push(page);
          }
        }
        return;
      }

      // JIT fetch
      setIsWorkspaceLoading(true);
      try {
        appLogger.debug(`JIT fetch for workspace "${workspaceKey}"`);
        const data = await fetchWorkspaceMenu(workspaceKey);
        if (data) {
          setWsDataCache((prev) => ({ ...prev, [workspaceKey]: data }));
          if (navigate) {
            const targetGroup = data.workspaceGroups.find((g) => g.workspaceKey === workspaceKey);
            if (targetGroup) {
              const page = firstPageOf(targetGroup);
              if (page) router.push(page);
            }
          }
        }
      } catch (err) {
        appLogger.error(`Failed to load workspace "${workspaceKey}":`, err);
      } finally {
        setIsWorkspaceLoading(false);
      }
    },
    [fetchWorkspaceMenu, wsDataCache, router]
  );

  // ── Public setActiveWorkspace ──────────────────────────────────────────────

  const setActiveWorkspace = useCallback(
    (workspaceKey: string) => {
      doSwitchWorkspace(workspaceKey, true);
    },
    [doSwitchWorkspace]
  );

  const setActiveRootItemId = useCallback((id: string) => {
    setActiveRootItemIdState(id);
    try {
      localStorage.setItem(ROOT_ITEM_KEY, id);
    } catch { /* ignore */ }
  }, []);

  const goBack = useCallback(() => {
    if (previousWorkspaceKey) {
      const key = previousWorkspaceKey;
      setPreviousWorkspaceKey(null);
      doSwitchWorkspace(key, true);
    }
  }, [previousWorkspaceKey, doSwitchWorkspace]);

  /**
   * Switch to the first module workspace (e.g. CRM), saving the current
   * admin workspace key so goBack() can restore it later.
   */
  const switchToModuleWorkspace = useCallback(() => {
    const firstModule = moduleWorkspaces[0];
    if (!firstModule) return;
    const currentKey = activeKey ?? activeWorkspace?.workspaceKey ?? null;
    if (currentKey) setPreviousWorkspaceKey(currentKey);
    doSwitchWorkspace(firstModule.workspaceKey, true);
  }, [moduleWorkspaces, activeKey, activeWorkspace, doSwitchWorkspace]);

  const switchToModuleWorkspaceByKey = useCallback(
    (key: string) => {
      const currentKey = activeKey ?? activeWorkspace?.workspaceKey ?? null;
      if (currentKey) setPreviousWorkspaceKey(currentKey);
      doSwitchWorkspace(key, true);
    },
    [activeKey, activeWorkspace, doSwitchWorkspace]
  );

  // ── Clear JIT cache on navigation cache invalidation ──────────────────────
  // When NavigationProvider purges all caches (impersonation/tenant change),
  // the workspaceGroups will become empty, then repopulate. Clear local cache.
  const prevGroupCount = useRef(workspaceGroups.length);
  useEffect(() => {
    const newCount = workspaceGroups.length;
    if (prevGroupCount.current > 0 && newCount === 0) {
      // Navigation was just cleared — wipe local JIT cache too
      setWsDataCache({});
    }
    prevGroupCount.current = newCount;
  }, [workspaceGroups.length]);

  const accentColor = activeWorkspace?.accentColor ?? null;
  const isLoading = workspaceGroups.length === 0 && navigationData !== null;

  const value = useMemo<WorkspaceContextType>(
    () => ({
      workspaceGroups,
      adminWorkspaces,
      moduleWorkspaces,
      activeWorkspace,
      setActiveWorkspace,
      rootMenuItems,
      activeRootItem,
      setActiveRootItemId,
      accentColor,
      isLoading,
      isWorkspaceLoading,
      isModuleMode,
      previousWorkspaceKey,
      goBack,
      switchToModuleWorkspace,
      switchToModuleWorkspaceByKey,
    }),
    [
      workspaceGroups,
      adminWorkspaces,
      moduleWorkspaces,
      activeWorkspace,
      setActiveWorkspace,
      rootMenuItems,
      activeRootItem,
      setActiveRootItemId,
      accentColor,
      isLoading,
      isWorkspaceLoading,
      isModuleMode,
      previousWorkspaceKey,
      goBack,
      switchToModuleWorkspace,
      switchToModuleWorkspaceByKey,
    ]
  );

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

// ── Public hook ───────────────────────────────────────────────────────────────
export function useWorkspace(): WorkspaceContextType {
  const ctx = useContext(WorkspaceContext);
  if (ctx === undefined) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return ctx;
}
