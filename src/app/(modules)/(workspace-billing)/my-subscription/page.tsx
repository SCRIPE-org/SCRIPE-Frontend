import { Metadata } from "next";
import { CurrentTenantSubscriptionView } from "@modules/entitlements/user-subscriptions/src/presentation/views/CurrentTenantSubscriptionView";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

export const metadata: Metadata = {
  title: "My Subscription",
  description: "View and manage your current subscription plan, billing details, and usage",
};

export default function MySubscriptionPage() {
  return (
    <ModuleErrorBoundary moduleName="entitlements.mySubscription.title">
      <CurrentTenantSubscriptionView />
    </ModuleErrorBoundary>
  );
}
