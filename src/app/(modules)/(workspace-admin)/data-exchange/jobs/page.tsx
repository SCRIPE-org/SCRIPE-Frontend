import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const JobsExecutionView = dynamic(() =>
  import("@modules/data-transfer").then((m) => ({ default: m.JobsExecutionView }))
);

export const metadata: Metadata = {
  title: "SCRIPE Data Transfer Jobs & Executions",
  description:
    "Real-time monitoring and artifact management for background data transfer executions",
};

/**
 * Route handler for /data-exchange/jobs rendering the Jobs Execution View.
 */
export default function DataExchangeJobsPage() {
  return (
    <ModuleErrorBoundary moduleName="adminDataTransferJobs.title">
      <JobsExecutionView />
    </ModuleErrorBoundary>
  );
}
