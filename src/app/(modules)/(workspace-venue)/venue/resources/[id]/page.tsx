import type { Metadata } from "next";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";
import { ResourceDetailView } from "@modules/venue/resources/src/presentation/views/ResourceDetailView";

export const metadata: Metadata = {
  title: "Court Details | SCRIPE Venue",
  description: "Operational space detail, working hours, booking slot, and pricing.",
};

export default async function ResourceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <ModuleErrorBoundary moduleName="resources.detail.title">
      <ResourceDetailView resourceId={id} />
    </ModuleErrorBoundary>
  );
}
