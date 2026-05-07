/**
 * Navigation Mappers
 *
 * Handles conversion between navigation domain models and external data formats.
 *
 * @version 2.0 - Updated for new API contract with actions.
 */

import {
  MenuItem,
  NavigationData,
  MenuItemsResponse,
  type MenuItemData,
  type NavigationDataData,
} from "@core/domain/entities/Navigation";

export class NavigationMapper {
  /**
   * Convert JSON/API response to MenuItem domain model
   */
  static menuItemFromJson(json: any): MenuItem {
    return new MenuItem({
      id: json.id || "",
      slug: json.slug || "",
      name: json.name || "",
      nameEn: json.nameEn || json.name || "",
      nameAr: json.nameAr || "",
      href: json.href || null,
      icon: json.icon || "",
      order: json.order || 0,
      resource: json.resource || null,
      actions: json.actions
        ? {
            canView: json.actions.canView ?? true,
            canCreate: json.actions.canCreate ?? false,
            canUpdate: json.actions.canUpdate ?? false,
            canDelete: json.actions.canDelete ?? false,
          }
        : null,
      children: json.children
        ? json.children.map((child: any) => this.menuItemFromJson(child))
        : [],
    });
  }

  /**
   * Convert MenuItem domain model to JSON for API requests
   */
  static menuItemToJson(menuItem: MenuItem): any {
    return {
      id: menuItem.id,
      slug: menuItem.slug,
      name: menuItem.name,
      nameEn: menuItem.nameEn,
      nameAr: menuItem.nameAr,
      href: menuItem.href,
      icon: menuItem.icon,
      order: menuItem.order,
      resource: menuItem.resource,
      actions: menuItem.actions,
      children: menuItem.children.map((child) => this.menuItemToJson(child)),
    };
  }

  /**
   * Convert MenuItem domain model to plain object
   */
  static menuItemToPlainObject(menuItem: MenuItem): MenuItemData {
    return {
      id: menuItem.id,
      slug: menuItem.slug,
      name: menuItem.name,
      nameEn: menuItem.nameEn,
      nameAr: menuItem.nameAr,
      href: menuItem.href,
      icon: menuItem.icon,
      order: menuItem.order,
      resource: menuItem.resource,
      actions: menuItem.actions,
      children: menuItem.children.map((child) => this.menuItemToPlainObject(child)),
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
      menuItems: json.menuItems
        ? json.menuItems.map((item: any) => this.menuItemFromJson(item))
        : [],
      routes: json.routes || json.allowedPages || json.pages || [],
      // Nexus: preserve workspace groups if present
      workspaceGroups: json.workspaceGroups
        ? json.workspaceGroups.map((g: any) => ({
            // New canonical format (backend sends workspace-prefixed names)
            workspaceId: g.workspaceId ?? g.id ?? "",
            workspaceKey: g.workspaceKey ?? g.key ?? "",
            workspaceNameEn: g.workspaceNameEn ?? g.nameEn ?? g.workspaceName ?? "",
            workspaceNameAr: g.workspaceNameAr ?? g.nameAr ?? g.workspaceNameEn ?? g.nameEn ?? "",
            workspaceIcon: g.workspaceIcon ?? g.icon ?? "LayoutDashboard",
            workspaceSortOrder: g.workspaceSortOrder ?? g.sortOrder ?? 0,
            colorHue: g.colorHue ?? null,
            colorChroma: g.colorChroma ?? null,
            workspaceType: g.workspaceType ?? "Admin",
            menuItems: g.menuItems
              ? g.menuItems.map((item: any) => this.menuItemFromJson(item))
              : [],
          }))
        : undefined,
    });
  }

  /**
   * Convert NavigationData domain model to JSON
   */
  static navigationDataToJson(navigationData: NavigationData): any {
    return {
      menuItems: navigationData.menuItems.map((item) => this.menuItemToJson(item)),
      routes: navigationData.routes,
    };
  }

  /**
   * Convert NavigationData domain model to plain object (used for localStorage caching).
   * Includes workspaceGroups so the Nexus dual-rail is fully hydrated from cache on reload.
   */
  static navigationDataToPlainObject(navigationData: NavigationData): any {
    const obj: any = {
      menuItems: navigationData.menuItems.map((item) => this.menuItemToPlainObject(item)),
      routes: navigationData.routes,
    };
    // Serialize workspaceGroups for dual-rail cache persistence
    if (navigationData.workspaceGroups && navigationData.workspaceGroups.length > 0) {
      obj.workspaceGroups = navigationData.workspaceGroups.map((ws) => ({
        workspaceId: ws.workspaceId,
        workspaceKey: ws.workspaceKey,
        workspaceNameEn: ws.workspaceNameEn,
        workspaceNameAr: ws.workspaceNameAr,
        workspaceIcon: ws.workspaceIcon,
        workspaceSortOrder: ws.workspaceSortOrder,
        colorHue: ws.colorHue,
        colorChroma: ws.colorChroma,
        workspaceType: ws.workspaceType,
        menuItems: ws.menuItems.map((item) => this.menuItemToPlainObject(item)),
      }));
    }
    return obj;
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
      message: json.message || "",
      data: {
        menuItems: json.data?.menuItems
          ? json.data.menuItems.map((item: any) => this.menuItemFromJson(item))
          : [],
        routes: json.data?.routes || json.data?.pages || [],
      },
      errors: json.errors || null,
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
        menuItems: response.data.menuItems.map((item) => this.menuItemToJson(item)),
        routes: response.data.routes,
      },
      errors: response.errors,
    };
  }

  /**
   * Convert array of JSON objects to MenuItem array
   */
  static menuItemArrayFromJson(jsonArray: any[]): MenuItem[] {
    return jsonArray.map((json) => this.menuItemFromJson(json));
  }

  /**
   * Convert MenuItem array to JSON array
   */
  static menuItemArrayToJson(menuItems: MenuItem[]): any[] {
    return menuItems.map((item) => this.menuItemToJson(item));
  }

  /**
   * Handle different API response formats.
   * Supports both the legacy flat response (menuItems/routes) and
   * the Nexus dual-rail grouped response (workspaceGroups).
   */
  static handleApiResponse(response: any): NavigationData {
    // Handle different possible response structures
    if (response && (response.statusCode === 200 || !response.statusCode)) {
      let menuItems: any[] = [];
      let routes: string[] = [];
      let workspaceGroups: any[] | undefined;

      // Check if response has data property (standard NEXORA envelope)
      if (response.data) {
        menuItems = response.data.menuItems || [];
        routes = response.data.routes || response.data.pages || [];
        // Nexus: workspace groups
        workspaceGroups = response.data.workspaceGroups;
      } else if (Array.isArray(response)) {
        // Direct array response (legacy)
        menuItems = response;
        routes = response
          .map((item: any) => item.href)
          .filter((href: any): href is string => href !== null);
      } else if (response.menuItems) {
        // Direct menuItems property (legacy)
        menuItems = response.menuItems;
        routes = response.routes || response.pages || [];
        workspaceGroups = response.workspaceGroups;
      }

      return this.navigationDataFromJson({
        menuItems,
        routes,
        workspaceGroups,
      });
    }

    throw new Error(response?.message || "Failed to fetch menu items");
  }
}
