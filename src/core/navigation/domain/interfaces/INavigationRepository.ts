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
   * Phase 1 — JIT bootstrap (login / hard reload).
   *
   * Fetches ONLY the default (admin) workspace menu and routes.
   * No workspace stubs are fetched here — module workspace discovery
   * is deferred until the user explicitly navigates to a module.
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
