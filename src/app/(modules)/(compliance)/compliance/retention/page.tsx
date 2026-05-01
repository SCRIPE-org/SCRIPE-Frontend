import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const RetentionView = dynamic(
  () => import("@modules/compliance/retention").then((m) => ({ default: m.RetentionView }))
);

export const metadata: Metadata = {
  title: "Retention Policies | NEXORA",
  description: "Manage data retention policies — configure retention periods, expiry actions, and scheduled execution",
};

export default function ComplianceRetentionPage() {
  return (
    <main>
      <ModuleErrorBoundary moduleName="Retention Policies">
        <RetentionView />
      </ModuleErrorBoundary>
    </main>
  );
}
