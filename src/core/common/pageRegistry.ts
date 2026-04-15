/**
 * Page Registry
 *
 * Central registry of all application pages with bilingual labels.
 * Used by the menu form to provide a user-friendly page picker.
 *
 * When adding a new page to the app:
 *   1. Add a new entry here
 *   2. The menu form will automatically show it in the page picker
 */

export interface PageDefinition {
  /** Route path, e.g. "/dashboard" */
  href: string;
  /** English display name */
  labelEn: string;
  /** Arabic display name */
  labelAr: string;
  /** Optional lucide icon name */
  icon?: string;
  /** Optional permission resource (for grouping) */
  resource?: string;
  /** Category for grouping in the picker */
  category: "system" | "settings" | "general";
}

/**
 * All registered pages in the application.
 * Add new pages here as they are created.
 */
export const PAGE_REGISTRY: PageDefinition[] = [
  // ── General ────────────────────────────────────────────────────
  {
    href: "/dashboard",
    labelEn: "Dashboard",
    labelAr: "لوحة التحكم",
    icon: "LayoutDashboard",
    resource: "dashboard",
    category: "general",
  },
  {
    href: "/profile",
    labelEn: "Profile",
    labelAr: "الملف الشخصي",
    icon: "User",
    category: "general",
  },

  // ── System ─────────────────────────────────────────────────────
  {
    href: "/admins",
    labelEn: "Admin Management",
    labelAr: "إدارة المشرفين",
    icon: "Users",
    resource: "admins",
    category: "system",
  },
  {
    href: "/roles",
    labelEn: "Role Management",
    labelAr: "إدارة الأدوار",
    icon: "Shield",
    resource: "roles",
    category: "system",
  },
  {
    href: "/tenants",
    labelEn: "Tenant Management",
    labelAr: "إدارة المستأجرين",
    icon: "Building",
    resource: "tenants",
    category: "system",
  },
  {
    href: "/audit",
    labelEn: "Audit Logs",
    labelAr: "سجل التدقيق",
    icon: "FileText",
    resource: "audit-logs",
    category: "system",
  },
  {
    href: "/analytics",
    labelEn: "Analytics",
    labelAr: "التحليلات",
    icon: "BarChart3",
    resource: "analytics",
    category: "system",
  },
  {
    href: "/security",
    labelEn: "Security",
    labelAr: "الأمان",
    icon: "ShieldAlert",
    resource: "security",
    category: "system",
  },
  {
    href: "/recycle-bin",
    labelEn: "Recycle Bin",
    labelAr: "سلة المحذوفات",
    icon: "Trash2",
    resource: "recycle-bin",
    category: "system",
  },

  // ── Settings ───────────────────────────────────────────────────
  {
    href: "/settings/menus",
    labelEn: "Menu Settings",
    labelAr: "إعدادات القائمة",
    icon: "Menu",
    resource: "menus",
    category: "settings",
  },
  {
    href: "/settings/permissions",
    labelEn: "Permission Settings",
    labelAr: "إعدادات الصلاحيات",
    icon: "Key",
    resource: "permissions",
    category: "settings",
  },
  {
    href: "/customization/branding",
    labelEn: "Tenant Settings",
    labelAr: "إعدادات المستأجر",
    icon: "Settings",
    resource: "tenant-settings",
    category: "settings",
  },
  {
    href: "/settings/webhooks",
    labelEn: "Webhooks",
    labelAr: "الويب هوك",
    icon: "Webhook",
    resource: "webhooks",
    category: "settings",
  },
];

/**
 * Get all pages grouped by category
 */
export function getPagesByCategory(language: string = "en"): Record<string, PageDefinition[]> {
  const groups: Record<string, PageDefinition[]> = {};
  for (const page of PAGE_REGISTRY) {
    if (!groups[page.category]) groups[page.category] = [];
    groups[page.category].push(page);
  }
  return groups;
}

/**
 * Get page label by href
 */
export function getPageLabel(href: string, language: string = "en"): string | undefined {
  const page = PAGE_REGISTRY.find((p) => p.href === href);
  if (!page) return undefined;
  return language === "ar" ? page.labelAr : page.labelEn;
}
