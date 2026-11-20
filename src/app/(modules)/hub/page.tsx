import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const WorkspaceHubView = dynamic(() =>
  import("@modules/home").then((m) => ({ default: m.WorkspaceHubView }))
);

export const metadata: Metadata = {
  title: "Workspace Hub",
  description: "Select your workspace to continue",
};

/**
 * Hub page — Operational Personal Home & workspace picker inside unified NexusLayout.
 * Inherits DashboardLayout + NexusLayout from the (modules) route group.
 */
export default function HubPage() {
  return (
    <ModuleErrorBoundary moduleName="workspaceHub.hubTitle">
      <WorkspaceHubView />
    </ModuleErrorBoundary>
  );
}
