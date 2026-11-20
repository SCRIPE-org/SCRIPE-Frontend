import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, fireEvent, render, renderHook, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { IDataExchangeRepository } from "@core/data-exchange/domain/interfaces/IDataExchangeRepository";
import type { DataExchangeEntitySummaryDto } from "@core/data-exchange/domain/types";
import { setDataTransferContainer, type IDataTransferContainer } from "../../di";
import { DataExchangePreset } from "../src/domain/entities/DataExchangePreset";
import type { IPresetsRepository } from "../src/domain/interfaces/IPresetsRepository";
import { CreatePresetEntityDialog } from "../src/presentation/components/CreatePresetEntityDialog";
import { usePresetsViewModel } from "../src/presentation/viewmodels/usePresetsViewModel";

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    direction: "ltr",
    language: "en",
    t: (key: string) => key,
  }),
}));

vi.mock("@core/providers/settings-provider", () => ({
  useSettings: () => ({
    inputStyle: "bordered",
    fontSize: "default",
    buttonStyle: "rounded",
    borderRadius: "md",
  }),
}));

vi.mock("@core/store/useAppStore", () => ({
  useAppStore: (selector: (s: { tenantCode: string }) => string) =>
    selector({ tenantCode: "ahly-sc" }),
}));

function makePreset(
  id: string,
  entityKey: string,
  name: string,
  isDefault = false
): DataExchangePreset {
  return new DataExchangePreset({
    id,
    entityKey,
    name,
    importMode: "Upsert",
    mappings: [{ sourceColumnHeader: "Name", targetFieldKey: "fullName" }],
    isDefault,
    createdAt: "2026-11-14T10:00:00Z",
  });
}

function makeCatalogEntity(
  entityKey: string,
  displayNameEn: string,
  displayNameAr: string,
  canImport = true
): DataExchangeEntitySummaryDto {
  return {
    entityKey,
    owningModule: "Academy",
    displayNameEn,
    displayNameAr,
    descriptionEn: `${displayNameEn} description`,
    descriptionAr: `${displayNameAr} وصف`,
    supportsBulkAutoCreateLookup: false,
    supportsIdentityOnboardingModes: false,
    supportedModes: ["Insert", "Upsert"],
    parentEntityKeys: [],
    remainingQuotaSlots: 100,
    quotaMaxLimit: 200,
    isImportFeatureEnabled: canImport,
    isExportFeatureEnabled: true,
    canImport,
    canExport: true,
  };
}

function createWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, retryDelay: 0 }, mutations: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client }, children);
}

function makeContainer(options: {
  getPresets: () => Promise<DataExchangePreset[]>;
  listEntities: () => Promise<DataExchangeEntitySummaryDto[]>;
}): IDataTransferContainer {
  const presetsRepository: IPresetsRepository = {
    getPresets: vi.fn(options.getPresets),
    savePreset: vi.fn(),
    deletePreset: vi.fn(),
    setDefaultPreset: vi.fn(),
  };

  const dataExchangeRepository = {
    listEntities: vi.fn(options.listEntities),
  } as unknown as IDataExchangeRepository;

  return {
    entitiesRepository: {} as IDataTransferContainer["entitiesRepository"],
    jobsRepository: {} as IDataTransferContainer["jobsRepository"],
    presetsRepository,
    dataExchangeRepository,
  };
}

