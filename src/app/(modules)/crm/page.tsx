import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const CrmDashboardView = dynamic(() =>
  import("@modules/mock-crm").then((m) => ({ default: m.CrmDashboardView }))
);

export const metadata: Metadata = {
  title: "CRM | NEXORA",
  description: "Customer Relationship Management",
};

export default function CrmPage() {
  return (
    <main>
      <ModuleErrorBoundary moduleName="CRM">
        <CrmDashboardView />
      </ModuleErrorBoundary>
    </main>
  );
}
