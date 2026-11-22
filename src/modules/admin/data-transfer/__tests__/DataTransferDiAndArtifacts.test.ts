import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import type { IApiService } from "@core/interfaces/api.interface";

const appStoreState: {
  tenantCode: string | null;
  user: { id?: string; tenantId?: string | null } | null;
} = {
  tenantCode: "ahly-sc",
  user: { id: "user-1", tenantId: "tenant-1" },
};

vi.mock("@core/store/useAppStore", () => ({
  useAppStore: {
    getState: () => appStoreState,
  },
}));

vi.mock("@core/di", () => ({
  container: {
    apiService: {} as IApiService,
  },
}));

import { resolveDataTransferContextKey } from "../di";
import { DataTransferJob } from "../jobs/src/domain/entities/DataTransferJob";
import { triggerJobArtifactDownload } from "../jobs/src/presentation/utils/download-job-artifact";

function makeJob(overrides: Partial<ConstructorParameters<typeof DataTransferJob>[0]> = {}) {
  return new DataTransferJob({
    jobId: "9b2a4f10-8a73-4f10-bc9e-6c7a8d9e1021",
    kind: "Export",
    entityKey: "crm.lead",
    status: "Completed",
    totalRows: 10,
    processedRows: 10,
    progressPercent: 100,
    validRows: 10,
    committedRows: 10,
    createdRows: 0,
    updatedRows: 0,
    rejectedRows: 0,
    hasRejectedWorkbook: false,
    hasExportWorkbook: true,
    createdAt: "2026-11-10T10:00:00.000Z",
    expiresAtUtc: "2026-11-17T10:00:00.000Z",
    ...overrides,
  });
}

describe("resolveDataTransferContextKey", () => {
  beforeEach(() => {
    appStoreState.tenantCode = "ahly-sc";
    appStoreState.user = { id: "user-1", tenantId: "tenant-1" };
  });

  it("produces distinct tenant+user keys across tenant switches and users", () => {
    const apiTenantA = { getTenantContext: () => "tenant-a" } as unknown as IApiService;
    const apiTenantB = { getTenantContext: () => "tenant-b" } as unknown as IApiService;

    const keyAUser1 = resolveDataTransferContextKey(apiTenantA);
    const keyBUser1 = resolveDataTransferContextKey(apiTenantB);

    appStoreState.user = { id: "user-2", tenantId: "tenant-1" };
    const keyAUser2 = resolveDataTransferContextKey(apiTenantA);

    expect(keyAUser1).toBe("tenant-a:user-1");
    expect(keyBUser1).toBe("tenant-b:user-1");
    expect(keyAUser2).toBe("tenant-a:user-2");
    expect(new Set([keyAUser1, keyBUser1, keyAUser2]).size).toBe(3);
  });

  it("falls back to store user tenantId, tenantCode, and anon user when api tenant context is absent", () => {
    const apiNoTenant = { getTenantContext: () => null } as unknown as IApiService;

    expect(resolveDataTransferContextKey(apiNoTenant)).toBe("tenant-1:user-1");

    appStoreState.user = { id: "user-9", tenantId: null };
    expect(resolveDataTransferContextKey(apiNoTenant)).toBe("ahly-sc:user-9");

    appStoreState.tenantCode = null;
    appStoreState.user = null;
    expect(resolveDataTransferContextKey(apiNoTenant)).toBe("platform:anon");
  });
});

describe("triggerJobArtifactDownload", () => {
  const originalCreateObjectUrl = URL.createObjectURL;
  const originalRevokeObjectUrl = URL.revokeObjectURL;

  beforeEach(() => {
    vi.useFakeTimers();
    URL.createObjectURL = vi.fn(() => "blob:mock-artifact");
    URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    vi.useRealTimers();
    URL.createObjectURL = originalCreateObjectUrl;
    URL.revokeObjectURL = originalRevokeObjectUrl;
    vi.restoreAllMocks();
  });

  it.each([
    ["tsv", "tsv"],
    ["csv", "csv"],
    ["xlsx", "xlsx"],
    [undefined, "xlsx"],
  ] as const)(
    "downloads export artifact with .%s extension matching fileFormat=%s",
    (fileFormat, expectedExt) => {
      const anchor = document.createElement("a");
      const clickSpy = vi.spyOn(anchor, "click").mockImplementation(() => {});
      vi.spyOn(document, "createElement").mockReturnValue(anchor);

      triggerJobArtifactDownload(
        new Blob(["col1\tcol2"]),
        makeJob({ fileFormat }),
        "export"
      );

      expect(anchor.download).toBe(`crm.lead-export-export-9b2a4f10.${expectedExt}`);
      expect(clickSpy).toHaveBeenCalledTimes(1);
      expect(URL.revokeObjectURL).not.toHaveBeenCalled();

      vi.runAllTimers();
      expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:mock-artifact");
    }
  );

  it("always downloads rejected rows report as .xlsx even when job.fileFormat is tsv", () => {
    const anchor = document.createElement("a");
    vi.spyOn(anchor, "click").mockImplementation(() => {});
    vi.spyOn(document, "createElement").mockReturnValue(anchor);

    triggerJobArtifactDownload(
      new Blob(["rejected"]),
      makeJob({ kind: "Import", fileFormat: "tsv" }),
      "rejected"
    );

    expect(anchor.download).toBe("crm.lead-import-rejected-9b2a4f10.xlsx");
  });
});
