import {
  LayoutDashboard,
  Users,
  BarChart3,
  Settings,
  User,
  UserX,
  Shield,
  UserPlus,
  UserCheck,
  Cog,
  FileText,
  TrendingUp,
  PieChart,
  BarChart,
  MapPin,
  Store,
  Building,
  ContrastIcon,
  HardHat,
  Move3D,
  ShieldCheck,
  ArrowRightLeft,
  LayoutList,
  Users2,
  Truck,
  ScrollText,
  FolderTree,
  Grid3X3,
  Package2,
  Package,
  Warehouse,
  Type,
  Palette,
  Map,
  Ticket,
  UserCog,
  Key,
  Menu,
  Building2,
  Crown,
  ToggleRight,
  Mail,
  Bell,
  Webhook,
  Trash2,
  DollarSign,
  CreditCard,
  Layers,
  Fingerprint,
  KeyRound,
  Paintbrush,
  // ── Phase 3-5 icons (Compliance, Ecosystem, Developer) ──
  Boxes,
  Clock,
  ClipboardCheck,
  Code,
  Database,
  FileStack,
  GitBranch,
  LayoutTemplate,
  Link,
  Plug,
  Receipt,
  Scale,
  ShieldAlert,
  Workflow,
  Wallet,
  Landmark,
  type LucideIcon,
} from "lucide-react";

export interface NavigationItem {
  name: string;
  href?: string;
  icon?: LucideIcon;
  children?: NavigationItem[];
  badge?: string | number; // Optional badge for notifications
  disabled?: boolean; // Optional disabled state
}

/**
 * Icon mapping from string names to actual icon components
 * Used to convert backend icon names to React components
 */
export const iconMap: Record<string, LucideIcon> = {
  // ── Core / Navigation ──
  MapPin: MapPin,
  ShieldCheck: ShieldCheck,
  ArrowRightLeft: ArrowRightLeft,
  HardHat: HardHat,
  Users2: Users2,
  Shield: Shield,
  Truck: Truck,
  ScrollText: ScrollText,
  Package2: Package2,
  FolderTree: FolderTree,
  Grid3X3: Grid3X3,
  Package: Package,
  Warehouse: Warehouse,
  Store: Store,
  LayoutDashboard: LayoutDashboard,
  LayoutList: LayoutList,
  Users: Users,
  BarChart3: BarChart3,
  Settings: Settings,
  User: User,
  Building: Building,
  Cog: Cog,
  FileText: FileText,
  TrendingUp: TrendingUp,
  PieChart: PieChart,
  BarChart: BarChart,
  Type: Type,
  UserCog: UserCog,
  Key: Key,
  Menu: Menu,
  Building2: Building2,
  Crown: Crown,
  ToggleRight: ToggleRight,
  Mail: Mail,
  Bell: Bell,
  Webhook: Webhook,
  Trash2: Trash2,
  DollarSign: DollarSign,
  CreditCard: CreditCard,
  Layers: Layers,
  Fingerprint: Fingerprint,
  KeyRound: KeyRound,
  Paintbrush: Paintbrush,
  Palette: Palette,
  UserCheck: UserCheck,
  // ── Phase 3: Compliance & Governance ──
  Scale: Scale,
  Clock: Clock,
  ClipboardCheck: ClipboardCheck,
  FileStack: FileStack,
  ShieldAlert: ShieldAlert,
  // ── Phase 4: Ecosystem ──
  Boxes: Boxes,
  Plug: Plug,
  Link: Link,
  LayoutTemplate: LayoutTemplate,
  GitBranch: GitBranch,
  Database: Database,
  Workflow: Workflow,
  // ── Phase 5: Developer ──
  Code: Code,
  Receipt: Receipt,
  // ── Self-service / Billing ──
  Wallet: Wallet,
  Landmark: Landmark,
};

