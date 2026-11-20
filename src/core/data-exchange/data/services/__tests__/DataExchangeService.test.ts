import { describe, it, expect, vi, beforeEach } from "vitest";
import type { IApiService } from "@core/interfaces/api.interface";
import { DataExchangeService } from "../DataExchangeService";
import { DATA_EXCHANGE_ENDPOINTS } from "../data-exchange.endpoints";

function createMockApiService(): IApiService {
  return {
    get: vi.fn(),
    getBlob: vi.fn(),
    postBlob: vi.fn(),
    getPublic: vi.fn(),
    post: vi.fn(),
    postWithRetry: vi.fn(),
    postPublic: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    upload: vi.fn(),
    setAuthToken: vi.fn(),
    clearAuthToken: vi.fn(),
    setTenantContext: vi.fn(),
    getTenantContext: vi.fn(() => null),
    setUnauthorizedCallback: vi.fn(),
    setForbiddenCallback: vi.fn(),
  } as unknown as IApiService;
}

describe("DataExchangeService", () => {
  let apiService: IApiService;
  let service: DataExchangeService;
  let controller: AbortController;

  beforeEach(() => {
    apiService = createMockApiService();
    service = new DataExchangeService(apiService);
    controller = new AbortController();
  });

  it("requests entity catalog and descriptors with AbortSignal forwarding", async () => {
    vi.mocked(apiService.get).mockResolvedValueOnce([]).mockResolvedValueOnce({ descriptor: {} });

    await service.listEntities(controller.signal);
    expect(apiService.get).toHaveBeenNthCalledWith(
      1,
      DATA_EXCHANGE_ENDPOINTS.ENTITIES,
      undefined,
      controller.signal
    );

    await service.getEntityDescriptor("crm.lead", controller.signal);
    expect(apiService.get).toHaveBeenNthCalledWith(
      2,
      DATA_EXCHANGE_ENDPOINTS.DESCRIPTOR("crm.lead"),
      undefined,
      controller.signal
    );
  });

  it("builds template URL with defaults and multi-sheet entityKeys", async () => {
    const blob = new Blob(["xlsx"]);
    vi.mocked(apiService.getBlob).mockResolvedValue(blob);

    const res1 = await service.downloadTemplate({ entityKey: "crm.lead" }, controller.signal);
    expect(res1).toBe(blob);
    const url1 = vi.mocked(apiService.getBlob).mock.calls[0][0];
    expect(url1).toContain(DATA_EXCHANGE_ENDPOINTS.TEMPLATE);
    expect(url1).toContain("entityKey=crm.lead");
    expect(url1).toContain("format=xlsx");
    expect(url1).toContain("locale=en");
    expect(url1).toContain("multiSheet=false");
    expect(url1).not.toContain("entityKeys=");

    await service.downloadTemplate(
      {
        entityKey: "party.person",
        format: "csv",
        locale: "ar",
        multiSheet: true,
        entityKeys: ["party.person", "party.contact-point"],
      },
      controller.signal
    );
    const url2 = vi.mocked(apiService.getBlob).mock.calls[1][0];
    expect(url2).toContain("format=csv");
    expect(url2).toContain("locale=ar");
    expect(url2).toContain("multiSheet=true");
    expect(url2).toContain("entityKeys=party.person%2Cparty.contact-point");
    expect(vi.mocked(apiService.getBlob).mock.calls[1][1]).toBe(controller.signal);
  });

  it("uploads inspect file as FormData via postWithRetry with idempotencyKey", async () => {
    const file = new File(["email\na@b.com"], "leads.csv", { type: "text/csv" });
    vi.mocked(apiService.postWithRetry!).mockResolvedValue({ sheets: [] });

    await service.inspectUpload("crm.lead", file, true, controller.signal);

    expect(apiService.postWithRetry).toHaveBeenCalledTimes(1);
    const [endpoint, body, signal, options] = vi.mocked(apiService.postWithRetry!).mock.calls[0];
    expect(endpoint).toBe(DATA_EXCHANGE_ENDPOINTS.INSPECT);
    expect(signal).toBe(controller.signal);
    expect(options?.idempotencyKey).toMatch(/^[0-9a-f-]{8,}|dx-/);
    expect(body).toBeInstanceOf(FormData);
    const fd = body as FormData;
    expect(fd.get("entityKey")).toBe("crm.lead");
    expect(fd.get("multiSheet")).toBe("true");
    expect(fd.get("file")).toBe(file);
  });

  it("posts dry-run, single-shot executeImport (IContainsSecretsInResponse), export, enqueueExport, and cancelJob", async () => {
    const blob = new Blob(["csv"]);
    vi.mocked(apiService.post).mockResolvedValue({ ok: true });
    vi.mocked(apiService.postWithRetry!).mockResolvedValue({ ok: true });
    vi.mocked(apiService.postBlob).mockResolvedValue(blob);

    const dryRunReq = { entityKey: "crm.lead" } as never;
    await service.dryRun(dryRunReq, controller.signal);
    expect(apiService.post).toHaveBeenCalledWith(
      DATA_EXCHANGE_ENDPOINTS.DRY_RUN,
      dryRunReq,
      controller.signal
    );

    const importReq = { entityKey: "crm.lead" } as never;
    await service.executeImport(importReq, controller.signal);
    expect(apiService.post).toHaveBeenCalledWith(
      DATA_EXCHANGE_ENDPOINTS.IMPORT,
      importReq,
      controller.signal,
      { idempotencyKey: expect.any(String) }
    );
    expect(apiService.postWithRetry).not.toHaveBeenCalledWith(
      DATA_EXCHANGE_ENDPOINTS.IMPORT,
      expect.anything(),
      expect.anything(),
      expect.anything()
    );

    const exportReq = { entityKey: "crm.lead", format: "tsv" } as never;
    const exported = await service.executeExport(exportReq, controller.signal);
    expect(exported).toBe(blob);
    expect(apiService.postBlob).toHaveBeenCalledWith(
      DATA_EXCHANGE_ENDPOINTS.EXPORT,
      exportReq,
      controller.signal
    );

    await service.enqueueExport(exportReq, controller.signal);
    expect(apiService.postWithRetry).toHaveBeenCalledWith(
      DATA_EXCHANGE_ENDPOINTS.EXPORT_JOBS,
      exportReq,
      controller.signal,
      { idempotencyKey: expect.any(String) }
    );

    await service.cancelJob("job-42", controller.signal);
    expect(apiService.postWithRetry).toHaveBeenCalledWith(
      DATA_EXCHANGE_ENDPOINTS.CANCEL_JOB("job-42"),
      {},
      controller.signal,
      { idempotencyKey: expect.any(String) }
    );
  });

  it("handles presets, jobs, and artifact downloads with idempotency keys on preset mutations", async () => {
    const artifactBlob = new Blob(["data"]);
    vi.mocked(apiService.get).mockResolvedValue({});
    vi.mocked(apiService.postWithRetry!).mockResolvedValue({ id: "p-1" });
    vi.mocked(apiService.delete).mockResolvedValue(undefined);
    vi.mocked(apiService.getBlob).mockResolvedValue(artifactBlob);

    await service.listPresets(undefined, controller.signal);
    expect(apiService.get).toHaveBeenNthCalledWith(
      1,
      DATA_EXCHANGE_ENDPOINTS.PRESETS,
      undefined,
      controller.signal
    );

    await service.listPresets("crm.lead", controller.signal);
    expect(apiService.get).toHaveBeenNthCalledWith(
      2,
      DATA_EXCHANGE_ENDPOINTS.PRESETS,
      { entityKey: "crm.lead" },
      controller.signal
    );

    const presetReq = { entityKey: "crm.lead", name: "Default" } as never;
    await service.savePreset(presetReq, controller.signal);
    expect(apiService.postWithRetry).toHaveBeenCalledWith(
      DATA_EXCHANGE_ENDPOINTS.PRESETS,
      presetReq,
      controller.signal,
      { idempotencyKey: expect.any(String) }
    );

    await service.deletePreset("p-1", controller.signal);
    expect(apiService.delete).toHaveBeenCalledWith(
      DATA_EXCHANGE_ENDPOINTS.PRESET_BY_ID("p-1"),
      controller.signal,
      { idempotencyKey: expect.any(String) }
    );

    await service.listJobs(2, 25, undefined, controller.signal);
    expect(apiService.get).toHaveBeenNthCalledWith(
      3,
      DATA_EXCHANGE_ENDPOINTS.JOBS,
      { page: 2, pageSize: 25 },
      controller.signal
    );

    await service.listJobs(1, 10, "crm.lead", controller.signal);
    expect(apiService.get).toHaveBeenNthCalledWith(
      4,
      DATA_EXCHANGE_ENDPOINTS.JOBS,
      { page: 1, pageSize: 10, entityKey: "crm.lead" },
      controller.signal
    );

    await service.getJob("job-99", controller.signal);
    expect(apiService.get).toHaveBeenNthCalledWith(
      5,
      DATA_EXCHANGE_ENDPOINTS.JOB_BY_ID("job-99"),
      undefined,
      controller.signal
    );

    const dl = await service.downloadArtifact("job-99", "rejected", controller.signal);
    expect(dl).toBe(artifactBlob);
    expect(apiService.getBlob).toHaveBeenCalledWith(
      DATA_EXCHANGE_ENDPOINTS.DOWNLOAD_ARTIFACT("job-99", "rejected"),
      controller.signal
    );
  });
});
