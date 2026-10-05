import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";
import { ReceivablesView } from "@modules/venue/money/src/presentation/views/ReceivablesView";
export default function ReceivablesPage() {
  return (
    <ModuleErrorBoundary moduleName="money.receivables.title">
      <ReceivablesView />
    </ModuleErrorBoundary>
  );
}
