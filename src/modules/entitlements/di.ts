/**
 * Entitlements Module DI Container
 *
 * Provides dependency injection for all entitlements submodules.
 *
 * Clean Architecture Pattern:
 * - Services wrap IApiService (API calls only)
 * - Repositories use Services and map Models → Entities
 * - ViewModels use Repositories
 */
import { getModuleApiService } from "@core/services/api-factory";

// Services
import { FeatureService } from "./features/src/data/services/FeatureService";
import { EditionService } from "./editions/src/data/services/EditionService";
import { BundleService } from "./bundles/src/data/services/BundleService";

// Repositories
import { FeatureRepository } from "./features/src/data/repositories/FeatureRepository";
import { EditionRepository } from "./editions/src/data/repositories/EditionRepository";
import { BundleRepository } from "./bundles/src/data/repositories/BundleRepository";

// Interfaces
import type { IFeatureRepository } from "./features/src/domain/interfaces/IFeatureRepository";
import type { IEditionRepository } from "./editions/src/domain/interfaces/IEditionRepository";
import type { IBundleRepository } from "./bundles/src/domain/interfaces/IBundleRepository";

export interface EntitlementsContainer {
      featureRepository: IFeatureRepository;
      editionRepository: IEditionRepository;
      bundleRepository: IBundleRepository;
}

let _container: EntitlementsContainer | null = null;

/**
 * Get the entitlements container (lazy initialization)
 */
export function getEntitlementsContainer(): EntitlementsContainer {
      if (!_container) {
            const apiService = getModuleApiService("ENTITLEMENTS");

            // Create Services
            const featureService = new FeatureService(apiService);
            const editionService = new EditionService(apiService);
            const bundleService = new BundleService(apiService);

            // Create Repositories
            _container = {
                  featureRepository: new FeatureRepository(featureService),
                  editionRepository: new EditionRepository(editionService),
                  bundleRepository: new BundleRepository(bundleService),
            };
      }

      return _container;
}

/**
 * Entitlements container accessor (for use in components)
 */
export const entitlementsContainer = {
      get featureRepository() {
            return getEntitlementsContainer().featureRepository;
      },
      get editionRepository() {
            return getEntitlementsContainer().editionRepository;
      },
      get bundleRepository() {
            return getEntitlementsContainer().bundleRepository;
      },
};
