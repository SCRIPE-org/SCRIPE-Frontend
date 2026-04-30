import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const FeatureDefinitionFormView = dynamic(
  () =>
    import("@modules/entitlements/tenant-plans").then((m) => ({
      default: m.FeatureDefinitionFormView,
    }))
);

export const metadata: Metadata = {
  title: "Create Feature Definition | NEXORA",
  description: "Create a new feature definition for use in tenant edition plans",
};

export default function CreateFeatureDefinitionPage() {
  return (
    <main>
      <ModuleErrorBoundary moduleName="Create Feature Definition">
        <FeatureDefinitionFormView />
      </ModuleErrorBoundary>
    </main>
  );
}
