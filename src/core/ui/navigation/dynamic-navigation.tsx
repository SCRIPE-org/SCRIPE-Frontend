"use client";

import { useNavigation } from "@core/providers/navigation-provider";
import { useI18n } from "@core/providers/i18n-provider";
import { convertMenuItemsToNavigation, getNavigationItems, fallbackNavigation, navigation, USE_DYNAMIC_NAVIGATION } from "@core/config/navigation";
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
  const { navigationData, isLoading } = useNavigation();
  const { t } = useI18n();

  // Check if we should use dynamic navigation
  if (!USE_DYNAMIC_NAVIGATION) {
    // Use static navigation
    const translatedStatic = getNavigationItems(t, navigation);
    return <>{children(translatedStatic)}</>;
  }

  // If still loading, use fallback navigation
  if (isLoading || !navigationData) {
    const translatedFallback = getNavigationItems(t, fallbackNavigation);
    return <>{children(translatedFallback)}</>;
  }

  // Convert backend menu items to navigation format
  const backendNavigation = convertMenuItemsToNavigation(navigationData.menuItems);

  // Translate navigation items
  return getNavigationItems(t, backendNavigation);

}

/**
 * 🪝 Main Navigation Hook - USE THIS IN ALL SIDEBAR COMPONENTS
 * 
 * Simply call: const navigation = useDynamicNavigation();
 * Everything else is handled automatically!
 */
export function useDynamicNavigation(): NavigationItem[] {
  // For SSR/prerendering, return empty array to avoid provider errors
  if (typeof window === 'undefined') {
    return [];
  }

  const { navigationData, isLoading } = useNavigation();
  const { t } = useI18n();

  // Check if we should use dynamic navigation
  if (!USE_DYNAMIC_NAVIGATION) {
    // Use static navigation
    return getNavigationItems(t, navigation);
  }

  // If still loading or no data, use fallback navigation
  if (isLoading || !navigationData) {
    return getNavigationItems(t, fallbackNavigation);
  }

  // Convert backend menu items to navigation format
  const backendNavigation = convertMenuItemsToNavigation(navigationData.menuItems);

  // Translate navigation items
  return getNavigationItems(t, backendNavigation);
}
