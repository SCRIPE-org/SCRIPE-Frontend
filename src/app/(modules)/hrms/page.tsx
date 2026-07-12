import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

// P5.4: Dynamic import with loading skeleton for code splitting
const HrmsListView = dynamic(() =>
  import("@modules/hrms/core/src/presentation/views/HrmsListView").then((m) => ({
    default: m.HrmsListView,
  }))
);

export const metadata: Metadata = {
  title: "Hrms | SCRIPE",
  description: "Manage Hrms",
};

export default function HrmsPage() {
  return (
    <main>
      <ModuleErrorBoundary moduleName="Hrms">
        <HrmsListView />
      </ModuleErrorBoundary>
    </main>
  );
}