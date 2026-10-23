import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getVenueContainer } from "@modules/venue/di";
import { useVenueReportsViewModel } from "./useVenueReportsViewModel";

const { toastSuccess, toastError, translate } = vi.hoisted(() => ({
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
  translate: (key: string) => key,
}));

vi.mock("@modules/venue/di", () => ({ getVenueContainer: vi.fn() }));
vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({ t: translate, language: "en" }),
}));
vi.mock("@core/providers/tenant-context-provider", () => ({
  useTenantContext: () => ({ currentTenant: { id: "tenant-1", name: "Test tenant" } }),
}));
vi.mock("@core/hooks/use-enhanced-toast", () => ({
  useEnhancedToast: () => ({ success: toastSuccess, error: toastError }),
}));

function createContainer() {
  return {
    siteRepository: { getAll: vi.fn().mockResolvedValue({ items: [] }) },
    schedulableResourceRepository: { getAll: vi.fn().mockResolvedValue({ items: [] }) },
    customerRepository: {
      search: vi.fn().mockResolvedValue([]),
      create: vi
        .fn()
        .mockResolvedValueOnce({ id: "party-1", displayName: "Completed Customer" })
        .mockRejectedValueOnce(new Error("response lost after commit"))
        .mockResolvedValueOnce({ id: "party-2", displayName: "Retry Customer" }),
    },
    moneyRepository: {
      getInvoices: vi.fn().mockResolvedValue({ items: [] }),
      getSummary: vi.fn().mockResolvedValue({ items: [] }),
    },
  };
}

describe("useVenueReportsViewModel customer import retry", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("replays only failed customer rows with original keys and skips completed rows", async () => {
    const value = createContainer();
    vi.mocked(getVenueContainer).mockReturnValue(value as never);
    const { result } = renderHook(() => useVenueReportsViewModel());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    act(() =>
      result.current.handleFileSelect(
        "Name,Type\nCompleted Customer,Person\nRetry Customer,Person"
      )
    );
    await waitFor(() => expect(result.current.parsedTable).not.toBeNull());
    act(() => result.current.executeValidation());
    await waitFor(() => expect(result.current.validationReport?.canCommit).toBe(true));

    await act(async () => {
      await result.current.commitImport();
    });

    expect(result.current.importSummaryResult).toMatchObject({ successCount: 1, errorCount: 1 });
    expect(value.customerRepository.create).toHaveBeenCalledTimes(2);
    const completedRowOptions = value.customerRepository.create.mock.calls[0]?.[3];
    const failedRowOptions = value.customerRepository.create.mock.calls[1]?.[3];
    expect(completedRowOptions).toEqual({ idempotencyKey: expect.any(String) });
    expect(failedRowOptions).toEqual({ idempotencyKey: expect.any(String) });
    expect(failedRowOptions).not.toEqual(completedRowOptions);

    await act(async () => {
      await result.current.commitImport(true);
    });

    expect(value.customerRepository.create).toHaveBeenCalledTimes(3);
    expect(value.customerRepository.create.mock.calls[2]?.[3]).toEqual(failedRowOptions);
    expect(result.current.importSummaryResult).toMatchObject({ successCount: 2, errorCount: 0 });
    expect(toastSuccess).toHaveBeenCalled();
  });
});
