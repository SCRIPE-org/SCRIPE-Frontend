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
import { useWorkspaceActions } from "@core/providers/hooks/useWorkspaceActions";
import { useNavigationStore } from "@core/navigation/store/useNavigationStore";
import { appLogger } from "@core/common/logger";

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
  const { switchToModuleWorkspaceByKey, workspaceGroups, isWorkspaceLoading, activeWorkspace } =
    useWorkspace();

  const { setActiveWorkspace } = useWorkspaceActions();

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
   * Dismiss the loader once:
   *  - The JIT fetch has finished (isWorkspaceLoading = false)
   *  - The active workspace matches our target
   *  - The current pathname matches the target transition route
   * Triggered by any of: fetch completion, workspace-key change, or pathname
   * settling after navigation. Merged into ONE effect so there is never more
   * than one timer in flight (two separate effects could race each other).
   * Respects MIN_VISIBLE_MS so fast cache-hits don't flash too briefly.
   */
  useEffect(() => {
    if (!loaderState.show) return;
    if (isWorkspaceLoading) return;
    if (!targetKey.current) return;
    if (activeWorkspace?.workspaceKey !== targetKey.current) return;

    // Gate loader dismissal on pathname match if transitionTargetRoute is tracked
    const transitionTargetRoute = useNavigationStore.getState().transitionTargetRoute;
    if (transitionTargetRoute) {
      const normPathname = pathname.toLowerCase().replace(/\/+$/, "");
      const normTarget = transitionTargetRoute.toLowerCase().replace(/\/+$/, "");

      if (normPathname !== normTarget && !normPathname.startsWith(normTarget + "/")) {
        appLogger.debug(
          `[useWorkspaceTransition] Pathname (${normPathname}) does not match target (${normTarget}) yet. Keeping loader visible.`
        );
        return;
      }

      // Reached destination! Clear transitionTargetRoute.
      useNavigationStore.getState().setTransitionTargetRoute(null);
    }

    const elapsed = Date.now() - loaderStartAt.current;
    const remaining = Math.max(0, MIN_VISIBLE_MS - elapsed);

    clearSettle();
    settleTimer.current = setTimeout(() => {
      setLoaderState((s) => ({ ...s, show: false }));
      targetKey.current = null;
    }, remaining + SETTLE_MS);

    return () => clearSettle();
    // pathname included so navigation completing also triggers the dismiss
  }, [isWorkspaceLoading, activeWorkspace?.workspaceKey, pathname, loaderState.show]);

  // Safety net: if the loader is still visible after 8 seconds, dismiss it.
  // This handles edge-cases where the JIT fetch resolves but the workspace key
  // never matches (e.g. rapid workspace switches, stale closures, or network
  // errors that were swallowed before reaching this effect).
  const SAFETY_TIMEOUT_MS = 8000;
  useEffect(() => {
    if (!loaderState.show) return;
    const timeout = setTimeout(() => {
      setLoaderState((s) => ({ ...s, show: false }));
      targetKey.current = null;
    }, SAFETY_TIMEOUT_MS);
    return () => clearTimeout(timeout);
  }, [loaderState.show]);

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
   * Always go to the PRIMARY admin workspace (adminWorkspaces[0]).
   * This is a "Go Home" button, not a browser-history back.
   * It works correctly regardless of previousWorkspaceKey state.
   */
  const goBackWorkspace = useCallback(() => {
    const adminWs = workspaceGroups
      .filter((ws) => ws.isAdminWorkspace)
      .sort((a, b) => a.workspaceSortOrder - b.workspaceSortOrder)[0];

    if (!adminWs) return; // safety: should never happen (admin is always seeded)

    const name = adminWs.workspaceNameEn || adminWs.workspaceKey;
    const abbr = adminWs.abbreviation ?? "AD";
    const accent = adminWs.accentColor ?? null;
    const key = adminWs.workspaceKey;

    showLoader(name, abbr, accent, key);
    // Use switchWorkspace directly — avoids the history-based goBack() path
    // which would restore previousWorkspaceKey (wrong for a "go home" action).
    setActiveWorkspace(key, true);
  }, [workspaceGroups, showLoader, setActiveWorkspace]);

  return {
    loaderState,
    switchWorkspace,
    goBackWorkspace,
  };
}
