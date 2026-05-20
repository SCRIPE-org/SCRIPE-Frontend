import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const AccountingDashboardView = dynamic(() =>
  import("@modules/mock-accounting").then((m) => ({ default: m.AccountingDashboardView }))
);

export const metadata: Metadata = {
  title: "Accounting | NEXORA",
  description: "Financial Accounting Module",
};

export default function AccountingPage() {
  return (
    <main>
      <ModuleErrorBoundary moduleName="Accounting">
        <AccountingDashboardView />
      </ModuleErrorBoundary>
    </main>
  );
}
