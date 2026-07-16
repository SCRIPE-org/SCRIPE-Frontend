/**
 * Menu API Data Models
 *
 * Defines the DTO types for menu-related API payloads.
 */

export interface MenuItemModel {
  id: string;
  title: string;
  path?: string;
  icon?: string;
  parentId?: string;
  displayOrder: number;
  permission?: string;
  children?: MenuItemModel[];
}
