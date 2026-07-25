import { Metadata } from "next";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";
import { LoadingSpinner } from "@core/ui/loading-spinner";

const BillingHubView = dynamic(() =>
  import("@modules/entitlements/billing-hub").then((m) => ({ default: m.BillingHubView }))
);

export const metadata: Metadata = {
  title: "Billing & Plans Hub",
  description: "Manage revenue dashboard, subscriptions, stripe connect, plans, and gateways.",
};

export default function BillingHubPage() {
  return (
    <ModuleErrorBoundary moduleName="entitlements.hub.title">
      <Suspense fallback={<LoadingSpinner size="md" />}>
        <BillingHubView />
      </Suspense>
    </ModuleErrorBoundary>
  );
}
