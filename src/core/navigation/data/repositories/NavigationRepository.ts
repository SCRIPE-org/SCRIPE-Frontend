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
 * JIT Architecture (two-phase initial load):
 *   Phase 1 — Parallel fetch:
 *     GET /Menus/my/workspaces  → lightweight workspace stubs (no menu items)
 *     GET /Menus/my             → default workspace menu items + routes
 *   Phase 2 — On workspace switch:
 *     GET /Menus/my?workspace=X → specific workspace menu items (JIT on demand)
 *
 * This gives the WorkspaceProvider all workspace metadata on first render
 * AND the default workspace's menu items — no extra round-trips needed.
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

  // ── Step 1: Default workspace (parallel fetch + merge) ────────────────────

  async fetchDefaultWorkspace(): Promise<NavigationData> {
    appLogger.debug(
      "[NavigationRepository] Fetching workspace stubs + default menu in parallel…"
    );

    // ── Parallel fetch ─────────────────────────────────────────────────────
    const [stubsRaw, menuRaw] = await Promise.all([
      this.apiService.get<unknown>(API_ENDPOINTS.MENUS.MY_WORKSPACES).catch((err) => {
        appLogger.warn(
          "[NavigationRepository] Workspace stubs fetch failed — using fallback:",
          err
        );
        return null;
      }),
      this.apiService.get<unknown>(API_ENDPOINTS.MENUS.MY),
    ]);

    // ── Extract menu items from default workspace response ─────────────────
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const menuData = ((menuRaw as any)?.data ?? menuRaw ?? {}) as Record<string, unknown>;
    const rawMenuItems = Array.isArray(menuData.menuItems)
      ? (menuData.menuItems as Record<string, unknown>[])
      : [];
    const rawRoutes = Array.isArray(menuData.routes)
      ? (menuData.routes as string[])
      : [];

    const parsedMenuItems = rawMenuItems.map((item) =>
      MenuItemMapper.fromJson(item)
    );

    // ── Extract workspace stubs ────────────────────────────────────────────
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const stubsData = (stubsRaw as any)?.data ?? stubsRaw;
    const rawStubs = Array.isArray(stubsData) ? stubsData : [];

    // ── Build workspaceGroups ──────────────────────────────────────────────
    // Each stub becomes a WorkspaceGroupData. The default workspace (lowest
    // sortOrder Admin workspace) gets the menu items we already fetched.
    let defaultKeyAssigned = false;
    const workspaceGroups: WorkspaceGroupData[] = rawStubs
      // Sort by sortOrder so we can identify the default workspace consistently
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .sort((a: any, b: any) => (a.workspaceSortOrder ?? 0) - (b.workspaceSortOrder ?? 0))
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((stub: any) => {
        const base = WorkspaceGroupMapper.fromDto(stub);
        const isAdminType = (base.workspaceType ?? "Admin") !== "Module";

        // Assign default menu items to the first Admin workspace
        let menuItems = base.menuItems; // (empty for stubs)
        if (isAdminType && !defaultKeyAssigned && parsedMenuItems.length > 0) {
          menuItems = parsedMenuItems.map((item) => item.toData());
          defaultKeyAssigned = true;
          appLogger.debug(
            `[NavigationRepository] Assigned ${menuItems.length} default menu items to workspace "${base.workspaceKey}"`
          );
        }

        return { ...base, menuItems };
      });

    // ── Fallback: no stubs returned — synthesise a single admin group ──────
    if (workspaceGroups.length === 0) {
      appLogger.warn(
        "[NavigationRepository] No workspace stubs — synthesising default admin workspace"
      );
      workspaceGroups.push({
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
      });
    }

    const input: NavigationDataInput = {
      menuItems: parsedMenuItems.map((item) => item.toData()),
      routes: rawRoutes,
      workspaceGroups,
    };

    const data = new NavigationData(input);
    this.defaultData = data;

    // Seed the in-memory cache with the first workspace
    const firstKey = workspaceGroups[0]?.workspaceKey;
    if (firstKey && !this.cache.has(firstKey)) {
      this.cache.set(firstKey, data);
    }

    appLogger.debug(
      `[NavigationRepository] Ready — ${workspaceGroups.length} workspace(s), ` +
        `${parsedMenuItems.length} root item(s), ${rawRoutes.length} route(s)`
    );

    return data;
  }

  // ── Step 2: JIT per-workspace fetch ───────────────────────────────────────

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

    // Inject the fetched items into the matching workspace group in the existing groups list
    const existingGroups = this.defaultData?.workspaceGroups.map((g) => g.toData()) ?? [];
    const updatedGroups = existingGroups.map((g) =>
      g.workspaceKey === workspaceKey
        ? { ...g, menuItems: parsedMenuItems.map((item) => item.toData()) }
        : g
    );

    const data = new NavigationData({
      menuItems: parsedMenuItems.map((item) => item.toData()),
      routes: rawRoutes,
      workspaceGroups: updatedGroups,
    });

    this.cache.set(workspaceKey, data);
    return data;
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
