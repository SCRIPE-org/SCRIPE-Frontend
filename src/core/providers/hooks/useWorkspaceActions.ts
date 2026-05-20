"use client";
import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useNavigation } from "@core/providers/navigation-provider";
import { useNavigationStore } from "@core/navigation/store/useNavigationStore";
import { firstPageOf } from "../utils/navigation-helpers";
import { appLogger } from "@core/common/logger";

export function useWorkspaceActions() {
  const router = useRouter();
  const { fetchWorkspaceMenu } = useNavigation();

  const setActiveWorkspace = useCallback(
    async (workspaceKey: string, navigateTo = false) => {
      appLogger.debug(`[WorkspaceActions] Switching to workspace: ${workspaceKey}`);

      useNavigationStore.getState().setActiveWorkspace(workspaceKey);
      useNavigationStore.getState().setActiveRootItem(null);

      if (!useNavigationStore.getState().hasWorkspaceData(workspaceKey)) {
        await fetchWorkspaceMenu(workspaceKey);
      }

      if (navigateTo) {
        const freshState = useNavigationStore.getState();

        // ── Navigation priority ───────────────────────────────────────────────
        // 1. homeRoute declared by the backend (workspace-level canonical home)
        //    — always present for module workspaces (e.g. "/crm", "/hrms")
        //    — may be "/" for the admin workspace
        // 2. First leaf page from the JIT-loaded menu tree (admin workspaces
        //    without an explicit homeRoute, or legacy workspaces)
        // ─────────────────────────────────────────────────────────────────────
        const wsGroup =
          freshState.workspaceGroups.find((g) => g.workspaceKey === workspaceKey) ?? null;

        if (wsGroup?.homeRoute) {
          appLogger.debug(
            `[WorkspaceActions] Navigating to homeRoute: ${wsGroup.homeRoute}`
          );
          router.replace(wsGroup.homeRoute);
          return;
        }

        // Fallback: scan the JIT-fetched menu tree for the first real page
        const wsData = freshState.workspaces.get(workspaceKey) ?? null;
        const firstHref = wsData ? firstPageOf(wsData) : null;

        if (firstHref) {
          appLogger.debug(
            `[WorkspaceActions] Navigating to first menu page: ${firstHref}`
          );
          router.replace(firstHref);
          return;
        }

        // Last-resort fallback via workspace group menu items
        const groupFirstHref = wsGroup ? firstPageOf(wsGroup) : null;
        if (groupFirstHref) {
          appLogger.debug(
            `[WorkspaceActions] Navigating to group first page: ${groupFirstHref}`
          );
          router.replace(groupFirstHref);
        }
      }
    },
    [fetchWorkspaceMenu, router]
  );

  return { setActiveWorkspace };
}
