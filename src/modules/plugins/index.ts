/**
 * Plugins Module Public API
 *
 * Re-exports all sub-module public APIs for external consumption.
 * Internal implementation details are NOT exported.
 *
 * Architecture: ALL code lives in sub-modules. No root-level src/ folder.
 */

// ── Sub-module views ────────────────────────────────────────────────────────
export { PluginCatalogView } from "./catalog";
export { InstalledPluginsView } from "./installed";
export { InstalledPluginDetailView } from "./installed";
export { PluginLogsView } from "./logs";
export { PluginSettingsView } from "./settings";
export { DefinitionsView } from "./definitions";

// ── Sub-module components (used by app routes / other modules) ──────────────
export { PluginCard, PluginInstallDialog } from "./catalog";
export { PluginHealthBadge, PluginStatusBadge, InstalledPluginRow } from "./installed";
export { LogRow, LogsPagination } from "./logs";
export { DynamicSettingsForm } from "./settings";
export type { PluginSettingsSchema, JsonSchemaField, SettingsValues } from "./settings";


// ── Sub-module ViewModels (for advanced composition) ────────────────────────
export { useCatalogViewModel } from "./catalog";
export { useInstalledViewModel } from "./installed";
export { useLogsViewModel } from "./logs";
export { useSettingsViewModel } from "./settings";
export { useDefinitionsViewModel } from "./definitions";

// ── Domain entities ─────────────────────────────────────────────────────────
export { PluginCatalogItem } from "./catalog";
export { PluginInstallation } from "./installed";
export { PluginExecutionLog } from "./logs";

// ── Cross-cutting domain (manifest & definition — owned by catalog) ─────────
export { parsePluginManifest } from "./catalog/src/domain/entities/PluginManifest";
export type {
  PluginManifest,
  PluginManifestEntryPoint,
  PluginManifestMenuItem,
} from "./catalog/src/domain/entities/PluginManifest";
export { PluginDefinition } from "./catalog/src/domain/entities/PluginDefinition";
export type { PluginDefinitionModel } from "./catalog/src/domain/entities/PluginDefinition";

// ── DI Container ─────────────────────────────────────────────────────────────
export { pluginsContainer, getPluginsContainer } from "./di";
export type { PluginsContainer } from "./di";
