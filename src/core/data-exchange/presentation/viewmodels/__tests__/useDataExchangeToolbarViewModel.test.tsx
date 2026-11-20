import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { DATA_TRANSFER_PERMISSIONS } from "@core/common/types/permissions";
import { DownloadInterceptedError } from "@core/errors/download-intercepted";
import { useDataExchangeToolbarViewModel } from "../useDataExchangeToolbarViewModel";

let mockActiveTenantId: string | null = "tenant-a";
let mockPermissions = new Set<string>([
  DATA_TRANSFER_PERMISSIONS.DATATRANSFER_JOBS_VIEW,
  DATA_TRANSFER_PERMISSIONS.DATATRANSFER_JOBS_MANAGE,
  DATA_TRANSFER_PERMISSIONS.DATATRANSFER_MIGRATIONS_EXECUTE,
]);

const listEntitiesMock = vi.fn();
const getEntityDescriptorMock = vi.fn();
const downloadTemplateFileMock = vi.fn();
const toastErrorMock = vi.fn();

vi.mock("@core/hooks/useAdminContext", () => ({
  useAdminContext: () => ({ activeTenantId: mockActiveTenantId }),
}));

vi.mock("@core/providers/permission-provider", () => ({
  usePermissions: () => ({
    hasPermission: (p: string) => mockPermissions.has(p),
  }),
}));

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    language: "en",
    direction: "ltr" as const,
    t: (k: string) => k,
  }),
}));

vi.mock("@core/di", () => ({
  getCoreContainer: () => ({
    dataExchangeRepository: {
      listEntities: listEntitiesMock,
      getEntityDescriptor: getEntityDescriptorMock,
      downloadTemplateFile: downloadTemplateFileMock,
    },
  }),
}));

vi.mock("@core/ui/sileo-toast", () => ({
  toast: {
    error: (...args: unknown[]) => toastErrorMock(...args),
  },
}));

function makeDescriptor(entityKey: string) {
  return {
    descriptor: {
      entityKey,
      owningModule: "CRM",
      displayNameEn: entityKey,
      displayNameAr: entityKey,
      supportedModes: ["Upsert"],
      relatedMultiSheetEntityKeys: [entityKey, "crm.contact"],
      columns: [],
    },
    quota: {
      allowed: true,
      planCode: "PRO",
      remainingRecords: 100,
      usedRecords: 0,
      maxRecords: 100,
    },
    canImport: true,
    canExport: true,
    isImportFeatureEnabled: true,
    isExportFeatureEnabled: true,
    restrictedFieldKeys: [],
  };
}

describe("useDataExchangeToolbarViewModel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockActiveTenantId = "tenant-a";
    mockPermissions = new Set([
      DATA_TRANSFER_PERMISSIONS.DATATRANSFER_JOBS_VIEW,
      DATA_TRANSFER_PERMISSIONS.DATATRANSFER_JOBS_MANAGE,
      DATA_TRANSFER_PERMISSIONS.DATATRANSFER_MIGRATIONS_EXECUTE,
    ]);
  });

  it("matches entityKey case-insensitively and scopes/resets descriptor across tenant switches", async () => {
    listEntitiesMock.mockResolvedValue([{ entityKey: "crm.lead" }]);
    getEntityDescriptorMock.mockResolvedValue(makeDescriptor("crm.lead"));

    const { result, rerender } = renderHook(
      ({ key }) => useDataExchangeToolbarViewModel({ entityKey: key }),
      { initialProps: { key: "CRM.LEAD" } }
    );

    await waitFor(() => {
      expect(result.current.isVisible).toBe(true);
      expect(result.current.showImport).toBe(true);
      expect(result.current.showMultiSheet).toBe(true);
    });

    // Switch tenant and block until new entity catalog resolves
    let resolveTenantB!: (v: unknown[]) => void;
    mockActiveTenantId = "tenant-b";
    listEntitiesMock.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveTenantB = resolve;
        })
    );

    rerender({ key: "CRM.LEAD" });
    // Old tenant descriptor must NOT remain visible while tenant-b loads
    expect(result.current.effectiveDescriptor).toBeNull();
    expect(result.current.isVisible).toBe(false);

    await act(async () => {
      resolveTenantB([]);
    });
    await waitFor(() => {
      expect(listEntitiesMock).toHaveBeenCalledTimes(2);
      expect(result.current.isVisible).toBe(false);
    });
  });

  it("surfaces localized toast error when downloadTemplate fails, ignoring DownloadInterceptedError", async () => {
    listEntitiesMock.mockResolvedValue([{ entityKey: "crm.lead" }]);
    getEntityDescriptorMock.mockResolvedValue(makeDescriptor("crm.lead"));

    const { result } = renderHook(() =>
      useDataExchangeToolbarViewModel({ entityKey: "crm.lead" })
    );
    await waitFor(() => expect(result.current.isVisible).toBe(true));

    downloadTemplateFileMock.mockRejectedValueOnce({
      message: "HTTP 422",
      details: { message: "Template limit exceeded" },
    });
    await act(async () => {
      await result.current.downloadTemplate("csv");
    });

    expect(toastErrorMock).toHaveBeenCalledTimes(1);
    expect(toastErrorMock).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "dataExchange.errors.templateDownloadFailed",
        description: "Template limit exceeded",
      })
    );

    toastErrorMock.mockClear();
    downloadTemplateFileMock.mockRejectedValueOnce(new DownloadInterceptedError());
    await act(async () => {
      await result.current.downloadTemplate("xlsx");
    });
    expect(toastErrorMock).not.toHaveBeenCalled();
  });
});
