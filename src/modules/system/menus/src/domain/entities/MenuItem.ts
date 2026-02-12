/**
 * Menu Item Entity
 *
 * Represents a menu item in the navigation system.
 * Supports bilingual names (English/Arabic) matching backend.
 */
import type { BaseEntity } from "@modules/system/core/domain/types";

/**
 * Menu item data from API (matches backend MenuItemResponse)
 */
export interface MenuItemData extends BaseEntity {
      slug: string;
      nameEn: string;
      nameAr: string;
      href?: string;
      icon?: string;
      parentMenuItemId?: string;
      order: number;
      resource?: string;
      isActive: boolean;
      children?: MenuItemData[];
}

/**
 * Menu item entity class with bilingual support
 */
export class MenuItem {
      constructor(public readonly data: MenuItemData) { }

      get id(): string {
            return this.data.id;
      }

      get slug(): string {
            return this.data.slug;
      }

      get nameEn(): string {
            return this.data.nameEn;
      }

      get nameAr(): string {
            return this.data.nameAr;
      }

      /**
       * Get localized name based on current language
       */
      getLocalizedName(language: string): string {
            return language === "ar" ? this.data.nameAr : this.data.nameEn;
      }

      get href(): string | undefined {
            return this.data.href;
      }

      get icon(): string | undefined {
            return this.data.icon;
      }

      get parentMenuItemId(): string | undefined {
            return this.data.parentMenuItemId;
      }

      get order(): number {
            return this.data.order;
      }

      get resource(): string | undefined {
            return this.data.resource;
      }

      get isActive(): boolean {
            return this.data.isActive;
      }

      get hasChildren(): boolean {
            return (this.data.children?.length ?? 0) > 0;
      }

      get children(): MenuItem[] {
            return (this.data.children ?? []).map((c) => new MenuItem(c));
      }

      /**
       * Check if this is a root menu item
       */
      get isRoot(): boolean {
            return !this.data.parentMenuItemId;
      }

      /**
       * Check if this is a parent-only item (no href)
       */
      get isParentOnly(): boolean {
            return !this.data.href;
      }
}

/**
 * Menu tree node for hierarchical display (used in views)
 */
export interface MenuTreeNode {
      id: string;
      slug: string;
      nameEn: string;
      nameAr: string;
      href?: string;
      icon?: string;
      order: number;
      resource?: string;
      isActive: boolean;
      parentMenuItemId?: string;
      children: MenuTreeNode[];
      /** User-scope override for this item (null if none) */
      userOverride?: MenuItemOverrideInfo;
      /** Tenant-scope override for this item (null if none) */
      tenantOverride?: MenuItemOverrideInfo;
}

/**
 * Light override info attached to each menu item (admin view only).
 * Contains just enough data for the customize dialog and remove-override button.
 */
export interface MenuItemOverrideInfo {
      id: string;
      nameEnOverride?: string;
      nameArOverride?: string;
      isHidden: boolean;
}

