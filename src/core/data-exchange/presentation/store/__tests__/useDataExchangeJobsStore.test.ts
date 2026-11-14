import { beforeEach, describe, expect, it } from "vitest";
import { useDataExchangeJobsStore } from "../useDataExchangeJobsStore";
import type { DataTransferJobDto } from "../../../domain/types";

function createJob(id: string, status: DataTransferJobDto["status"] = "Queued"): DataTransferJobDto {
  return {
    id,
    kind: "Export",
    entityKey: "crm.lead",
    isMultiSheet: false,
    importMode: "Insert",
    onboardingMode: "Standard",
    fileFormat: "xlsx",
    originalFileName: "leads-export.xlsx",
    status,
    totalRows: 100,
    processedRows: status === "Running" ? 50 : 0,
    progressPercent: status === "Running" ? 50 : 0,
    validRows: 100,
    committedRows: 0,
    createdRows: 0,
    updatedRows: 0,
    rejectedRows: 0,
    hasRejectedWorkbook: false,
    hasExportWorkbook: false,
    createdAt: new Date().toISOString(),
    expiresAtUtc: new Date().toISOString(),
  };
}

describe("useDataExchangeJobsStore", () => {
  beforeEach(() => {
    useDataExchangeJobsStore.setState({ jobs: [], isCollapsed: false });
  });

  it("tracks new jobs and prepends them to the jobs list", () => {
    const job1 = createJob("job-1");
    const job2 = createJob("job-2");

    useDataExchangeJobsStore.getState().trackJob(job1);
    expect(useDataExchangeJobsStore.getState().jobs).toHaveLength(1);
    expect(useDataExchangeJobsStore.getState().jobs[0].id).toBe("job-1");

    useDataExchangeJobsStore.getState().trackJob(job2);
    expect(useDataExchangeJobsStore.getState().jobs).toHaveLength(2);
    expect(useDataExchangeJobsStore.getState().jobs[0].id).toBe("job-2");
  });

  it("updates existing job on trackJob and upsertJob", () => {
    const job = createJob("job-1", "Queued");
    useDataExchangeJobsStore.getState().trackJob(job);

    useDataExchangeJobsStore.getState().upsertJob({
      ...job,
      status: "Running",
      processedRows: 45,
    });

    const jobs = useDataExchangeJobsStore.getState().jobs;
    expect(jobs).toHaveLength(1);
    expect(jobs[0].status).toBe("Running");
    expect(jobs[0].processedRows).toBe(45);
  });

  it("dismisses job by id", () => {
    const job1 = createJob("job-1");
    const job2 = createJob("job-2");
    useDataExchangeJobsStore.setState({ jobs: [job1, job2], isCollapsed: false });

    useDataExchangeJobsStore.getState().dismissJob("job-1");
    const jobs = useDataExchangeJobsStore.getState().jobs;
    expect(jobs).toHaveLength(1);
    expect(jobs[0].id).toBe("job-2");
  });

  it("clears finished jobs while preserving queued and running jobs", () => {
    const queued = createJob("job-queued", "Queued");
    const running = createJob("job-running", "Running");
    const completed = createJob("job-completed", "Completed");
    const failed = createJob("job-failed", "Failed");
    const cancelled = createJob("job-cancelled", "Cancelled");

    useDataExchangeJobsStore.setState({
      jobs: [queued, running, completed, failed, cancelled],
      isCollapsed: false,
    });

    useDataExchangeJobsStore.getState().clearFinished();
    const remaining = useDataExchangeJobsStore.getState().jobs;
    expect(remaining.map((j) => j.id)).toEqual(["job-queued", "job-running"]);
  });

  it("toggles and sets collapsed state", () => {
    expect(useDataExchangeJobsStore.getState().isCollapsed).toBe(false);

    useDataExchangeJobsStore.getState().toggleCollapsed();
    expect(useDataExchangeJobsStore.getState().isCollapsed).toBe(true);

    useDataExchangeJobsStore.getState().setCollapsed(false);
    expect(useDataExchangeJobsStore.getState().isCollapsed).toBe(false);
  });
});
