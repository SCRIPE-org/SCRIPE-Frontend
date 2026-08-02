import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const PayoutsView = dynamic(() =>
  import("@modules/entitlements/stripe-connect").then((m) => ({ default: m.PayoutsView }))
);

export const metadata: Metadata = {
  title: "Payouts",
  description: "View your payout account status, commission history, and lifetime earnings",
};

export default function PayoutsPage() {
  return (
    <ModuleErrorBoundary moduleName="entitlements.stripeConnect.payoutsTitle">
      <PayoutsView />
    </ModuleErrorBoundary>
  );
}
