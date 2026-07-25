"use client";

import { createContext, useContext, useCallback, useEffect, useMemo } from "react";
import type React from "react";
import { useNavigationStore } from "@core/navigation/store/useNavigationStore";
import type { WorkspaceGroup, MenuItem } from "@core/navigation";
import { useActiveRootSync } from "./hooks/useActiveRootSync";
import { useWorkspaceActions } from "./hooks/useWorkspaceActions";
import { getAccentColor } from "./utils/navigation-helpers";
import { getCoreContainer } from "@core/di";

// ── Context shape ──────────────────────────────────────────────────────────
interface WorkspaceContextType {
  workspaceGroups: WorkspaceGroup[];
  activeWorkspace: WorkspaceGroup | null;
  setActiveWorkspace: (workspaceKey: string, navigateTo?: boolean) => void;
  rootMenuItems: MenuItem[];
  activeRootItem: MenuItem | null;
  setActiveRootItemId: (id: string | null) => void;
  accentColor: string | null;
  isLoading: boolean;
  isWorkspaceLoading: boolean;
  isModuleMode: boolean;
  previousWorkspaceKey: string | null;
  goBack: () => void;
  switchToModuleWorkspace: () => void;
  switchToModuleWorkspaceByKey: (key: string) => void;
  /** Toggle pin state for a workspace. Returns the new isPinned boolean. */
  togglePin: (workspaceKey: string) => Promise<boolean>;
  /** @deprecated use workspaceGroups.filter(ws => ws.isAdminWorkspace) */
  adminWorkspaces: WorkspaceGroup[];
  /** @deprecated use workspaceGroups.filter(ws => ws.isModuleWorkspace) */
  moduleWorkspaces: WorkspaceGroup[];
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

// ── Provider ──────────────────────────────────────────────────────────────
export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  // ── Granular selectors ──
  const workspaceGroups = useNavigationStore((s) => s.workspaceGroups);
  const activeWorkspaceKey = useNavigationStore((s) => s.activeWorkspaceKey);
  const activeRootItemId = useNavigationStore((s) => s.activeRootItemId);
  const previousWorkspaceKey = useNavigationStore((s) => s.previousWorkspaceKey);
  const isInitialLoading = useNavigationStore((s) => s.isInitialLoading);
  const isWorkspaceSwitching = useNavigationStore((s) => s.isWorkspaceSwitching);
  const workspacesMap = useNavigationStore((s) => s.workspaces);
  const defaultWorkspace = useNavigationStore((s) => s.defaultWorkspace);

  // ── Sorted workspace list ──
  const sortedGroups = useMemo(
    () =>
      [...workspaceGroups]
        .filter((ws) => ws.workspaceKey !== "organization-core")
        .sort((a, b) => a.workspaceSortOrder - b.workspaceSortOrder),
    [workspaceGroups]
  );

  // ── Active workspace entity ──
  // Returns null when no workspace is selected (e.g. on the Hub page at "/").
  // Previously defaulted to sortedGroups[0], which caused the sidebar to show
  // the first workspace's items even when the admin hadn't selected one yet.
  const activeWorkspace = useMemo<WorkspaceGroup | null>(() => {
    if (!activeWorkspaceKey) return null;
    return sortedGroups.find((ws) => ws.workspaceKey === activeWorkspaceKey) ?? null;
  }, [activeWorkspaceKey, sortedGroups]);

  // ── Root menu items for active workspace ──
  const rootMenuItems = useMemo<MenuItem[]>(() => {
    const key = activeWorkspaceKey ?? "__default__";
    const data = workspacesMap.get(key) ?? defaultWorkspace;
    return data?.menuItems ?? [];
  }, [activeWorkspaceKey, workspacesMap, defaultWorkspace]);

  // ── Active root item entity ──
  const activeRootItem = useMemo<MenuItem | null>(() => {
    if (!activeRootItemId) return null;
    return rootMenuItems.find((m) => m.id === activeRootItemId) ?? null;
  }, [activeRootItemId, rootMenuItems]);

  // ── Auto-sync activeRootItem from URL ──
  useActiveRootSync(rootMenuItems);

