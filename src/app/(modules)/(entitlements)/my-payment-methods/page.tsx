import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const TenantPaymentGatewaysView = dynamic(() =>
  import("@modules/entitlements/tenant-gateways").then((m) => ({
    default: m.TenantPaymentGatewaysView,
  }))
);

export const metadata: Metadata = {
  title: "My Payment Methods | NEXORA",
  description: "Configure and manage your tenant's payment gateway integrations",
};

export default function MyPaymentMethodsPage() {
  return (
    <main>
      <ModuleErrorBoundary moduleName="Payment Methods">
        <TenantPaymentGatewaysView />
      </ModuleErrorBoundary>
    </main>
  );
}
