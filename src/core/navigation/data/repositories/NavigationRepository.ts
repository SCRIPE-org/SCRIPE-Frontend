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
  /** In-memory per-workspace cache: workspaceKey → NavigationData */
  private readonly cache = new Map<string, NavigationData>();

  /** The most-recently fetched merged result (used for access checks and JIT merge base) */
  private defaultData: NavigationData | null = null;

  constructor(private readonly apiService: IApiService) {}

  // ── Phase 1: Default workspace (admin menu only — no stubs) ───────────────

  async fetchDefaultWorkspace(): Promise<NavigationData> {
    appLogger.debug("[NavigationRepository] Fetching default (admin) workspace menu…");

    // Single call — only the admin workspace menu. No workspace stubs.
    const menuRaw = await this.apiService.get<unknown>(API_ENDPOINTS.MENUS.MY);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const menuData = ((menuRaw as any)?.data ?? menuRaw ?? {}) as Record<string, unknown>;
    const rawMenuItems = Array.isArray(menuData.menuItems)
      ? (menuData.menuItems as Record<string, unknown>[])
      : [];
    const rawRoutes = Array.isArray(menuData.routes)
      ? (menuData.routes as string[])
      : [];

    const parsedMenuItems = rawMenuItems.map((item) => MenuItemMapper.fromJson(item));

    // Synthesise a single Admin WorkspaceGroup — no stubs needed.
    // The primary rail only shows admin items at this stage; module workspace
    // icons are NOT rendered until the user explicitly navigates to one.
    const adminGroup: WorkspaceGroupData = {
      workspaceId: "admin",
      workspaceKey: "admin",
      workspaceNameEn: "Administration",
      workspaceNameAr: "الإدارة",
      workspaceIcon: "ShieldCheck",
      workspaceSortOrder: 1,
      colorHue: 270,
      colorChroma: 0.22,
      workspaceType: "Admin",
      menuItems: parsedMenuItems.map((item) => item.toData()),
    };

    const input: NavigationDataInput = {
      menuItems: parsedMenuItems.map((item) => item.toData()),
      routes: rawRoutes,
      workspaceGroups: [adminGroup],
    };

    const data = new NavigationData(input);
    this.defaultData = data;

    // Seed the admin workspace cache entry
    if (!this.cache.has("admin")) {
      this.cache.set("admin", data);
    }

    appLogger.debug(
      `[NavigationRepository] Ready — 1 workspace (admin), ` +
        `${parsedMenuItems.length} root item(s), ${rawRoutes.length} route(s)`
    );

    return data;
  }

  // ── Phase 2: JIT per-workspace fetch (triggered by user action) ───────────

  async fetchWorkspaceMenu(workspaceKey: string): Promise<NavigationData> {
    // Return in-memory cached version immediately (no network)
    const cached = this.cache.get(workspaceKey);
    if (cached) {
      appLogger.debug(`[NavigationRepository] Cache HIT for workspace "${workspaceKey}"`);
      return cached;
    }

    appLogger.debug(`[NavigationRepository] JIT fetch for workspace "${workspaceKey}"…`);

    const raw = await this.apiService.get<unknown>(
      API_ENDPOINTS.MENUS.MY_WORKSPACE(workspaceKey)
    );

    // The JIT response returns { menuItems, routes } — no workspace stubs.
    // Merge into the full workspaceGroups from defaultData.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payload = ((raw as any)?.data ?? raw ?? {}) as Record<string, unknown>;
    const rawMenuItems = Array.isArray(payload.menuItems)
      ? (payload.menuItems as Record<string, unknown>[])
      : [];
    const rawRoutes = Array.isArray(payload.routes) ? (payload.routes as string[]) : [];

    const parsedMenuItems = rawMenuItems.map((item) => MenuItemMapper.fromJson(item));

    // Inject fetched items into the matching workspace group in the existing groups list.
    // If the workspace group doesn't exist yet (first visit after stub discovery),
    // append it to the list.
    const existingGroups = this.defaultData?.workspaceGroups.map((g) => g.toData()) ?? [];
    const alreadyInList = existingGroups.some((g) => g.workspaceKey === workspaceKey);

    const updatedGroups = alreadyInList
      ? existingGroups.map((g) =>
          g.workspaceKey === workspaceKey
            ? { ...g, menuItems: parsedMenuItems.map((item) => item.toData()) }
            : g
        )
      : [
          ...existingGroups,
          {
            workspaceId: workspaceKey,
            workspaceKey,
            workspaceNameEn: workspaceKey,
            workspaceNameAr: workspaceKey,
            workspaceIcon: "Boxes",
            workspaceSortOrder: 99,
            colorHue: 240,
            colorChroma: 0.2,
            workspaceType: "Module",
            menuItems: parsedMenuItems.map((item) => item.toData()),
          } satisfies WorkspaceGroupData,
        ];

    const data = new NavigationData({
      menuItems: parsedMenuItems.map((item) => item.toData()),
      routes: rawRoutes,
      workspaceGroups: updatedGroups,
    });

    this.cache.set(workspaceKey, data);
    return data;
  }

  // ── JIT workspace stub discovery (called only when switching to a module) ─

  /**
   * Fetches lightweight workspace stubs from GET /Menus/my/workspaces.
   * Called ONLY when the WorkspaceProvider needs to discover module workspaces
   * (e.g. after a drill-down or when the user first enters a module workspace).
   * Never called at startup.
   */
  async fetchWorkspaceStubs(): Promise<WorkspaceGroupData[]> {
    appLogger.debug("[NavigationRepository] JIT fetch of workspace stubs…");

    const raw = await this.apiService.get<unknown>(API_ENDPOINTS.MENUS.MY_WORKSPACES).catch(
      (err) => {
        appLogger.warn("[NavigationRepository] Workspace stubs fetch failed:", err);
        return null;
      }
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const stubsData = (raw as any)?.data ?? raw;
    const rawStubs = Array.isArray(stubsData) ? stubsData : [];

    return rawStubs
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .sort((a: any, b: any) => (a.workspaceSortOrder ?? 0) - (b.workspaceSortOrder ?? 0))
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((stub: any) => WorkspaceGroupMapper.fromDto(stub));
  }

  // ── Cache management ───────────────────────────────────────────────────────

  clearAllCaches(): void {
    this.cache.clear();
    this.defaultData = null;
    appLogger.auth("[NavigationRepository] All caches cleared (lifecycle event)");
  }

  hasPageAccess(pathname: string): boolean {
    // Check default data first
    if (this.defaultData?.hasPageAccess(pathname)) return true;
    // Then check across all loaded workspace caches
    for (const data of this.cache.values()) {
      if (data.hasPageAccess(pathname)) return true;
    }
    return false;
  }

  getAllowedRoutes(): string[] {
    const routes = new Set<string>(this.defaultData?.routes ?? []);
    for (const data of this.cache.values()) {
      data.routes.forEach((r) => routes.add(r));
    }
    return [...routes];
  }
}
