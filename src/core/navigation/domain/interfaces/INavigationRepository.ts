/**
 * INavigationRepository — Navigation Domain Interface
 *
 * Contract that all navigation data access must satisfy.
 * The data layer implements this; the presentation layer depends on it.
 *
 * Clean Architecture rule: Domain interfaces NEVER import from the data layer.
 */

import type { NavigationData } from "../entities/NavigationData";

export interface INavigationRepository {
  /**
   * Step 1 — JIT bootstrap.
   *
   * Fetches the DEFAULT workspace menu + lightweight workspace stubs for the
   * primary rail. Called once after login / on hard reload.
   *
   * Backend: GET /Menus/my  (no workspace param)
   */
  fetchDefaultWorkspace(): Promise<NavigationData>;

  /**
   * Step 2 — JIT on-demand.
   *
   * Fetches (and in-memory caches) the full menu tree for a specific workspace.
   * Returns the cached copy instantly if already loaded.
   *
   * Backend: GET /Menus/my?workspace={key}
   */
  fetchWorkspaceMenu(workspaceKey: string): Promise<NavigationData>;

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