/**
 * ============================================================================
 * DYNAMIC NAVIGATION SYSTEM - EASY MAINTENANCE & SWITCHING
 * ============================================================================
 *
 * 🚀 SUPER EASY TO MAINTAIN:
 * - Single toggle flag to switch between static/dynamic navigation
 * - All sidebar components automatically use the same system
 * - No need to update individual components when adding new items
 * - Centralized icon mapping and configuration
 *
 * 🔄 EASY SWITCHING:
 * - Development: Set USE_DYNAMIC_NAVIGATION = false (uses static navigation)
 * - Production: Set USE_DYNAMIC_NAVIGATION = true (uses backend navigation)
 * - Automatic fallback when backend is unavailable
 *
 * 📁 CLEAN ARCHITECTURE:
 * - useDynamicNavigation() hook handles all the logic
 * - Components just call the hook and render
 * - Route protection automatically enabled in dynamic mode
 * - Translation support built-in
 *
 * ============================================================================
 */

/**
 * 🎛️ NAVIGATION MODE SWITCH
 *
 * Change this ONE flag to switch between static and dynamic navigation:
 * - false = Static navigation (hardcoded, no backend calls, no route protection)
 * - true = Dynamic navigation (from backend, with route protection)
 */
export const USE_DYNAMIC_NAVIGATION = true;

// STATIC NAVIGATION - Used when USE_DYNAMIC_NAVIGATION is false
export const navigation: NavigationItem[] = [
  // {
  //   name: "nav.demo",
  //   icon: Users,
  //   children: [
  //     {
  //       name: "nav.products",
  //       href: "/demo/products",
  //       icon: ShieldCheck,
  //     },
  //     {
  //       name: "nav.tree",
  //       href: "/demo/tree",
  //       icon: Users,
  //     },
  //     {
  //       name: "nav.richTextEditor",
  //       href: "/demo/rich-text-editor",
  //       icon: Type,
  //     },
  //   ],
  // },
];

// 🔄 Fallback navigation - used when backend is unavailable (same as static navigation)
export const fallbackNavigation: NavigationItem[] = navigation;

/**
 * ============================================================================
 * 📖 QUICK USAGE GUIDE
 * ============================================================================
 *
 * 🔧 FOR DEVELOPERS:
 * 1. Set USE_DYNAMIC_NAVIGATION = false for development
 * 2. Edit the 'navigation' array below to add/remove items
 * 3. All sidebar components will automatically update
 *
 * 🚀 FOR PRODUCTION:
 * 1. Set USE_DYNAMIC_NAVIGATION = true
 * 2. Implement /MenuItems API endpoint
 * 3. System handles everything automatically
 *
 * 🎨 ADDING NEW STATIC ITEMS:
 * 1. Import icon from lucide-react
 * 2. Add to iconMap if using dynamic navigation
 * 3. Add item to navigation array
 *
 * Example:
 * {
 *   name: "nav.newSection",
 *   href: "/new-section",
 *   icon: NewIcon,
 *   children: [...] // Optional nested items
 * }
 *
 * ============================================================================
 */

/**
 * 🔧 UTILITY FUNCTIONS
 * These are used internally by the navigation system
 */

/**
 * Translates navigation items using the i18n system
 */
export const getNavigationItems = (
  t: (key: string, params?: Record<string, string>) => string,
  navigationItems: NavigationItem[] = fallbackNavigation
): NavigationItem[] => {
  const translateItem = (item: NavigationItem): NavigationItem => ({
    ...item,
    name: item.name.startsWith("nav.") ? t(item.name) : item.name,
    children: item.children?.map(translateItem),
  });

  return navigationItems.map(translateItem);
};

/**
 * Checks if a navigation item or its children match the current pathname.
 *
 * Uses EXACT match for leaf items — no URL prefix matching.
 * Parent items are active if any child in the menu tree matches.
 *
 * When `allItems` is provided (the full navigation tree), the function
 * also falls back to URL prefix matching when NO exact match exists
 * in the entire tree. This handles detail/child pages like /tenants/{id}
 * without false positives between siblings.
 *
 * @param item      The navigation item to check
 * @param pathname  The current URL pathname
 * @param allItems  Optional: full navigation tree (enables prefix fallback)
 */
