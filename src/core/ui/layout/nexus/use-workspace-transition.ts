"use client";

/**
 * useWorkspaceTransition
 *
 * Orchestrates workspace switching with:
 *  1. Immediate loader display
 *  2. JIT fetch via WorkspaceProvider.switchToModuleWorkspaceByKey
 *     (WorkspaceProvider owns the navigation to the first page)
 *  3. Loader stays visible while WorkspaceProvider.isWorkspaceLoading is true
 *  4. Once the workspace is loaded AND the pathname has settled, hide the loader
 *
 * Usage:
 *   const { loaderState, switchWorkspace, goBackWorkspace } = useWorkspaceTransition();
 */

import { useState, useCallback, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useWorkspace } from "@core/providers/workspace-provider";
import type { WorkspaceGroup } from "@core/navigation";

/** How long to wait AFTER the JIT fetch + pathname settle before hiding the loader */
const SETTLE_MS = 350;
/** Minimum time the loader is shown (so very fast cache-hits still feel intentional) */
const MIN_VISIBLE_MS = 600;

export interface WorkspaceLoaderState {
  show: boolean;
  workspaceName: string;
  workspaceAbbr: string;
  accentColor: string | null;
}

export function useWorkspaceTransition() {
  const pathname = usePathname();
  const {
    switchToModuleWorkspaceByKey,
    workspaceGroups,
    goBack,
    previousWorkspaceKey,
    isWorkspaceLoading,
    activeWorkspace,
  } = useWorkspace();

  const [loaderState, setLoaderState] = useState<WorkspaceLoaderState>({
    show: false,
    workspaceName: "",
    workspaceAbbr: "",
    accentColor: null,
  });

  const targetKey = useRef<string | null>(null);
  const loaderStartAt = useRef<number>(0);
  const settleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearSettle = () => {
    if (settleTimer.current) {
      clearTimeout(settleTimer.current);
      settleTimer.current = null;
    }
  };

  /**
   * Dismiss loader when:
   *  - The JIT fetch has completed (isWorkspaceLoading went false) AND
   *  - The active workspace matches the target we switched to
   * Respects MIN_VISIBLE_MS so fast cache-hits don't flash too briefly.
   */
  useEffect(() => {
    if (!loaderState.show) return;
    if (isWorkspaceLoading) return; // still fetching
    if (!targetKey.current) return;
    if (activeWorkspace?.workspaceKey !== targetKey.current) return;

    const elapsed = Date.now() - loaderStartAt.current;
    const remaining = Math.max(0, MIN_VISIBLE_MS - elapsed);

    clearSettle();
    settleTimer.current = setTimeout(() => {
      setLoaderState((s) => ({ ...s, show: false }));
      targetKey.current = null;
    }, remaining + SETTLE_MS);

    return () => clearSettle();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isWorkspaceLoading, activeWorkspace?.workspaceKey]);

  // Also hide loader on pathname change if it already resolved
  useEffect(() => {
    if (!loaderState.show || isWorkspaceLoading) return;
    if (!targetKey.current) return;
    if (activeWorkspace?.workspaceKey !== targetKey.current) return;

    const elapsed = Date.now() - loaderStartAt.current;
    const remaining = Math.max(0, MIN_VISIBLE_MS - elapsed);
    clearSettle();
    settleTimer.current = setTimeout(() => {
      setLoaderState((s) => ({ ...s, show: false }));
      targetKey.current = null;
    }, remaining + SETTLE_MS);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const showLoader = useCallback(
    (name: string, abbr: string, accent: string | null, key: string) => {
      clearSettle();
      targetKey.current = key;
      loaderStartAt.current = Date.now();
      setLoaderState({ show: true, workspaceName: name, workspaceAbbr: abbr, accentColor: accent });
    },
    []
  );

  /**
   * Switch to a module workspace by key.
   * Shows the loader → delegates JIT fetch + navigation to WorkspaceProvider.
   * Loader auto-dismisses when isWorkspaceLoading resolves.
   */
  const switchWorkspace = useCallback(
    (workspaceKey: string) => {
      const target = workspaceGroups.find((ws) => ws.workspaceKey === workspaceKey);
      const name = target?.workspaceNameEn || workspaceKey;
      const abbr = target?.abbreviation ?? workspaceKey.slice(0, 2).toUpperCase();
      const accent = target?.accentColor ?? null;

      // Show loader
      showLoader(name, abbr, accent, workspaceKey);

      // WorkspaceProvider handles JIT fetch + navigation
      switchToModuleWorkspaceByKey(workspaceKey);
    },
    [workspaceGroups, switchToModuleWorkspaceByKey, showLoader]
  );

  /**
   * Go back to the previous admin workspace.
   */
  const goBackWorkspace = useCallback(() => {
    const prevWs = previousWorkspaceKey
      ? workspaceGroups.find((ws) => ws.workspaceKey === previousWorkspaceKey)
      : null;

    const name = prevWs ? prevWs.workspaceNameEn || prevWs.workspaceKey : "Platform";
    const abbr = prevWs?.abbreviation ?? "PL";
    const accent = prevWs?.accentColor ?? null;
    const key = previousWorkspaceKey ?? "admin";

    showLoader(name, abbr, accent, key);
    goBack();
  }, [goBack, previousWorkspaceKey, workspaceGroups, showLoader]);

  return {
    loaderState,
    switchWorkspace,
    goBackWorkspace,
  };
}
