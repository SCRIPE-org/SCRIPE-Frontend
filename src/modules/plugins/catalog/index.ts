export { PluginCatalogView } from "./src/presentation/views/PluginCatalogView";
export { PluginCard } from "./src/presentation/components/PluginCard";
export { PluginInstallDialog } from "./src/presentation/components/PluginInstallDialog";
export { useCatalogViewModel } from "./src/presentation/viewmodels/useCatalogViewModel";
export { PluginCatalogItem } from "./src/domain/entities/PluginCatalogItem";
export type { ICatalogRepository } from "./src/domain/interfaces/ICatalogRepository";
export type { ICatalogService } from "./src/domain/interfaces/ICatalogService";
export type { InstallPluginRequest, PluginCatalogItemModel } from "./src/data/models/CatalogModels";
export { CatalogService } from "./src/data/services/CatalogService";
export { CatalogRepository } from "./src/data/repositories/CatalogRepository";

// ── Cross-cutting domain entities (owned by catalog as the primary submodule) ──
export { PluginDefinition } from "./src/domain/entities/PluginDefinition";
export type { PluginDefinitionModel } from "./src/domain/entities/PluginDefinition";
export { parsePluginManifest } from "./src/domain/entities/PluginManifest";
export type {
  PluginManifest,
  PluginManifestEntryPoint,
  PluginManifestMenuItem,
  PluginManifestWebhooks,
  PluginManifestPricing,
} from "./src/domain/entities/PluginManifest";
