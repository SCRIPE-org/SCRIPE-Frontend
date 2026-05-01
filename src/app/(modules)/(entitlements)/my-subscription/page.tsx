import { Metadata } from "next";
import { MySubscriptionView } from "@modules/entitlements/user-subscriptions/src/presentation/views/MySubscriptionView";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

export const metadata: Metadata = {
  title: "My Subscription | NEXORA",
  description: "View and manage your current subscription plan, billing details, and usage",
};

export default function MySubscriptionPage() {
  return (
    <main>
      <ModuleErrorBoundary moduleName="My Subscription">
        <MySubscriptionView />
      </ModuleErrorBoundary>
    </main>
  );
}
