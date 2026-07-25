import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const ReportDetailView = dynamic(() =>
  import("@modules/compliance/reports").then((m) => ({ default: m.ReportDetailView }))
);

export const metadata: Metadata = {
  title: "Report Details",
  description: "View compliance report details",
};

interface ReportDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ReportDetailPage({ params }: ReportDetailPageProps) {
  const { id } = await params;
  return (
    <ModuleErrorBoundary moduleName="compliance.reportDetail">
      <ReportDetailView id={id} />
    </ModuleErrorBoundary>
  );
}
