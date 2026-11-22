import { describe, expect, it } from "vitest";
import { DataTransferJobMapper } from "../src/data/mappers/DataTransferJobMapper";
import type { DataTransferJobModel } from "../src/data/models/DataTransferJobModel";

describe("DataTransferJobMapper", () => {
  const sampleJobModel: DataTransferJobModel = {
    id: "job-001-uuid",
    kind: "Import",
    entityKey: "CrmLead",
    isMultiSheet: false,
    importMode: "Insert",
    onboardingMode: "SkipExisting",
    fileFormat: "xlsx",
    originalFileName: "leads-batch-1.xlsx",
    status: "Running",
    totalRows: 500,
    processedRows: 250,
    progressPercent: 50,
    validRows: 240,
    committedRows: 240,
    createdRows: 240,
    updatedRows: 0,
    rejectedRows: 10,
    errorSummary: null,
    hasRejectedWorkbook: true,
    hasExportWorkbook: false,
    createdAt: "2026-11-14T00:00:00Z",
    startedAtUtc: "2026-11-14T00:01:00Z",
    completedAtUtc: null,
    expiresAtUtc: "2026-11-21T00:00:00Z",
  };

  it("maps API model to domain entity with full fidelity", () => {
    const job = DataTransferJobMapper.toDomain(sampleJobModel);

    expect(job.id).toBe("job-001-uuid");
    expect(job.jobId).toBe("job-001-uuid");
    expect(job.kind).toBe("Import");
    expect(job.entityKey).toBe("CrmLead");
    expect(job.status).toBe("Running");
    expect(job.isActive).toBe(true);
    expect(job.isTerminal).toBe(false);
    expect(job.totalRows).toBe(500);
    expect(job.processedRows).toBe(250);
    expect(job.progressPercent).toBe(50);
    expect(job.committedRows).toBe(240);
    expect(job.rejectedRows).toBe(10);
    expect(job.hasRejectedWorkbook).toBe(true);
  });

  it("maps domain entity back to API model", () => {
    const job = DataTransferJobMapper.toDomain(sampleJobModel);
    const model = DataTransferJobMapper.toModel(job);

    expect(model).toEqual(sampleJobModel);
  });

  it("correctly identifies terminal statuses", () => {
    const job = DataTransferJobMapper.toDomain({
      ...sampleJobModel,
      status: "Completed",
    });

    expect(job.isActive).toBe(false);
    expect(job.isTerminal).toBe(true);
  });

  it("supports immutable copyWith", () => {
    const job = DataTransferJobMapper.toDomain(sampleJobModel);
    const updated = job.copyWith({
      status: "Completed",
      processedRows: 500,
      progressPercent: 100,
    });

    expect(updated.status).toBe("Completed");
    expect(updated.processedRows).toBe(500);
    expect(updated.progressPercent).toBe(100);
    expect(job.status).toBe("Running");
  });
});
