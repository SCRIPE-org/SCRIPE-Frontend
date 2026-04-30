import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const EditionOverviewView = dynamic(
  () => import("@modules/entitlements/editions").then((m) => ({ default: m.EditionOverviewView }))
);

export const metadata: Metadata = {
  title: "Edition Overview | NEXORA",
  description: "View the complete configuration of this subscription edition",
};

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditionOverviewPage({ params }: Props) {
  const { id } = await params;

  return (
    <main>
      <ModuleErrorBoundary moduleName="Edition Overview">
        <EditionOverviewView editionId={id} />
      </ModuleErrorBoundary>
    </main>
  );
}
