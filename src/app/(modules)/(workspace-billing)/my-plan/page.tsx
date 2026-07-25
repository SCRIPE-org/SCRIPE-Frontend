import { Metadata } from "next";
import { MyUserSubscriptionView } from "@modules/entitlements/user-subscriptions/src/presentation/views/MyUserSubscriptionView";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

export const metadata: Metadata = {
  title: "My Plan",
  description: "View and manage your own subscription plan, features, and billing",
};

export default function MyPlanPage() {
  return (
    <ModuleErrorBoundary moduleName="entitlements.mySubscription.title">
      <MyUserSubscriptionView />
    </ModuleErrorBoundary>
  );
}
