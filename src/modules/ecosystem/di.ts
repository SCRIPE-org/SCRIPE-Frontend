/**
 * Ecosystem Module DI Container
 *
 * Provides dependency injection for ecosystem submodules.
 * Currently: RecycleBin only.
 */
import { getModuleApiService } from "@core/services/api-factory";

// Services
import { RecycleBinService } from "./recycle-bin/src/data/services/RecycleBinService";

// Repositories
import { RecycleBinRepository } from "./recycle-bin/src/data/repositories/RecycleBinRepository";

// Interfaces
import type { IRecycleBinRepository } from "./recycle-bin/src/domain/interfaces/IRecycleBinRepository";
import type { IRecycleBinService } from "./recycle-bin/src/domain/interfaces/IRecycleBinService";

export interface EcosystemContainer {
  recycleBinService: IRecycleBinService;
  recycleBinRepository: IRecycleBinRepository;
}

let _container: EcosystemContainer | null = null;

/**
 * Get the ecosystem container (lazy initialization)
 */
export function getEcosystemContainer(): EcosystemContainer {
  if (!_container) {
    const apiService = getModuleApiService("IDENTITY");
    const recycleBinService = new RecycleBinService(apiService);

    _container = {
      recycleBinService,
      recycleBinRepository: new RecycleBinRepository(recycleBinService),
    };
  }

  return _container;
}

/**
 * Ecosystem container accessor (for use in components)
 */
export const ecosystemContainer = {
  get recycleBinService() {
    return getEcosystemContainer().recycleBinService;
  },
  get recycleBinRepository() {
    return getEcosystemContainer().recycleBinRepository;
  },
};
