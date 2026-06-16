import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const AccountingInvoicesView = dynamic(() =>
  import("@/modules/mocks/mock-accounting").then((m) => ({ default: m.AccountingInvoicesView }))
);

export const metadata: Metadata = {
  title: "Accounting – Invoices | SCRIPE",
  description: "Invoice management",
};

export default function AccountingInvoicesPage() {
  return (
    <main>
      <ModuleErrorBoundary moduleName="Accounting Invoices">
        <AccountingInvoicesView />
      </ModuleErrorBoundary>
    </main>
  );
}
