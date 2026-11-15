import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { setDataTransferContainer, type IDataTransferContainer } from "../../di";
import { DataExchangeEntity } from "../src/domain/entities/DataExchangeEntity";
import type { IEntitiesRepository } from "../src/domain/interfaces/IEntitiesRepository";
import { useEntitiesViewModel } from "../src/presentation/viewmodels/useEntitiesViewModel";

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    direction: "ltr",
    language: "en",
    t: (key: string) => key,
  }),
}));

vi.mock("@core/store/useAppStore", () => ({
  useAppStore: (selector: (s: { tenantCode: string }) => string) =>
    selector({ tenantCode: "ahly-sc" }),
}));

function makeEntity(key: string, module = "CRM"): DataExchangeEntity {
  return new DataExchangeEntity({
    entityKey: key,
    owningModule: module,
    displayNameEn: `${key} EN`,
    displayNameAr: `${key} AR`,
    descriptionEn: `${key} desc`,
    descriptionAr: `${key} وصف`,
    supportsBulkAutoCreateLookup: false,
    supportsIdentityOnboardingModes: false,
    supportedModes: ["Insert", "Update"],
    parentEntityKeys: [],
    remainingQuotaSlots: 50,
    quotaMaxLimit: 100,
    isImportFeatureEnabled: true,
    isExportFeatureEnabled: true,
    canImport: true,
    canExport: true,
  });
}

function createWrapper() {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false, retryDelay: 0 },
      mutations: { retry: false },
    },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client }, children);
  };
}

function makeContainer(getAllImpl: () => Promise<DataExchangeEntity[]>): IDataTransferContainer {
  const entitiesRepository: IEntitiesRepository = {
    getAll: vi.fn(getAllImpl),
    getDescriptor: vi.fn(),
    downloadTemplate: vi.fn(),
  };

  return {
    entitiesRepository,
    jobsRepository: {} as IDataTransferContainer["jobsRepository"],
    presetsRepository: {} as IDataTransferContainer["presetsRepository"],
  };
}

describe("useEntitiesViewModel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    setDataTransferContainer(null);
  });

  it("guarantees strictly finite non-negative pagination across loading, empty, and error states", async () => {
    let resolveEntities!: (value: DataExchangeEntity[]) => void;
    setDataTransferContainer(
      makeContainer(
        () =>
          new Promise<DataExchangeEntity[]>((resolve) => {
            resolveEntities = resolve;
          })
      )
    );

    const { result } = renderHook(() => useEntitiesViewModel(), {
      wrapper: createWrapper(),
    });

    // Initial loading state
    expect(Number.isFinite(result.current.pagination.page)).toBe(true);
    expect(Number.isFinite(result.current.pagination.currentPage)).toBe(true);
    expect(Number.isFinite(result.current.pagination.pageSize)).toBe(true);
    expect(Number.isFinite(result.current.pagination.itemsCount)).toBe(true);
    expect(Number.isFinite(result.current.pagination.pagesCount)).toBe(true);
    expect(result.current.pagination).toMatchObject({
      page: 1,
      currentPage: 1,
      pageSize: 10,
      itemsCount: 0,
      pagesCount: 1,
    });

    await act(async () => {
      resolveEntities([]);
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.pagination).toMatchObject({
      page: 1,
      currentPage: 1,
      pageSize: 10,
      itemsCount: 0,
      pagesCount: 1,
    });

    // Error state preserves finite bounds
    setDataTransferContainer(makeContainer(async () => Promise.reject(new Error("Network failure"))));
    const { result: errResult } = renderHook(() => useEntitiesViewModel(), {
      wrapper: createWrapper(),
    });
    await waitFor(() => {
      expect(errResult.current.isError).toBe(true);
    });
    expect(errResult.current.pagination).toMatchObject({
      page: 1,
      currentPage: 1,
      pageSize: 10,
      itemsCount: 0,
      pagesCount: 1,
    });
  });

  it("clamps invalid NaN/negative page mutations and paginates populated entities safely", async () => {
    setDataTransferContainer(
      makeContainer(async () => [
        makeEntity("crm.lead"),
        makeEntity("crm.contact"),
        makeEntity("academy.athlete", "Academy"),
      ])
    );

    const { result } = renderHook(() => useEntitiesViewModel(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.setPageSize(2);
    });

    expect(result.current.pagination).toMatchObject({
      page: 1,
      currentPage: 1,
      pageSize: 2,
      itemsCount: 3,
      pagesCount: 2,
    });
    expect(result.current.entities).toHaveLength(2);

    act(() => {
      result.current.setPage(2);
    });
    expect(result.current.pagination.currentPage).toBe(2);
    expect(result.current.entities).toHaveLength(1);

    act(() => {
      result.current.setPage(Number.NaN);
      result.current.setPageSize(-4);
    });
    expect(result.current.pagination).toMatchObject({
      page: 1,
      currentPage: 1,
      pageSize: 10,
      itemsCount: 3,
      pagesCount: 1,
    });
  });
});
