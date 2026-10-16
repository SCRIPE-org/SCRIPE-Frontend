/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { ConnectService } from "./stripe-connect/src/data/services/ConnectService";
import { PlatformStripeService } from "./platform-stripe/src/data/services/PlatformStripeService";
import { PlatformStripeRepository } from "./platform-stripe/src/data/repositories/PlatformStripeRepository";
import { TenantGatewayService } from "./tenant-gateways/src/data/services/TenantGatewayService";
import { TenantGatewayRepository } from "./tenant-gateways/src/data/repositories/TenantGatewayRepository";
import { AnalyticsService } from "./analytics/src/data/services/AnalyticsService";
import { CommissionLedgerService } from "./commission-ledger/src/data/services/CommissionLedgerService";
import { EditionCategoryService } from "./edition-categories/src/data/services/EditionCategoryService";

// ── Repository Implementations ──
import { FeatureRepository } from "./features/src/data/repositories/FeatureRepository";
import { EditionRepository } from "./editions/src/data/repositories/EditionRepository";
import { OverrideRepository } from "./overrides/src/data/repositories/OverrideRepository";
import { SubscriptionRepository } from "./subscriptions/src/data/repositories/SubscriptionRepository";
import { BillingRepository } from "./billing/src/data/repositories/BillingRepository";
import { TenantPlanRepository } from "./tenant-plans/src/data/repositories/TenantPlanRepository";
import { UserSubscriptionRepository } from "./user-subscriptions/src/data/repositories/UserSubscriptionRepository";
import { ConnectRepository } from "./stripe-connect/src/data/repositories/ConnectRepository";
import { AnalyticsRepository } from "./analytics/src/data/repositories/AnalyticsRepository";
import { CommissionLedgerRepository } from "./commission-ledger/src/data/repositories/CommissionLedgerRepository";
import { EditionCategoryRepository } from "./edition-categories/src/data/repositories/EditionCategoryRepository";
import { LeadsService } from "./leads/src/data/services/LeadsService";
import { LeadsRepository } from "./leads/src/data/repositories/LeadsRepository";
import { OnboardingQuestionService } from "./onboarding-questions/src/data/services/OnboardingQuestionService";
import { OnboardingQuestionRepository } from "./onboarding-questions/src/data/repositories/OnboardingQuestionRepository";
import { RecommendationRuleService } from "./recommendation-rules/src/data/services/RecommendationRuleService";
import { RecommendationRuleRepository } from "./recommendation-rules/src/data/repositories/RecommendationRuleRepository";
import { SignupContentService } from "./signup-content/src/data/services/SignupContentService";
import { SignupContentRepository } from "./signup-content/src/data/repositories/SignupContentRepository";

// Tenant Gateways — no separate repository import needed (already imported above)

// ── Repository Interfaces (exposed to consumers) ──
import type { IFeatureRepository } from "./features/src/domain/interfaces/IFeatureRepository";
import type { IEditionRepository } from "./editions/src/domain/interfaces/IEditionRepository";
import type { IOverrideRepository } from "./overrides/src/domain/interfaces/IOverrideRepository";
import type { ISubscriptionRepository } from "./subscriptions/src/domain/interfaces/ISubscriptionRepository";
import type { IBillingRepository } from "./billing/src/domain/interfaces/IBillingRepository";
import type { ITenantPlanRepository } from "./tenant-plans/src/domain/interfaces/ITenantPlanRepository";
import type { IUserSubscriptionRepository } from "./user-subscriptions/src/domain/interfaces/IUserSubscriptionRepository";
import type { IConnectRepository } from "./stripe-connect/src/domain/interfaces/IConnectRepository";
import type { IPlatformStripeRepository } from "./platform-stripe/src/domain/interfaces/IPlatformStripeRepository";
import type { IAnalyticsRepository } from "./analytics/src/domain/interfaces/IAnalyticsRepository";
import type { ITenantGatewayRepository } from "./tenant-gateways/src/domain/interfaces/ITenantGatewayRepository";
import type { ICommissionLedgerRepository } from "./commission-ledger/src/domain/interfaces/ICommissionLedgerRepository";
import type { IEditionCategoryRepository } from "./edition-categories/src/domain/interfaces/IEditionCategoryRepository";
import type { ILeadsRepository } from "./leads/src/domain/interfaces/ILeadsRepository";
import type { IOnboardingQuestionRepository } from "./onboarding-questions/src/domain/interfaces/IOnboardingQuestionRepository";
import type { IRecommendationRuleRepository } from "./recommendation-rules/src/domain/interfaces/IRecommendationRuleRepository";
import type { ISignupContentRepository } from "./signup-content/src/domain/interfaces/ISignupContentRepository";

