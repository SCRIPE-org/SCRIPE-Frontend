/**
 * Menu Item Entity
 *
 * Represents a menu item in the navigation system.
 */
import type { BaseEntity } from "@modules/system/core/domain/types";

/**
 * Menu item data from API
 */
export interface MenuItemData extends BaseEntity {
      name: string;
      title: string;
      path?: string;
      icon?: string;
      parentId?: string;
      order: number;
      tenantId?: string;
      requiredPermission?: string;
      isVisible: boolean;
      isExternal: boolean;
      externalUrl?: string;
      children?: MenuItemData[];
}

/**
 * Menu item entity class
 */
export class MenuItem {
      constructor(public readonly data: MenuItemData) { }

      get id(): string {
            return this.data.id;
      }

      get name(): string {
            return this.data.name;
      }

      get title(): string {
            return this.data.title;
      }

      get path(): string | undefined {
            return this.data.path;
      }

      get icon(): string | undefined {
            return this.data.icon;
      }

      get parentId(): string | undefined {
            return this.data.parentId;
      }

      get order(): number {
            return this.data.order;
      }

      get tenantId(): string | undefined {
            return this.data.tenantId;
      }

      get requiredPermission(): string | undefined {
            return this.data.requiredPermission;
      }

      get isVisible(): boolean {
            return this.data.isVisible;
      }

      get isExternal(): boolean {
            return this.data.isExternal;
      }

      get externalUrl(): string | undefined {
            return this.data.externalUrl;
      }

      get hasChildren(): boolean {
            return (this.data.children?.length ?? 0) > 0;
      }

      get children(): MenuItem[] {
            return (this.data.children ?? []).map((c) => new MenuItem(c));
      }

      /**
       * Get the effective URL (path or external URL)
       */
      get url(): string | undefined {
            return this.data.isExternal ? this.data.externalUrl : this.data.path;
      }

      /**
       * Check if this is a root menu item
       */
      get isRoot(): boolean {
            return !this.data.parentId;
      }
}

/**
 * Menu tree node for hierarchical display
 */
export interface MenuTreeNode {
      id: string;
      name: string;
      title: string;
      path?: string;
      icon?: string;
      order: number;
      isVisible: boolean;
      isExternal: boolean;
      requiredPermission?: string;
      parentId?: string;
      children: MenuTreeNode[];
}
