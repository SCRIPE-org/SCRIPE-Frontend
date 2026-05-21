/**
 * INavigationRepository — Navigation Domain Interface
 *
 * Contract that all navigation data access must satisfy.
 * The data layer implements this; the presentation layer depends on it.
 *
 * Clean Architecture rule: Domain interfaces NEVER import from the data layer.
 */

import type { NavigationData } from "../entities/NavigationData";
import type { WorkspaceGroupData } from "../entities/WorkspaceGroup";

export interface INavigationRepository {
  /**
   * Phase 0 — Eager routes load (called ONCE on login, before any menu trees).
   *
   * Fetches ALL accessible routes across ALL workspaces in a single lightweight call.
   * This seeds the allRoutes Set in useNavigationStore, guaranteeing that the
   * RouteGuard never gets a false "not-authorized" while menu trees are loading.
   *
   * Backend: GET /Menus/my/routes
   */
  fetchRoutes(): Promise<{
    routes: string[];
    workspaceRouteMap: Record<string, string[]>;
  }>;

  /**
   * Phase 1 — Default workspace load (login / hard reload).
   *
   * Fetches the default (admin) workspace menu tree + workspace group metadata.
   * No workspace stubs are fetched separately — groups come in this response.
   *
   * Backend: GET /Menus/my  (no workspace param)
   */
  fetchDefaultWorkspace(): Promise<NavigationData>;

  /**
   * Phase 2 — JIT on-demand (user switches workspace).
   *
   * Fetches (and in-memory caches) the full menu tree for a specific workspace.
   * Returns the cached copy instantly if already loaded.
   *
   * Backend: GET /Menus/my?workspace={key}
   */
  fetchWorkspaceMenu(workspaceKey: string): Promise<NavigationData>;

  /**
   * Toggle pin state for a workspace.
   *
   * Backend: POST /Menus/my/workspaces/{key}/pin
   * Returns both the new isPinned state AND the backend-authoritative pinSortOrder.
   * Never compute pinSortOrder client-side — always use the value returned here.
   */
  toggleWorkspacePin(workspaceKey: string): Promise<{ isPinned: boolean; pinSortOrder: number | null }>;

  /**
   * Phase 2b — JIT stub discovery (user navigates to a module workspace).
   *
   * Fetches lightweight workspace stubs so the provider can discover
   * which module workspaces are available. Never called at startup.
   *
   * Backend: GET /Menus/my/workspaces
   */
  fetchWorkspaceStubs(): Promise<WorkspaceGroupData[]>;

  /**
   * Purge ALL in-memory workspace caches.
   * Called on impersonation start/stop and on logout to prevent data leakage.
   */
  clearAllCaches(): void;

  /**
   * Check whether the current user has access to a given pathname.
   * Checks across all workspace caches loaded so far.
   */
  hasPageAccess(pathname: string): boolean;

  /**
   * Return all known allowed routes (union across all loaded workspaces).
   */
  getAllowedRoutes(): string[];
}
