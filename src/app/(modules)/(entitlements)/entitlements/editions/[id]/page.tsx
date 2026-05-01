import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const EditionDetailView = dynamic(() =>
  import("@modules/entitlements/editions").then((m) => ({ default: m.EditionDetailView }))
);

export const metadata: Metadata = {
  title: "Edition Features | NEXORA",
  description: "Manage features and limits for this subscription edition",
};

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditionDetailPage({ params }: Props) {
  const { id } = await params;

  return (
    <main>
      <ModuleErrorBoundary moduleName="Edition Features Management">
        <EditionDetailView editionId={id} />
      </ModuleErrorBoundary>
    </main>
  );
}
