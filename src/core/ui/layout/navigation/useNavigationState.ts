"use client";

/**
 * ============================================================================
 * useNavigationState — SINGLE SOURCE OF TRUTH FOR NAVIGATION STATE
 * ============================================================================
 *
 * This hook centralises ALL navigation state that was previously scattered
 * across navigation-layout.tsx, navigation-main-sidebar.tsx, and
 * navigation-panel-sidebar.tsx.
 *
 * Key improvements over the old system:
 * 1. Recursive findActiveAncestry — works for unlimited nesting depth
 * 2. No manualSelectionRef race condition
 * 3. Unified active/expanded/panel computation
 * 4. Panel expanded items derived from ancestry (auto-expand on reload)
 * ============================================================================
 */

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { NavigationItem } from "@core/config/navigation";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface NavigationState {
  /** Full ancestry path from root to active leaf, e.g. ["System", "Security", "Roles"] */
  activeAncestry: string[];
  /** Top-level ancestor name (first element of ancestry) — highlights in main sidebar */
  activeMainItem: string;
  /** User override — when user clicks a different main item to browse its panel */
  selectedMainItem: string | null;
  /** The effective main item to display (selectedMainItem ?? activeMainItem) */
  currentMainItem: string;
  /** Whether the current main item has children (needs panel) */
  hasChildren: boolean;
  /** Whether the panel sidebar should be visible */
  panelOpen: boolean;
  /** Items that should be expanded in the panel sidebar */
  expandedItems: string[];

  // ── Actions ──
  /** Handle clicking a main sidebar item */
  handleMainItemClick: (item: NavigationItem) => void;
  /** Toggle panel sidebar open/closed */
  handlePanelToggle: () => void;
  /** Toggle a specific item's expanded state in the panel */
  toggleExpanded: (itemName: string) => void;

  // ── Mobile ──
  isMobile: boolean;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Check if a pathname matches an item's href.
 * Returns true for exact match or proper segment-prefix match.
 * Prevents partial matches like `/system/entry` matching `/system/entryGate`.
 */
function hrefMatchesPath(href: string | undefined, pathname: string): boolean {
  if (!href || href === "/") return pathname === href;
  if (pathname === href) return true;
  if (pathname.startsWith(href)) {
    const nextChar = pathname[href.length];
    return nextChar === undefined || nextChar === "/";
  }
  return false;
}

/**
 * Recursively find the ancestry path (list of item names from root to leaf)
 * for the given pathname.
 *
 * Returns [] if no match found.
 *
 * Example: for pathname "/settings/system/roles",
 * returns ["System", "Roles"] (the name chain).
 *
 * Works for UNLIMITED depth — no hardcoded level limits.
 */
function findActiveAncestry(items: NavigationItem[], pathname: string): string[] {
  for (const item of items) {
    // Check if this item directly matches
    if (item.href && hrefMatchesPath(item.href, pathname)) {
      return [item.name];
    }

    // Check children recursively
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
 * Returns all ancestry names except the leaf (leaves are links, not groups).
 */
function computeExpandedItems(ancestry: string[]): string[] {
  // All items in the ancestry except the leaf should be expanded
  // (the leaf is the current page, parents are expandable groups)
  if (ancestry.length <= 1) return [];
  // Skip the first (it's the main sidebar item) — the rest are panel items
  return ancestry.slice(1, -1);
}

// ─── Hook ───────────────────────────────────────────────────────────────────

export function useNavigationState(navigation: NavigationItem[]): NavigationState {
  const pathname = usePathname();
  const router = useRouter();

  // ── Core state ──
  const [selectedMainItem, setSelectedMainItem] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== "undefined") return window.innerWidth < 1024;
    return false;
  });

  // Track if we're navigating via click (to avoid double-processing)
  const isClickNavigating = useRef(false);

  // ── Compute ancestry from pathname (reactive) ──
  const activeAncestry = useMemo(
    () => findActiveAncestry(navigation, pathname),
    [navigation, pathname]
  );

  const activeMainItem = activeAncestry[0] ?? "";

  // The effective main item: user selection overrides URL-derived
  const currentMainItem = selectedMainItem ?? activeMainItem;

  // Does the current main item have children?
  const currentNavItem = useMemo(
    () => navigation.find((item) => item.name === currentMainItem),
    [navigation, currentMainItem]
  );
  const hasChildren = !!(currentNavItem?.children && currentNavItem.children.length > 0);

  // Should the panel be visible?
  const shouldShowPanel = hasChildren && panelOpen && !isMobile;

  // ── Sync panel & expanded state with pathname changes ──
  useEffect(() => {
    if (isClickNavigating.current) {
      isClickNavigating.current = false;
      return;
    }

    // Determine if the active main item (from URL) has children
    const activeNavItem = navigation.find((item) => item.name === activeMainItem);
    const activeHasChildren = !!(activeNavItem?.children && activeNavItem.children.length > 0);

    // Clear user selection when URL changes (user navigated via link/browser)
    setSelectedMainItem(null);

    // Auto-open panel if active item has children (desktop only)
    if (activeHasChildren && !isMobile) {
      setPanelOpen(true);
    } else {
      setPanelOpen(false);
    }

    // Auto-expand ancestry chain in panel
    const expanded = computeExpandedItems(activeAncestry);
    if (expanded.length > 0) {
      setExpandedItems((prev) => {
        // Merge: keep manually expanded items + add ancestry items
        const merged = new Set([...prev, ...expanded]);
        return [...merged];
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, activeMainItem, isMobile]);

  // ── Handle window resize ──
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setPanelOpen(false);
      } else if (hasChildren) {
        setPanelOpen(true);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasChildren]);

  // ── Actions ──

  const handleMainItemClick = useCallback(
    (item: NavigationItem) => {
      const itemHasChildren = !!(item.children && item.children.length > 0);

      if (itemHasChildren) {
        // Toggle selection: if clicking the already-selected item, deselect
        if (item.name === selectedMainItem) {
          setSelectedMainItem(null);
          // Restore to URL-derived state
          const activeNavItem = navigation.find((i) => i.name === activeMainItem);
          const activeHasChildren = !!(
            activeNavItem?.children && activeNavItem.children.length > 0
          );
          if (activeHasChildren && !isMobile) {
            setPanelOpen(true);
          } else {
            setPanelOpen(false);
          }
        } else if (item.name === activeMainItem && selectedMainItem === null) {
          // Clicking the active item that's already selected — toggle panel
          setPanelOpen((prev) => !prev);
        } else {
          // Select a different group item
          setSelectedMainItem(item.name);
          if (!isMobile) {
            setPanelOpen(true);
          }
        }
      } else if (item.href) {
        // Leaf item — navigate directly
        isClickNavigating.current = true;
        setSelectedMainItem(null);
        setPanelOpen(false);
        router.push(item.href);
        // Close mobile sidebar after navigation
        if (isMobile) {
          // This will be handled by the parent via onSidebarOpenChange
        }
      }
    },
    [selectedMainItem, activeMainItem, navigation, isMobile, router]
  );

  const handlePanelToggle = useCallback(() => {
    if (hasChildren) {
      setPanelOpen((prev) => !prev);
    }
  }, [hasChildren]);

  const toggleExpanded = useCallback((itemName: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemName) ? prev.filter((name) => name !== itemName) : [...prev, itemName]
    );
  }, []);

  return {
    activeAncestry,
    activeMainItem,
    selectedMainItem,
    currentMainItem,
    hasChildren,
    panelOpen: shouldShowPanel,
    expandedItems,
    handleMainItemClick,
    handlePanelToggle,
    toggleExpanded,
    isMobile,
  };
}
