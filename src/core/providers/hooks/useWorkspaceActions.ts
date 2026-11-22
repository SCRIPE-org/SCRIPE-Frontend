"use client";
import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useNavigation } from "@core/providers/navigation-provider";
import { useNavigationStore } from "@core/navigation/store/useNavigationStore";
import type { NavigationStoreState } from "@core/navigation/store/types";
import type { MenuItem } from "@core/navigation/domain/entities/MenuItem";
import { normalizeRoutePath } from "@core/config/app-route-manifest";
import { useAdminContext } from "@core/hooks/useAdminContext";
import { appLogger } from "@core/common/logger";
import { usePermissions } from "@core/providers/permission-provider";
import { useAppStore } from "@core/store/useAppStore";

export interface SetActiveWorkspaceOptions {
  preserveHistory?: boolean;
}

function findAccessibleMenuRoute(
  items: readonly MenuItem[],
  canAccessPage: (path: string) => boolean
): string | null {
  const sorted = [...items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  for (const item of sorted) {
    if (
      item.href &&
      !item.href.startsWith("#") &&
      item.href !== "/" &&
      canAccessPage(item.href)
    ) {
      return item.href;
    }
    if (item.children && item.children.length > 0) {
      const childRoute = findAccessibleMenuRoute(item.children, canAccessPage);
      if (childRoute) return childRoute;
    }
  }
  return null;
}

function findWorkspaceRoutesInMap(
  workspaceRouteMap: Record<string, string[]>,
  workspaceKey: string
): string[] {
  if (Object.prototype.hasOwnProperty.call(workspaceRouteMap, workspaceKey)) {
    return workspaceRouteMap[workspaceKey] ?? [];
  }
  const lowerKey = workspaceKey.toLowerCase();
  for (const [key, routes] of Object.entries(workspaceRouteMap)) {
    if (key.toLowerCase() === lowerKey) {
      return routes ?? [];
    }
  }
  return [];
}

function resolveWorkspaceTargetRoute(
  state: NavigationStoreState,
  workspaceKey: string,
  isPlatformContext: boolean,
  canAccessPage: (path: string) => boolean
): string | null {
  const lowerKey = workspaceKey.toLowerCase();
  const wsGroup =
    state.workspaceGroups.find((g) => g.workspaceKey.toLowerCase() === lowerKey) ?? null;

  // 1. Server-verified effectiveHomeRoute (still checked against client PBAC)
  const effectiveHome = wsGroup?.effectiveHomeRoute?.trim() || null;
  if (effectiveHome && canAccessPage(effectiveHome)) {
    return effectiveHome;
  }

  // 2. Context-aware raw configured home route when effectiveHomeRoute is absent
  if (!effectiveHome) {
    const rawConfigured = isPlatformContext
      ? (wsGroup?.platformHomeRoute?.trim() || wsGroup?.homeRoute?.trim() || null)
      : (wsGroup?.homeRoute?.trim() || null);
    if (
      rawConfigured &&
      canAccessPage(rawConfigured) &&
      (!state.routesLoaded || state.routesError !== null || state.hasRouteAccess(rawConfigured))
    ) {
      return rawConfigured;
    }
  }

  // 3. Hydrated workspace menu tree (canonical sidebar SortOrder)
  const wsData = state.workspaces.get(workspaceKey) ?? null;
  if (wsData?.menuItems?.length) {
    const firstLeaf = findAccessibleMenuRoute(wsData.menuItems, canAccessPage);
    if (firstLeaf) return firstLeaf;
  }

  // 4. WorkspaceGroup embedded menu items
  if (wsGroup?.menuItems?.length) {
    const groupLeaf = findAccessibleMenuRoute(wsGroup.menuItems, canAccessPage);
    if (groupLeaf) return groupLeaf;
  }

  // 5. Bootstrap-hydrated workspaceRouteMap (canonical sidebar SortOrder on backend)
  const mapRoutes = findWorkspaceRoutesInMap(state.workspaceRouteMap ?? {}, workspaceKey);
  const firstMapRoute = mapRoutes.find(
    (route) => Boolean(route && route !== "/" && canAccessPage(route))
  );
  return firstMapRoute ?? null;
}

export function useWorkspaceActions() {
  const router = useRouter();
  const { fetchWorkspaceMenu } = useNavigation();
  const { canAccessPage } = usePermissions();
  const { isPlatform: isPlatformContext, activeTenantId } = useAdminContext();

  const setActiveWorkspace = useCallback(
    async (workspaceKey: string, navigateTo = false, options?: SetActiveWorkspaceOptions) => {
      appLogger.debug(`[WorkspaceActions] Switching to workspace: ${workspaceKey}`);

      // Update store key immediately so layout/accent transitions start cleanly.
      const navStore = useNavigationStore.getState();
      navStore.setActiveWorkspace(workspaceKey);
      navStore.setActiveRootItem(null);

      const username = useAppStore.getState().user?.username ?? "";
      const activeContextKey =
        navStore.routesContextKey ||
        navStore.contextKey ||
        (username ? `${activeTenantId ?? "platform"}:${username}` : "");
      if (navigateTo && activeContextKey) {
        navStore.recordRecentWorkspace(activeContextKey, workspaceKey);
      }

      if (!navigateTo) {
        if (!navStore.hasWorkspaceData(workspaceKey)) {
          fetchWorkspaceMenu(workspaceKey).catch((err) => {
            appLogger.error(
              `[WorkspaceActions] Background JIT fetch failed for "${workspaceKey}":`,
              err
            );
          });
        }
        return;
      }

      let freshState = useNavigationStore.getState();
      let targetRoute = resolveWorkspaceTargetRoute(
        freshState,
        workspaceKey,
        isPlatformContext,
        canAccessPage
      );

      if (!freshState.hasWorkspaceData(workspaceKey)) {
        if (!targetRoute) {
          // Await JIT fetch before finalizing targetRoute so /hub never stalls on a 3s timeout.
          try {
            await fetchWorkspaceMenu(workspaceKey);
          } catch (err) {
            appLogger.error(
              `[WorkspaceActions] Blocking JIT fetch failed for "${workspaceKey}":`,
              err
            );
          }
          freshState = useNavigationStore.getState();
          targetRoute = resolveWorkspaceTargetRoute(
            freshState,
            workspaceKey,
            isPlatformContext,
            canAccessPage
          );
        } else {
          fetchWorkspaceMenu(workspaceKey).catch((err) => {
            appLogger.error(
              `[WorkspaceActions] Background JIT fetch failed for "${workspaceKey}":`,
              err
            );
          });
        }
      }

      if (targetRoute) {
        appLogger.debug(`[WorkspaceActions] Navigating to targetRoute: ${targetRoute}`);
        useNavigationStore.getState().setTransitionTargetRoute(targetRoute);
        if (options?.preserveHistory === false) {
          router.replace(targetRoute);
        } else {
          router.push(targetRoute);
        }
        return;
      }

      // Zero authorized routes exist for this workspace even after JIT hydration:
      // abort transition cleanly instead of spinning the 3,000ms safety timeout.
      appLogger.warn(
        `[WorkspaceActions] No authorized route resolved for "${workspaceKey}". Aborting transition cleanly.`
      );
      const latestStore = useNavigationStore.getState();
      latestStore.setTransitionTargetRoute(null);
      latestStore.setActiveWorkspace(null);

      const currentPath =
        typeof window !== "undefined"
          ? normalizeRoutePath(window.location.pathname).toLowerCase()
          : "";
      if (currentPath !== "/hub" && canAccessPage("/hub")) {
        if (options?.preserveHistory === false) {
          router.replace("/hub");
        } else {
          router.push("/hub");
        }
      } else if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("routing-progress-stop"));
      }
    },
    [fetchWorkspaceMenu, router, isPlatformContext, activeTenantId, canAccessPage]
  );

  return { setActiveWorkspace };
}
