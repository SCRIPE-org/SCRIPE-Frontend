import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const EditionComparisonView = dynamic(
  () =>
    import(
      "@modules/entitlements/editions/src/presentation/views/EditionComparisonView"
    ).then((m) => ({
      default: m.EditionComparisonView,
    }))
);

export const metadata: Metadata = {
  title: "Compare Editions | NEXORA",
  description: "Side-by-side comparison of platform editions and their feature allocations",
};

export default function EditionComparisonPage() {
  return (
    <main>
      <ModuleErrorBoundary moduleName="Edition Comparison">
        <EditionComparisonView />
      </ModuleErrorBoundary>
    </main>
  );
}
