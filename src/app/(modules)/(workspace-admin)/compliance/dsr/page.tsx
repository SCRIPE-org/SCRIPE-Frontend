import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const DsrView = dynamic(() =>
  import("@modules/compliance/dsr").then((m) => ({ default: m.DsrView }))
);

export const metadata: Metadata = {
  title: "Data Subject Requests",
  description: "Manage Data Subject Requests (DSR) — export, erasure, rectification, restriction",
};

export default function ComplianceDsrPage() {
  return (
    <ModuleErrorBoundary moduleName="compliance.dsrTitle">
      <DsrView />
    </ModuleErrorBoundary>
  );
}
