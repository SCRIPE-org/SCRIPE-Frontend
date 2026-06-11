import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const PayrollRunsView = dynamic(() =>
  import("@modules/mock-payroll").then((m) => ({ default: m.PayrollRunsView }))
);

export const metadata: Metadata = {
  title: "Payroll – Salary Slips | SCRIPE",
  description: "Salary slip management",
};

export default function PayrollSalaryPage() {
  return (
    <main>
      <ModuleErrorBoundary moduleName="Payroll Salary">
        <PayrollRunsView />
      </ModuleErrorBoundary>
    </main>
  );
}
