import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const ConsentView = dynamic(() =>
  import("@modules/compliance/consent").then((m) => ({ default: m.ConsentView }))
);

export const metadata: Metadata = {
  title: "Consent Management | SCRIPE",
  description: "Manage data subject consent — grant, withdraw, and audit consent purposes",
};

export default function ComplianceConsentPage() {
  return (
    <main>
      <ModuleErrorBoundary moduleName="Consent Management">
        <ConsentView />
      </ModuleErrorBoundary>
    </main>
  );
}
