import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, fireEvent, render, renderHook, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { IDataExchangeRepository } from "@core/data-exchange/domain/interfaces/IDataExchangeRepository";
import type { DataExchangeEntitySummaryDto } from "@core/data-exchange/domain/types";
import type { PagedResult } from "@core/interfaces/common.interface";
import { setDataTransferContainer, type IDataTransferContainer } from "../../di";
import { DataTransferJob } from "../src/domain/entities/DataTransferJob";
import { StudioEntityPickerDialog } from "../src/presentation/components/StudioEntityPickerDialog";
import { useJobsViewModel } from "../src/presentation/viewmodels/useJobsViewModel";

let mockLang: "en" | "ar" = "en";

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({ direction: mockLang === "ar" ? "rtl" : "ltr", language: mockLang, t: (key: string) => key }),
}));

vi.mock("@core/providers/settings-provider", () => ({
  useSettings: () => ({ inputStyle: "bordered", fontSize: "default", buttonStyle: "rounded", borderRadius: "md" }),
}));

vi.mock("@core/store/useAppStore", () => ({
  useAppStore: (selector: (s: { tenantCode: string }) => string) => selector({ tenantCode: "ahly-sc" }),
}));

function makeJob(id: string, entityKey: string): DataTransferJob {
  return new DataTransferJob({
    jobId: id,
    kind: "Import",
    entityKey,
    isMultiSheet: false,
    importMode: "Upsert",
    onboardingMode: "StagedPendingInvite",
    fileFormat: "xlsx",
    status: "Completed",
    totalRows: 10,
    processedRows: 10,
    progressPercent: 100,
    validRows: 10,
    committedRows: 10,
    createdRows: 5,
    updatedRows: 5,
    rejectedRows: 0,
    hasRejectedWorkbook: false,
    hasExportWorkbook: false,
    createdAt: "2026-11-14T10:00:00Z",
    expiresAtUtc: "2026-11-21T10:00:00Z",
  });
}

function makeCatalogEntity(
  entityKey: string,
  displayNameEn: string,
  displayNameAr: string,
  canImport = true
): DataExchangeEntitySummaryDto {
  return {
    entityKey, owningModule: "Academy", displayNameEn, displayNameAr,
    descriptionEn: `${displayNameEn} description`, descriptionAr: `${displayNameAr} وصف`,
    supportsBulkAutoCreateLookup: false, supportsIdentityOnboardingModes: false,
    supportedModes: ["Insert", "Upsert"], parentEntityKeys: [], remainingQuotaSlots: 25, quotaMaxLimit: 100,
    isImportFeatureEnabled: canImport, isExportFeatureEnabled: true, canImport, canExport: true,
  };
}

function createWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, retryDelay: 0 }, mutations: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => React.createElement(QueryClientProvider, { client }, children);
}

function makeContainer(options: {
  getJobs: () => Promise<PagedResult<DataTransferJob>>;
  listEntities: () => Promise<DataExchangeEntitySummaryDto[]>;
}): IDataTransferContainer {
  return {
    entitiesRepository: {} as IDataTransferContainer["entitiesRepository"],
    jobsRepository: { getJobs: vi.fn(options.getJobs), getJobById: vi.fn(), cancelJob: vi.fn(), downloadArtifact: vi.fn() },
    presetsRepository: {} as IDataTransferContainer["presetsRepository"],
    dataExchangeRepository: { listEntities: vi.fn(options.listEntities) } as unknown as IDataExchangeRepository,
  };
}

