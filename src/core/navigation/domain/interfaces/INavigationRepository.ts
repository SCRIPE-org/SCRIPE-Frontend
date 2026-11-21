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

export type RouteAccessState =
  | "authorized"
  | "tenant_context_required"
  | "platform_context_required"
  | "feature_disabled";

export interface AuthorizedRouteDescriptor {
  route: string;
  accessState: RouteAccessState;
  workspaceKey?: string | null;
  requiredFeature?: string | null;
  requiresTenantContext: boolean;
}

export interface AuthorizedRoutesResult {
  routes: string[];
  workspaceRouteMap: Record<string, string[]>;
  routeDescriptors: AuthorizedRouteDescriptor[];
}

export interface LandingResolution {
  targetKind: string;
  route: string;
  workspaceKey: string | null;
  sourceReason: string;
  isEnforced: boolean;
  enforcingRoleName: string | null;
  wasFallbackApplied: boolean;
  fallbackReason: string | null;
}

export interface BootstrapNavigationResult {
  navigationData: NavigationData;
  routes: string[];
  workspaceRouteMap: Record<string, string[]>;
  routeDescriptors: AuthorizedRouteDescriptor[];
  landingResolution: LandingResolution | null;
}

export interface INavigationRepository {
  /**
   * Single-pass bootstrap call (called ONCE on login/context switch/hard reload).
   * Coalesces authorized routes, descriptors, workspace groups, hydrated target workspace
   * menu tree, and resolved landing metadata into one HTTP request.
   *
   * Backend: GET /menus/navigation[?redirect=<encoded>]
   */
  fetchNavigationBootstrap(redirect?: string | null): Promise<BootstrapNavigationResult>;

  /**
   * Legacy / rolling-compat routes load.
   *
   * Backend: GET /menus/navigation/routes
   */
  fetchRoutes(): Promise<AuthorizedRoutesResult>;

  /**
   * Phase 1 — Default workspace load (login / hard reload).
   *
   * Fetches the default (admin) workspace menu tree + workspace group metadata.
   * No workspace stubs are fetched separately — groups come in this response.
   *
   * Backend: GET /menus/navigation  (no workspace param)
   */
  fetchDefaultWorkspace(): Promise<NavigationData>;

  /**
   * Phase 2 — JIT on-demand (user switches workspace).
   *
   * Fetches (and in-memory caches) the full menu tree for a specific workspace.
   * Returns the cached copy instantly if already loaded.
   *
   * Backend: GET /menus/navigation?workspace={key}
   */
  fetchWorkspaceMenu(workspaceKey: string): Promise<NavigationData>;

  /**
   * Toggle pin state for a workspace.
   *
   * Backend: POST /menus/navigation/workspaces/{key}/pin
   * Returns both the new isPinned state AND the backend-authoritative pinSortOrder.
   * Never compute pinSortOrder client-side — always use the value returned here.
   */
  toggleWorkspacePin(
    workspaceKey: string
  ): Promise<{ isPinned: boolean; pinSortOrder: number | null }>;

  /**
   * Phase 2b — JIT stub discovery (user navigates to a module workspace).
   *
   * Fetches lightweight workspace stubs so the provider can discover
   * which module workspaces are available. Never called at startup.
   *
   * Backend: GET /menus/navigation/workspaces
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
