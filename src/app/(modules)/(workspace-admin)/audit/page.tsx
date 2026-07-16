import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const AuditView = dynamic(() =>
  import("@modules/monitoring/audit").then((m) => ({ default: m.AuditView }))
);

export const metadata: Metadata = {
  title: "Audit Log | SCRIPE",
  description: "View and search the complete audit trail of all system events",
};

export default function AuditPage() {
  return (
    <main>
      <ModuleErrorBoundary moduleName="Audit Log">
        <AuditView />
      </ModuleErrorBoundary>
    </main>
  );
}
