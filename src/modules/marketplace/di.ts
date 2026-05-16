/**
* Marketplace Module DI Container
*
* Provides dependency injection for the Marketplace module.
*
* Clean Architecture Pattern:
* - Services wrap IApiService (API calls only)
* - Repositories use Services and map Models → Entities
* - ViewModels use Repositories
*/
import { getModuleApiService } from "@/core/services/api-factory";

// Service
import { MarketplaceService } from "./src/data/services/MarketplaceService";

// Repository
import { MarketplaceRepository } from "./src/data/repositories/MarketplaceRepository";

// Interfaces
import type { IMarketplaceRepository } from "./src/domain/interfaces/IMarketplaceRepository";
import type { IMarketplaceService } from "./src/domain/interfaces/IMarketplaceService";

export interface MarketplaceContainer {
marketplaceService: IMarketplaceService;
marketplaceRepository: IMarketplaceRepository;
}

let _container: MarketplaceContainer | null = null;

/**
* Get the Marketplace container (lazy initialization)
*/
export function getMarketplaceContainer(): MarketplaceContainer {
if (!_container) {
const apiService = getModuleApiService("MARKETPLACE");

// Create Service (wraps IApiService)
const marketplaceService = new MarketplaceService(apiService);

// Create Repository (uses Service)
_container = {
marketplaceService,
marketplaceRepository: new MarketplaceRepository(marketplaceService),
};
}

return _container;
}

/**
* Marketplace container accessor (for use in components)
*/
export const marketplaceContainer = {
get marketplaceRepository() {
return getMarketplaceContainer().marketplaceRepository;
},
};