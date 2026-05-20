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

  // ── Gap E fix: JIT workspace activation on direct URL navigation ────────────
  // When the user lands on a module URL (e.g. /crm/customers) directly (typed
  // in the browser or bookmarked), the JIT fetch normally only runs when the
  // module icon is clicked. This effect detects the mismatch and triggers the
  // fetch automatically, so the secondary rail populates without a click.
  useEffect(() => {
    const state = useNavigationStore.getState();
    const { workspaceGroups, activeWorkspaceKey, hasWorkspaceData, setActiveWorkspace } = state;

    // Only consider module workspaces (Admin workspaces are pre-loaded)
    const moduleWorkspaces = workspaceGroups.filter((g) => g.isModuleWorkspace);
    if (moduleWorkspaces.length === 0) return;

    // Find the module workspace whose key appears as a leading segment in the URL.
    // Convention: module workspace key === URL prefix (e.g. "crm" → /crm, /crm/*)
    const normalizedPath = pathname.toLowerCase().replace(/\/+$/, "");

    const matchingWorkspace = moduleWorkspaces.find((ws) => {
      const prefix = `/${ws.workspaceKey.toLowerCase()}`;
      return normalizedPath === prefix || normalizedPath.startsWith(`${prefix}/`);
    });

    if (!matchingWorkspace) return; // Not a module URL — nothing to do

    const wsKey = matchingWorkspace.workspaceKey;

    // Already on the right workspace and data is loaded → nothing to do
    if (activeWorkspaceKey === wsKey && hasWorkspaceData(wsKey)) return;

    // Prevent double-firing for the same key
    if (jitFetchingRef.current === wsKey) return;
    jitFetchingRef.current = wsKey;

    // Activate the workspace in the store (sets activeWorkspaceKey + clears activeRootItem)
    setActiveWorkspace(wsKey);

    // Trigger JIT fetch if menu data isn't available yet
    if (!hasWorkspaceData(wsKey)) {
      fetchWorkspaceMenu(wsKey).finally(() => {
        if (jitFetchingRef.current === wsKey) jitFetchingRef.current = null;
      });
    } else {
      jitFetchingRef.current = null;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

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
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, rootMenuItems]);
}
