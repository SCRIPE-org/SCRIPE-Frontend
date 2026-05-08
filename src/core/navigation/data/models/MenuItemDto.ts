/**
 * MenuItemDto — Raw API DTO
 *
 * Exact shape the backend sends for a menu item.
 * Used ONLY in the data layer. Never cross into presentation.
 */
export interface MenuItemActionsDto {
  canView: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
}

export interface MenuItemDto {
  id: string;
  slug: string;
  /** Combined display name (backend may omit this and send nameEn/nameAr separately) */
  name?: string;
  nameEn: string;
  nameAr?: string;
  href: string | null;
  icon: string;
  order: number;
  resource?: string | null;
  actions?: MenuItemActionsDto | null;
  children?: MenuItemDto[];
}
