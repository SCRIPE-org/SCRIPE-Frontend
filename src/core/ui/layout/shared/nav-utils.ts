"use client";

/**
 * ============================================================================
 * NAVIGATION PATH UTILITIES — Single Source of Truth
 * ============================================================================
 *
 * All active-state logic centralised here. After the one-shell collapse these
 * live in shared/ (they are shell-agnostic path helpers, never layout markup):
 * the nexus rails/topbar and the shared sidebar/nav-renderer all import them
 * instead of defining their own copy.
 *
 * RULES:
 *   1. Leaf items use EXACT match  (pathname === href)
 *   2. Group parents use TREE STRUCTURE to check descendants
 *   3. URL prefix matching is used ONLY as a fallback when no exact match
 *      exists anywhere in the entire navigation tree. This handles detail/
 *      nested pages (e.g. /tenants/{id}) that don't have their own nav entry.
 *   4. When prefix fallback is used, the LONGEST matching href wins,
 *      preventing false positives between siblings like
 *      /settings/themes vs /settings/themes/gallery.
 * ============================================================================
 */

import type { NavigationItem } from "@core/config/navigation";

// ─── Helper: collect all hrefs from the nav tree ────────────────────────────

function collectAllHrefs(items: NavigationItem[]): string[] {
  const hrefs: string[] = [];
  for (const item of items) {
    if (item.href) hrefs.push(item.href);
    if (item.children) hrefs.push(...collectAllHrefs(item.children));
  }
  return hrefs;
}

/**
 * Checks if any item in the entire tree has an exact href match for the pathname.
 */
function hasAnyExactMatch(items: NavigationItem[], pathname: string): boolean {
  for (const item of items) {
    if (item.href && item.href === pathname) return true;
    if (item.children && hasAnyExactMatch(item.children, pathname)) return true;
  }
  return false;
}

/**
 * Returns `true` when `pathname` starts with `href` followed by a `/` or end-of-string.
 * Ensures `/tenants` matches `/tenants/abc` but NOT `/tenants-list`.
 */
function isPrefixMatch(href: string | undefined, pathname: string): boolean {
  if (!href || href === "/") return false;
  return (
    pathname.startsWith(href) && (pathname.length === href.length || pathname[href.length] === "/")
  );
}

/**
 * Among all hrefs in the tree, find the longest one that is a prefix of `pathname`.
 * Returns null if none match.
 */
function findBestPrefixHref(allHrefs: string[], pathname: string): string | null {
  let best: string | null = null;
  for (const href of allHrefs) {
    if (isPrefixMatch(href, pathname)) {
      if (!best || href.length > best.length) {
        best = href;
      }
    }
  }
  return best;
}

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

// ─── Prefix-aware matching (for detail pages) ───────────────────────────────

/**
 * Returns `true` when `href` matches `pathname` exactly OR when:
 *   - No item in `allItems` has an exact match for `pathname`
 *   - `href` is the best (longest) prefix match for `pathname`
 *
 * This correctly highlights parent nav items when on detail pages
 * (e.g. /tenants/{id}) while avoiding false positives between siblings.
 */
export function isMatchWithFallback(
  href: string | undefined,
  pathname: string,
  allItems: NavigationItem[]
): boolean {
  if (!href) return false;
  // Exact match always wins
  if (pathname === href) return true;
  // If there IS an exact match somewhere in the tree, don't use prefix fallback
  if (hasAnyExactMatch(allItems, pathname)) return false;
  // No exact match → use prefix fallback with "best match" logic
  const allHrefs = collectAllHrefs(allItems);
  const bestHref = findBestPrefixHref(allHrefs, pathname);
  return bestHref === href;
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
 * Returns `true` when `item` has at least one child (at any depth)
 * that matches via the prefix-aware fallback logic.
 */
export function hasActiveChildWithFallback(
  item: NavigationItem,
  pathname: string,
  allItems: NavigationItem[]
): boolean {
  if (!item.children) return false;
  return item.children.some(
    (child) =>
      isMatchWithFallback(child.href, pathname, allItems) ||
      hasActiveChildWithFallback(child, pathname, allItems)
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
 * PHASE 1: Uses EXACT match.
 * PHASE 2: Falls back to longest prefix match when no exact match exists.
 *
 * Returns `[]` if no match found.
 *
 * Example: for pathname "/tenants/abc123" and a nav tree:
 *   الإدارة → المستأجرون (/tenants)
 * returns ["الإدارة", "المستأجرون"]
 */
export function findActiveAncestry(items: NavigationItem[], pathname: string): string[] {
  // Phase 1: try exact match first
  const exactResult = findActiveAncestryExact(items, pathname);
  if (exactResult.length > 0) return exactResult;

  // Phase 2: no exact match in entire tree — find best prefix match
  const allHrefs = collectAllHrefs(items);
  const bestHref = findBestPrefixHref(allHrefs, pathname);
  if (!bestHref) return [];

  // Find the ancestry for the best prefix match (which IS an exact match for bestHref)
  return findActiveAncestryExact(items, bestHref);
}

/**
 * Internal: strict exact-match ancestry resolution.
 */
function findActiveAncestryExact(items: NavigationItem[], pathname: string): string[] {
  for (const item of items) {
    // Leaf exact match
    if (item.href && item.href === pathname) {
      return [item.name];
    }

    // Recurse into children
    if (item.children && item.children.length > 0) {
      const childAncestry = findActiveAncestryExact(item.children, pathname);
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
