import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const InvoiceListView = dynamic(() =>
  import("@modules/entitlements/billing").then((m) => ({ default: m.InvoiceListView }))
);

export const metadata: Metadata = {
  title: "Invoices",
  description: "View and manage billing invoices",
};

export default function InvoicesPage() {
  return (
    <ModuleErrorBoundary moduleName="billing.invoices">
      <InvoiceListView />
    </ModuleErrorBoundary>
  );
}
