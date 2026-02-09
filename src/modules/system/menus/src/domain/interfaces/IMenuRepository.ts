/**
 * Menu Repository Interface
 *
 * Defines the contract for menu data operations.
 */
import type { MenuItem, MenuTreeNode } from "../entities/MenuItem";
import type {
      CreateMenuItemRequest,
      UpdateMenuItemRequest,
      ReorderMenuItemsRequest,
      SetRoleMenuVisibilityRequest,
} from "../entities/MenuItemRequests";

/**
 * Menu repository interface
 */
export interface IMenuRepository {
      /**
       * Get the full menu tree (admin view — all items)
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

      /**
       * Reorder menu items (drag-drop bulk update)
       */
      reorder(request: ReorderMenuItemsRequest): Promise<void>;

      /**
       * Set role-level menu item visibility
       */
      setRoleVisibility(request: SetRoleMenuVisibilityRequest): Promise<void>;
}
