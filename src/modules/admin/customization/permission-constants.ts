/**
 * Customization Module Permissions
 *
 * Covers: Menus, Themes, Bundles, Dashboard Builder
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

  // ── Dashboard Builder ──────────────────────────────────
  DASHBOARD_BUILDER_VIEW: "settings.dashboard_builder.view",
  DASHBOARD_BUILDER_UPDATE: "settings.dashboard_builder.update",
  DASHBOARD_BUILDER_PUBLISH: "settings.dashboard_builder.publish",
  DASHBOARD_BUILDER_ADMIN_OVERRIDE: "settings.dashboard_builder.admin_override",
  DASHBOARD_BUILDER_PRESETS: "settings.dashboard_builder.presets",
  DASHBOARD_BUILDER_SAVE_PRESETS: "settings.dashboard_builder.save_presets",
  DASHBOARD_BUILDER_EXPORT: "settings.dashboard_builder.export",
} as const;
