/**
 * Menu Service Implementation
 *
 * Handles all HTTP operations for menu items.
 * Repository delegates to this service for API calls.
 *
 * @module menus/data
 */
import type { IApiService } from "@core/interfaces/api.interface";
import type { IMenuService } from "../../domain/interfaces/IMenuService";
import type { MenuTreeNode } from "../../domain/entities/MenuItem";
import type {
  CreateMenuItemRequest,
  UpdateMenuItemRequest,
  ReorderMenuItemsRequest,
  SetRoleMenuVisibilityRequest,
  SaveMenuOverrideRequest,
} from "../../domain/entities/MenuItemRequests";
import { MENUS_ENDPOINTS } from "./menus.endpoints";

/**
 * Http API network service for menu.
 * Maps request properties to core endpoint paths and delegates HTTP client fetching calls.
 */
export class MenuService implements IMenuService {
  constructor(private readonly api: IApiService) {}

  async getAll(): Promise<MenuTreeNode[]> {
    return await this.api.get<MenuTreeNode[]>(MENUS_ENDPOINTS.LIST);
  }

  async create(request: CreateMenuItemRequest): Promise<{ id: string }> {
    return await this.api.post<{ id: string }>(MENUS_ENDPOINTS.CREATE, request);
  }

  async update(id: string, request: UpdateMenuItemRequest): Promise<void> {
    await this.api.put(MENUS_ENDPOINTS.UPDATE(id), request);
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(MENUS_ENDPOINTS.DELETE(id));
  }

  async reorder(request: ReorderMenuItemsRequest): Promise<void> {
    await this.api.put(MENUS_ENDPOINTS.REORDER, request);
  }

  async setRoleVisibility(request: SetRoleMenuVisibilityRequest): Promise<void> {
    await this.api.put(MENUS_ENDPOINTS.ROLE_VISIBILITY, request);
  }

  async saveOverride(request: SaveMenuOverrideRequest): Promise<{ id: string }> {
    return await this.api.post<{ id: string }>(MENUS_ENDPOINTS.OVERRIDES, request);
  }

  async deleteOverride(id: string): Promise<void> {
    await this.api.delete(MENUS_ENDPOINTS.DELETE_OVERRIDE(id));
  }
}
