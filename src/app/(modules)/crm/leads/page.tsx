import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const CrmLeadsView = dynamic(() =>
  import("@modules/mock-crm").then((m) => ({ default: m.CrmLeadsView }))
);

export const metadata: Metadata = {
  title: "CRM – Leads | SCRIPE",
  description: "Manage your sales pipeline",
};

export default function CrmLeadsPage() {
  return (
    <main>
      <ModuleErrorBoundary moduleName="CRM Leads">
        <CrmLeadsView />
      </ModuleErrorBoundary>
    </main>
  );
}
