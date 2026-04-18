/**
 * Entitlements Module DI Container
 *
 * Provides dependency injection for all entitlements submodules.
 *
 * Clean Architecture Pattern:
 * - Services implement IService interfaces (API calls only)
 * - Repositories use IService interfaces and map Models → Entities
 * - ViewModels use IRepository interfaces (never Services directly)
 */
import { getModuleApiService } from "@core/services/api-factory";

// ── Service Implementations ──
import { FeatureService } from "./features/src/data/services/FeatureService";
import { EditionService } from "./editions/src/data/services/EditionService";
import { OverrideService } from "./overrides/src/data/services/OverrideService";
import { SubscriptionService } from "./subscriptions/src/data/services/SubscriptionService";
import { BillingService } from "./billing/src/data/services/BillingService";
import { TenantPlanService } from "./tenant-plans/src/data/services/TenantPlanService";
import { UserSubscriptionService } from "./user-subscriptions/src/data/services/UserSubscriptionService";

// ── Repository Implementations ──
import { FeatureRepository } from "./features/src/data/repositories/FeatureRepository";
import { EditionRepository } from "./editions/src/data/repositories/EditionRepository";
import { OverrideRepository } from "./overrides/src/data/repositories/OverrideRepository";
import { SubscriptionRepository } from "./subscriptions/src/data/repositories/SubscriptionRepository";
import { BillingRepository } from "./billing/src/data/repositories/BillingRepository";
import { TenantPlanRepository } from "./tenant-plans/src/data/repositories/TenantPlanRepository";
import { UserSubscriptionRepository } from "./user-subscriptions/src/data/repositories/UserSubscriptionRepository";

// ── Repository Interfaces (exposed to consumers) ──
import type { IFeatureRepository } from "./features/src/domain/interfaces/IFeatureRepository";
import type { IEditionRepository } from "./editions/src/domain/interfaces/IEditionRepository";
import type { IOverrideRepository } from "./overrides/src/domain/interfaces/IOverrideRepository";
import type { ISubscriptionRepository } from "./subscriptions/src/domain/interfaces/ISubscriptionRepository";
import type { IBillingRepository } from "./billing/src/domain/interfaces/IBillingRepository";
import type { ITenantPlanRepository } from "./tenant-plans/src/domain/interfaces/ITenantPlanRepository";
import type { IUserSubscriptionRepository } from "./user-subscriptions/src/domain/interfaces/IUserSubscriptionRepository";

// ── Service Interfaces (used internally for DI wiring) ──
import type { IFeatureService } from "./features/src/domain/interfaces/IFeatureService";
import type { IEditionService } from "./editions/src/domain/interfaces/IEditionService";
import type { IOverrideService } from "./overrides/src/domain/interfaces/IOverrideService";
import type { ISubscriptionService } from "./subscriptions/src/domain/interfaces/ISubscriptionService";
import type { IBillingService } from "./billing/src/domain/interfaces/IBillingService";
import type { ITenantPlanService } from "./tenant-plans/src/domain/interfaces/ITenantPlanService";
import type { IUserSubscriptionService } from "./user-subscriptions/src/domain/interfaces/IUserSubscriptionService";

export interface EntitlementsContainer {
      featureRepository: IFeatureRepository;
      editionRepository: IEditionRepository;
      overrideRepository: IOverrideRepository;
      subscriptionRepository: ISubscriptionRepository;
      billingRepository: IBillingRepository;
      tenantPlanRepository: ITenantPlanRepository;
      userSubscriptionRepository: IUserSubscriptionRepository;
}

let _container: EntitlementsContainer | null = null;

/**
 * Get the entitlements container (lazy initialization)
 */
export function getEntitlementsContainer(): EntitlementsContainer {
      if (!_container) {
            const apiService = getModuleApiService("ENTITLEMENTS");

            // ── Create Services (typed as interfaces) ──
            const featureService: IFeatureService = new FeatureService(apiService);
            const editionService: IEditionService = new EditionService(apiService);
            const overrideService: IOverrideService = new OverrideService(apiService);
            const subscriptionService: ISubscriptionService = new SubscriptionService(apiService);
            const billingService: IBillingService = new BillingService(apiService);
            const tenantPlanService: ITenantPlanService = new TenantPlanService(apiService);
            const userSubscriptionService: IUserSubscriptionService = new UserSubscriptionService(apiService);

            // ── Create Repositories (IService → IRepository mapping) ──
            _container = {
                  featureRepository: new FeatureRepository(featureService),
                  editionRepository: new EditionRepository(editionService),
                  overrideRepository: new OverrideRepository(overrideService),
                  subscriptionRepository: new SubscriptionRepository(subscriptionService),
                  billingRepository: new BillingRepository(billingService),
                  tenantPlanRepository: new TenantPlanRepository(tenantPlanService),
                  userSubscriptionRepository: new UserSubscriptionRepository(userSubscriptionService),
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
      get overrideRepository() {
            return getEntitlementsContainer().overrideRepository;
      },
      get subscriptionRepository() {
            return getEntitlementsContainer().subscriptionRepository;
      },
      get billingRepository() {
            return getEntitlementsContainer().billingRepository;
      },
      get tenantPlanRepository() {
            return getEntitlementsContainer().tenantPlanRepository;
      },
      get userSubscriptionRepository() {
            return getEntitlementsContainer().userSubscriptionRepository;
      },
};
