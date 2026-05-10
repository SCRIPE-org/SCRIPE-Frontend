/**
 * Plugins Module Public API
 *
 * Re-exports all sub-module public APIs for external consumption.
 * Internal implementation details are NOT exported.
 */

// ── Sub-module views ────────────────────────────────────────────────────────
export { PluginCatalogView } from "./catalog";
export { InstalledPluginsView } from "./installed";
export { PluginLogsView } from "./logs";
export { PluginSettingsView } from "./settings";

// ── Sub-module components (used by app routes / other modules) ──────────────
export { PluginCard, PluginInstallDialog } from "./catalog";
export { PluginHealthBadge, PluginStatusBadge, InstalledPluginRow } from "./installed";
export { LogRow, LogsPagination } from "./logs";

// ── Sub-module ViewModels (for advanced composition) ────────────────────────
export { useCatalogViewModel } from "./catalog";
export { useInstalledViewModel } from "./installed";
export { useLogsViewModel } from "./logs";
export { useSettingsViewModel } from "./settings";

// ── Domain entities ─────────────────────────────────────────────────────────
export { PluginCatalogItem } from "./catalog";
export { PluginInstallation } from "./installed";
export { PluginExecutionLog } from "./logs";

// ── Shared domain (manifest — still lives in src/ as it's cross-cutting) ────
export { parsePluginManifest } from "./src/domain/entities/PluginManifest";
export type {
  PluginManifest,
  PluginManifestEntryPoint,
  PluginManifestMenuItem,
} from "./src/domain/entities/PluginManifest";

// ── DI Container ─────────────────────────────────────────────────────────────
export { pluginsContainer, getPluginsContainer } from "./di";
export type { PluginsContainer } from "./di";
