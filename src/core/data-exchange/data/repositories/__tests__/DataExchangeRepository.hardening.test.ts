import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  DataExchangeRepository,
  clearAllDataExchangeCaches,
} from "../DataExchangeRepository";
import type { IDataExchangeService } from "../../../domain/interfaces/IDataExchangeService";

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

describe("DataExchangeRepository hardening", () => {
  let service: IDataExchangeService;
  let currentContext: string;
  let repo: DataExchangeRepository;

  beforeEach(() => {
    vi.useFakeTimers();
    clearAllDataExchangeCaches();
    service = createMockService();
    currentContext = "tenant-a:user-1";
    repo = new DataExchangeRepository(service, () => currentContext);
  });

  afterEach(() => {
    clearAllDataExchangeCaches();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("caches negative 403/400 listEntities responses for 30s and clears on tenant switch", async () => {
    const err403 = Object.assign(new Error("Forbidden"), { status: 403 });
    vi.mocked(service.listEntities).mockRejectedValueOnce(err403);

    await expect(repo.listEntities()).rejects.toThrow("Forbidden");
    await expect(repo.listEntities()).rejects.toThrow("Forbidden");
    expect(service.listEntities).toHaveBeenCalledTimes(1);

    // Different tenant context gets a fresh attempt
    currentContext = "tenant-b:user-1";
    vi.mocked(service.listEntities).mockResolvedValueOnce([]);
    await expect(repo.listEntities()).resolves.toEqual([]);
    expect(service.listEntities).toHaveBeenCalledTimes(2);

    // Original tenant recovers after 30s TTL
    currentContext = "tenant-a:user-1";
    vi.advanceTimersByTime(31_000);
    vi.mocked(service.listEntities).mockResolvedValueOnce([]);
    await expect(repo.listEntities()).resolves.toEqual([]);
    expect(service.listEntities).toHaveBeenCalledTimes(3);
  });

  it("does not cache aborted or 500 errors in listEntities", async () => {
    const controller = new AbortController();
    controller.abort();
    const err400 = Object.assign(new Error("Aborted"), { status: 400 });
    vi.mocked(service.listEntities)
      .mockRejectedValueOnce(err400)
      .mockRejectedValueOnce(Object.assign(new Error("Server error"), { status: 500 }))
      .mockResolvedValueOnce([]);

    await expect(repo.listEntities(controller.signal)).rejects.toThrow("Aborted");
    await expect(repo.listEntities()).rejects.toThrow("Server error");
    await expect(repo.listEntities()).resolves.toEqual([]);
    expect(service.listEntities).toHaveBeenCalledTimes(3);
  });

  it("invalidates entitiesCache and all sheet descriptors when executeImport commits", async () => {
    vi.mocked(service.listEntities).mockResolvedValue([
      {
        entityKey: "crm.lead",
        owningModule: "CRM",
        displayNameEn: "Leads",
        displayNameAr: "العملاء المحتملون",
        descriptionEn: "Leads",
        descriptionAr: "العملاء المحتملون",
        supportsBulkAutoCreateLookup: false,
        supportsIdentityOnboardingModes: false,
        parentEntityKeys: [],
        canImport: true,
        canExport: true,
        isImportFeatureEnabled: true,
        isExportFeatureEnabled: true,
        supportedModes: ["Upsert"],
      },
    ]);
    vi.mocked(service.getEntityDescriptor).mockImplementation(async (key) => ({
      descriptor: {
        entityKey: key,
        owningModule: "CRM",
        displayNameEn: key,
        displayNameAr: key,
        descriptionEn: key,
        descriptionAr: key,
        requiredFeatureKey: "DataTransfer.Import",
        moduleImportFeatureKey: "CRM.Access",
        requiredImportPermission: "datatransfer.jobs.manage",
        requiredExportPermission: "datatransfer.jobs.manage",
        requiredCreatePermission: "crm.leads.create",
        requiredUpdatePermission: "crm.leads.update",
        requiredViewPermission: "crm.leads.view",
        quotaResourceType: null,
        supportsBulkAutoCreateLookup: false,
        supportsIdentityOnboardingModes: false,
        parentEntityKeys: [],
        supportedModes: ["Upsert"],
        columns: [],
      },
      quotaUsed: 0,
      quotaReserved: 0,
      quotaMaxLimit: 100,
      quotaRemainingSlots: 100,
      isQuotaEnforced: false,
      canImport: true,
      canExport: true,
      isImportFeatureEnabled: true,
      isExportFeatureEnabled: true,
      restrictedFieldKeys: [],
    }));
    vi.mocked(service.executeImport).mockResolvedValue({
      jobId: "job-1",
      status: "Completed",
      executedSynchronously: true,
      totalRows: 5,
      committedRows: 5,
      createdRows: 5,
      updatedRows: 0,
      rejectedRows: 0,
      cascadeDeferredRows: 0,
      hasRejectedWorkbook: false,
    });

    await repo.listEntities();
    await repo.getEntityDescriptor("crm.lead");
    await repo.getEntityDescriptor("crm.contact");

    await repo.executeImport({
      uploadId: "up-1",
      format: "xlsx",
      originalFileName: "leads.xlsx",
      entityKey: "crm.lead",
      isMultiSheet: true,
      mode: "Upsert",
      onboardingMode: "StagedPendingInvite",
      allowCreateMissingLookups: false,
      timeZoneId: "UTC",
      mappings: null,
      sheetMappings: [
        { sheetName: "Leads", entityKey: "crm.lead", mode: "Upsert", mappings: [] },
        { sheetName: "Contacts", entityKey: "crm.contact", mode: "Upsert", mappings: [] },
      ],
      runInBackground: false,
    });

    await repo.listEntities();
    await repo.getEntityDescriptor("crm.lead");
    await repo.getEntityDescriptor("crm.contact");

    expect(service.listEntities).toHaveBeenCalledTimes(2);
    expect(service.getEntityDescriptor).toHaveBeenCalledTimes(4);
  });

  it("derives dynamic artifact extension (.csv, .tsv, .xlsx) from Blob MIME type", async () => {
    const createObjectUrlSpy = vi.fn(() => "blob:mock-url");
    const revokeSpy = vi.fn();
    Object.defineProperty(URL, "createObjectURL", { value: createObjectUrlSpy, configurable: true });
    Object.defineProperty(URL, "revokeObjectURL", { value: revokeSpy, configurable: true });

    const createdAnchors: HTMLAnchorElement[] = [];
    const origCreateElement = document.createElement.bind(document);
    vi.spyOn(document, "createElement").mockImplementation(((tagName: string) => {
      const el = origCreateElement(tagName);
      if (tagName.toLowerCase() === "a") {
        vi.spyOn(el as HTMLAnchorElement, "click").mockImplementation(() => {});
        createdAnchors.push(el as HTMLAnchorElement);
      }
      return el;
    }) as typeof document.createElement);

    vi.mocked(service.downloadArtifact)
      .mockResolvedValueOnce(new Blob(["a\tb"], { type: "text/tab-separated-values" }))
      .mockResolvedValueOnce(new Blob(["a,b"], { type: "text/csv" }))
      .mockResolvedValueOnce(new Blob(["x"], { type: "application/octet-stream" }));

    await repo.downloadArtifactFile("12345678-aaaa", "export");
    await repo.downloadArtifactFile("12345678-bbbb", "export");
    await repo.downloadArtifactFile("12345678-cccc", "rejected");

    expect(createdAnchors[0].download).toBe("data-exchange-export-12345678.tsv");
    expect(createdAnchors[1].download).toBe("data-exchange-export-12345678.csv");
    expect(createdAnchors[2].download).toBe("data-exchange-rejected-12345678.xlsx");
  });
});
