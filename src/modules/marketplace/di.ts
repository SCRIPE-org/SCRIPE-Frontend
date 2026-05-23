/**
 * Marketplace Module DI Container
 *
 * Central dependency injection for all 6 Marketplace sub-modules.
 * Follows the NEXORA Architecture 3-layer pattern (H-02):
 *
 *   ViewModel → Repository (domain interface) → Service → IApiService → HTTP
 *
 * Sub-modules wired:
 *   1. app-listings   → AppListingsService  → AppListingsRepository
 *   2. categories     → CategoriesService   → CategoriesRepository
 *   3. submissions    → SubmissionsService  → SubmissionsRepository
 *   4. developers     → DevelopersService   → DevelopersRepository
 *   5. reviews        → ReviewsService      → ReviewsRepository
 *   6. financials     → FinancialsService   → FinancialsRepository
 */
import { getModuleApiService } from "@core/services/api-factory";

// ── Service Implementations ──────────────────────────────────────────────────
import { AppListingsService } from "./app-listings/src/data/services/AppListingsService";
import { CategoriesService } from "./categories/src/data/services/CategoriesService";
import { SubmissionsService } from "./submissions/src/data/services/SubmissionsService";
import { DevelopersService } from "./developers/src/data/services/DevelopersService";
import { ReviewsService } from "./reviews/src/data/services/ReviewsService";
import { FinancialsService } from "./financials/src/data/services/FinancialsService";

// ── Repository Implementations ───────────────────────────────────────────────
import { AppListingsRepository } from "./app-listings/src/data/repositories/AppListingsRepository";
import { CategoriesRepository } from "./categories/src/data/repositories/CategoriesRepository";
import { SubmissionsRepository } from "./submissions/src/data/repositories/SubmissionsRepository";
import { DevelopersRepository } from "./developers/src/data/repositories/DevelopersRepository";
import { ReviewsRepository } from "./reviews/src/data/repositories/ReviewsRepository";
import { FinancialsRepository } from "./financials/src/data/repositories/FinancialsRepository";

// ── Repository Interfaces ────────────────────────────────────────────────────
import type { IAppListingsRepository } from "./app-listings/src/domain/interfaces/IAppListingsRepository";
import type { ICategoriesRepository } from "./categories/src/domain/interfaces/ICategoriesRepository";
import type { ISubmissionsRepository } from "./submissions/src/domain/interfaces/ISubmissionsRepository";
import type { IDevelopersRepository } from "./developers/src/domain/interfaces/IDevelopersRepository";
import type { IReviewsRepository } from "./reviews/src/domain/interfaces/IReviewsRepository";
import type { IFinancialsRepository } from "./financials/src/domain/interfaces/IFinancialsRepository";

// ── Container Interface ───────────────────────────────────────────────────────

export interface MarketplaceContainer {
  appListingsRepository: IAppListingsRepository;
  categoriesRepository: ICategoriesRepository;
  submissionsRepository: ISubmissionsRepository;
  developersRepository: IDevelopersRepository;
  reviewsRepository: IReviewsRepository;
  financialsRepository: IFinancialsRepository;
}

let _container: MarketplaceContainer | null = null;

export function getMarketplaceContainer(): MarketplaceContainer {
  if (!_container) {
    // Single IApiService instance shared across all sub-module services
    const apiService = getModuleApiService("MARKETPLACE");

    // H-02: Services are now injected into Repositories (not IApiService directly)
    const appListingsService = new AppListingsService(apiService);
    const categoriesService = new CategoriesService(apiService);
    const submissionsService = new SubmissionsService(apiService);
    const developersService = new DevelopersService(apiService);
    const reviewsService = new ReviewsService(apiService);
    const financialsService = new FinancialsService(apiService);

    _container = {
      appListingsRepository: new AppListingsRepository(appListingsService),
      categoriesRepository: new CategoriesRepository(categoriesService),
      submissionsRepository: new SubmissionsRepository(submissionsService),
      developersRepository: new DevelopersRepository(developersService),
      reviewsRepository: new ReviewsRepository(reviewsService),
      financialsRepository: new FinancialsRepository(financialsService),
    };
  }
  return _container;
}

/**
 * Lazy-getter proxy — import `marketplaceContainer` in ViewModels.
 * Never call getModuleApiService() or instantiate services from a ViewModel or View.
 */
export const marketplaceContainer = {
  get appListingsRepository() { return getMarketplaceContainer().appListingsRepository; },
  get categoriesRepository() { return getMarketplaceContainer().categoriesRepository; },
  get submissionsRepository() { return getMarketplaceContainer().submissionsRepository; },
  get developersRepository() { return getMarketplaceContainer().developersRepository; },
  get reviewsRepository() { return getMarketplaceContainer().reviewsRepository; },
  get financialsRepository() { return getMarketplaceContainer().financialsRepository; },
};