/**
 * Navigation Domain Models
 * 
 * Contains all navigation-related domain models including
 * menu items, navigation data, and related structures.
 * 
 * @version 2.0 - Refactored for new backend contract with granular actions.
 */

// ============================================================================
// ACTION TYPES (Page-Level Permissions)
// ============================================================================

/**
 * Granular permissions for a specific page/resource.
 * Used to control UI visibility (e.g., hide Create button if canCreate is false).
 */
export interface MenuItemActions {
  canView: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
}

// ============================================================================
// MENU ITEM
// ============================================================================

export interface MenuItemData {
  id: string;
  slug: string;
  name: string;
  href: string | null;
  icon: string;
  order: number;
  resource: string | null;
  actions: MenuItemActions | null;
  children: MenuItemData[];
}

export class MenuItem {
  public readonly id: string;
  public readonly slug: string;
  public readonly name: string;
  public readonly href: string | null;
  public readonly icon: string;
  public readonly order: number;
  public readonly resource: string | null;
  public readonly actions: MenuItemActions | null;
  public readonly children: MenuItem[];

  constructor(data: MenuItemData) {
    this.id = data.id;
    this.slug = data.slug;
    this.name = data.name;
    this.href = data.href;
    this.icon = data.icon;
    this.order = data.order;
    this.resource = data.resource;
    this.actions = data.actions;
    this.children = data.children.map(child => new MenuItem(child));
  }

  /**
   * Get display name for the menu item
   */
  get displayName(): string {
    return this.name || 'Unnamed Item';
  }

  /**
   * Check if this is a parent menu item (has children)
   */
  get isParent(): boolean {
    return this.children.length > 0;
  }

  /**
   * Check if user can view this menu item
   */
  get canView(): boolean {
    return this.actions?.canView ?? true;
  }

  /**
   * Check if user can create in this page
   */
  get canCreate(): boolean {
    return this.actions?.canCreate ?? false;
  }

  /**
   * Check if user can update in this page
   */
  get canUpdate(): boolean {
    return this.actions?.canUpdate ?? false;
  }

  /**
   * Check if user can delete in this page
   */
  get canDelete(): boolean {
    return this.actions?.canDelete ?? false;
  }
}

// ============================================================================
// NAVIGATION DATA (Full Response)
// ============================================================================

export interface NavigationDataData {
  menuItems: MenuItemData[];
  routes: string[];
}

export class NavigationData {
  public readonly menuItems: MenuItem[];
  public readonly routes: string[];

  constructor(data: NavigationDataData) {
    this.menuItems = data.menuItems.map(item => new MenuItem(item));
    this.routes = data.routes;
  }

  /**
   * Get root level menu items
   */
  get rootMenuItems(): MenuItem[] {
    return this.menuItems;
  }

  /**
   * Check if user has access to a specific page
   */
  hasPageAccess(pathname: string): boolean {
    const cleanPath = pathname.split('?')[0].replace(/\/$/, '') || '/';

    // Allow access to root dashboard
    if (cleanPath === '' || cleanPath === '/') {
      return true;
    }

    // Check for exact match first
    if (this.routes.includes(cleanPath)) {
      return true;
    }

    // Check for case-insensitive match
    const lowerCleanPath = cleanPath.toLowerCase();
    if (this.routes.some(page => page.toLowerCase() === lowerCleanPath)) {
      return true;
    }

    // Check for hierarchical access (parent route grants child access)
    const pathSegments = cleanPath.split('/').filter(segment => segment !== '');

    for (let i = pathSegments.length - 1; i > 0; i--) {
      const parentPath = '/' + pathSegments.slice(0, i).join('/');
      if (this.routes.includes(parentPath)) {
        return true;
      }

      const lowerParentPath = parentPath.toLowerCase();
      if (this.routes.some(page => page.toLowerCase() === lowerParentPath)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Find menu item by href (recursive)
   */
  findMenuItemByHref(href: string): MenuItem | null {
    const search = (items: MenuItem[]): MenuItem | null => {
      for (const item of items) {
        if (item.href === href) return item;
        const found = search(item.children);
        if (found) return found;
      }
      return null;
    };
    return search(this.menuItems);
  }

  /**
   * Get actions for a specific page
   */
  getPageActions(pathname: string): MenuItemActions | null {
    const cleanPath = pathname.split('?')[0].replace(/\/$/, '') || '/';
    const item = this.findMenuItemByHref(cleanPath);
    return item?.actions ?? null;
  }
}

// ============================================================================
// API RESPONSE WRAPPER
// ============================================================================

export interface MenuItemsResponseData {
  statusCode: number;
  message: string;
  data: {
    menuItems: MenuItemData[];
    routes: string[];
  };
  errors: any;
}

export class MenuItemsResponse {
  public readonly statusCode: number;
  public readonly message: string;
  public readonly data: {
    menuItems: MenuItem[];
    routes: string[];
  };
  public readonly errors: any;

  constructor(data: MenuItemsResponseData) {
    this.statusCode = data.statusCode;
    this.message = data.message;
    this.data = {
      menuItems: data.data.menuItems.map(item => new MenuItem(item)),
      routes: data.data.routes
    };
    this.errors = data.errors;
  }

  /**
   * Check if response is successful
   */
  get isSuccessful(): boolean {
    return this.statusCode === 200;
  }

  /**
   * Convert to NavigationData
   */
  toNavigationData(): NavigationData {
    return new NavigationData({
      menuItems: this.data.menuItems.map(item => this.mapMenuItemToData(item)),
      routes: this.data.routes
    });
  }

  private mapMenuItemToData(item: MenuItem): MenuItemData {
    return {
      id: item.id,
      slug: item.slug,
      name: item.name,
      href: item.href,
      icon: item.icon,
      order: item.order,
      resource: item.resource,
      actions: item.actions,
      children: item.children.map(child => this.mapMenuItemToData(child)),
    };
  }
}
