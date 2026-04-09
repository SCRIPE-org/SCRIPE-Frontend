/**
 * Menu Service Implementation
 *
 * Handles all HTTP operations for menu items.
 * Repository delegates to this service for API calls.
 *
 * @module menus/data
 */
import type { IApiService } from "@core/interfaces/api.interface";
import { API_ENDPOINTS } from "@core/config/api-endpoints";
import type { IMenuService } from "../../domain/interfaces/IMenuService";
import type { MenuTreeNode } from "../../domain/entities/MenuItem";
import type {
  CreateMenuItemRequest,
  UpdateMenuItemRequest,
  ReorderMenuItemsRequest,
  SetRoleMenuVisibilityRequest,
  SaveMenuOverrideRequest,
} from "../../domain/entities/MenuItemRequests";

export class MenuService implements IMenuService {
  constructor(private readonly api: IApiService) {}

  async getAll(): Promise<MenuTreeNode[]> {
    return await this.api.get<MenuTreeNode[]>(API_ENDPOINTS.MENUS.LIST);
  }

  async create(request: CreateMenuItemRequest): Promise<{ id: string }> {
    return await this.api.post<{ id: string }>(API_ENDPOINTS.MENUS.CREATE, request);
  }

  async update(id: string, request: UpdateMenuItemRequest): Promise<void> {
    await this.api.put(API_ENDPOINTS.MENUS.UPDATE(id), request);
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(API_ENDPOINTS.MENUS.DELETE(id));
  }

  async reorder(request: ReorderMenuItemsRequest): Promise<void> {
    await this.api.put(API_ENDPOINTS.MENUS.REORDER, request);
  }

  async setRoleVisibility(request: SetRoleMenuVisibilityRequest): Promise<void> {
    await this.api.put(API_ENDPOINTS.MENUS.ROLE_VISIBILITY, request);
  }

  async saveOverride(request: SaveMenuOverrideRequest): Promise<{ id: string }> {
    return await this.api.post<{ id: string }>(API_ENDPOINTS.MENUS.OVERRIDES, request);
  }

  async deleteOverride(id: string): Promise<void> {
    await this.api.delete(API_ENDPOINTS.MENUS.DELETE_OVERRIDE(id));
  }
}
