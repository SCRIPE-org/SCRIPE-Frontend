"use client";

/**
 * WorkspaceProvider
 *
 * Provides the active workspace state AND active root-item state for the Nexus dual-rail layout.
 *
 * Architecture:
 *  - The PRIMARY RAIL renders root menu items (parentId=null) of the activeWorkspace as icon buttons
 *  - The SECONDARY RAIL renders the children of the selected root item as nav rows
 *  - A "Modules" root item (slug: modules-group) switches to another workspace when clicked
 *
 * Exports:
 *  - workspaceGroups     — all workspaces ordered by sortOrder
 *  - activeWorkspace     — currently selected WorkspaceGroup
 *  - setActiveWorkspace  — switch workspace (persisted to localStorage)
 *  - rootMenuItems       — root menu items of the active workspace (for primary rail)
 *  - activeRootItem      — selected root item (for secondary rail panel)
 *  - setActiveRootItemId — select which root item's children to show
 *  - accentColor         — CSS oklch() string or null
 *  - isModuleMode        — true when active workspace is classified as Module
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
import { useNavigation } from "@core/providers/navigation-provider";
import { useI18n } from "@core/providers/i18n-provider";
import { usePathname } from "next/navigation";
import type { WorkspaceGroup, MenuItem } from "@core/domain/entities/Navigation";

// ── Storage keys ───────────────────────────────────────────────────────────────
const WORKSPACE_KEY = "nexora:active-workspace";
const ROOT_ITEM_KEY = "nexora:active-root-item";

// ── Slug that identifies the "Modules" navigation group ────────────────────────
const MODULES_SLUG = "modules-group";

// ── Context shape ─────────────────────────────────────────────────────────────
interface WorkspaceContextType {
  /** All workspaces sorted by sortOrder */
  workspaceGroups: WorkspaceGroup[];
  /** Currently selected workspace, or null while loading */
  activeWorkspace: WorkspaceGroup | null;
  /** Switch the active workspace. Persisted to localStorage. */
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
  /** True while navigation data is still loading */
  isLoading: boolean;
  /**
   * True when the active workspace is a Module-type workspace.
   * Triggers layout mode switch (back button etc.)
   */
  isModuleMode: boolean;
  /** Previous admin workspace key, set when entering module mode */
  previousWorkspaceKey: string | null;
  /** Return to the previous admin workspace (exit module mode) */
  goBack: () => void;
  /** @deprecated use rootMenuItems + activeRootItem instead */
  adminWorkspaces: WorkspaceGroup[];
  /** @deprecated use rootMenuItems + activeRootItem instead */
  moduleWorkspaces: WorkspaceGroup[];
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

// ── Provider ──────────────────────────────────────────────────────────────────
export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const { navigationData } = useNavigation();
  const { language } = useI18n();
  const pathname = usePathname();

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

  // ── Resolve WorkspaceGroup ─────────────────────────────────────────────────
  const activeWorkspace = useMemo<WorkspaceGroup | null>(() => {
    if (workspaceGroups.length === 0) return null;
    const found = workspaceGroups.find((g) => g.workspaceKey === activeKey);
    return found ?? workspaceGroups[0] ?? null;
  }, [workspaceGroups, activeKey]);

  // ── Root menu items of the active workspace ────────────────────────────────
  const rootMenuItems = useMemo<MenuItem[]>(
    () => activeWorkspace?.menuItems ?? [],
    [activeWorkspace]
  );

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

  // ── Actions ────────────────────────────────────────────────────────────────
  const setActiveWorkspace = useCallback(
    (workspaceKey: string) => {
      setActiveKey(workspaceKey);
      try {
        localStorage.setItem(WORKSPACE_KEY, workspaceKey);
      } catch {
        // ignore
      }
    },
    []
  );

  const setActiveRootItemId = useCallback((id: string) => {
    setActiveRootItemIdState(id);
    try {
      localStorage.setItem(ROOT_ITEM_KEY, id);
    } catch {
      // ignore
    }
  }, []);

  const goBack = useCallback(() => {
    if (previousWorkspaceKey) {
      setActiveKey(previousWorkspaceKey);
      setPreviousWorkspaceKey(null);
      try {
        localStorage.setItem(WORKSPACE_KEY, previousWorkspaceKey);
      } catch {
        // ignore
      }
    }
  }, [previousWorkspaceKey]);

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
      isModuleMode,
      previousWorkspaceKey,
      goBack,
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
      isModuleMode,
      previousWorkspaceKey,
      goBack,
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
