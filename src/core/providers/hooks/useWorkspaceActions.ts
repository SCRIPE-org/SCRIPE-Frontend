"use client";
import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useNavigation } from "@core/providers/navigation-provider";
import { useNavigationStore } from "@core/navigation/store/useNavigationStore";
import { useAppStore } from "@core/store/useAppStore";
import { firstPageOf } from "../utils/navigation-helpers";
import { appLogger } from "@core/common/logger";

export function useWorkspaceActions() {
  const router = useRouter();
  const { fetchWorkspaceMenu } = useNavigation();
  const tenantCode = useAppStore((s) => s.tenantCode);

  /** True when no tenant is drilled-into — i.e. the admin is in platform context. */
  const isPlatformContext = tenantCode === null;

  const setActiveWorkspace = useCallback(
    async (workspaceKey: string, navigateTo = false) => {
      appLogger.debug(`[WorkspaceActions] Switching to workspace: ${workspaceKey}`);

      // Start the workspace menu fetch in the background if not cached.
      // This is non-blocking to prevent UI lag on click.
      if (!useNavigationStore.getState().hasWorkspaceData(workspaceKey)) {
        fetchWorkspaceMenu(workspaceKey).catch((err) => {
          appLogger.error(`[WorkspaceActions] Background JIT fetch failed for "${workspaceKey}":`, err);
        });
      }

      // Update store key immediately. This switches activeWorkspaceKey so layout/accent etc. can transition.
      useNavigationStore.getState().setActiveWorkspace(workspaceKey);
      useNavigationStore.getState().setActiveRootItem(null);

      if (navigateTo) {
        const freshState = useNavigationStore.getState();

        // ── Navigation priority ───────────────────────────────────────────────
        // 1. Context-aware homeRoute declared by the backend:
        //    - platformHomeRoute when no tenant is selected (platform admin context)
        //    - homeRoute when a tenant is selected (tenant admin context)
        //    These cover workspaces like Billing (platform→revenue, tenant→invoices)
        //    and Plugins (platform→definitions, tenant→catalog)
        // 2. First leaf page from the JIT-loaded menu tree
        // 3. First leaf page from the workspace group menu items (last resort)
        // ─────────────────────────────────────────────────────────────────────
        const wsGroup =
          freshState.workspaceGroups.find((g) => g.workspaceKey === workspaceKey) ?? null;

        // Pick the best home route for the current context
        const contextRoute = isPlatformContext
          ? (wsGroup?.platformHomeRoute ?? wsGroup?.homeRoute)
          : wsGroup?.homeRoute;

        const wsData = freshState.workspaces.get(workspaceKey) ?? null;
        const firstHref = wsData ? firstPageOf(wsData) : null;
        const groupFirstHref = wsGroup ? firstPageOf(wsGroup) : null;

        const targetRoute = contextRoute || firstHref || groupFirstHref;

        if (targetRoute) {
          appLogger.debug(`[WorkspaceActions] Navigating to targetRoute: ${targetRoute}`);
          useNavigationStore.getState().setTransitionTargetRoute(targetRoute);
          router.replace(targetRoute);
        }
      }
    },
    [fetchWorkspaceMenu, router, isPlatformContext]
  );

  return { setActiveWorkspace };
}
