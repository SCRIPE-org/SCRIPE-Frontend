"use client";

/**
 * ============================================================================
 * NAVIGATION PATH UTILITIES — Single Source of Truth
 * ============================================================================
 *
 * All active-state logic centralised here.  Every sidebar / header component
 * imports these instead of defining its own copy.
 *
 * RULES:
 *   1. Leaf items use EXACT match  (pathname === href)
 *   2. Group parents use TREE STRUCTURE to check descendants
 *   3. URL prefix is NEVER used — it causes false positives when sibling
 *      items share a path prefix (e.g. /settings/themes vs /settings/themes/gallery)
 * ============================================================================
 */

import type { NavigationItem } from "@core/config/navigation";

// ─── Leaf-level matching ────────────────────────────────────────────────────

/**
 * Returns `true` when the leaf item's `href` is an EXACT match
 * for the current pathname.
 *
 * No prefix matching — two sibling leaves like
 * `/settings/themes` and `/settings/themes/gallery`
 * will never falsely cross-activate.
 */
export function isExactMatch(href: string | undefined, pathname: string): boolean {
  if (!href) return false;
  return pathname === href;
}

// ─── Tree-based ancestry ────────────────────────────────────────────────────

/**
 * Returns `true` when `item` has at least one child (at any depth)
 * whose `href` exactly matches the current `pathname`.
 *
 * This traverses the **menu tree**, NOT the URL path.
 */
export function hasActiveChild(item: NavigationItem, pathname: string): boolean {
  if (!item.children) return false;
  return item.children.some(
    (child) => isExactMatch(child.href, pathname) || hasActiveChild(child, pathname)
  );
}

/**
 * Returns `true` when the item itself matches OR any descendant matches.
 */
export function isItemOrDescendantActive(item: NavigationItem, pathname: string): boolean {
  if (isExactMatch(item.href, pathname)) return true;
  return hasActiveChild(item, pathname);
}

// ─── Ancestry path ──────────────────────────────────────────────────────────

/**
 * Recursively find the ancestry path (list of item names from root to leaf)
 * for the given `pathname`.
 *
 * Uses EXACT match only — never prefix.
 *
 * Returns `[]` if no match found.
 *
 * Example: for pathname "/settings/themes/gallery" and a nav tree:
 *   System Settings → Theme Gallery (/settings/themes/gallery)
 * returns ["System Settings", "Theme Gallery"]
 */
export function findActiveAncestry(items: NavigationItem[], pathname: string): string[] {
  for (const item of items) {
    // Leaf exact match
    if (item.href && item.href === pathname) {
      return [item.name];
    }

    // Recurse into children
    if (item.children && item.children.length > 0) {
      const childAncestry = findActiveAncestry(item.children, pathname);
      if (childAncestry.length > 0) {
        return [item.name, ...childAncestry];
      }
    }
  }

  return [];
}

/**
 * Given the full ancestry (e.g. ["System", "Security", "Roles"]) and
 * the panel item's children, compute which items should be expanded.
 *
 * Returns all ancestry names except the first (main sidebar) and the last (leaf).
 */
export function computeExpandedItems(ancestry: string[]): string[] {
  if (ancestry.length <= 1) return [];
  // Skip the first (it's the main sidebar item) — the rest minus leaf are panel parents
  return ancestry.slice(1, -1);
}
