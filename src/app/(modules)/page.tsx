import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const WorkspaceHubView = dynamic(
  () => import("@modules/home").then((m) => ({ default: m.WorkspaceHubView }))
);

export const metadata: Metadata = {
  title: "Workspace Hub | NEXORA",
  description: "Choose your workspace to get started",
};

export default function HomePage() {
  return (
    <main>
      <ModuleErrorBoundary moduleName="Workspace Hub">
        <WorkspaceHubView />
      </ModuleErrorBoundary>
    </main>
  );
}