export const isNavigationItemActive = (
  item: NavigationItem,
  pathname: string,
  allItems?: NavigationItem[]
): boolean => {
  // Exact match for leaf items
  if (item.href && pathname === item.href) return true;

  // Recurse through menu tree children (exact match)
  if (item.children) {
    if (item.children.some((child) => isNavigationItemActive(child, pathname))) {
      return true;
    }
  }

  // ── Prefix fallback for detail/child pages ──
  // Only when full tree context is provided AND no exact match anywhere
  if (allItems) {
    const { isMatchWithFallback, hasActiveChildWithFallback } = require("@core/ui/layout/navigation/nav-utils");
    if (item.href && isMatchWithFallback(item.href, pathname, allItems)) return true;
    if (item.children) {
      return item.children.some(
        (child: NavigationItem) =>
          (child.href && isMatchWithFallback(child.href, pathname, allItems)) ||
          hasActiveChildWithFallback(child, pathname, allItems)
      );
    }
  }

  return false;
};

/**
 * Flattens nested navigation items into a single array (useful for search)
 */
export const getFlatNavigationItems = (
  items: NavigationItem[] = fallbackNavigation
): NavigationItem[] => {
  const flatItems: NavigationItem[] = [];

  const flatten = (items: NavigationItem[]) => {
    items.forEach((item) => {
      if (item.href) {
        flatItems.push(item);
      }
      if (item.children) {
        flatten(item.children);
      }
    });
  };

  flatten(items);
  return flatItems;
};

/**
 * 🔄 Converts backend menu items to frontend navigation format
 * Used internally by the dynamic navigation system
 */
/** Shape of a single backend menu item (bilingual) */
interface BackendMenuItem {
  nameEn?: string;
  nameAr?: string;
  slug?: string;
  /** @deprecated Legacy field — use nameEn/nameAr */
  name?: string;
  /** @deprecated Legacy field — use nameEn/nameAr */
  displayName?: string;
  href?: string;
  icon?: string;
  order?: number;
  resource?: string;
  children?: BackendMenuItem[];
}

/**
 * Gets the current language from localStorage (fallback: 'en')
 */
function getCurrentLanguage(): string {
  if (typeof window === "undefined") return "en";
  try {
    return localStorage.getItem("language") || "en";
  } catch {
    return "en";
  }
}

/**
 * Converts backend menu items to frontend navigation format.
 * Handles bilingual fields (nameEn/nameAr) — picks name by current language.
 * Used internally by the dynamic navigation system.
 */
export const convertMenuItemsToNavigation = (menuItemsData: unknown): NavigationItem[] => {
  // Handle different possible data structures
  let menuItems: BackendMenuItem[] = [];

  if (Array.isArray(menuItemsData)) {
    menuItems = menuItemsData as BackendMenuItem[];
  } else if (menuItemsData && typeof menuItemsData === "object" && "menuItem" in menuItemsData) {
    menuItems = (menuItemsData as Record<string, unknown>).menuItem as BackendMenuItem[];
  } else if (
    menuItemsData &&
    typeof menuItemsData === "object" &&
    Object.keys(menuItemsData as object).length > 0
  ) {
    menuItems = [menuItemsData as BackendMenuItem];
  } else {
    menuItems = [];
  }

  const lang = getCurrentLanguage();

  const convertMenuItem = (item: BackendMenuItem): NavigationItem => {
    // Bilingual name resolution: prefer nameEn/nameAr, fallback to legacy fields
    const displayName =
      lang === "ar"
        ? item.nameAr || item.nameEn || item.name || item.displayName || "Unnamed"
        : item.nameEn || item.name || item.displayName || "Unnamed";

    return {
      name: displayName,
      href: item.href || undefined,
      icon: iconMap[item.icon ?? ""] || iconMap["Package"],
      children: item.children?.map(convertMenuItem) || [],
      disabled: false,
    };
  };

  // Backend already returns only active, non-deleted items
  // Just sort by order and convert
  const sortedMenuItems = [...menuItems].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return sortedMenuItems.map(convertMenuItem);
};
