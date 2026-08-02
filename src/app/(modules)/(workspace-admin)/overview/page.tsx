import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const HomeView = dynamic(() => import("@modules/home").then((m) => ({ default: m.HomeView })));

export const metadata: Metadata = {
  title: "Overview",
  description: "System overview with quick stats, navigation, and recent activity",
};

export default function OverviewPage() {
  return (
    <ModuleErrorBoundary moduleName="workspaceHub.title">
      <HomeView />
    </ModuleErrorBoundary>
  );
}
