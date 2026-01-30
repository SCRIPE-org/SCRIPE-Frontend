/**
 * Navigation Domain Models
 * 
 * Contains all navigation-related domain models including
 * menu items, navigation data, and related structures.
 */

export interface MenuItemData {
  id: string;
  name: string;
  href: string | null;
  icon: string;
  order: number;
  parentMenuItem: {
    id: string;
    name: string;
  } | null;
  children: MenuItemData[];
  requiredPermission: string | null;
  isDeleted: boolean;
  isActive: boolean;
  notes: string | null;
  createdTimestamp: string;
  updatedTimestamp: string | null;
  deletedTimestamp: string | null;
}

export interface NavigationDataData {
  menuItems: MenuItemData[];
  allowedPages: string[];
}

export interface MenuItemsResponseData {
  statusCode: number;
  message: string;
  data: {
    menuItems: MenuItemData[];
    pages: string[];
  };
  errors: any;
  pagination: any;
}

export class MenuItem {
  public readonly id: string;
  public readonly name: string;
  public readonly href: string | null;
  public readonly icon: string;
  public readonly order: number;
  public readonly parentMenuItem: { id: string; name: string } | null;
  public readonly children: MenuItem[];
  public readonly requiredPermission: string | null;
  public readonly isDeleted: boolean;
  public readonly isActive: boolean;
  public readonly notes: string | null;
  public readonly createdTimestamp: string;
  public readonly updatedTimestamp: string | null;
  public readonly deletedTimestamp: string | null;

  constructor(data: MenuItemData) {
    this.id = data.id;
    this.name = data.name;
    this.href = data.href;
    this.icon = data.icon;
    this.order = data.order;
    this.parentMenuItem = data.parentMenuItem;
    this.children = data.children.map(child => new MenuItem(child));
    this.requiredPermission = data.requiredPermission;
    this.isDeleted = data.isDeleted;
    this.isActive = data.isActive;
    this.notes = data.notes;
    this.createdTimestamp = data.createdTimestamp;
    this.updatedTimestamp = data.updatedTimestamp;
    this.deletedTimestamp = data.deletedTimestamp;
  }

  /**
   * Check if menu item is accessible
   */
  get isAccessible(): boolean {
    return this.isActive && !this.isDeleted;
  }

  /**
   * Get display name for the menu item
   */
  get displayName(): string {
    return this.name || 'Unnamed Item';
  }

  /**
   * Check if this is a parent menu item
   */
  get isParent(): boolean {
    return this.children.length > 0;
  }

  /**
   * Get active children only
   */
  get activeChildren(): MenuItem[] {
    return this.children.filter(child => child.isAccessible);
  }
}

export class NavigationData {
  public readonly menuItems: MenuItem[];
  public readonly allowedPages: string[];

  constructor(data: NavigationDataData) {
    this.menuItems = data.menuItems.map(item => new MenuItem(item));
    this.allowedPages = data.allowedPages;
  }

  /**
   * Get all accessible menu items
   */
  get accessibleMenuItems(): MenuItem[] {
    return this.menuItems.filter(item => item.isAccessible);
  }

  /**
   * Get root level menu items (no parent)
   */
  get rootMenuItems(): MenuItem[] {
    return this.accessibleMenuItems.filter(item => !item.parentMenuItem);
  }

  /**
   * Check if user has access to a specific page
   */
  hasPageAccess(pathname: string): boolean {
    // Remove query parameters and trailing slashes for comparison
    const cleanPath = pathname.split('?')[0].replace(/\/$/, '') || '/';
    
    // Allow access to root dashboard
    if (cleanPath === '' || cleanPath === '/') {
      return true;
    }

    // Check for exact match first
    if (this.allowedPages.includes(cleanPath)) {
      return true;
    }

    // Check for case-insensitive match
    const lowerCleanPath = cleanPath.toLowerCase();
    if (this.allowedPages.some(page => page.toLowerCase() === lowerCleanPath)) {
      return true;
    }

    // Check for hierarchical access
    const pathSegments = cleanPath.split('/').filter(segment => segment !== '');
    
    for (let i = pathSegments.length - 1; i > 0; i--) {
      const parentPath = '/' + pathSegments.slice(0, i).join('/');
      if (this.allowedPages.includes(parentPath)) {
        return true;
      }
      
      const lowerParentPath = parentPath.toLowerCase();
      if (this.allowedPages.some(page => page.toLowerCase() === lowerParentPath)) {
        return true;
      }
    }

    return false;
  }
}

export class MenuItemsResponse {
  public readonly statusCode: number;
  public readonly message: string;
  public readonly data: {
    menuItems: MenuItem[];
    pages: string[];
  };
  public readonly errors: any;
  public readonly pagination: any;

  constructor(data: MenuItemsResponseData) {
    this.statusCode = data.statusCode;
    this.message = data.message;
    this.data = {
      menuItems: data.data.menuItems.map(item => new MenuItem(item)),
      pages: data.data.pages
    };
    this.errors = data.errors;
    this.pagination = data.pagination;
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
      menuItems: this.data.menuItems.map(item => ({
        id: item.id,
        name: item.name,
        href: item.href,
        icon: item.icon,
        order: item.order,
        parentMenuItem: item.parentMenuItem,
        children: item.children.map(child => ({
          id: child.id,
          name: child.name,
          href: child.href,
          icon: child.icon,
          order: child.order,
          parentMenuItem: child.parentMenuItem,
          children: [],
          requiredPermission: child.requiredPermission,
          isDeleted: child.isDeleted,
          isActive: child.isActive,
          notes: child.notes,
          createdTimestamp: child.createdTimestamp,
          updatedTimestamp: child.updatedTimestamp,
          deletedTimestamp: child.deletedTimestamp,
        })),
        requiredPermission: item.requiredPermission,
        isDeleted: item.isDeleted,
        isActive: item.isActive,
        notes: item.notes,
        createdTimestamp: item.createdTimestamp,
        updatedTimestamp: item.updatedTimestamp,
        deletedTimestamp: item.deletedTimestamp,
      })),
      allowedPages: this.data.pages
    });
  }
}
