import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const SubscriptionsOverviewView = dynamic(() =>
  import("@modules/entitlements/subscriptions").then((m) => ({
    default: m.SubscriptionsOverviewView,
  }))
);

export const metadata: Metadata = {
  title: "Subscriptions Overview | NEXORA",
  description: "View all active subscriptions across all tenants",
};

export default function SubscriptionsOverviewPage() {
  return (
    <main>
      <ModuleErrorBoundary moduleName="Subscriptions Overview">
        <SubscriptionsOverviewView />
      </ModuleErrorBoundary>
    </main>
  );
}
