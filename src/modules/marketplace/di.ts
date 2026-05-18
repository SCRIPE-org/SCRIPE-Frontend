/**
 * Marketplace Module DI Container
 *
 * Central dependency injection for all 6 Marketplace sub-modules.
 * Follows the Plugins module di.ts pattern exactly.
 *
 * Sub-modules wired:
 *   1. app-listings   → AppListingsRepository
 *   2. categories     → CategoriesRepository
 *   3. submissions    → SubmissionsRepository
 *   4. developers     → DevelopersRepository
 *   5. reviews        → ReviewsRepository
 *   6. financials     → FinancialsRepository
 *
 * Architecture:
 *   Repositories use IApiService directly (no intermediate Service layer needed
 *   for standard REST endpoints). Complex modules can add a Service layer later.
 *   ViewModels → Repository interfaces → never IApiService directly.
 */
import { getModuleApiService } from "@core/services/api-factory";

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
    const apiService = getModuleApiService("MARKETPLACE");

    _container = {
      appListingsRepository: new AppListingsRepository(apiService),
      categoriesRepository: new CategoriesRepository(apiService),
      submissionsRepository: new SubmissionsRepository(apiService),
      developersRepository: new DevelopersRepository(apiService),
      reviewsRepository: new ReviewsRepository(apiService),
      financialsRepository: new FinancialsRepository(apiService),
    };
  }
  return _container;
}

/**
 * Lazy-getter accessors — import `marketplaceContainer` in ViewModels.
 * Never call getModuleApiService() from a ViewModel or View.
 */
export const marketplaceContainer = {
  get appListingsRepository() { return getMarketplaceContainer().appListingsRepository; },
  get categoriesRepository() { return getMarketplaceContainer().categoriesRepository; },
  get submissionsRepository() { return getMarketplaceContainer().submissionsRepository; },
  get developersRepository() { return getMarketplaceContainer().developersRepository; },
  get reviewsRepository() { return getMarketplaceContainer().reviewsRepository; },
  get financialsRepository() { return getMarketplaceContainer().financialsRepository; },
};