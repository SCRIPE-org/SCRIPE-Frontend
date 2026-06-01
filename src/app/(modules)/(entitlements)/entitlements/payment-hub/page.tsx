import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const PaymentHubView = dynamic(() =>
  import("@modules/entitlements/payment-hub").then((m) => ({
    default: m.PaymentHubView,
  }))
);

export const metadata: Metadata = {
  title: "Payment Hub | SCRIPE",
  description: "Centralized hub for all payment and billing configuration.",
};

export default function PaymentHubPage() {
  return (
    <main>
      <ModuleErrorBoundary moduleName="Payment Hub">
        <PaymentHubView />
      </ModuleErrorBoundary>
    </main>
  );
}