// ── Service Interfaces (used internally for DI wiring) ──
import type { IFeatureService } from "./features/src/domain/interfaces/IFeatureService";
import type { IEditionService } from "./editions/src/domain/interfaces/IEditionService";
import type { IOverrideService } from "./overrides/src/domain/interfaces/IOverrideService";
import type { ISubscriptionService } from "./subscriptions/src/domain/interfaces/ISubscriptionService";
import type { IBillingService } from "./billing/src/domain/interfaces/IBillingService";
import type { ITenantPlanService } from "./tenant-plans/src/domain/interfaces/ITenantPlanService";
import type { IUserSubscriptionService } from "./user-subscriptions/src/domain/interfaces/IUserSubscriptionService";
import type { IConnectService } from "./stripe-connect/src/domain/interfaces/IConnectService";
import type { IPlatformStripeService } from "./platform-stripe/src/domain/interfaces/IPlatformStripeService";
import type { IAnalyticsService } from "./analytics/src/domain/interfaces/IAnalyticsService";
import type { ITenantGatewayService } from "./tenant-gateways/src/domain/interfaces/ITenantGatewayService";
import type { ICommissionLedgerService } from "./commission-ledger/src/domain/interfaces/ICommissionLedgerService";
import type { IEditionCategoryService } from "./edition-categories/src/domain/interfaces/IEditionCategoryService";
import type { ILeadsService } from "./leads/src/domain/interfaces/ILeadsService";
import type { IOnboardingQuestionService } from "./onboarding-questions/src/domain/interfaces/IOnboardingQuestionService";
import type { IRecommendationRuleService } from "./recommendation-rules/src/domain/interfaces/IRecommendationRuleService";
import type { ISignupContentService } from "./signup-content/src/domain/interfaces/ISignupContentService";

export interface EntitlementsContainer {
  featureRepository: IFeatureRepository;
  editionRepository: IEditionRepository;
  overrideRepository: IOverrideRepository;
  subscriptionRepository: ISubscriptionRepository;
  billingRepository: IBillingRepository;
  tenantPlanRepository: ITenantPlanRepository;
  userSubscriptionRepository: IUserSubscriptionRepository;
  connectRepository: IConnectRepository;
  platformStripeRepository: IPlatformStripeRepository;
  analyticsRepository: IAnalyticsRepository;
  tenantGatewayRepository: ITenantGatewayRepository;
  commissionLedgerRepository: ICommissionLedgerRepository;
  editionCategoryRepository: IEditionCategoryRepository;
  leadsRepository: ILeadsRepository;
  onboardingQuestionRepository: IOnboardingQuestionRepository;
  recommendationRuleRepository: IRecommendationRuleRepository;
  signupContentRepository: ISignupContentRepository;
}

let _container: EntitlementsContainer | null = null;

/**
 * Get the entitlements container (lazy initialization)
 */
