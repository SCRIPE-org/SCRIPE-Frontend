/**
 * Menu Repository Interface
 *
 * Defines the contract for menu data operations.
 */
import type { MenuItem, MenuTreeNode } from "../entities/MenuItem";
import type {
      CreateMenuItemRequest,
      UpdateMenuItemRequest,
} from "../entities/MenuItemRequests";

/**
 * Menu repository interface
 */
export interface IMenuRepository {
      /**
       * Get the full menu tree
       */
      getAll(): Promise<MenuTreeNode[]>;

      /**
       * Get menu item by ID
       */
      getById(id: string): Promise<MenuItem>;

      /**
       * Create a new menu item
       */
      create(request: CreateMenuItemRequest): Promise<string>;

      /**
       * Update an existing menu item
       */
      update(id: string, request: UpdateMenuItemRequest): Promise<void>;

      /**
       * Delete a menu item
       */
      delete(id: string): Promise<void>;
}
