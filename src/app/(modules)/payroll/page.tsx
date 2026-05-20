import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const PayrollDashboardView = dynamic(() =>
  import("@modules/mock-payroll").then((m) => ({ default: m.PayrollDashboardView }))
);

export const metadata: Metadata = {
  title: "Payroll | NEXORA",
  description: "Payroll Management System",
};

export default function PayrollPage() {
  return (
    <main>
      <ModuleErrorBoundary moduleName="Payroll">
        <PayrollDashboardView />
      </ModuleErrorBoundary>
    </main>
  );
}
