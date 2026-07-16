import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const RecommendationRulesView = dynamic(() =>
  import("@modules/entitlements/recommendation-rules").then((m) => ({
    default: m.RecommendationRulesView,
  }))
);

export const metadata: Metadata = {
  title: "Recommendation Rules | SCRIPE",
  description: "Configure the scoring rules that drive plan recommendations during signup",
};

export default function RecommendationRulesPage() {
  return (
    <main>
      <ModuleErrorBoundary moduleName="Recommendation Rules">
        <RecommendationRulesView />
      </ModuleErrorBoundary>
    </main>
  );
}
