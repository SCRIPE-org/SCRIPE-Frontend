import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const RecommendationRulesView = dynamic(() =>
  import("@modules/entitlements/recommendation-rules").then((m) => ({
    default: m.RecommendationRulesView,
  }))
);

export const metadata: Metadata = {
  title: "Recommendation Rules",
  description: "Configure the scoring rules that drive plan recommendations during signup",
};

export default function RecommendationRulesPage() {
  return (
    <ModuleErrorBoundary moduleName="entitlements.onboarding.rules.title">
      <RecommendationRulesView />
    </ModuleErrorBoundary>
  );
}
