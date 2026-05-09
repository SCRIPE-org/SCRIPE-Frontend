"use client";

import {
  createContext,
  useContext,
  useCallback,
  useMemo,
} from "react";
import type React from "react";
import { useNavigationStore } from "@core/navigation/store/useNavigationStore";
import type { WorkspaceGroup, MenuItem } from "@core/navigation";
import { useActiveRootSync } from "./hooks/useActiveRootSync";
import { useWorkspaceActions } from "./hooks/useWorkspaceActions";
import { getAccentColor } from "./utils/navigation-helpers";

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
  /** @deprecated use workspaceGroups.filter(ws => ws.isAdminWorkspace) */
  adminWorkspaces: WorkspaceGroup[];
  /** @deprecated use workspaceGroups.filter(ws => ws.isModuleWorkspace) */
  moduleWorkspaces: WorkspaceGroup[];
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

// ── Provider ──────────────────────────────────────────────────────────────
export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  // ── Granular selectors ──
  const workspaceGroups   = useNavigationStore((s) => s.workspaceGroups);
  const activeWorkspaceKey = useNavigationStore((s) => s.activeWorkspaceKey);
  const activeRootItemId  = useNavigationStore((s) => s.activeRootItemId);
  const previousWorkspaceKey = useNavigationStore((s) => s.previousWorkspaceKey);
  const isInitialLoading  = useNavigationStore((s) => s.isInitialLoading);
  const isWorkspaceSwitching = useNavigationStore((s) => s.isWorkspaceSwitching);
  const workspacesMap     = useNavigationStore((s) => s.workspaces);
  const defaultWorkspace  = useNavigationStore((s) => s.defaultWorkspace);

  // ── Sorted workspace list ──
  const sortedGroups = useMemo(
    () => [...workspaceGroups].sort((a, b) => a.workspaceSortOrder - b.workspaceSortOrder),
    [workspaceGroups]
  );

  // ── Active workspace entity ──
  const activeWorkspace = useMemo<WorkspaceGroup | null>(() => {
    if (!activeWorkspaceKey) return sortedGroups[0] ?? null;
    return sortedGroups.find((ws) => ws.workspaceKey === activeWorkspaceKey) ?? sortedGroups[0] ?? null;
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
  const value = useMemo<WorkspaceContextType>(() => ({
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
  }), [
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
    adminWorkspaces,
    moduleWorkspaces,
  ]);

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
}

// ── Hooks ──
export function useWorkspace(): WorkspaceContextType {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) {
    throw new Error("useWorkspace must be used within WorkspaceProvider");
  }
  return ctx;
}
