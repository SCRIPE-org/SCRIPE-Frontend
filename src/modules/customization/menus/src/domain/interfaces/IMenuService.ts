/**
 * Menu Service Interface
 *
 * Defines the HTTP contract for menu operations.
 * Repository delegates to this instead of using IApiService directly.
 *
 * @module menus/domain
 */
import type { MenuTreeNode } from "../entities/MenuItem";
import type {
  CreateMenuItemRequest,
  UpdateMenuItemRequest,
  ReorderMenuItemsRequest,
  SetRoleMenuVisibilityRequest,
  SaveMenuOverrideRequest,
} from "../entities/MenuItemRequests";

/**
 * Interface defining operations for the Menu network service.
 */
export interface IMenuService {
  getAll(): Promise<MenuTreeNode[]>;
  create(request: CreateMenuItemRequest): Promise<{ id: string }>;
  update(id: string, request: UpdateMenuItemRequest): Promise<void>;
  delete(id: string): Promise<void>;
  reorder(request: ReorderMenuItemsRequest): Promise<void>;
  setRoleVisibility(request: SetRoleMenuVisibilityRequest): Promise<void>;
  saveOverride(request: SaveMenuOverrideRequest): Promise<{ id: string }>;
  deleteOverride(id: string): Promise<void>;
}
