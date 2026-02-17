/**
 * Menu Repository Implementation
 *
 * Implements IMenuRepository using the API service.
 */
import type { IApiService } from "@core/interfaces/api.interface";
import { API_ENDPOINTS } from "@core/config/api-endpoints";
import type { IMenuRepository } from "../../domain/interfaces/IMenuRepository";
import { MenuItem, type MenuItemData, type MenuTreeNode } from "../../domain/entities/MenuItem";
import type {
  CreateMenuItemRequest,
  UpdateMenuItemRequest,
  ReorderMenuItemsRequest,
  SetRoleMenuVisibilityRequest,
  SaveMenuOverrideRequest,
} from "../../domain/entities/MenuItemRequests";

export class MenuRepository implements IMenuRepository {
  constructor(private readonly api: IApiService) { }

  async getAll(): Promise<MenuTreeNode[]> {
    return await this.api.get<MenuTreeNode[]>(API_ENDPOINTS.MENUS.LIST);
  }

  async getById(id: string): Promise<MenuItem> {
    const all = await this.getAll();
    const found = this.findInTree(all, id);
    if (!found) {
      throw new Error(`Menu item not found: ${id}`);
    }
    return new MenuItem(found as MenuItemData);
  }

  async create(request: CreateMenuItemRequest): Promise<string> {
    const response = await this.api.post<{ id: string }>(API_ENDPOINTS.MENUS.CREATE, request);
    return response.id;
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

  async saveOverride(request: SaveMenuOverrideRequest): Promise<string> {
    const response = await this.api.post<{ id: string }>(API_ENDPOINTS.MENUS.OVERRIDES, request);
    // Clear navigation cache so sidebar picks up new overrides
    this.invalidateNavigationCache();
    return response.id;
  }

  async deleteOverride(id: string): Promise<void> {
    await this.api.delete(API_ENDPOINTS.MENUS.DELETE_OVERRIDE(id));
    // Clear navigation cache so sidebar picks up removed overrides
    this.invalidateNavigationCache();
  }

  /**
   * Clear navigation localStorage cache so the sidebar re-fetches fresh data.
   * This runs at the data layer (not presentation) per architecture rules.
   */
  private invalidateNavigationCache(): void {
    try {
      localStorage.removeItem("navigation_data");
      localStorage.removeItem("navigation_data_expiry");
    } catch { /* SSR safety */ }
  }

  private findInTree(nodes: MenuTreeNode[], id: string): MenuTreeNode | undefined {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children?.length) {
        const found = this.findInTree(node.children, id);
        if (found) return found;
      }
    }
    return undefined;
  }
}
