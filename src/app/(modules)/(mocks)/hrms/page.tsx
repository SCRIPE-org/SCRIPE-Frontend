import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const HrmsDashboardView = dynamic(() =>
  import("@/modules/mocks/mock-hrms").then((m) => ({ default: m.HrmsDashboardView }))
);

export const metadata: Metadata = {
  title: "HRMS | SCRIPE",
  description: "Human Resource Management System",
};

export default function HrmsPage() {
  return (
    <main>
      <ModuleErrorBoundary moduleName="HRMS">
        <HrmsDashboardView />
      </ModuleErrorBoundary>
    </main>
  );
}
