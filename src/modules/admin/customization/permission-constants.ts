/**
 * Customization Module Permissions
 *
 * Covers: Menus, Themes, Bundles
 */
export const CUSTOMIZATION_PERMISSIONS = {
  // ── Menus ───────────────────────────────────────────────
  MENUS_VIEW: "menus.view",
  MENUS_CREATE: "menus.create",
  MENUS_UPDATE: "menus.update",
  MENUS_DELETE: "menus.delete",
  MENUS_MANAGE_LINKS: "menus.manage_links",
  MENUS_CUSTOMIZE: "menus.customize",
  MENUS_CUSTOMIZE_TENANT: "menus.customize_tenant",

  // ── Themes (Marketplace Management) ────────────────────
  THEMES_VIEW: "themes.view",
  THEMES_CREATE: "themes.create",
  THEMES_UPDATE: "themes.update",
  THEMES_DELETE: "themes.delete",

  // ── Bundles ─────────────────────────────────────────────
  BUNDLES_VIEW: "bundles.view",
  BUNDLES_VIEW_DETAILS: "bundles.view_details",
  BUNDLES_CREATE: "bundles.create",
  BUNDLES_UPDATE: "bundles.update",
  BUNDLES_DELETE: "bundles.delete",
} as const;
