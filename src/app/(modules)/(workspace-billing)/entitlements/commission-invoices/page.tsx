import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const CommissionInvoicesView = dynamic(() =>
  import("@modules/entitlements/commission-ledger").then((m) => ({
    default: m.CommissionInvoicesView,
  }))
);

export const metadata: Metadata = {
  title: "Commission Invoices",
  description: "View your commission invoices charged by the platform.",
};

export default function CommissionInvoicesPage() {
  return (
    <ModuleErrorBoundary moduleName="entitlements.commissionLedger.invoicesTitle">
      <CommissionInvoicesView />
    </ModuleErrorBoundary>
  );
}
