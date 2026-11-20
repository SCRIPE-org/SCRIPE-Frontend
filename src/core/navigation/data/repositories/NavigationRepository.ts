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
 *   1. fetchRoutes()           → GET /menus/navigation/routes    (login, eager)
 *   2. fetchDefaultWorkspace() → GET /menus/navigation           (login, eager)
 *   3. fetchWorkspaceMenu(key) → GET /menus/navigation?workspace={key} (JIT on switch)
 */

import type { IApiService } from "@core/interfaces/api.interface";
import { NAVIGATION_ENDPOINTS } from "@core/config/api-endpoints";
import { appLogger } from "@core/common/logger";
import { normalizeRoutePath } from "@core/config/app-route-manifest";

import type {
  AuthorizedRouteDescriptor,
  AuthorizedRoutesResult,
  INavigationRepository,
  RouteAccessState,
} from "../../domain/interfaces/INavigationRepository";
import { NavigationData, type NavigationDataInput } from "../../domain/entities/NavigationData";
import { WorkspaceGroupMapper } from "../mappers/WorkspaceGroupMapper";
import { MenuItemMapper } from "../mappers/MenuItemMapper";
import type { WorkspaceGroupData } from "../../domain/entities/WorkspaceGroup";

const VALID_ROUTE_ACCESS_STATES = new Set<RouteAccessState>([
  "authorized",
  "tenant_context_required",
  "platform_context_required",
  "feature_disabled",
]);

export function parseRouteDescriptors(rawDescriptors: unknown): AuthorizedRouteDescriptor[] {
  if (!Array.isArray(rawDescriptors)) return [];

  const parsed: AuthorizedRouteDescriptor[] = [];
  for (const item of rawDescriptors) {
    if (!item || typeof item !== "object") continue;
    const record = item as Record<string, unknown>;
    if (typeof record.route !== "string" || !record.route.trim()) continue;
    const rawState = record.accessState;
    if (
      typeof rawState !== "string" ||
      !VALID_ROUTE_ACCESS_STATES.has(rawState as RouteAccessState)
    ) {
      appLogger.warn(
        `[NavigationRepository] Skipping route descriptor "${record.route}" with unrecognized accessState: ${String(rawState)}`
      );
      continue;
    }

    parsed.push({
      route: normalizeRoutePath(record.route),
      accessState: rawState as RouteAccessState,
      workspaceKey: typeof record.workspaceKey === "string" ? record.workspaceKey : null,
      requiredFeature: typeof record.requiredFeature === "string" ? record.requiredFeature : null,
      requiresTenantContext: Boolean(record.requiresTenantContext),
    });
  }
  return parsed;
}

// ── Response shapes from backend ──────────────────────────────────────────
interface RoutesApiResponse {
  data?: {
    routes?: string[];
    workspaceRouteMap?: Record<string, string[]>;
    routeDescriptors?: AuthorizedRouteDescriptor[];
  };
  routes?: string[];
  workspaceRouteMap?: Record<string, string[]>;
  routeDescriptors?: AuthorizedRouteDescriptor[];
}

export class NavigationRepository implements INavigationRepository {
  constructor(private readonly apiService: IApiService) {}

  /**
   * Fetches ALL accessible routes and route descriptors across ALL workspaces in one lightweight call.
   * Called on login and tenant/platform context switches.
   */
  async fetchRoutes(): Promise<AuthorizedRoutesResult> {
    appLogger.debug("[NavigationRepository] Fetching all routes (eager)…");

    const raw = await this.apiService.get<RoutesApiResponse>(
      NAVIGATION_ENDPOINTS.MENUS.AUTHORIZED_ROUTES
    );
    const payload = ((raw as RoutesApiResponse)?.data ?? raw ?? {}) as RoutesApiResponse;

    const routes = Array.isArray(payload.routes)
      ? payload.routes.filter((r): r is string => typeof r === "string" && r.trim().length > 0).map(normalizeRoutePath)
      : [];

    const workspaceRouteMap: Record<string, string[]> = {};
    if (typeof payload.workspaceRouteMap === "object" && payload.workspaceRouteMap !== null) {
      for (const [key, list] of Object.entries(payload.workspaceRouteMap)) {
        if (Array.isArray(list)) {
          workspaceRouteMap[key] = list
            .filter((r): r is string => typeof r === "string" && r.trim().length > 0)
            .map(normalizeRoutePath);
        }
      }
    }

    const routeDescriptors = parseRouteDescriptors(payload.routeDescriptors);

    appLogger.debug(
      `[NavigationRepository] Got ${routes.length} total routes (${routeDescriptors.length} descriptor(s)) across ${Object.keys(workspaceRouteMap).length} workspace(s)`
    );

    return { routes, workspaceRouteMap, routeDescriptors };
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
    appLogger.debug(
      `[NavigationRepository] Fetching workspace menu for "${workspaceKey || "default"}"…`
    );

    const endpoint =
      workspaceKey && workspaceKey !== "admin"
        ? NAVIGATION_ENDPOINTS.MENUS.WORKSPACE_NAVIGATION(workspaceKey)
        : NAVIGATION_ENDPOINTS.MENUS.NAVIGATION;

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
    const raw = await this.apiService.get<unknown>(
      NAVIGATION_ENDPOINTS.MENUS.AUTHORIZED_WORKSPACES
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payload = ((raw as any)?.data ?? raw ?? []) as Record<string, unknown>[];
    const rawGroups = Array.isArray(payload) ? payload : [];

    return rawGroups.map((group) => WorkspaceGroupMapper.fromDto(group));
  }

  /**
   * Toggles the pin state for a workspace.
   * Returns { isPinned, pinSortOrder } from the backend — never compute sort order client-side.
   */
  async toggleWorkspacePin(
    workspaceKey: string
  ): Promise<{ isPinned: boolean; pinSortOrder: number | null }> {
    appLogger.debug(`[NavigationRepository] Toggling pin for workspace "${workspaceKey}"…`);

    const raw = await this.apiService.post<unknown>(
      NAVIGATION_ENDPOINTS.MENUS.TOGGLE_WORKSPACE_PIN(workspaceKey),
      {}
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payload = ((raw as any)?.data ?? raw ?? {}) as Record<string, unknown>;
    const isPinned = Boolean(payload.isPinned ?? false);
    const pinSortOrder = payload.pinSortOrder != null ? Number(payload.pinSortOrder) : null;

    appLogger.debug(
      `[NavigationRepository] Workspace "${workspaceKey}" is now ${isPinned ? "pinned" : "unpinned"} (sortOrder=${pinSortOrder})`
    );

    return { isPinned, pinSortOrder };
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
