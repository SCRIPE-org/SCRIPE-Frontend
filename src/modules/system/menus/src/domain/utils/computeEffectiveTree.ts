/**
 * Compute Effective Tree
 *
 * Pure utility that takes the base MenuTreeNode[] and a scope,
 * then produces the **effective tree** with all overrides applied:
 *   - Apply nameEnOverride / nameArOverride → overwrite node names
 *   - Apply orderOverride → overwrite sort order
 *   - Apply parentMenuItemIdOverride → reparent node
 *   - Apply isHidden → remove from effective tree
 *   - Re-sort children by effective order
 */

import { appLogger } from "@/core/common/logger";
import type { MenuTreeNode, MenuItemOverrideInfo } from "../entities/MenuItem";
import { MenuOverrideScope } from "../entities/MenuItemRequests";

/**
 * Effective tree node: same shape as MenuTreeNode but with override-applied values.
 * We re-use the same type but with overridden fields.
 */
export interface EffectiveTreeNode {
  id: string;
  slug: string;
  nameEn: string; // override-applied
  nameAr: string; // override-applied
  originalNameEn: string; // original base name
  originalNameAr: string; // original base name
  href?: string;
  icon?: string;
  order: number; // override-applied
  originalOrder: number; // original base order
  resource?: string;
  isActive: boolean;
  parentMenuItemId?: string;
  children: EffectiveTreeNode[];
  hasOverride: boolean;
  isHidden: boolean;
}

/**
 * Compute the effective tree by applying all overrides for the given scope.
 *
 * Algorithm:
 * 1. Flatten the entire tree into a lookup map
 * 2. For each node, determine the effective values (apply overrides)
 * 3. Rebuild the tree using effective parentMenuItemId
 * 4. Filter out hidden nodes
 * 5. Sort children by effective order
 */
export function computeEffectiveTree(
  baseTree: MenuTreeNode[],
  scope: MenuOverrideScope
): EffectiveTreeNode[] {
  // 1. Flatten the entire tree into a flat list
  const flatNodes: FlatNode[] = [];
  flattenTree(baseTree, flatNodes, undefined);

  // 2. Apply overrides and determine effective values
  const effectiveFlat: EffectiveFlat[] = flatNodes.map((node) => {
    const override = getOverride(node, scope);
    const hasOverride = !!override;
    const isHidden = override?.isHidden ?? false;

    return {
      id: node.id,
      slug: node.slug,
      nameEn: override?.nameEnOverride || node.nameEn,
      nameAr: override?.nameArOverride || node.nameAr,
      originalNameEn: node.nameEn,
      originalNameAr: node.nameAr,
      href: node.href,
      icon: node.icon,
      order: override?.orderOverride ?? node.order,
      originalOrder: node.order,
      resource: node.resource,
      isActive: node.isActive,
      // If override has parentMenuItemIdOverride set (not null/undefined), use it:
      // - valid ID string → reparent to that item
      // - empty string '' → move to root (no parent)
      // null/undefined from JSON → keep original parent
      effectiveParentId:
        override?.parentMenuItemIdOverride != null
          ? override.parentMenuItemIdOverride || undefined // '' → undefined (root)
          : node.originalParentId,
      hasOverride,
      isHidden,
    };
  });

  // 3. Filter out hidden nodes
  const visible = effectiveFlat.filter((n) => !n.isHidden);

  // 4. Rebuild tree from flat list using effectiveParentId
  const nodeMap = new Map<string, EffectiveTreeNode>();
  const roots: EffectiveTreeNode[] = [];

  // Create tree nodes
  for (const n of visible) {
    nodeMap.set(n.id, {
      id: n.id,
      slug: n.slug,
      nameEn: n.nameEn,
      nameAr: n.nameAr,
      originalNameEn: n.originalNameEn,
      originalNameAr: n.originalNameAr,
      href: n.href,
      icon: n.icon,
      order: n.order,
      originalOrder: n.originalOrder,
      resource: n.resource,
      isActive: n.isActive,
      parentMenuItemId: n.effectiveParentId,
      children: [],
      hasOverride: n.hasOverride,
      isHidden: n.isHidden,
    });
  }

  // Assign children
  for (const n of visible) {
    const treeNode = nodeMap.get(n.id)!;
    if (n.effectiveParentId && nodeMap.has(n.effectiveParentId)) {
      nodeMap.get(n.effectiveParentId)!.children.push(treeNode);
    } else {
      roots.push(treeNode);
    }
  }

  // 5. Sort children recursively by effective order
  sortChildren(roots);

  return roots;
}

/* -------------------------------------------------------------------------- */
/*  Internal helpers                                                           */
/* -------------------------------------------------------------------------- */

interface FlatNode {
  id: string;
  slug: string;
  nameEn: string;
  nameAr: string;
  href?: string;
  icon?: string;
  order: number;
  resource?: string;
  isActive: boolean;
  originalParentId?: string;
  userOverride?: MenuItemOverrideInfo;
  tenantOverride?: MenuItemOverrideInfo;
}

interface EffectiveFlat {
  id: string;
  slug: string;
  nameEn: string;
  nameAr: string;
  originalNameEn: string;
  originalNameAr: string;
  href?: string;
  icon?: string;
  order: number;
  originalOrder: number;
  resource?: string;
  isActive: boolean;
  effectiveParentId?: string;
  hasOverride: boolean;
  isHidden: boolean;
}

function flattenTree(nodes: MenuTreeNode[], out: FlatNode[], parentId: string | undefined): void {
  for (const n of nodes) {
    out.push({
      id: n.id,
      slug: n.slug,
      nameEn: n.nameEn,
      nameAr: n.nameAr,
      href: n.href,
      icon: n.icon,
      order: n.order,
      resource: n.resource,
      isActive: n.isActive,
      originalParentId: n.parentMenuItemId ?? parentId,
      userOverride: n.userOverride,
      tenantOverride: n.tenantOverride,
    });
    if (n.children.length > 0) {
      flattenTree(n.children, out, n.id);
    }
  }
}

function getOverride(node: FlatNode, scope: MenuOverrideScope): MenuItemOverrideInfo | undefined {
  if (scope === MenuOverrideScope.User) return node.userOverride;
  if (scope === MenuOverrideScope.Tenant) return node.tenantOverride;
  return undefined;
}

function sortChildren(nodes: EffectiveTreeNode[]): void {
  nodes.sort((a, b) => a.order - b.order);
  for (const n of nodes) {
    if (n.children.length > 0) {
      sortChildren(n.children);
    }
  }
}
