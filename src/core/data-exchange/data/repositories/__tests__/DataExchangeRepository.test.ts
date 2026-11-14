import { beforeEach, describe, expect, it, vi } from "vitest";
import { DataExchangeRepository } from "../DataExchangeRepository";
import type { IDataExchangeService } from "../../../domain/interfaces/IDataExchangeService";
import type {
  DataExchangeDescriptorResponseDto,
  DataExchangeExportRequestDto,
  DataTransferJobDto,
} from "../../../domain/types";

function createMockService(): IDataExchangeService {
  return {
    listEntities: vi.fn(),
    getEntityDescriptor: vi.fn(),
    downloadTemplate: vi.fn(),
    inspectUpload: vi.fn(),
    dryRun: vi.fn(),
    executeImport: vi.fn(),
    executeExport: vi.fn(),
    enqueueExport: vi.fn(),
    cancelJob: vi.fn(),
    listPresets: vi.fn(),
    savePreset: vi.fn(),
    deletePreset: vi.fn(),
    listJobs: vi.fn(),
    getJob: vi.fn(),
    downloadArtifact: vi.fn(),
  };
}

describe("DataExchangeRepository", () => {
  let service: IDataExchangeService;
  let repository: DataExchangeRepository;

  beforeEach(() => {
    service = createMockService();
    repository = new DataExchangeRepository(service);
    vi.clearAllMocks();
  });

  describe("getEntityDescriptor TTL cache", () => {
    it("caches entity descriptor for 30 seconds and avoids redundant service calls", async () => {
      const mockDescriptor: DataExchangeDescriptorResponseDto = {
        descriptor: {
          entityKey: "crm.lead",
          owningModule: "CRM",
          displayNameEn: "Leads",
          displayNameAr: "العملاء المحتملون",
          descriptionEn: "Lead entity",
          descriptionAr: "كيان العملاء المحتملين",
          requiredFeatureKey: "CRM.Enabled",
          moduleImportFeatureKey: "CRM.Import",
          requiredImportPermission: "crm.leads.import",
          requiredExportPermission: "crm.leads.export",
          requiredCreatePermission: "crm.leads.create",
          requiredUpdatePermission: "crm.leads.update",
          requiredViewPermission: "crm.leads.read",
          supportsBulkAutoCreateLookup: true,
          supportsIdentityOnboardingModes: false,
          supportedModes: ["Insert", "Update"],
          parentEntityKeys: [],
          columns: [],
        },
        isQuotaEnforced: false,
        isImportFeatureEnabled: true,
        isExportFeatureEnabled: true,
        canImport: true,
        canExport: true,
        restrictedFieldKeys: [],
      };

      vi.mocked(service.getEntityDescriptor).mockResolvedValue(mockDescriptor);

      // First call fetches from service
      const first = await repository.getEntityDescriptor("crm.lead");
      expect(first).toEqual(mockDescriptor);
      expect(service.getEntityDescriptor).toHaveBeenCalledTimes(1);

      // Second immediate call hits 30s in-memory TTL cache
      const second = await repository.getEntityDescriptor("crm.lead");
      expect(second).toEqual(mockDescriptor);
      expect(service.getEntityDescriptor).toHaveBeenCalledTimes(1);

      // Call for different entity key fetches from service
      await repository.getEntityDescriptor("crm.account");
      expect(service.getEntityDescriptor).toHaveBeenCalledTimes(2);
    });
  });

  describe("enqueueExport", () => {
    it("delegates enqueueExport call to service", async () => {
      const exportReq: DataExchangeExportRequestDto = {
        entityKey: "crm.lead",
        format: "xlsx",
        locale: "en",
      };

      const mockJob: DataTransferJobDto = {
        id: "job-export-1",
        kind: "Export",
        entityKey: "crm.lead",
        isMultiSheet: false,
        importMode: "Insert",
        onboardingMode: "Standard",
        fileFormat: "xlsx",
        originalFileName: "leads-export.xlsx",
        status: "Queued",
        totalRows: 0,
        processedRows: 0,
        progressPercent: 0,
        validRows: 0,
        committedRows: 0,
        createdRows: 0,
        updatedRows: 0,
        rejectedRows: 0,
        hasRejectedWorkbook: false,
        hasExportWorkbook: false,
        createdAt: new Date().toISOString(),
        expiresAtUtc: new Date().toISOString(),
      };

      vi.mocked(service.enqueueExport).mockResolvedValue(mockJob);

      const result = await repository.enqueueExport(exportReq);
      expect(result).toEqual(mockJob);
      expect(service.enqueueExport).toHaveBeenCalledWith(exportReq, undefined);
    });
  });

  describe("cancelJob", () => {
    it("delegates cancelJob call to service with jobId", async () => {
      const mockCancelledJob: DataTransferJobDto = {
        id: "job-cancel-1",
        kind: "Import",
        entityKey: "crm.lead",
        isMultiSheet: false,
        importMode: "Insert",
        onboardingMode: "Standard",
        fileFormat: "xlsx",
        originalFileName: "leads-import.xlsx",
        status: "Cancelled",
        totalRows: 50,
        processedRows: 20,
        progressPercent: 40,
        validRows: 20,
        committedRows: 20,
        createdRows: 20,
        updatedRows: 0,
        rejectedRows: 0,
        hasRejectedWorkbook: false,
        hasExportWorkbook: false,
        createdAt: new Date().toISOString(),
        expiresAtUtc: new Date().toISOString(),
      };

      vi.mocked(service.cancelJob).mockResolvedValue(mockCancelledJob);

      const result = await repository.cancelJob("job-cancel-1");
      expect(result).toEqual(mockCancelledJob);
      expect(service.cancelJob).toHaveBeenCalledWith("job-cancel-1", undefined);
    });
  });
});
