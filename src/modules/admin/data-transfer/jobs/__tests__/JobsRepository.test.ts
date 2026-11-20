import { describe, expect, it, vi } from "vitest";
import { JobsRepository } from "../src/data/repositories/JobsRepository";
import type { IJobsService } from "../src/domain/interfaces/IJobsService";
import type { DataTransferJobModel } from "../src/data/models/DataTransferJobModel";

describe("JobsRepository", () => {
  const sampleJobModel: DataTransferJobModel = {
    id: "job-100",
    kind: "Export",
    entityKey: "CrmDeal",
    isMultiSheet: false,
    importMode: "AppendOnly",
    onboardingMode: "SkipExisting",
    fileFormat: "xlsx",
    status: "Completed",
    totalRows: 100,
    processedRows: 100,
    progressPercent: 100,
    validRows: 100,
    committedRows: 100,
    createdRows: 100,
    updatedRows: 0,
    rejectedRows: 0,
    hasRejectedWorkbook: false,
    hasExportWorkbook: true,
    createdAt: "2026-11-14T00:00:00Z",
    expiresAtUtc: "2026-11-21T00:00:00Z",
  };

  const mockService: IJobsService = {
    fetchJobs: vi.fn().mockResolvedValue({
      items: [sampleJobModel],
      totalCount: 1,
      pageNumber: 1,
      pageSize: 20,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    }),
    fetchJob: vi.fn().mockResolvedValue(sampleJobModel),
    cancelJob: vi.fn().mockResolvedValue({
      ...sampleJobModel,
      status: "Cancelled",
    }),
    fetchArtifactBlob: vi.fn().mockResolvedValue(new Blob(["mock-artifact"])),
  };

  it("fetches and maps paginated jobs", async () => {
    const repo = new JobsRepository(mockService);
    const result = await repo.getJobs({ page: 1, pageSize: 20 });

    expect(mockService.fetchJobs).toHaveBeenCalledWith({ page: 1, pageSize: 20 }, undefined);
    expect(result.items).toHaveLength(1);
    expect(result.items[0].jobId).toBe("job-100");
    expect(result.items[0].status).toBe("Completed");
    expect(result.items[0].hasExportWorkbook).toBe(true);
  });

  it("fetches single job by ID", async () => {
    const repo = new JobsRepository(mockService);
    const job = await repo.getJobById("job-100");

    expect(mockService.fetchJob).toHaveBeenCalledWith("job-100", undefined);
    expect(job.jobId).toBe("job-100");
  });

  it("cancels job and returns updated domain entity", async () => {
    const repo = new JobsRepository(mockService);
    const cancelled = await repo.cancelJob("job-100");

    expect(mockService.cancelJob).toHaveBeenCalledWith("job-100", undefined);
    expect(cancelled.status).toBe("Cancelled");
  });

  it("downloads artifact blob", async () => {
    const repo = new JobsRepository(mockService);
    const blob = await repo.downloadArtifact("job-100", "export");

    expect(mockService.fetchArtifactBlob).toHaveBeenCalledWith("job-100", "export", undefined);
    expect(blob).toBeInstanceOf(Blob);
  });

  it("normalizes undefined pagination totals and data envelopes safely to finite numbers", async () => {
    const wrappedService: IJobsService = {
      ...mockService,
      fetchJobs: vi.fn().mockResolvedValue({
        data: {
          items: [sampleJobModel],
          totalCount: undefined,
          pageNumber: Number.NaN,
          pageSize: undefined,
          totalPages: undefined,
        },
      }),
    };
    const repo = new JobsRepository(wrappedService);
    const result = await repo.getJobs({ page: 1, pageSize: 20 });

    expect(result.items).toHaveLength(1);
    expect(result.totalCount).toBe(1);
    expect(result.pageNumber).toBe(1);
    expect(result.pageSize).toBe(20);
    expect(result.totalPages).toBe(1);
  });
});
