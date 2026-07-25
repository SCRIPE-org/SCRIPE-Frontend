import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const DsrDetailView = dynamic(() =>
  import("@modules/compliance/dsr").then((m) => ({ default: m.DsrDetailView }))
);

export const metadata: Metadata = {
  title: "DSR Details",
  description: "View and process Data Subject Request details",
};

interface DsrDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function DsrDetailPage({ params }: DsrDetailPageProps) {
  const { id } = await params;
  return (
    <ModuleErrorBoundary moduleName="compliance.dsrDetailTitle">
      <DsrDetailView id={id} />
    </ModuleErrorBoundary>
  );
}
