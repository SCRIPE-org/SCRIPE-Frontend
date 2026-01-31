/**
 * Menu Item Requests
 *
 * DTOs for menu API operations.
 */

/**
 * Create menu item request
 */
export interface CreateMenuItemRequest {
      name: string;
      title: string;
      path?: string;
      icon?: string;
      parentId?: string;
      order?: number;
      requiredPermission?: string;
      isVisible?: boolean;
      isExternal?: boolean;
      externalUrl?: string;
}

/**
 * Update menu item request
 */
export interface UpdateMenuItemRequest {
      name?: string;
      title?: string;
      path?: string;
      icon?: string;
      parentId?: string;
      order?: number;
      requiredPermission?: string;
      isVisible?: boolean;
      isExternal?: boolean;
      externalUrl?: string;
}

/**
 * Reorder menu items request
 */
export interface ReorderMenuItemsRequest {
      items: { id: string; order: number; parentId?: string }[];
}
