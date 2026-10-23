import { Metadata } from "next";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";
import { MoneyLandingView } from "@modules/venue/money/src/presentation/views/MoneyLandingView";

export const metadata: Metadata = {
  title: "Money | SCRIPE Venue",
  description: "Authoritative financial receivables and manual payment tracking.",
};

export default function MoneyPage() {
  return (
    <ModuleErrorBoundary moduleName="money.landing.title">
      <MoneyLandingView />
    </ModuleErrorBoundary>
  );
}
