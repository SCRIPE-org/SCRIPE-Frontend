import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useNavigationStore } from "@core/navigation/store/useNavigationStore";
import type { MenuItem } from "@core/navigation/domain/entities/MenuItem";
import { containsPath, findBestRootMatch } from "@core/navigation/utils/path-matcher";
import { useNavigation } from "@core/providers/navigation-provider";

export function useActiveRootSync(rootMenuItems: MenuItem[]) {
  const pathname = usePathname();
  const { fetchWorkspaceMenu } = useNavigation();
  // Ref to prevent concurrent JIT fetches
  const jitFetchingRef = useRef<string | null>(null);

  // Subscribe to routesLoadedAt so the effect re-fires when Query 1 completes.
  // Without this, deep-link after login would miss workspace detection because
  // workspaceRouteMap was empty on the first render and pathname didn't change.
  const routesLoadedAt = useNavigationStore((s) => s.routesLoadedAt);

  // ── JIT workspace activation on direct URL navigation (Gap 2 + Gap 4 + Gap 6 fix) ──
  // When the user lands on a workspace URL directly (typed in the browser,
  // bookmarked, or page refresh), this effect detects which workspace owns
  // the current URL using the persisted `workspaceRouteMap` and triggers the
  // JIT fetch if menu data isn't available yet.
  //
  // v2: Uses workspaceRouteMap (authoritative, persisted, works for ALL workspace
  // types — Admin and Module) instead of the Module-only URL-prefix convention.
  //
  // Dependencies: pathname + routesLoadedAt. The routesLoadedAt dependency ensures
  // the effect re-fires when Query 1 completes (deep-link-after-login case).
  useEffect(() => {
    const state = useNavigationStore.getState();
    const {
      workspaceRouteMap,
      activeWorkspaceKey,
      hasWorkspaceData,
      setActiveWorkspace,
      workspaceGroups,
    } = state;

    const normalizedPath = pathname.toLowerCase().replace(/\/+$/, "");

    // ── System pages: treat same as root for workspace activation ────────────
    // Pages like /overview, /settings, /profile are "system-wide" — they don't
    // belong to a specific workspace URL prefix, so workspaceRouteMap won't match them.
    // If the user lands on one with no active workspace, activate the primary admin
    // workspace so the nav rails remain populated.
    //
    // We detect this case AFTER the route-map strategies run (below), but we handle
    // the root "/" case here first for clarity.
    const isRootOrSystemPage = !normalizedPath || normalizedPath === "/";

    if (isRootOrSystemPage) {
      if (!activeWorkspaceKey && workspaceGroups.length > 0) {
        // Pick primary admin workspace (first admin workspace by sort order)
        const adminWs = workspaceGroups
          .filter((ws) => ws.isAdminWorkspace)
          .sort((a, b) => a.workspaceSortOrder - b.workspaceSortOrder)[0];
        const target = adminWs ?? workspaceGroups[0];
        if (target) {
          setActiveWorkspace(target.workspaceKey);
          // JIT fetch if needed
          if (!hasWorkspaceData(target.workspaceKey)) {
            fetchWorkspaceMenu(target.workspaceKey).catch(() => {});
          }
        }
      }
      return;
    }

    // ── Strategy 1: Use workspaceRouteMap (authoritative, persisted) ──────────
    // workspaceRouteMap: Record<workspaceKey, string[]> — populated by Query 1
    // and persisted to localStorage, so it's available immediately on refresh.
    let matchingKey: string | null = null;
    let bestMatchLen = 0;

    for (const [wsKey, routes] of Object.entries(workspaceRouteMap)) {
      for (const route of routes) {
        const r = route.toLowerCase().replace(/\/+$/, "");
        if (!r) continue;
        if (normalizedPath === r || normalizedPath.startsWith(r + "/")) {
          // Pick the longest (most specific) route match
          if (r.length > bestMatchLen) {
            bestMatchLen = r.length;
            matchingKey = wsKey;
          }
        }
      }
    }

    // ── Strategy 2: Fallback to workspace key as URL prefix ──────────────────
    // For cases where workspaceRouteMap hasn't loaded yet or is incomplete,
    // fall back to the convention: workspace key === URL leading segment.
    if (!matchingKey && workspaceGroups.length > 0) {
      const match = workspaceGroups.find((ws) => {
        const prefix = `/${ws.workspaceKey.toLowerCase()}`;
        return normalizedPath === prefix || normalizedPath.startsWith(`${prefix}/`);
      });
      if (match) matchingKey = match.workspaceKey;
    }

    if (!matchingKey) {
      // No workspace URL match found.
      // This happens when:
      //   (a) The page is genuinely not a workspace route (e.g. /settings, /profile), OR
      //   (b) workspaceRouteMap is still empty (first load, route map fetch in flight).
      //
      // In case (b), the layout would show an empty secondary rail until the map loads.
      // Fix: activate the primary admin workspace as a sensible default so the rail
      // remains populated. When the route map loads, routesLoadedAt changes and this
      // effect re-fires, finding the correct workspace and switching if needed.
      if (!activeWorkspaceKey && workspaceGroups.length > 0) {
        const adminWs = workspaceGroups
          .filter((ws) => ws.isAdminWorkspace)
          .sort((a, b) => a.workspaceSortOrder - b.workspaceSortOrder)[0];
        const target = adminWs ?? workspaceGroups[0];
        if (target) {
          setActiveWorkspace(target.workspaceKey);
          if (!hasWorkspaceData(target.workspaceKey)) {
            fetchWorkspaceMenu(target.workspaceKey).catch(() => {});
          }
        }
      }
      return;
    }

    // Already on the right workspace and data is loaded → nothing to do
    if (activeWorkspaceKey === matchingKey && hasWorkspaceData(matchingKey)) return;

    // Prevent double-firing for the same key
    if (jitFetchingRef.current === matchingKey) return;
    jitFetchingRef.current = matchingKey;

    // Activate the workspace in the store (sets activeWorkspaceKey + clears activeRootItem)
    setActiveWorkspace(matchingKey);

    // Trigger JIT fetch if menu data isn't available yet
    if (!hasWorkspaceData(matchingKey)) {
      fetchWorkspaceMenu(matchingKey).finally(() => {
        if (jitFetchingRef.current === matchingKey) jitFetchingRef.current = null;
      });
    } else {
      jitFetchingRef.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, routesLoadedAt]);

  // ── Standard activeRootItem sync from URL ───────────────────────────────────
  useEffect(() => {
    if (!rootMenuItems.length) return;

    const activeRootItemId = useNavigationStore.getState().activeRootItemId;

    if (activeRootItemId) {
      const current = rootMenuItems.find((m) => m.id === activeRootItemId);
      if (current) {
        if (containsPath(current, pathname)) {
          return;
        }
      }
    }

    const bestRoot = findBestRootMatch(rootMenuItems, pathname);

    if (bestRoot && bestRoot.id !== activeRootItemId) {
      useNavigationStore.getState().setActiveRootItem(bestRoot.id);
    } else if (!bestRoot && !activeRootItemId && rootMenuItems.length > 0) {
      // No URL match and no active root — auto-select the first root item.
      // This covers the workspace-switch case where activeRootItemId was cleared
      // to null by setActiveWorkspace: without this, the secondary rail renders
      // completely empty until the user manually clicks a primary rail item.
      useNavigationStore.getState().setActiveRootItem(rootMenuItems[0].id);
    }
  }, [pathname, rootMenuItems]);
}
