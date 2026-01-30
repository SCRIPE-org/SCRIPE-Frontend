/**
 * Navigation Mappers
 * 
 * Handles conversion between navigation domain models and external data formats.
 * Follows Single Responsibility Principle by separating serialization concerns
 * from domain logic.
 */

import {
  MenuItem,
  NavigationData,
  MenuItemsResponse,
  type MenuItemData,
  type NavigationDataData,
  type MenuItemsResponseData
} from '@core/domain/entities/Navigation';

export class NavigationMapper {
  /**
   * Convert JSON/API response to MenuItem domain model
   */
  static menuItemFromJson(json: any): MenuItem {
    return new MenuItem({
      id: json.id || '',
      name: json.name || '',
      href: json.href || null,
      icon: json.icon || '',
      order: json.order || 0,
      parentMenuItem: json.parentMenuItem || null,
      children: json.children ? json.children.map((child: any) => this.menuItemFromJson(child)) : [],
      requiredPermission: json.requiredPermission || null,
      isDeleted: json.isDeleted || false,
      isActive: json.isActive || false,
      notes: json.notes || null,
      createdTimestamp: json.createdTimestamp || '',
      updatedTimestamp: json.updatedTimestamp || null,
      deletedTimestamp: json.deletedTimestamp || null,
    });
  }

  /**
   * Convert MenuItem domain model to JSON for API requests
   */
  static menuItemToJson(menuItem: MenuItem): any {
    return {
      id: menuItem.id,
      name: menuItem.name,
      href: menuItem.href,
      icon: menuItem.icon,
      order: menuItem.order,
      parentMenuItem: menuItem.parentMenuItem,
      children: menuItem.children.map(child => this.menuItemToJson(child)),
      requiredPermission: menuItem.requiredPermission,
      isDeleted: menuItem.isDeleted,
      isActive: menuItem.isActive,
      notes: menuItem.notes,
      createdTimestamp: menuItem.createdTimestamp,
      updatedTimestamp: menuItem.updatedTimestamp,
      deletedTimestamp: menuItem.deletedTimestamp,
    };
  }

  /**
   * Convert MenuItem domain model to plain object
   */
  static menuItemToPlainObject(menuItem: MenuItem): MenuItemData {
    return {
      id: menuItem.id,
      name: menuItem.name,
      href: menuItem.href,
      icon: menuItem.icon,
      order: menuItem.order,
      parentMenuItem: menuItem.parentMenuItem,
      children: menuItem.children.map(child => this.menuItemToPlainObject(child)),
      requiredPermission: menuItem.requiredPermission,
      isDeleted: menuItem.isDeleted,
      isActive: menuItem.isActive,
      notes: menuItem.notes,
      createdTimestamp: menuItem.createdTimestamp,
      updatedTimestamp: menuItem.updatedTimestamp,
      deletedTimestamp: menuItem.deletedTimestamp,
    };
  }

  /**
   * Convert plain object to MenuItem domain model
   */
  static menuItemFromPlainObject(data: MenuItemData): MenuItem {
    return new MenuItem(data);
  }

  /**
   * Convert JSON/API response to NavigationData domain model
   */
  static navigationDataFromJson(json: any): NavigationData {
    return new NavigationData({
      menuItems: json.menuItems ? json.menuItems.map((item: any) => this.menuItemFromJson(item)) : [],
      allowedPages: json.allowedPages || json.pages || [],
    });
  }

  /**
   * Convert NavigationData domain model to JSON
   */
  static navigationDataToJson(navigationData: NavigationData): any {
    return {
      menuItems: navigationData.menuItems.map(item => this.menuItemToJson(item)),
      allowedPages: navigationData.allowedPages,
    };
  }

  /**
   * Convert NavigationData domain model to plain object
   */
  static navigationDataToPlainObject(navigationData: NavigationData): NavigationDataData {
    return {
      menuItems: navigationData.menuItems.map(item => this.menuItemToPlainObject(item)),
      allowedPages: navigationData.allowedPages,
    };
  }

  /**
   * Convert plain object to NavigationData domain model
   */
  static navigationDataFromPlainObject(data: NavigationDataData): NavigationData {
    return new NavigationData(data);
  }

  /**
   * Convert JSON/API response to MenuItemsResponse domain model
   */
  static menuItemsResponseFromJson(json: any): MenuItemsResponse {
    return new MenuItemsResponse({
      statusCode: json.statusCode || 200,
      message: json.message || '',
      data: {
        menuItems: json.data?.menuItems ? json.data.menuItems.map((item: any) => this.menuItemFromJson(item)) : [],
        pages: json.data?.pages || [],
      },
      errors: json.errors || null,
      pagination: json.pagination || null,
    });
  }

  /**
   * Convert MenuItemsResponse domain model to JSON
   */
  static menuItemsResponseToJson(response: MenuItemsResponse): any {
    return {
      statusCode: response.statusCode,
      message: response.message,
      data: {
        menuItems: response.data.menuItems.map(item => this.menuItemToJson(item)),
        pages: response.data.pages,
      },
      errors: response.errors,
      pagination: response.pagination,
    };
  }

  /**
   * Convert array of JSON objects to MenuItem array
   */
  static menuItemArrayFromJson(jsonArray: any[]): MenuItem[] {
    return jsonArray.map(json => this.menuItemFromJson(json));
  }

  /**
   * Convert MenuItem array to JSON array
   */
  static menuItemArrayToJson(menuItems: MenuItem[]): any[] {
    return menuItems.map(item => this.menuItemToJson(item));
  }

  /**
   * Handle different API response formats
   */
  static handleApiResponse(response: any): NavigationData {
    // Handle different possible response structures
    if (response && (response.statusCode === 200 || !response.statusCode)) {
      let menuItems: any[] = [];
      let allowedPages: string[] = [];

      // Check if response has data property
      if (response.data) {
        menuItems = response.data.menuItems || [];
        allowedPages = response.data.pages || [];
      } else if (Array.isArray(response)) {
        // Direct array response
        menuItems = response;
        allowedPages = response.map((item: any) => item.href).filter((href: any): href is string => href !== null);
      } else if (response.menuItems) {
        // Direct menuItems property
        menuItems = response.menuItems;
        allowedPages = response.pages || [];
      }

      return this.navigationDataFromJson({
        menuItems,
        allowedPages
      });
    }

    throw new Error(response?.message || 'Failed to fetch menu items');
  }
}
