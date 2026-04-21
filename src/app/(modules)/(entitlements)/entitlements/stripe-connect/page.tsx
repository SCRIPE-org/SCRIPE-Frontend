import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const ConnectOnboardingView = dynamic(
  () =>
    import("@modules/entitlements/stripe-connect").then((m) => ({
      default: m.ConnectOnboardingView,
    }))
);

export const metadata: Metadata = {
  title: "Stripe Connect | NEXORA",
  description: "Manage Stripe Express accounts and onboarding for platform tenants",
};

export default function StripeConnectPage() {
  return (
    <main>
      <ModuleErrorBoundary moduleName="Stripe Connect">
        <ConnectOnboardingView />
      </ModuleErrorBoundary>
    </main>
  );
}
