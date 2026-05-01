import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const TenantStripeConnectView = dynamic(() =>
  import("@modules/entitlements/stripe-connect").then((m) => ({
    default: m.TenantStripeConnectView,
  }))
);

export const metadata: Metadata = {
  title: "My Payment Account | NEXORA",
  description:
    "Manage your payment gateway account — set up payouts, view status, and access your dashboard.",
};

export default function MyStripeAccountPage() {
  return (
    <main>
      <ModuleErrorBoundary moduleName="Payment Account">
        <TenantStripeConnectView />
      </ModuleErrorBoundary>
    </main>
  );
}
