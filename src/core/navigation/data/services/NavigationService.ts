/**
 * NavigationService — Data Service Layer
 *
 * Executes all navigation HTTP requests via `IApiService`.
 * Contains zero domain logic, caching, or UI state.
 */

import type { IApiService } from "@core/interfaces/api.interface";
import { NAVIGATION_ENDPOINTS } from "@core/config/api-endpoints";
import type { LandingTargetScopeMode } from "../../domain/entities/LandingTargetCatalog";
import type { SetAdminWorkspaceEntryRequestDto } from "../models/WorkspaceEntryPreferenceDto";

export interface INavigationService {
  getNavigationBootstrap(redirect?: string | null): Promise<Record<string, unknown>>;
  getAuthorizedRoutes(): Promise<Record<string, unknown>>;
  getWorkspaceMenu(workspaceKey?: string): Promise<Record<string, unknown>>;
  getWorkspaceStubs(): Promise<Record<string, unknown>[]>;
  toggleWorkspacePin(workspaceKey: string): Promise<Record<string, unknown>>;
  getLandingTargetCatalog(scopeMode?: LandingTargetScopeMode): Promise<Record<string, unknown>>;
  setWorkspaceStartPage(
    workspaceKey: string,
    target: string,
    rowVersion?: string | null
  ): Promise<Record<string, unknown>>;
  resetWorkspaceStartPage(workspaceKey: string): Promise<void>;
}

function unwrapDataPayload<T extends object>(raw: unknown, fallback: T): T {
  if (!raw || typeof raw !== "object") return fallback;
  const envelope = raw as { data?: unknown };
  const candidate = envelope.data ?? raw;
  if (!candidate || typeof candidate !== "object") return fallback;
  return candidate as T;
}

export class NavigationService implements INavigationService {
  constructor(private readonly apiService: IApiService) {}

  async getNavigationBootstrap(redirect?: string | null): Promise<Record<string, unknown>> {
    const endpoint = redirect
      ? NAVIGATION_ENDPOINTS.MENUS.NAVIGATION_BOOTSTRAP(redirect)
      : NAVIGATION_ENDPOINTS.MENUS.NAVIGATION;
    const raw = await this.apiService.get<unknown>(endpoint);
    return unwrapDataPayload<Record<string, unknown>>(raw, {});
  }

  async getAuthorizedRoutes(): Promise<Record<string, unknown>> {
    const raw = await this.apiService.get<unknown>(NAVIGATION_ENDPOINTS.MENUS.AUTHORIZED_ROUTES);
    return unwrapDataPayload<Record<string, unknown>>(raw, {});
  }

  async getWorkspaceMenu(workspaceKey?: string): Promise<Record<string, unknown>> {
    const endpoint = workspaceKey
      ? NAVIGATION_ENDPOINTS.MENUS.WORKSPACE_NAVIGATION(workspaceKey)
      : NAVIGATION_ENDPOINTS.MENUS.NAVIGATION;
    const raw = await this.apiService.get<unknown>(endpoint);
    return unwrapDataPayload<Record<string, unknown>>(raw, {});
  }

  async getWorkspaceStubs(): Promise<Record<string, unknown>[]> {
    const raw = await this.apiService.get<unknown>(
      NAVIGATION_ENDPOINTS.MENUS.AUTHORIZED_WORKSPACES
    );
    const envelope = raw as { data?: unknown } | null | undefined;
    const candidate = envelope?.data ?? raw;
    return Array.isArray(candidate) ? (candidate as Record<string, unknown>[]) : [];
  }

  async toggleWorkspacePin(workspaceKey: string): Promise<Record<string, unknown>> {
    const raw = await this.apiService.post<unknown>(
      NAVIGATION_ENDPOINTS.MENUS.TOGGLE_WORKSPACE_PIN(workspaceKey),
      {}
    );
    return unwrapDataPayload<Record<string, unknown>>(raw, {});
  }

  async getLandingTargetCatalog(
    scopeMode?: LandingTargetScopeMode
  ): Promise<Record<string, unknown>> {
    const endpoint = NAVIGATION_ENDPOINTS.MENUS.LANDING_TARGETS(scopeMode);
    const raw = await this.apiService.get<unknown>(endpoint);
    return unwrapDataPayload<Record<string, unknown>>(raw, {});
  }

  async setWorkspaceStartPage(
    workspaceKey: string,
    target: string,
    rowVersion?: string | null
  ): Promise<Record<string, unknown>> {
    const body: SetAdminWorkspaceEntryRequestDto = {
      target,
      rowVersion: rowVersion ?? null,
    };
    const raw = await this.apiService.put<unknown>(
      NAVIGATION_ENDPOINTS.ACCOUNT.WORKSPACE_ENTRY(workspaceKey),
      body
    );
    return unwrapDataPayload<Record<string, unknown>>(raw, {});
  }

  async resetWorkspaceStartPage(workspaceKey: string): Promise<void> {
    await this.apiService.delete<void>(NAVIGATION_ENDPOINTS.ACCOUNT.WORKSPACE_ENTRY(workspaceKey));
  }
}
