/**
 * Entitlements Core shared exports
 */

// Billing
export { BillingDashboardView } from "../billing/src/presentation/views/BillingDashboardView";

// Subscriptions
export { SubscriptionsOverviewView } from "../subscriptions/src/presentation/views/SubscriptionsOverviewView";
export { useSubscriptionsViewModel } from "../subscriptions/src/presentation/viewmodels/useSubscriptionsViewModel";

// Stripe Connect
export { ConnectOnboardingView } from "../stripe-connect/src/presentation/views/ConnectOnboardingView";

// Tenant Plans
export { TenantPlanComparisonView } from "../tenant-plans/src/presentation/views/TenantPlanComparisonView";

// Tenant Gateways
export { TenantPaymentGatewaysView } from "../tenant-gateways/src/presentation/views/TenantPaymentGatewaysView";

// Editions
export { Edition } from "../editions/src/domain/entities/Edition";
export type { EditionData } from "../editions/src/domain/entities/Edition";
export { EditionPromotion } from "../editions/src/domain/entities/EditionPromotion";
export type { EditionPromotionData } from "../editions/src/domain/entities/EditionPromotion";
export { useEditionsViewModel } from "../editions/src/presentation/viewmodels/useEditionsViewModel";
export { RecommendationBadge } from "../editions/src/presentation/components/comparison/RecommendationBadge";
export { BooleanIndicator } from "../editions/src/presentation/components/comparison/BooleanIndicator";
export { WizardStepIndicator } from "../editions/src/presentation/components/wizard/WizardStepIndicator";

// User Subscriptions
export { GatewaySelectionStep } from "../user-subscriptions/src/presentation/components/GatewaySelectionStep";

// Payment Gateways
export { usePaymentGatewaysViewModel } from "../payment-gateways/src/presentation/viewmodels/usePaymentGatewaysViewModel";
