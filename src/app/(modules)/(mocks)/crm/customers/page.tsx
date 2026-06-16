import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const CrmCustomersView = dynamic(() =>
  import("@/modules/mocks/mock-crm").then((m) => ({ default: m.CrmCustomersView }))
);

export const metadata: Metadata = {
  title: "CRM – Customers | SCRIPE",
  description: "Manage your customer accounts",
};

export default function CrmCustomersPage() {
  return (
    <main>
      <ModuleErrorBoundary moduleName="CRM Customers">
        <CrmCustomersView />
      </ModuleErrorBoundary>
    </main>
  );
}
