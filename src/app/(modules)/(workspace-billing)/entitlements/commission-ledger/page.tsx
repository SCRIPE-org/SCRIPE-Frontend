import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const CommissionLedgerView = dynamic(() =>
  import("@modules/entitlements/commission-ledger").then((m) => ({
    default: m.CommissionLedgerView,
  }))
);

export const metadata: Metadata = {
  title: "Commission Ledger",
  description: "View platform-wide commissions and manage invoices",
};

export default function CommissionLedgerPage() {
  return (
    <ModuleErrorBoundary moduleName="entitlements.commissionLedger.title">
      <CommissionLedgerView />
    </ModuleErrorBoundary>
  );
}
