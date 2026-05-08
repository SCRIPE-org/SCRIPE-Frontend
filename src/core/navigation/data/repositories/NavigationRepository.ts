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
 * NOT responsible for:
 *  - localStorage read/write (that's the provider's concern for SSR safety)
 *  - React state / context
 *  - Any UI concerns
 *
 * The single effective endpoint contract:
 *   GET /Menus/my              → default workspace menu + workspace stubs
 *   GET /Menus/my?workspace=X  → specific workspace menu (JIT on switch)
 */

import type { IApiService } from "@core/interfaces/api.interface";
import { API_ENDPOINTS } from "@core/config/api-endpoints";
import { appLogger } from "@core/common/logger";

import type { INavigationRepository } from "../../domain/interfaces/INavigationRepository";
import { NavigationData } from "../../domain/entities/NavigationData";
import { NavigationDataMapper } from "../mappers/NavigationDataMapper";

export class NavigationRepository implements INavigationRepository {
  /** In-memory per-workspace cache: workspaceKey → NavigationData */
  private readonly cache = new Map<string, NavigationData>();

  /** The most-recently fetched default-workspace result (used for access checks) */
  private defaultData: NavigationData | null = null;

  constructor(private readonly apiService: IApiService) {}

  // ── Step 1: Default workspace ─────────────────────────────────────────────

  async fetchDefaultWorkspace(): Promise<NavigationData> {
    appLogger.debug("[NavigationRepository] Fetching default workspace menu…");

    const raw = await this.apiService.get<unknown>(API_ENDPOINTS.MENUS.MY);
    const data = NavigationDataMapper.fromApiResponse(raw);

    this.defaultData = data;

    // Seed the in-memory cache with the first workspace returned
    if (data.workspaceGroups.length > 0) {
      const firstKey = data.workspaceGroups[0].workspaceKey;
      if (!this.cache.has(firstKey)) {
        this.cache.set(firstKey, data);
        appLogger.debug(`[NavigationRepository] Seeded cache for workspace "${firstKey}"`);
      }
    }

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
    const data = NavigationDataMapper.fromApiResponse(raw);

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
