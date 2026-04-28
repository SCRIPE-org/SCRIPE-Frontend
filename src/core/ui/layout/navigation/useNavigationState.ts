"use client";

/**
 * ============================================================================
 * useNavigationState — SINGLE SOURCE OF TRUTH FOR NAVIGATION STATE
 * ============================================================================
 *
 * Centralises ALL navigation state that was previously scattered
 * across navigation-layout.tsx, navigation-main-sidebar.tsx, and
 * navigation-panel-sidebar.tsx.
 *
 * Key design decisions:
 * 1. Uses EXACT match for active detection (no URL prefix)
 * 2. Ancestry is derived from the menu tree structure
 * 3. Panel expanded items auto-derived from ancestry
 * 4. Single source for mobile/desktop breakpoint
 * ============================================================================
 */

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { NavigationItem } from "@core/config/navigation";
import { findActiveAncestry, computeExpandedItems } from "./nav-utils";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface NavigationState {
  /** Full ancestry path from root to active leaf, e.g. ["System Settings", "Theme Gallery"] */
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

  // ── Compute ancestry from pathname (reactive, exact match) ──
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
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);

    // eslint-disable-next-line react-hooks/refs
    if (isClickNavigating.current) {
      // eslint-disable-next-line react-hooks/refs
      isClickNavigating.current = false;
    } else {
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
    }
  }

  // ── Handle window resize ──
  const hasChildrenRef = useRef(hasChildren);
  useEffect(() => {
    hasChildrenRef.current = hasChildren;
  }, [hasChildren]);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setPanelOpen(false);
      } else if (hasChildrenRef.current) {
        setPanelOpen(true);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
     
  }, []);  

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
