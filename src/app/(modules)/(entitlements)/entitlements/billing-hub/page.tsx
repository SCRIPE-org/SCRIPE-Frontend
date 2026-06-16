import { Metadata } from "next";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const BillingHubView = dynamic(() =>
  import("@modules/entitlements/billing-hub").then((m) => ({ default: m.BillingHubView }))
);

export const metadata: Metadata = {
  title: "Billing & Plans Hub | SCRIPE",
  description: "Manage revenue dashboard, subscriptions, stripe connect, plans, and gateways.",
};

export default function BillingHubPage() {
  return (
    <main>
      <ModuleErrorBoundary moduleName="Billing & Plans Hub">
        <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Loading billing console...</div>}>
          <BillingHubView />
        </Suspense>
      </ModuleErrorBoundary>
    </main>
  );
}