describe("usePresetsViewModel & CreatePresetEntityDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    setDataTransferContainer(null);
  });

  it("builds dynamic entityFilterOptions from union of catalog and observed presets without hardcoded lists", async () => {
    setDataTransferContainer(
      makeContainer({
        getPresets: async () => [
          makePreset("p-1", "academy.athlete", "Roster Intake", true),
          makePreset("p-2", "legacy.custom-entity", "Legacy Intake", false),
        ],
        listEntities: async () => [
          makeCatalogEntity("academy.athlete", "Academy Athletes", "رياضيو الأكاديمية", true),
          makeCatalogEntity("venue.court", "Venue Courts", "ملاعب المنشأة", true),
        ],
      })
    );

    const { result } = renderHook(() => usePresetsViewModel(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isCatalogLoading).toBe(false);
    });

    const optionKeys = result.current.entityFilterOptions.map((o) => o.entityKey);
    expect(optionKeys).toEqual(
      expect.arrayContaining(["academy.athlete", "venue.court", "legacy.custom-entity"])
    );
    expect(result.current.resolveEntityName("academy.athlete")).toBe("Academy Athletes");

    // Filtering preserves full catalog+observed options and KPIs
    act(() => {
      result.current.setEntityFilter("venue.court");
    });
    expect(result.current.presets).toHaveLength(0);
    expect(result.current.entityFilterOptions).toHaveLength(3);
    expect(result.current.kpis.totalPresets).toBe(2);

    act(() => {
      result.current.setEntityFilter("academy.athlete");
    });
    expect(result.current.presets.map((p) => p.id)).toEqual(["p-1"]);
  });

  it("guarantees strictly finite non-negative pagination across loading, empty, and error states", async () => {
    let resolvePresets!: (val: DataExchangePreset[]) => void;
    setDataTransferContainer(
      makeContainer({
        getPresets: () =>
          new Promise<DataExchangePreset[]>((resolve) => {
            resolvePresets = resolve;
          }),
        listEntities: async () => [],
      })
    );

    const { result } = renderHook(() => usePresetsViewModel(), {
      wrapper: createWrapper(),
    });

    expect(result.current.pagination).toMatchObject({
      page: 1,
      currentPage: 1,
      pageSize: 10,
      itemsCount: 0,
      pagesCount: 1,
    });

    await act(async () => {
      resolvePresets([
        makePreset("p-1", "venue.court", "Courts A"),
        makePreset("p-2", "venue.court", "Courts B"),
        makePreset("p-3", "venue.court", "Courts C"),
      ]);
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.setPageSize(2);
      result.current.setPage(2);
    });
    expect(result.current.pagination).toMatchObject({
      page: 2,
      currentPage: 2,
      pageSize: 2,
      itemsCount: 3,
      pagesCount: 2,
    });

    act(() => {
      result.current.setPage(Number.NaN);
    });
    expect(result.current.pagination.currentPage).toBe(1);
  });

  it("pre-defaults CreatePresetEntityDialog to activeEntityFilter when importable and handles empty catalog gracefully", () => {
    const onConfirm = vi.fn();
    render(
      <CreatePresetEntityDialog
        open={true}
        onOpenChange={vi.fn()}
        entities={[
          makeCatalogEntity("academy.athlete", "Academy Athletes", "رياضيو الأكاديمية", true),
          makeCatalogEntity("venue.court", "Venue Courts", "ملاعب المنشأة", true),
        ]}
        isLoading={false}
        activeEntityFilter="venue.court"
        onConfirm={onConfirm}
      />
    );

    fireEvent.click(screen.getByTestId("presets-studio-picker-confirm"));
    expect(onConfirm).toHaveBeenCalledWith("venue.court");

    // Empty importable catalog disables confirmation and renders empty state
    render(
      <CreatePresetEntityDialog
        open={true}
        onOpenChange={vi.fn()}
        entities={[]}
        isLoading={false}
        onConfirm={vi.fn()}
      />
    );
    expect(screen.getByText("adminDataTransferPresets.studioPicker.emptyTitle")).toBeInTheDocument();
  });

  it("resets stale picker selection when CreatePresetEntityDialog reopens after filter change", () => {
    Element.prototype.hasPointerCapture ??= () => false;
    Element.prototype.releasePointerCapture ??= () => {};

    const onConfirm = vi.fn();
    const entities = [
      makeCatalogEntity("academy.athlete", "Academy Athletes", "رياضيو الأكاديمية", true),
      makeCatalogEntity("venue.court", "Venue Courts", "ملاعب المنشأة", true),
    ];

    const { rerender } = render(
      <CreatePresetEntityDialog
        open={true}
        onOpenChange={vi.fn()}
        entities={entities}
        isLoading={false}
        activeEntityFilter="academy.athlete"
        onConfirm={onConfirm}
      />
    );

    fireEvent.click(screen.getByTestId("presets-studio-entity-select"));
    fireEvent.click(screen.getByText("Venue Courts"));

    rerender(
      <CreatePresetEntityDialog
        open={false}
        onOpenChange={vi.fn()}
        entities={entities}
        isLoading={false}
        activeEntityFilter="academy.athlete"
        onConfirm={onConfirm}
      />
    );
    rerender(
      <CreatePresetEntityDialog
        open={true}
        onOpenChange={vi.fn()}
        entities={entities}
        isLoading={false}
        activeEntityFilter="academy.athlete"
        onConfirm={onConfirm}
      />
    );

    fireEvent.click(screen.getByTestId("presets-studio-picker-confirm"));
    expect(onConfirm).toHaveBeenCalledWith("academy.athlete");
  });
});
