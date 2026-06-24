/**
 * Plugins Module DI Container
 *
 * Central dependency injection for all plugin sub-modules.
 * Architecture:
 * - Services implement IService interfaces (API calls only, no React, no "use client")
 * - Repositories use IService interfaces and map Models → Entities
 * - ViewModels use IRepository interfaces (never Services directly)
 */
import { getModuleApiService } from "@core/services/api-factory";

// ── Service Implementations ──────────────────────────────────────────────────
import { CatalogService } from "./catalog/src/data/services/CatalogService";
import { InstalledService } from "./installed/src/data/services/InstalledService";
import { LogsService } from "./logs/src/data/services/LogsService";
import { DefinitionsService } from "./definitions/src/data/services/DefinitionsService";

// ── Repository Implementations ───────────────────────────────────────────────
import { CatalogRepository } from "./catalog/src/data/repositories/CatalogRepository";
import { InstalledRepository } from "./installed/src/data/repositories/InstalledRepository";
import { LogsRepository } from "./logs/src/data/repositories/LogsRepository";
import { DefinitionsRepository } from "./definitions/src/data/repositories/DefinitionsRepository";

// ── Repository Interfaces (exposed to consumers) ─────────────────────────────
import type { ICatalogRepository } from "./catalog/src/domain/interfaces/ICatalogRepository";
import type { IInstalledRepository } from "./installed/src/domain/interfaces/IInstalledRepository";
import type { ILogsRepository } from "./logs/src/domain/interfaces/ILogsRepository";
import type { IDefinitionsRepository } from "./definitions/src/domain/interfaces/IDefinitionsRepository";

// ── Service Interfaces (used internally for DI wiring) ───────────────────────
import type { ICatalogService } from "./catalog/src/domain/interfaces/ICatalogService";
import type { IInstalledService } from "./installed/src/domain/interfaces/IInstalledService";
import type { ILogsService } from "./logs/src/domain/interfaces/ILogsService";
import type { IDefinitionsService } from "./definitions/src/domain/interfaces/IDefinitionsService";

// ── Container Interface ───────────────────────────────────────────────────────

export interface PluginsContainer {
  catalogRepository: ICatalogRepository;
  installedRepository: IInstalledRepository;
  logsRepository: ILogsRepository;
  definitionsRepository: IDefinitionsRepository;
}

let _container: PluginsContainer | null = null;

export function getPluginsContainer(): PluginsContainer {
  if (typeof window === "undefined") {
    const dummyProxy = new Proxy({} as any, {
      get() {
        return () => Promise.resolve({});
      },
    });
    return {
      catalogRepository: dummyProxy,
      installedRepository: dummyProxy,
      logsRepository: dummyProxy,
      definitionsRepository: dummyProxy,
    };
  }

  if (!_container) {
    const apiService = getModuleApiService("PLUGINS");

    // ── Create Services (typed as interfaces) ──
    const catalogService: ICatalogService = new CatalogService(apiService);
    const installedService: IInstalledService = new InstalledService(apiService);
    const logsService: ILogsService = new LogsService(apiService);
    const definitionsService: IDefinitionsService = new DefinitionsService(apiService);

    // ── Create Repositories (IService → IRepository mapping) ──
    _container = {
      catalogRepository: new CatalogRepository(catalogService),
      installedRepository: new InstalledRepository(installedService),
      logsRepository: new LogsRepository(logsService),
      definitionsRepository: new DefinitionsRepository(definitionsService),
    };
  }

  return _container;
}

export const pluginsContainer = {
  get catalogRepository() {
    return getPluginsContainer().catalogRepository;
  },
  get installedRepository() {
    return getPluginsContainer().installedRepository;
  },
  get logsRepository() {
    return getPluginsContainer().logsRepository;
  },
  get definitionsRepository() {
    return getPluginsContainer().definitionsRepository;
  },
};