  // ── Legacy splits ──
  const adminWorkspaces = useMemo(
    () => sortedGroups.filter((ws) => ws.isAdminWorkspace),
    [sortedGroups]
  );
  const moduleWorkspaces = useMemo(
    () => sortedGroups.filter((ws) => ws.isModuleWorkspace),
    [sortedGroups]
  );

  // ── Accent color ──
  const accentColor = useMemo(() => getAccentColor(activeWorkspace), [activeWorkspace]);

  // ── Publish the workspace accent as CSS custom properties ──
  // Workspace.ColorHue / ColorChroma are OKLCH components already; writing them
  // to <html> lets stylesheets derive every accent shade in CSS instead of each
  // consumer concatenating alpha onto a colour string (`${accent}22`), which
  // produces invalid CSS for the oklch() values this field actually holds.
  // Additive: only rules that opt in (the scripe shell) read these.
  useEffect(() => {
    const root = document.documentElement;
    const hue = activeWorkspace?.colorHue;
    const chroma = activeWorkspace?.colorChroma;
    if (typeof hue === "number" && Number.isFinite(hue)) {
      root.style.setProperty("--workspace-hue", String(hue));
    } else {
      root.style.removeProperty("--workspace-hue");
    }
    if (typeof chroma === "number" && Number.isFinite(chroma)) {
      root.style.setProperty("--workspace-chroma", String(chroma));
    } else {
      root.style.removeProperty("--workspace-chroma");
    }
  }, [activeWorkspace]);

  // ── isModuleMode ──
  const isModuleMode = useMemo(
    () => activeWorkspace?.isModuleWorkspace ?? false,
    [activeWorkspace]
  );

  // ── Actions ──
  const setActiveRootItemId = useNavigationStore((s) => s.setActiveRootItem);
  const { setActiveWorkspace } = useWorkspaceActions();

  const goBack = useCallback(async () => {
    const prev = previousWorkspaceKey ?? adminWorkspaces[0]?.workspaceKey;
    if (prev) {
      await setActiveWorkspace(prev, true);
    }
    useNavigationStore.getState().setPreviousWorkspace(null);
  }, [previousWorkspaceKey, adminWorkspaces, setActiveWorkspace]);

  const togglePin = useCallback(async (workspaceKey: string): Promise<boolean> => {
    const { navigationRepository } = getCoreContainer();
    // Backend returns both isPinned AND the authoritative pinSortOrder —
    // never compute sort order on the client (diverges from backend gap-10 scheme).
    const { isPinned, pinSortOrder } = await navigationRepository.toggleWorkspacePin(workspaceKey);
    useNavigationStore.getState().toggleWorkspacePinLocal(workspaceKey, isPinned, pinSortOrder);
    return isPinned;
  }, []);

  const switchToModuleWorkspaceByKey = useCallback(
    (key: string) => {
      setActiveWorkspace(key, true);
    },
    [setActiveWorkspace]
  );

  const switchToModuleWorkspace = useCallback(() => {
    const firstModule = moduleWorkspaces[0];
    if (firstModule) {
      switchToModuleWorkspaceByKey(firstModule.workspaceKey);
    }
  }, [moduleWorkspaces, switchToModuleWorkspaceByKey]);

  // ── Context value ──
  const value = useMemo<WorkspaceContextType>(
    () => ({
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
      togglePin,
      adminWorkspaces,
      moduleWorkspaces,
    }),
    [
      sortedGroups,
      activeWorkspace,
      setActiveWorkspace,
      rootMenuItems,
      activeRootItem,
      setActiveRootItemId,
      accentColor,
      isInitialLoading,
      isWorkspaceSwitching,
      isModuleMode,
      previousWorkspaceKey,
      goBack,
      switchToModuleWorkspace,
      switchToModuleWorkspaceByKey,
      togglePin,
      adminWorkspaces,
      moduleWorkspaces,
    ]
  );

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

// ── Hooks ──
export function useWorkspace(): WorkspaceContextType {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) {
    throw new Error("useWorkspace must be used within WorkspaceProvider");
  }
  return ctx;
}
