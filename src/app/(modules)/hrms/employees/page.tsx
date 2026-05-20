import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const HrmsEmployeesView = dynamic(() =>
  import("@modules/mock-hrms").then((m) => ({ default: m.HrmsEmployeesView }))
);

export const metadata: Metadata = {
  title: "HRMS – Employees | NEXORA",
  description: "Employee management",
};

export default function HrmsEmployeesPage() {
  return (
    <main>
      <ModuleErrorBoundary moduleName="HRMS Employees">
        <HrmsEmployeesView />
      </ModuleErrorBoundary>
    </main>
  );
}
