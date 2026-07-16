import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const ReportDetailView = dynamic(() =>
  import("@modules/compliance/reports").then((m) => ({ default: m.ReportDetailView }))
);

export const metadata: Metadata = {
  title: "Report Details | SCRIPE",
  description: "View compliance report details",
};

export default function ReportDetailPage({ params }: { params: { id: string } }) {
  return (
    <main>
      <ModuleErrorBoundary moduleName="Report Details">
        <ReportDetailView id={params.id} />
      </ModuleErrorBoundary>
    </main>
  );
}
