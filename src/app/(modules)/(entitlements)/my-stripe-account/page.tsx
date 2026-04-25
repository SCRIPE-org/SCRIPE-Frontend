import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const TenantStripeConnectView = dynamic(
  () =>
    import("@modules/entitlements/stripe-connect").then((m) => ({
      default: m.TenantStripeConnectView,
    }))
);

export const metadata: Metadata = {
  title: "My Stripe Account | NEXORA",
  description:
    "Manage your Stripe Connect Express account — set up payouts, view status, and access your dashboard.",
};

export default function MyStripeAccountPage() {
  return (
    <main>
      <ModuleErrorBoundary moduleName="Stripe Connect">
        <TenantStripeConnectView />
      </ModuleErrorBoundary>
    </main>
  );
}
