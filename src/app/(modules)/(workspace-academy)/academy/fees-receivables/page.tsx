import { Metadata } from "next";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";
import { AcademyFeesReceivablesView } from "@modules/academy/fees-receivables/src/presentation/views/AcademyFeesReceivablesView";

export const metadata: Metadata = {
  title: "Academy Fees & Receivables",
  description: "Inspect authoritative finance-owned invoices, receipts, and receivables reconciliation.",
};

export default function FeesReceivablesPage() {
  return (
    <ModuleErrorBoundary moduleName="academy.fees-receivables">
      <AcademyFeesReceivablesView />
    </ModuleErrorBoundary>
  );
}
