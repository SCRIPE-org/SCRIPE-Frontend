import { Metadata } from "next";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";
import { ReceivablesView } from "@modules/venue/money/src/presentation/views/ReceivablesView";

export const metadata: Metadata = {
  title: "Receivables | SCRIPE Venue",
  description: "Monitor outstanding balances, invoices, customer credit, and debt aging.",
};

export default function ReceivablesPage() {
  return (
    <ModuleErrorBoundary moduleName="money.receivables.title">
      <ReceivablesView />
    </ModuleErrorBoundary>
  );
}
