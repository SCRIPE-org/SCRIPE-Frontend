/**
 * @file menuOverrideTypes.ts
 * @description Type definitions, state models, and tree transformation utilities
 * for navigation menu item override operations.
 */

import type {
  MenuOverrideScope,
  SaveMenuOverrideRequest,
} from "../../domain/entities/MenuItemRequests";
import type { MenuTreeNode } from "../../domain/entities/MenuItem";

/**
 * State tracking configuration for the menu override dialog.
 */
export interface OverrideDialogState {
  /** Indicates whether the dialog is currently visible. */
  open: boolean;
  /** Active menu tree node under edit, or null when closed. */
  node: MenuTreeNode | null;
  /** Dialog operation mode ('customize' or 'hide'). */
  mode: "customize" | "hide" | null;
}

/**
 * Form payload representing user-specified customization values for a menu item.
 */
export interface OverrideFormData {
  /** Optional English localized title override. */
  nameEn?: string;
  /** Optional Arabic localized title override. */
  nameAr?: string;
  /** Optional numeric sorting sequence override. */
  orderOverride?: number;
  /** Optional parent menu item identifier for hierarchy repositioning. */
  parentMenuItemIdOverride?: string;
  /** Whether the item is explicitly hidden from navigation. */
  isHidden: boolean;
}

/**
 * Flat representation of a menu tree node used in hierarchical picker dropdowns.
 */
export interface FlattenedMenuItem {
  /** Menu item unique identifier. */
  id: string;
  /** English display title. */
  nameEn: string;
  /** Arabic display title. */
  nameAr: string;
  /** Hierarchical depth level for visual indentation. */
  depth: number;
}

/**
 * Contract defining the state, handlers, and mutation triggers returned by useMenuOverrideViewModel.
 */
export interface UseMenuOverrideViewModelResult {
  /** Current state of the customize or hide override dialog. */
  overrideDialog: OverrideDialogState;
  /** Opens the customize dialog for a specific menu item node. */
  openCustomizeDialog: (node: MenuTreeNode) => void;
  /** Dismisses the active override dialog and resets local selection. */
  closeOverrideDialog: () => void;

  /** Currently selected override scope (User or Tenant). */
  scope: MenuOverrideScope;
  /** Mutates the active override scope. */
  setScope: (scope: MenuOverrideScope) => void;
  /** Permitted override scopes based on user permissions. */
  availableScopes: MenuOverrideScope[];

  /** Submits an override modification covering names, ordering, hierarchy, or visibility. */
  saveOverride: (data: OverrideFormData) => void;
  /** Quick action to hide a menu item within user scope. */
  toggleHideItem: (node: MenuTreeNode) => void;
  /** Initiates deletion confirmation for an existing override record. */
  confirmDeleteOverride: (overrideId: string) => void;
  /** Confirms and dispatches the deletion request. */
  onDeleteOverrideConfirm: () => void;
  /** Dismisses the deletion confirmation modal. */
  closeDeleteOverrideDialog: () => void;
  /** Indicates whether the deletion confirmation dialog is open. */
  deleteConfirmOpen: boolean;
  /** Evaluates whether the operator is authorized to remove a scoped override. */
  canRemoveOverride: (override: { scope: string }) => boolean;
  /** Indicates whether an override save operation is pending. */
  isSaving: boolean;
  /** Indicates whether an override delete operation is pending. */
  isDeleting: boolean;

  /** Flattened list of menu items used for parent selection pickers. */
  flatMenuItems: FlattenedMenuItem[];
  /** Updates the local tree source used to compute flattened items. */
  setMenuTree: (tree: MenuTreeNode[]) => void;

  /** Legacy alias for openCustomizeDialog. */
  openRenameDialog: (node: MenuTreeNode) => void;
  /** Legacy alias for updating localized display names. */
  saveRename: (nameEn: string, nameAr: string) => void;
}

/**
 * Recursively traverses a hierarchical menu tree to produce a flattened list with depth indicators.
 *
 * @param nodes Root or nested collection of menu tree nodes.
 * @returns An ordered flat array suitable for select dropdowns.
 */
export function flattenMenuTree(nodes: MenuTreeNode[]): FlattenedMenuItem[] {
  const items: FlattenedMenuItem[] = [];
  const traverse = (currentNodes: MenuTreeNode[], depth: number) => {
    const sorted = [...currentNodes].sort((a, b) => a.order - b.order);
    for (const node of sorted) {
      items.push({ id: node.id, nameEn: node.nameEn, nameAr: node.nameAr, depth });
      if (node.children && node.children.length > 0) {
        traverse(node.children, depth + 1);
      }
    }
  };
  traverse(nodes, 0);
  return items;
}

/**
 * Builds a standardized SaveMenuOverrideRequest payload.
 *
 * @param menuItemId Target menu item identifier.
 * @param scope Target application scope (User or Tenant).
 * @param overrides Partial property overrides.
 * @returns Fully populated request object.
 */
export function buildMenuOverrideRequest(
  menuItemId: string,
  scope: MenuOverrideScope,
  overrides: Partial<SaveMenuOverrideRequest>
): SaveMenuOverrideRequest {
  return {
    menuItemId,
    scope,
    isHidden: false,
    ...overrides,
  };
}
