import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const OnboardingQuestionsView = dynamic(() =>
  import("@modules/entitlements/onboarding-questions").then((m) => ({
    default: m.OnboardingQuestionsView,
  }))
);

export const metadata: Metadata = {
  title: "Onboarding Questions",
  description: "Manage the signup intelligence engine questions and answer options",
};

export default function OnboardingQuestionsPage() {
  return (
    <ModuleErrorBoundary moduleName="entitlements.onboarding.questions.title">
      <OnboardingQuestionsView />
    </ModuleErrorBoundary>
  );
}