describe("useJobsViewModel & StudioEntityPickerDialog", () => {
  beforeEach(() => {
    mockLang = "en";
    vi.clearAllMocks();
  });

  afterEach(() => {
    setDataTransferContainer(null);
  });

  it("loads live entity catalog, filters importable entities, resolves localized names, and launches dynamic Studio entityKey", async () => {
    setDataTransferContainer(
      makeContainer({
        getJobs: async () => ({
          items: [makeJob("job-1", "academy.athlete")],
          totalCount: 1,
          pageNumber: 1,
          pageSize: 20,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        }),
        listEntities: async () => [
          makeCatalogEntity("academy.athlete", "Academy Athletes", "رياضيو الأكاديمية", true),
          makeCatalogEntity("audit.readonly", "Read-Only Audit", "سجل تدقيق", false),
        ],
      })
    );

    const { result } = renderHook(() => useJobsViewModel(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isCatalogLoading).toBe(false);
    });

    expect(result.current.importableEntities.map((e) => e.entityKey)).toEqual(["academy.athlete"]);
    expect(result.current.resolveEntityName("academy.athlete")).toBe("Academy Athletes");

    // Open picker & launch with selected dynamic entity (never hardcoded crm.lead)
    act(() => {
      result.current.openStudioPicker();
    });
    expect(result.current.isStudioPickerOpen).toBe(true);
    expect(result.current.activeStudioEntityKey).toBeNull();

    act(() => {
      result.current.launchStudioForEntity("academy.athlete");
    });
    expect(result.current.isStudioPickerOpen).toBe(false);
    expect(result.current.activeStudioEntityKey).toBe("academy.athlete");
    expect(result.current.isStudioOpen).toBe(true);
  });

  it("guarantees strictly finite non-negative pagination across loading, malformed/undefined totalCount, and error states", async () => {
    let resolveJobs!: (val: PagedResult<DataTransferJob>) => void;
    setDataTransferContainer(
      makeContainer({
        getJobs: () =>
          new Promise<PagedResult<DataTransferJob>>((resolve) => {
            resolveJobs = resolve;
          }),
        listEntities: async () => [],
      })
    );

    const { result } = renderHook(() => useJobsViewModel(), {
      wrapper: createWrapper(),
    });

    expect(result.current.pagination).toMatchObject({
      page: 1,
      currentPage: 1,
      pageSize: 20,
      itemsCount: 0,
      pagesCount: 1,
    });

    // Simulate runtime undefined totalCount in a malformed payload
    await act(async () => {
      resolveJobs({
        items: [makeJob("j-1", "party.person"), makeJob("j-2", "party.person")],
        totalCount: undefined as unknown as number,
        pageNumber: Number.NaN,
        pageSize: Number.NaN,
        totalPages: Number.NaN,
        hasNextPage: false,
        hasPreviousPage: false,
      });
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.pagination).toMatchObject({
      page: 1,
      currentPage: 1,
      pageSize: 20,
      itemsCount: 2,
      pagesCount: 1,
    });

    // Error state remains strictly finite
    setDataTransferContainer(
      makeContainer({
        getJobs: async () => Promise.reject(new Error("API offline")),
        listEntities: async () => [],
      })
    );
    const { result: errResult } = renderHook(() => useJobsViewModel(), {
      wrapper: createWrapper(),
    });
    await waitFor(() => {
      expect(errResult.current.isError).toBe(true);
    });
    expect(errResult.current.pagination).toMatchObject({
      page: 1,
      currentPage: 1,
      pageSize: 20,
      itemsCount: 0,
      pagesCount: 1,
    });
  });

  it("disables StudioEntityPickerDialog confirm button and shows empty state when importable catalog is empty", () => {
    const onConfirm = vi.fn();
    render(
      <StudioEntityPickerDialog
        open={true}
        onOpenChange={vi.fn()}
        entities={[]}
        isLoading={false}
        onConfirm={onConfirm}
      />
    );

    expect(screen.getByText("adminDataTransferJobs.studioPicker.emptyTitle")).toBeInTheDocument();
    const confirmBtn = screen.getByTestId("jobs-studio-picker-confirm");
    expect(confirmBtn).toBeDisabled();
    fireEvent.click(confirmBtn);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("confirms selected dynamic entityKey from StudioEntityPickerDialog", () => {
    const onConfirm = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <StudioEntityPickerDialog
        open={true}
        onOpenChange={onOpenChange}
        entities={[
          makeCatalogEntity("academy.athlete", "Academy Athletes", "رياضيو الأكاديمية", true),
          makeCatalogEntity("party.person", "Party Persons", "الأفراد", true),
        ]}
        isLoading={false}
        onConfirm={onConfirm}
      />
    );

    const confirmBtn = screen.getByTestId("jobs-studio-picker-confirm");
    expect(confirmBtn).not.toBeDisabled();
    fireEvent.click(confirmBtn);
    expect(onConfirm).toHaveBeenCalledWith("academy.athlete");
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("resets stale picker selection when StudioEntityPickerDialog reopens", () => {
    Element.prototype.hasPointerCapture ??= () => false;
    Element.prototype.releasePointerCapture ??= () => {};
    const onConfirm = vi.fn();
    const entities = [
      makeCatalogEntity("academy.athlete", "Academy Athletes", "رياضيو الأكاديمية", true),
      makeCatalogEntity("party.person", "Party Persons", "الأفراد", true),
    ];

    const { rerender } = render(
      <StudioEntityPickerDialog
        open={true} onOpenChange={vi.fn()} entities={entities}
        isLoading={false} defaultEntityKey="academy.athlete" onConfirm={onConfirm}
      />
    );
    fireEvent.click(screen.getByTestId("jobs-studio-entity-select"));
    fireEvent.click(screen.getByText("Party Persons"));

    rerender(
      <StudioEntityPickerDialog
        open={false} onOpenChange={vi.fn()} entities={entities}
        isLoading={false} defaultEntityKey="academy.athlete" onConfirm={onConfirm}
      />
    );
    rerender(
      <StudioEntityPickerDialog
        open={true} onOpenChange={vi.fn()} entities={entities}
        isLoading={false} defaultEntityKey="academy.athlete" onConfirm={onConfirm}
      />
    );
    fireEvent.click(screen.getByTestId("jobs-studio-picker-confirm"));
    expect(onConfirm).toHaveBeenCalledWith("academy.athlete");
  });
});
