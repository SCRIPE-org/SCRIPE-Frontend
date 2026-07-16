import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const LeadsView = dynamic(() =>
  import("@modules/entitlements/leads").then((m) => ({
    default: m.LeadsView,
  }))
);

export const metadata: Metadata = {
  title: "Sales Leads | SCRIPE",
  description: "Manage platform sales leads and contact-sales inquiries",
};

export default function LeadsPage() {
  return (
    <main>
      <ModuleErrorBoundary moduleName="Sales Leads">
        <LeadsView />
      </ModuleErrorBoundary>
    </main>
  );
}
