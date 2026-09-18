import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const PlatformHealthView = dynamic(() =>
  import("@modules/monitoring/platform-health").then((m) => ({ default: m.PlatformHealthView }))
);

export const metadata: Metadata = {
  title: "Platform Health & Observability",
  description: "Real-time CLR runtime telemetry, infrastructure latencies, and registered modules",
};

export default function PlatformHealthPage() {
  return (
    <ModuleErrorBoundary moduleName="platformHealth.title">
      <PlatformHealthView />
    </ModuleErrorBoundary>
  );
}
