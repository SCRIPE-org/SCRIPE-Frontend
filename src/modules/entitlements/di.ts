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
import { OverrideService } from "./overrides/src/data/services/OverrideService";
import { SubscriptionService } from "./subscriptions/src/data/services/SubscriptionService";

// Repositories
import { FeatureRepository } from "./features/src/data/repositories/FeatureRepository";
import { EditionRepository } from "./editions/src/data/repositories/EditionRepository";

// Interfaces
import type { IFeatureRepository } from "./features/src/domain/interfaces/IFeatureRepository";
import type { IEditionRepository } from "./editions/src/domain/interfaces/IEditionRepository";

export interface EntitlementsContainer {
      featureRepository: IFeatureRepository;
      editionRepository: IEditionRepository;
      overrideService: OverrideService;
      subscriptionService: SubscriptionService;
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
            const overrideService = new OverrideService(apiService);
            const subscriptionService = new SubscriptionService(apiService);

            // Create Repositories
            _container = {
                  featureRepository: new FeatureRepository(featureService),
                  editionRepository: new EditionRepository(editionService),
                  overrideService,
                  subscriptionService,
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
      get overrideService() {
            return getEntitlementsContainer().overrideService;
      },
      get subscriptionService() {
            return getEntitlementsContainer().subscriptionService;
      },
};

