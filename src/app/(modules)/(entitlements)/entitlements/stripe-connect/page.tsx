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
  title: "Marketplace Accounts | NEXORA",
  description: "Manage connected gateway accounts and onboarding for platform tenants",
};

export default function StripeConnectPage() {
  return (
    <main>
      <ModuleErrorBoundary moduleName="Marketplace Accounts">
        <ConnectOnboardingView />
      </ModuleErrorBoundary>
    </main>
  );
}
