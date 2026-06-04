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

      // Bug 1 guard: setActiveWorkspace in the store now no-ops when the key
      // matches the current activeWorkspaceKey (prevents previousWorkspaceKey
      // from being overwritten with itself and breaking the Back button).
      useNavigationStore.getState().setActiveWorkspace(workspaceKey);
      useNavigationStore.getState().setActiveRootItem(null);

      // Bug 5 fix: wrap JIT fetch in try/catch so a network or server error
      // never leaves the workspace transition loader stuck in an infinite spin.
      if (!useNavigationStore.getState().hasWorkspaceData(workspaceKey)) {
        try {
          await fetchWorkspaceMenu(workspaceKey);
        } catch (err) {
          // Log and continue — landing on an empty workspace is better than
          // being stuck on the loader overlay forever.
          appLogger.error(`[WorkspaceActions] JIT fetch failed for "${workspaceKey}":`, err);
        }
      }

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

        if (contextRoute) {
          appLogger.debug(
            `[WorkspaceActions] Navigating to ${isPlatformContext ? "platform" : "tenant"} homeRoute: ${contextRoute}`
          );
          router.replace(contextRoute);
          return;
        }

        // Fallback: scan the JIT-fetched menu tree for the first real page
        const wsData = freshState.workspaces.get(workspaceKey) ?? null;
        const firstHref = wsData ? firstPageOf(wsData) : null;

        if (firstHref) {
          appLogger.debug(`[WorkspaceActions] Navigating to first menu page: ${firstHref}`);
          router.replace(firstHref);
          return;
        }

        // Last-resort fallback via workspace group menu items
        const groupFirstHref = wsGroup ? firstPageOf(wsGroup) : null;
        if (groupFirstHref) {
          appLogger.debug(`[WorkspaceActions] Navigating to group first page: ${groupFirstHref}`);
          router.replace(groupFirstHref);
        }
      }
    },
    [fetchWorkspaceMenu, router, isPlatformContext]
  );

  return { setActiveWorkspace };
}
