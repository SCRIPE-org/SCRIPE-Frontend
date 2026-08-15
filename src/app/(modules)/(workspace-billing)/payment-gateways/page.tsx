import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const PaymentGatewaySettingsView = dynamic(() =>
  import("@modules/entitlements/payment-gateways").then((m) => ({
    default: m.PaymentGatewaySettingsView,
  }))
);

export const metadata: Metadata = {
  title: "Payment Gateways",
  description: "Configure platform-level payment gateway integrations for all tenants",
};

export default function PaymentGatewaysPage() {
  return (
    <ModuleErrorBoundary moduleName="billing.gateways.title">
      <PaymentGatewaySettingsView />
    </ModuleErrorBoundary>
  );
}
