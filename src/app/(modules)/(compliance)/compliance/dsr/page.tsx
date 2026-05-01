import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const DsrView = dynamic(() =>
  import("@modules/compliance/dsr").then((m) => ({ default: m.DsrView }))
);

export const metadata: Metadata = {
  title: "Data Subject Requests | NEXORA",
  description: "Manage Data Subject Requests (DSR) — export, erasure, rectification, restriction",
};

export default function ComplianceDsrPage() {
  return (
    <main>
      <ModuleErrorBoundary moduleName="Data Subject Requests">
        <DsrView />
      </ModuleErrorBoundary>
    </main>
  );
}
