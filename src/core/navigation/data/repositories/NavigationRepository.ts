/**
 * NavigationRepository — Data Layer Implementation (v2)
 *
 * Responsibilities:
 *  - HTTP calls via IApiService
 *  - Parse raw API responses via mappers
 *  - NO in-memory caching (Zustand store + TanStack Query handle this)
 *  - NO localStorage read/write (Zustand persist handles this)
 *
 * Call sequence (v2 — Option B / Eager Routes):
 *   1. fetchRoutes()           → GET /Menus/my/routes    (login, eager)
 *   2. fetchDefaultWorkspace() → GET /Menus/my           (login, eager)
 *   3. fetchWorkspaceMenu(key) → GET /Menus/my?workspace={key} (JIT on switch)
 */

import type { IApiService } from "@core/interfaces/api.interface";
import { API_ENDPOINTS } from "@core/config/api-endpoints";
import { appLogger } from "@core/common/logger";

import type { INavigationRepository } from "../../domain/interfaces/INavigationRepository";
import { NavigationData, type NavigationDataInput } from "../../domain/entities/NavigationData";
import { WorkspaceGroupMapper } from "../mappers/WorkspaceGroupMapper";
import { MenuItemMapper } from "../mappers/MenuItemMapper";
import type { WorkspaceGroupData } from "../../domain/entities/WorkspaceGroup";

// ── Response shapes from backend ──────────────────────────────────────────
interface RoutesApiResponse {
  data?: {
    routes: string[];
    workspaceRouteMap: Record<string, string[]>;
  };
  routes?: string[];
  workspaceRouteMap?: Record<string, string[]>;
}

export class NavigationRepository implements INavigationRepository {
  constructor(private readonly apiService: IApiService) {}

  /**
   * Fetches ALL accessible routes across ALL workspaces in one lightweight call.
   * Called ONCE on login — feeds useNavigationStore.allRoutes immediately.
   */
  async fetchRoutes(): Promise<{
    routes: string[];
    workspaceRouteMap: Record<string, string[]>;
  }> {
    appLogger.debug("[NavigationRepository] Fetching all routes (eager)…");

    const raw = await this.apiService.get<RoutesApiResponse>(API_ENDPOINTS.MENUS.MY_ROUTES);
    const payload = (raw as RoutesApiResponse)?.data ?? raw ?? {};

    const routes = Array.isArray((payload as RoutesApiResponse).routes)
      ? ((payload as RoutesApiResponse).routes as string[])
      : [];

    const workspaceRouteMap =
      typeof (payload as RoutesApiResponse).workspaceRouteMap === "object" &&
      (payload as RoutesApiResponse).workspaceRouteMap !== null
        ? ((payload as RoutesApiResponse).workspaceRouteMap as Record<string, string[]>)
        : {};

    appLogger.debug(`[NavigationRepository] Got ${routes.length} total routes across ${Object.keys(workspaceRouteMap).length} workspace(s)`);

    return { routes, workspaceRouteMap };
  }

  /**
   * Fetches the default (admin) workspace menu tree + all workspace group metadata.
   */
  async fetchDefaultWorkspace(): Promise<NavigationData> {
    return this.fetchWorkspaceMenu();
  }

  /**
   * Fetches navigation data for the specified workspace (JIT).
   * If no workspaceKey is provided, fetches the default workspace.
   */
  async fetchWorkspaceMenu(workspaceKey?: string): Promise<NavigationData> {
    appLogger.debug(`[NavigationRepository] Fetching workspace menu for "${workspaceKey || "default"}"…`);

    const endpoint =
      workspaceKey && workspaceKey !== "admin"
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
    const parsedWorkspaceGroups = rawWorkspaceGroups.map((group) =>
      WorkspaceGroupMapper.fromDto(group)
    );

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
   * Fetches lightweight workspace stubs (no menu trees) for workspace picker UI.
   */
  async fetchWorkspaceStubs(): Promise<WorkspaceGroupData[]> {
    appLogger.debug("[NavigationRepository] Fetching workspace stubs...");
    const raw = await this.apiService.get<unknown>(API_ENDPOINTS.MENUS.MY_WORKSPACES);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payload = ((raw as any)?.data ?? raw ?? []) as Record<string, unknown>[];
    const rawGroups = Array.isArray(payload) ? payload : [];

    return rawGroups.map((group) => WorkspaceGroupMapper.fromDto(group));
  }

  // ── Legacy compatibility — kept for interface compliance ──────────────────
  clearAllCaches(): void {
    // No-op: caching handled by Zustand persist + TanStack Query
    appLogger.debug("[NavigationRepository] clearAllCaches (no-op in v2)");
  }

  hasPageAccess(_pathname: string): boolean {
    // Removed: use useNavigationStore.hasRouteAccess() directly
    return false;
  }

  getAllowedRoutes(): string[] {
    // Removed: use useNavigationStore.allRoutes directly
    return [];
  }
}
