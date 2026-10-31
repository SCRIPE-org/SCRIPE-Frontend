import type { Metadata } from "next";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";
import { CrmOverviewView } from "@modules/crm";

export const metadata: Metadata = {
  title: "CRM Command Center",
  description:
    "Enterprise sports operations CRM, deals pipeline, party verification gate, and commercial account management.",
};

export default function CrmPage() {
  return (
    <ModuleErrorBoundary moduleName="crm.title">
      <CrmOverviewView />
    </ModuleErrorBoundary>
  );
}
