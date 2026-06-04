"use client";

import { useMemo } from "react";

import { useNavigation } from "@core/providers/navigation-provider";
import { useI18n } from "@core/providers/i18n-provider";
import { useNavigationStore } from "@core/navigation/store/useNavigationStore";
import {
  convertMenuItemsToNavigation,
  getNavigationItems,
  fallbackNavigation,
  navigation,
  USE_DYNAMIC_NAVIGATION,
} from "@core/config/navigation";
import type { NavigationItem } from "@core/config/navigation";

/**
 * ============================================================================
 * 🚀 DYNAMIC NAVIGATION SYSTEM
 * ============================================================================
 *
 * This is the CORE of the navigation system. Super easy to use:
 *
 * 📱 IN COMPONENTS:
 * const navigation = useDynamicNavigation(); // That's it!
 *
 * 🔄 AUTOMATIC SWITCHING:
 * - Static mode: Returns hardcoded navigation items
 * - Dynamic mode: Returns backend navigation items with fallback
 * - Translation: Automatically applied
 * - Icons: Automatically mapped from strings to components
 *
 * 💡 BENEFITS:
 * - Zero configuration needed in components
 * - Automatic fallback when backend fails
 * - Built-in translation support
 * - Route protection in dynamic mode
 *
 * ============================================================================
 */

interface DynamicNavigationProps {
  children: (navigationItems: NavigationItem[]) => React.ReactNode;
}

/**
 * 🎯 Dynamic Navigation Component
 * Automatically handles static/dynamic navigation switching
 */
export function DynamicNavigation({ children }: DynamicNavigationProps) {
  const { isLoading } = useNavigation();
  const { t } = useI18n();
  // Read active workspace menu items from the store (Gap 3 fix)
  const activeMenuItems = useNavigationStore((s) => s.getActiveRootMenuItems());

  // Check if we should use dynamic navigation
  if (!USE_DYNAMIC_NAVIGATION) {
    // Use static navigation
    const translatedStatic = getNavigationItems(t, navigation);
    return <>{children(translatedStatic)}</>;
  }

  // If still loading, use fallback navigation
  if (isLoading || activeMenuItems.length === 0) {
    const translatedFallback = getNavigationItems(t, fallbackNavigation);
    return <>{children(translatedFallback)}</>;
  }

  // Convert backend menu items to navigation format
  const backendNavigation = convertMenuItemsToNavigation(activeMenuItems);

  // Translate and render via children
  const translatedBackend = getNavigationItems(t, backendNavigation);
  return <>{children(translatedBackend)}</>;
}

/**
 * 🪝 Main Navigation Hook - USE THIS IN ALL SIDEBAR COMPONENTS
 *
 * Simply call: const navigation = useDynamicNavigation();
 * Everything else is handled automatically!
 *
 * Gap 3 fix: Now reads from the ACTIVE workspace's menu items via the Zustand
 * store (getActiveRootMenuItems) instead of always reading from the navigation
 * context's `navigationData` (which is fixed to the default/admin workspace).
 * This ensures non-Nexus layout sidebars show the correct workspace menu items.
 */
export function useDynamicNavigation(): NavigationItem[] {
  // ⚠️ All hooks MUST be called before any early returns (React Rules of Hooks)
  const { isLoading } = useNavigation();
  const { t } = useI18n();
  // Read active workspace menu items from the store — reacts to workspace switches
  const activeMenuItems = useNavigationStore((s) => s.getActiveRootMenuItems());

  return useMemo(() => {
    // SSR safety — return empty during server-side rendering
    if (typeof window === "undefined") {
      return [];
    }

    // Static mode — return hardcoded navigation
    if (!USE_DYNAMIC_NAVIGATION) {
      return getNavigationItems(t, navigation);
    }

    // Loading or no data — use fallback navigation
    if (isLoading || activeMenuItems.length === 0) {
      return getNavigationItems(t, fallbackNavigation);
    }

    // Dynamic mode — convert active workspace menu items to navigation format
    const backendNavigation = convertMenuItemsToNavigation(activeMenuItems);
    return getNavigationItems(t, backendNavigation);
  }, [isLoading, activeMenuItems, t]);
}
