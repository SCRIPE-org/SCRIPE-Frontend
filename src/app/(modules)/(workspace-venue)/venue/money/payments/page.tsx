import { Metadata } from "next";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";
import { PaymentsView } from "@modules/venue/money/src/presentation/views/PaymentsView";

export const metadata: Metadata = {
  title: "Payments | SCRIPE Venue",
  description: "Track and manage venue payment transactions, receipts, and cash flow.",
};

export default function PaymentsPage() {
  return (
    <ModuleErrorBoundary moduleName="money.payments.title">
      <PaymentsView />
    </ModuleErrorBoundary>
  );
}
