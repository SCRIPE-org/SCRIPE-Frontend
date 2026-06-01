import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const DsrDetailView = dynamic(() =>
  import("@modules/compliance/dsr").then((m) => ({ default: m.DsrDetailView }))
);

export const metadata: Metadata = {
  title: "DSR Details | SCRIPE",
  description: "View and process Data Subject Request details",
};

export default function DsrDetailPage({ params }: { params: { id: string } }) {
  return (
    <main>
      <ModuleErrorBoundary moduleName="DSR Details">
        <DsrDetailView id={params.id} />
      </ModuleErrorBoundary>
    </main>
  );
}
