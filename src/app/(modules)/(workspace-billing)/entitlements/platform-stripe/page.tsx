import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const PlatformStripeDashboardView = dynamic(() =>
  import("@modules/entitlements/platform-stripe").then((m) => ({
    default: m.PlatformStripeDashboardView,
  }))
);

export const metadata: Metadata = {
  title: "Platform Stripe",
  description: "View your platform Stripe account details, balances, transactions, and payouts",
};

export default function PlatformStripePage() {
  return (
    <ModuleErrorBoundary moduleName="entitlements.platformStripe.title">
      <PlatformStripeDashboardView />
    </ModuleErrorBoundary>
  );
}
