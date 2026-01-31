/**
 * Menu Repository Implementation
 *
 * Implements IMenuRepository using the API service.
 */
import type { IApiService } from "@core/interfaces/api.interface";
import { API_ENDPOINTS } from "@core/config/api-endpoints";
import type { IMenuRepository } from "../../domain/interfaces/IMenuRepository";
import { MenuItem, MenuItemData, MenuTreeNode } from "../../domain/entities/MenuItem";
import type {
      CreateMenuItemRequest,
      UpdateMenuItemRequest,
} from "../../domain/entities/MenuItemRequests";

export class MenuRepository implements IMenuRepository {
      constructor(private readonly api: IApiService) { }

      async getAll(): Promise<MenuTreeNode[]> {
            // Use the admin menu endpoint which returns all menu items
            return await this.api.get<MenuTreeNode[]>(API_ENDPOINTS.MENUS.MY);
      }

      async getById(id: string): Promise<MenuItem> {
            // For individual menu item, we'd need a specific endpoint
            // For now, we can fetch all and find
            const all = await this.getAll();
            const found = this.findInTree(all, id);
            if (!found) {
                  throw new Error(`Menu item not found: ${id}`);
            }
            return new MenuItem(found as MenuItemData);
      }

      async create(request: CreateMenuItemRequest): Promise<string> {
            const response = await this.api.post<{ id: string }>(
                  API_ENDPOINTS.MENUS.CREATE,
                  request
            );
            return response.id;
      }

      async update(id: string, request: UpdateMenuItemRequest): Promise<void> {
            await this.api.put(API_ENDPOINTS.MENUS.UPDATE(id), request);
      }

      async delete(id: string): Promise<void> {
            await this.api.delete(API_ENDPOINTS.MENUS.DELETE(id));
      }

      private findInTree(
            nodes: MenuTreeNode[],
            id: string
      ): MenuTreeNode | undefined {
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