export function getEntitlementsContainer(): EntitlementsContainer {
  if (typeof window === "undefined") {
    const dummyProxy = new Proxy({} as any, {
      get() {
        return () => Promise.resolve({});
      },
    });
    return {
      featureRepository: dummyProxy,
      editionRepository: dummyProxy,
      overrideRepository: dummyProxy,
      subscriptionRepository: dummyProxy,
      billingRepository: dummyProxy,
      tenantPlanRepository: dummyProxy,
      userSubscriptionRepository: dummyProxy,
      connectRepository: dummyProxy,
      platformStripeRepository: dummyProxy,
      analyticsRepository: dummyProxy,
      tenantGatewayRepository: dummyProxy,
      commissionLedgerRepository: dummyProxy,
      editionCategoryRepository: dummyProxy,
      leadsRepository: dummyProxy,
      onboardingQuestionRepository: dummyProxy,
      recommendationRuleRepository: dummyProxy,
      signupContentRepository: dummyProxy,
    };
  }

  if (!_container) {
    const apiService = getModuleApiService("ENTITLEMENTS");

    // ── Create Services (typed as interfaces) ──
    const featureService: IFeatureService = new FeatureService(apiService);
    const editionService: IEditionService = new EditionService(apiService);
    const overrideService: IOverrideService = new OverrideService(apiService);
    const subscriptionService: ISubscriptionService = new SubscriptionService(apiService);
    const billingService: IBillingService = new BillingService(apiService);
    const tenantPlanService: ITenantPlanService = new TenantPlanService(apiService);
    const userSubscriptionService: IUserSubscriptionService = new UserSubscriptionService(
      apiService
    );
    const connectService: IConnectService = new ConnectService(apiService);
    const platformStripeService: IPlatformStripeService = new PlatformStripeService(apiService);
    const analyticsService: IAnalyticsService = new AnalyticsService(apiService);
    const tenantGatewayService: ITenantGatewayService = new TenantGatewayService(apiService);
    const commissionLedgerService: ICommissionLedgerService = new CommissionLedgerService(
      apiService
    );
    const editionCategoryService: IEditionCategoryService = new EditionCategoryService(apiService);
    const leadsService: ILeadsService = new LeadsService(apiService);
    const onboardingQuestionService: IOnboardingQuestionService = new OnboardingQuestionService(
      apiService
    );
    const recommendationRuleService: IRecommendationRuleService = new RecommendationRuleService(
      apiService
    );
    const signupContentService: ISignupContentService = new SignupContentService(apiService);

    // ── Create Repositories (IService → IRepository mapping) ──
    _container = {
      signupContentRepository: new SignupContentRepository(signupContentService),
      featureRepository: new FeatureRepository(featureService),
      editionRepository: new EditionRepository(editionService),
      overrideRepository: new OverrideRepository(overrideService),
      subscriptionRepository: new SubscriptionRepository(subscriptionService),
      billingRepository: new BillingRepository(billingService),
      tenantPlanRepository: new TenantPlanRepository(tenantPlanService),
      userSubscriptionRepository: new UserSubscriptionRepository(userSubscriptionService),
      connectRepository: new ConnectRepository(connectService),
      platformStripeRepository: new PlatformStripeRepository(platformStripeService),
      analyticsRepository: new AnalyticsRepository(analyticsService),
      tenantGatewayRepository: new TenantGatewayRepository(tenantGatewayService),
      commissionLedgerRepository: new CommissionLedgerRepository(commissionLedgerService),
      editionCategoryRepository: new EditionCategoryRepository(editionCategoryService),
      leadsRepository: new LeadsRepository(leadsService),
      onboardingQuestionRepository: new OnboardingQuestionRepository(onboardingQuestionService),
      recommendationRuleRepository: new RecommendationRuleRepository(recommendationRuleService),
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
  get connectRepository() {
    return getEntitlementsContainer().connectRepository;
  },
  get platformStripeRepository() {
    return getEntitlementsContainer().platformStripeRepository;
  },
  get analyticsRepository() {
    return getEntitlementsContainer().analyticsRepository;
  },
  get tenantGatewayRepository() {
    return getEntitlementsContainer().tenantGatewayRepository;
  },
  get commissionLedgerRepository() {
    return getEntitlementsContainer().commissionLedgerRepository;
  },
  get editionCategoryRepository() {
    return getEntitlementsContainer().editionCategoryRepository;
  },
  get leadsRepository() {
    return getEntitlementsContainer().leadsRepository;
  },
  get onboardingQuestionRepository() {
    return getEntitlementsContainer().onboardingQuestionRepository;
  },
  get recommendationRuleRepository() {
    return getEntitlementsContainer().recommendationRuleRepository;
  },
  get signupContentRepository() {
    return getEntitlementsContainer().signupContentRepository;
  },
};
