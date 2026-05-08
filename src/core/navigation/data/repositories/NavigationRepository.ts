/**
 * NavigationRepository — Data Layer Implementation
 *
 * Implements INavigationRepository.
 *
 * Responsibilities:
 *  - Make HTTP calls via IApiService
 *  - Parse raw API responses via NavigationDataMapper
 *  - Maintain in-memory per-workspace cache (Map<key, NavigationData>)
 *  - Expose clearAllCaches() for impersonation lifecycle management
 *
 * JIT Architecture (true on-demand loading):
 *   Phase 1 — Login / page refresh:
 *     GET /Menus/my  →  default (admin) workspace menu items + routes
 *     No other calls are made. A single WorkspaceGroup is synthesised
 *     from this response so the primary rail renders immediately.
 *
 *   Phase 2 — User switches to a module workspace (e.g. CRM):
 *     GET /Menus/my?workspace=crm  →  CRM menu items (JIT, cached after first load)
 *
 *   The GET /Menus/my/workspaces endpoint is NEVER called on login.
 *   It is only called when the WorkspaceProvider needs to discover
 *   available module workspaces (e.g. to populate a picker or after
 *   a drill-down context change). This keeps the initial payload tiny
 *   and avoids leaking module workspace metadata to users who have
 *   no business seeing it.
 */

import type { IApiService } from "@core/interfaces/api.interface";
import { API_ENDPOINTS } from "@core/config/api-endpoints";
import { appLogger } from "@core/common/logger";

import type { INavigationRepository } from "../../domain/interfaces/INavigationRepository";
import { NavigationData, type NavigationDataInput } from "../../domain/entities/NavigationData";
import { WorkspaceGroupMapper } from "../mappers/WorkspaceGroupMapper";
import { MenuItemMapper } from "../mappers/MenuItemMapper";
import type { WorkspaceGroupData } from "../../domain/entities/WorkspaceGroup";

export class NavigationRepository implements INavigationRepository {
  constructor(private readonly apiService: IApiService) {}

  /**
   * Fetches the default (admin) workspace navigation data.
   */
  async fetchDefaultWorkspace(): Promise<NavigationData> {
    return this.fetchWorkspaceMenu();
  }

  /**
   * Fetches navigation data for the specified workspace.
   * If no workspaceKey is provided, fetches the default (admin) workspace.
   */
  async fetchWorkspaceMenu(workspaceKey?: string): Promise<NavigationData> {
    appLogger.debug(`[NavigationRepository] Fetching workspace menu for "${workspaceKey || 'default'}"…`);

    const endpoint = workspaceKey && workspaceKey !== 'admin'
      ? API_ENDPOINTS.MENUS.MY_WORKSPACE(workspaceKey)
      : API_ENDPOINTS.MENUS.MY;

    const raw = await this.apiService.get<unknown>(endpoint);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payload = ((raw as any)?.data ?? raw ?? {}) as Record<string, unknown>;
    
    const rawMenuItems = Array.isArray(payload.menuItems)
      ? (payload.menuItems as Record<string, unknown>[])
      : [];
    const rawRoutes = Array.isArray(payload.routes) ? (payload.routes as string[]) : [];
    const rawWorkspaceGroups = Array.isArray(payload.workspaceGroups) 
      ? (payload.workspaceGroups as Record<string, unknown>[]) 
      : [];

    const parsedMenuItems = rawMenuItems.map((item) => MenuItemMapper.fromJson(item));
    const parsedWorkspaceGroups = rawWorkspaceGroups.map((group) => WorkspaceGroupMapper.fromDto(group));

    const input: NavigationDataInput = {
      menuItems: parsedMenuItems.map((item) => item.toData()),
      routes: rawRoutes,
      workspaceGroups: parsedWorkspaceGroups,
    };

    const data = new NavigationData(input);
    
    appLogger.debug(
      `[NavigationRepository] Ready — ${parsedWorkspaceGroups.length} workspace(s), ` +
        `${parsedMenuItems.length} root item(s), ${rawRoutes.length} route(s)`
    );

    return data;
  }

  /**
   * Fetches lightweight workspace stubs so the provider can discover
   * which module workspaces are available. Never called at startup.
   */
  async fetchWorkspaceStubs(): Promise<WorkspaceGroupData[]> {
    appLogger.debug(`[NavigationRepository] Fetching workspace stubs...`);
    const endpoint = API_ENDPOINTS.MENUS.MY_WORKSPACES;
    const raw = await this.apiService.get<unknown>(endpoint);
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payload = ((raw as any)?.data ?? raw ?? []) as Record<string, unknown>[];
    const rawWorkspaceGroups = Array.isArray(payload) ? payload : [];
    
    return rawWorkspaceGroups.map(group => WorkspaceGroupMapper.fromDto(group));
  }

  // ── Cache management (No-op as state is managed by provider) ───────────────

  clearAllCaches(): void {
    appLogger.auth("[NavigationRepository] clearAllCaches called (no-op, state managed by provider)");
  }

  hasPageAccess(pathname: string): boolean {
    // This is no longer used by RouteGuard (it uses the Provider's state)
    return false;
  }

  getAllowedRoutes(): string[] {
    // This is no longer used
    return [];
  }
}

