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
import { useRouter, usePathname } from "next/navigation";
import { useNavigation } from "@core/providers/navigation-provider";
import { authBroadcast } from "@core/common/broadcast-auth";
import { useI18n } from "@core/providers/i18n-provider";
import { useTenantContext } from "@core/providers/tenant-context-provider";
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

// ── Helper: clean pathname ────────────────────────────────────────────────────
function cleanPath(p: string | undefined | null): string {
  if (!p) return "";
  let cleaned = p.split("?")[0].split("#")[0];
  if (cleaned.endsWith("/")) {
    cleaned = cleaned.slice(0, -1);
  }
  return cleaned;
}

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

  /**
   * User's EXPLICIT selection — set when the user clicks a root item in the primary rail.
   * This overrides the URL-derived item so the user can browse any section
   * without being forced to stay on the current page's parent.
   * Cleared automatically when the URL changes to a page that belongs to
   * a recognised root item (i.e., the user navigated via a secondary rail link).
   */
  const [userSelectedRootItemId, setUserSelectedRootItemId] = useState<string | null>(() => {
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

  // ── Auth & Tenant Context Listeners ────────────────────────────────────────

  const { currentTenant } = useTenantContext();
  const tenantIdRef = useRef(currentTenant?.id ?? null);

  useEffect(() => {
    const newTenantId = currentTenant?.id ?? null;
    if (newTenantId !== tenantIdRef.current) {
      tenantIdRef.current = newTenantId;
      setActiveKey(null);
      setPreviousWorkspaceKey(null);
      setUserSelectedRootItemId(null);
      setWsDataCache({});
      try {
        localStorage.removeItem(WORKSPACE_KEY);
        localStorage.removeItem(ROOT_ITEM_KEY);
      } catch { /* ignore */ }
    }
  }, [currentTenant]);

  useEffect(() => {
    authBroadcast.onImpersonation(() => {
      setActiveKey(null);
      setPreviousWorkspaceKey(null);
      setUserSelectedRootItemId(null);
      setWsDataCache({});
      try {
        localStorage.removeItem(WORKSPACE_KEY);
        localStorage.removeItem(ROOT_ITEM_KEY);
      } catch { /* ignore */ }
    });
  }, []);

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
      // API returns the items for the requested workspace in the top-level menuItems
      if (jitData.menuItems && jitData.menuItems.length > 0) return jitData.menuItems;

      const jitGroup = jitData.workspaceGroups.find(
        (g) => g.workspaceKey === activeWorkspace.workspaceKey
      );
      if (jitGroup && jitGroup.menuItems.length > 0) return jitGroup.menuItems;
    }
    return activeWorkspace.menuItems;
  }, [activeWorkspace, wsDataCache]);

  const cleanedPathname = cleanPath(pathname);

  // ── URL-derived root item (pure computation — no state, no side-effects) ───
  // Finds which root item's subtree the current pathname belongs to.
  // This is the ground-truth "you are here" based solely on the URL.
  const urlRootItemId = useMemo<string | null>(() => {
    if (!cleanedPathname || rootMenuItems.length === 0) return null;

    let bestId: string | null = null;
    let bestLen = -1;

    function searchNode(node: MenuItem, rootId: string): void {
      const href = cleanPath(node.href);
      if (href && (cleanedPathname === href || cleanedPathname.startsWith(href + "/"))) {
        if (href.length > bestLen) {
          bestLen = href.length;
          bestId = rootId;
        }
      }
      for (const child of node.children ?? []) {
        searchNode(child, rootId);
      }
    }

    for (const root of rootMenuItems) {
      searchNode(root, root.id);
    }

    return bestId;
  }, [rootMenuItems, cleanedPathname]);

  // ── Clear user selection when URL changes to a page under a known root item ──
  // This makes the URL take over after the user navigates via a secondary rail link.
  // If the URL doesn't match any root item (e.g. /profile), the user’s browsing
  // selection is preserved so the panel doesn’t snap away.
  const prevPathnameRef = useRef(cleanedPathname);
  useEffect(() => {
    if (cleanedPathname === prevPathnameRef.current) return;
    prevPathnameRef.current = cleanedPathname;

    if (urlRootItemId !== null) {
      // Real navigation happened and the new URL belongs to a root section.
      // Drop the user’s manual selection so the URL drives the active state.
      setUserSelectedRootItemId(null);
      try { localStorage.removeItem(ROOT_ITEM_KEY); } catch { /* ignore */ }
    }
    // If urlRootItemId is null (system page like /profile), keep user selection.
  }, [cleanedPathname, urlRootItemId]);

  // ── Effective active root item ID ─────────────────────────────────────────
  // User’s explicit click always wins; URL-derived is the fallback.
  const effectiveRootItemId = userSelectedRootItemId ?? urlRootItemId;

  // ── Resolve activeRootItem ─────────────────────────────────────────────────
  const activeRootItem = useMemo<MenuItem | null>(() => {
    if (rootMenuItems.length === 0) return null;
    if (!effectiveRootItemId) return null;
    return rootMenuItems.find((item) => item.id === effectiveRootItemId) ?? null;
  }, [rootMenuItems, effectiveRootItemId]);

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

  // ── Auto-Switch Workspace Based on URL (Deep Linking) ──────────────────────
  useEffect(() => {
    if (!pathname || workspaceGroups.length === 0) return;
    
    // Switch to default admin workspace on root or known system paths
    if (cleanedPathname === "" || cleanedPathname === "/profile" || cleanedPathname === "/not-authorized") {
      const defaultWs = workspaceGroups.find(g => g.isAdminWorkspace) || workspaceGroups[0];
      if (defaultWs && defaultWs.workspaceKey !== activeKey) {
        doSwitchWorkspace(defaultWs.workspaceKey, false);
      }
      return;
    }

    // Is the current path already handled by the active workspace?
    const currentMatches = rootMenuItems.some((root) => {
      const rHref = cleanPath(root.href);
      if (rHref && (cleanedPathname === rHref || cleanedPathname.startsWith(rHref + "/"))) return true;
      return root.children?.some((child) => {
        const cHref = cleanPath(child.href);
        return cHref && (cleanedPathname === cHref || cleanedPathname.startsWith(cHref + "/"));
      });
    });

    if (currentMatches) return; // All good, current workspace owns this path

    // It doesn't match the active workspace. See if it strictly maps to another workspace's key/route.
    // We assume module workspaces map to `/{workspaceKey}`
    const possibleWorkspace = workspaceGroups.find((wg) => 
      cleanedPathname === `/${wg.workspaceKey}` || cleanedPathname.startsWith(`/${wg.workspaceKey}/`)
    );

    if (possibleWorkspace && possibleWorkspace.workspaceKey !== activeKey) {
      appLogger.debug(`URL-sync: switching to workspace "${possibleWorkspace.workspaceKey}" based on deep-link ${cleanedPathname}`);
      doSwitchWorkspace(possibleWorkspace.workspaceKey, false); // false = do not push state/navigate
    }
  }, [cleanedPathname, workspaceGroups, activeKey, rootMenuItems]);

  // ── JIT fetch on workspace switch ─────────────────────────────────────────

  /**
   * Internal: switch workspace key, trigger JIT fetch, navigate to first page.
   */
  const doSwitchWorkspace = useCallback(
    async (workspaceKey: string, navigate = true) => {
      // Persist immediately for instant visual feedback
      setActiveKey(workspaceKey);
      setUserSelectedRootItemId(null);
      try {
        localStorage.setItem(WORKSPACE_KEY, workspaceKey);
        localStorage.removeItem(ROOT_ITEM_KEY);
      } catch { /* ignore */ }

      // Check if already in cache
      if (wsDataCache[workspaceKey]) {
        appLogger.debug(`Workspace "${workspaceKey}" already in memory cache`);
        if (navigate) {
          const cached = wsDataCache[workspaceKey];
          let page: string | null = null;
          if (cached.menuItems && cached.menuItems.length > 0) {
            for (const root of cached.menuItems) {
              if (root.href && !root.href.startsWith("#")) { page = root.href; break; }
              for (const child of root.children ?? []) {
                if (child.href && !child.href.startsWith("#")) { page = child.href; break; }
              }
              if (page) break;
            }
          } else {
            const targetGroup = cached.workspaceGroups.find((g) => g.workspaceKey === workspaceKey);
            if (targetGroup) page = firstPageOf(targetGroup);
          }
          if (page) router.push(page);
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
            let page: string | null = null;
            if (data.menuItems && data.menuItems.length > 0) {
              for (const root of data.menuItems) {
                if (root.href && !root.href.startsWith("#")) { page = root.href; break; }
                for (const child of root.children ?? []) {
                  if (child.href && !child.href.startsWith("#")) { page = child.href; break; }
                }
                if (page) break;
              }
            } else {
              const targetGroup = data.workspaceGroups.find((g) => g.workspaceKey === workspaceKey);
              if (targetGroup) page = firstPageOf(targetGroup);
            }
            if (page) router.push(page);
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
    setUserSelectedRootItemId(id);
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
