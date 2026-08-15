/**
 * Plugins Module Permissions
 *
 * Covers: Catalog, Installed, Definitions, Data Store, Execution Logs
 */
export const PLUGINS_PERMISSIONS = {
  // ── Catalog ─────────────────────────────────────────────
  PLUGINS_CATALOG_VIEW: "plugins_catalog.view",
  PLUGINS_CATALOG_INSTALL: "plugins_catalog.install",
  PLUGINS_CATALOG_UNINSTALL: "plugins_catalog.uninstall",

  // ── Installed ───────────────────────────────────────────
  PLUGINS_INSTALLED_VIEW: "plugins_installed.view",
  PLUGINS_INSTALLED_MANAGE: "plugins_installed.manage",
  PLUGINS_INSTALLED_CONFIGURE: "plugins_installed.configure",

  // ── Definitions (Developer) ────────────────────────────
  PLUGINS_DEFINITION_VIEW: "plugins_definition.view",
  PLUGINS_DEFINITION_CREATE: "plugins_definition.create",
  PLUGINS_DEFINITION_UPDATE: "plugins_definition.update",
  PLUGINS_DEFINITION_DELETE: "plugins_definition.delete",

  // ── Data Store ──────────────────────────────────────────
  PLUGINS_DATA_STORE_VIEW: "plugins_data_store.view",
  PLUGINS_DATA_STORE_MANAGE: "plugins_data_store.manage",

  // ── Execution Logs ──────────────────────────────────────
  PLUGINS_EXECUTION_LOGS_VIEW: "plugins_execution_logs.view",
} as const;
