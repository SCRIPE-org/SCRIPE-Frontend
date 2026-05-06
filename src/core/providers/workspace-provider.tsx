"use client";

/**
 * WorkspaceProvider
 *
 * Provides the active workspace state for the Nexus dual-rail layout.
 * Reads workspaceGroups from the NavigationProvider (already fetched on login),
 * stores the active workspace key in localStorage, and exposes:
 *
 *  - workspaceGroups     — all workspaces ordered by sortOrder
 *  - activeWorkspace     — currently selected WorkspaceGroup
 *  - setActiveWorkspace  — switch workspace (persisted to localStorage)
 *  - accentColor         — CSS oklch() string or null for the active workspace
 *
 * The provider also injects --workspace-hue and --workspace-chroma CSS custom
 * properties on <html> so any component can pick them up via oklch().
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
import type { WorkspaceGroup } from "@core/domain/entities/Navigation";

// ── Storage key ───────────────────────────────────────────────────────────────
const WORKSPACE_KEY = "nexora:active-workspace";

// ── Context shape ─────────────────────────────────────────────────────────────
interface WorkspaceContextType {
  /** All workspaces sorted by sortOrder, sourced from NavigationProvider */
  workspaceGroups: WorkspaceGroup[];
  /** Currently selected workspace, or null while loading */
  activeWorkspace: WorkspaceGroup | null;
  /** Switch the active workspace. Persisted to localStorage. */
  setActiveWorkspace: (workspaceKey: string) => void;
  /** CSS oklch() string for the active workspace accent or null for theme default */
  accentColor: string | null;
  /** True while there are no workspaceGroups yet (initial load) */
  isLoading: boolean;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

// ── Provider ──────────────────────────────────────────────────────────────────
export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const { navigationData } = useNavigation();
  const { language } = useI18n();

  // Sorted workspace list derived from navigation data
  const workspaceGroups = useMemo<WorkspaceGroup[]>(() => {
    if (!navigationData) return [];
    return [...navigationData.workspaceGroups].sort(
      (a, b) => a.workspaceSortOrder - b.workspaceSortOrder
    );
  }, [navigationData]);

  // Active workspace key — restored from localStorage
  const [activeKey, setActiveKey] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(WORKSPACE_KEY) ?? null;
  });

  // Resolve WorkspaceGroup object from the active key
  const activeWorkspace = useMemo<WorkspaceGroup | null>(() => {
    if (workspaceGroups.length === 0) return null;
    // Try to find persisted key, else fall back to first workspace
    const found = workspaceGroups.find((g) => g.workspaceKey === activeKey);
    return found ?? workspaceGroups[0] ?? null;
  }, [workspaceGroups, activeKey]);

  // Inject CSS custom properties on <html> whenever the active workspace changes
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
  }, [activeWorkspace]);

  const setActiveWorkspace = useCallback((workspaceKey: string) => {
    setActiveKey(workspaceKey);
    try {
      localStorage.setItem(WORKSPACE_KEY, workspaceKey);
    } catch {
      // Ignore storage errors (private browsing, quota exceeded, etc.)
    }
  }, []);

  const accentColor = activeWorkspace?.accentColor ?? null;
  const isLoading = workspaceGroups.length === 0 && navigationData !== null;

  const value = useMemo<WorkspaceContextType>(
    () => ({
      workspaceGroups,
      activeWorkspace,
      setActiveWorkspace,
      accentColor,
      isLoading,
    }),
    [workspaceGroups, activeWorkspace, setActiveWorkspace, accentColor, isLoading]
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
