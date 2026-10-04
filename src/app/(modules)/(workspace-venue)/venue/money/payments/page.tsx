import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";
import { PaymentsView } from "@modules/venue/money/src/presentation/views/PaymentsView";
export default function PaymentsPage() {
  return (
    <ModuleErrorBoundary moduleName="money.payments.title">
      <PaymentsView />
    </ModuleErrorBoundary>
  );
}
