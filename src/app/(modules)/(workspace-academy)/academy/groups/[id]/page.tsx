import { Metadata } from "next";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";
import { TrainingGroupDetailView } from "@modules/academy/groups/src/presentation/views/TrainingGroupDetailView";

export const metadata: Metadata = {
  title: "Academy Training Group Details & Rosters",
  description: "Operational squad cohort management, coach assignments, and governed group transfers.",
};

interface GroupDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function GroupDetailPage({ params }: GroupDetailPageProps) {
  const { id } = await params;
  return (
    <ModuleErrorBoundary moduleName="academy.groups.detail">
      <TrainingGroupDetailView groupId={id} />
    </ModuleErrorBoundary>
  );
}
