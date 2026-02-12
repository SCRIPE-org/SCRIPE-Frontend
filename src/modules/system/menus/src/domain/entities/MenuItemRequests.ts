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
      tenantScopeJson?: string;
      featureFlag?: string;
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
      order: number;
      parentMenuItemId?: string;
      resource?: string;
      tenantScopeJson?: string;
      featureFlag?: string;
      isActive: boolean;
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

/**
 * Menu override scope (matches backend MenuOverrideScope enum)
 * Simplified 2-scope model: User (personal) and Tenant (organization).
 */
export enum MenuOverrideScope {
      User = 'User',
      Tenant = 'Tenant',
}

/**
 * Save menu override request (matches backend SaveMenuOverrideRequest)
 */
export interface SaveMenuOverrideRequest {
      menuItemId: string;
      scope: MenuOverrideScope;
      nameEnOverride?: string;
      nameArOverride?: string;
      orderOverride?: number;
      parentMenuItemIdOverride?: string;
      isHidden: boolean;
}
