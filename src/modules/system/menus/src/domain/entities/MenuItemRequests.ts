/**
 * Menu Item Requests
 *
 * DTOs for menu API operations. Matches backend request models.
 */

/**
 * Create menu item request (matches backend CreateMenuItemRequest)
 */
export interface CreateMenuItemRequest {
      slug: string;
      nameEn: string;
      nameAr: string;
      href?: string;
      icon?: string;
      parentMenuItemId?: string;
      order?: number;
      resource?: string;
}

/**
 * Update menu item request (matches backend UpdateMenuItemRequest)
 */
export interface UpdateMenuItemRequest {
      slug: string;
      nameEn: string;
      nameAr: string;
      href?: string;
      icon?: string;
      parentMenuItemId?: string;
      order?: number;
      resource?: string;
}

/**
 * Reorder menu items request (matches backend ReorderMenuItemsRequest)
 */
export interface ReorderMenuItemsRequest {
      items: ReorderItemDto[];
}

export interface ReorderItemDto {
      id: string;
      order: number;
      parentMenuItemId?: string;
}

/**
 * Set role menu visibility request (matches backend SetRoleMenuVisibilityRequest)
 */
export interface SetRoleMenuVisibilityRequest {
      roleId: string;
      menuItemId: string;
      isVisible: boolean;
}
