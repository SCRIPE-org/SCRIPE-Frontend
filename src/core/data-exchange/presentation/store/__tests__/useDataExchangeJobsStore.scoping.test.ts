import { describe, it, expect, beforeEach } from "vitest";
import { STORAGE_KEYS } from "@core/config/storage-keys";
import { useAppStore } from "@core/store/useAppStore";
import {
  DATA_EXCHANGE_JOBS_STORAGE_PREFIX,
  getDataExchangeJobsScopeKey,
  purgeDataExchangeJobsStorage,
  useDataExchangeJobsStore,
} from "../useDataExchangeJobsStore";
import type { DataTransferJobDto } from "../../../domain/types";

function makeJob(id: string): DataTransferJobDto {
  return {
    id,
    kind: "Import",
    entityKey: "crm.lead",
    isMultiSheet: false,
    importMode: "Upsert",
    onboardingMode: "StagedPendingInvite",
    fileFormat: "xlsx",
    originalFileName: "leads.xlsx",
    status: "Running",
    totalRows: 10,
    processedRows: 2,
    progressPercent: 20,
    validRows: 10,
    committedRows: 0,
    createdRows: 0,
    updatedRows: 0,
    rejectedRows: 0,
    errorSummary: null,
    hasRejectedWorkbook: false,
    hasExportWorkbook: false,
    createdAt: new Date().toISOString(),
    startedAtUtc: new Date().toISOString(),
    completedAtUtc: null,
    expiresAtUtc: new Date(Date.now() + 86_400_000).toISOString(),
  };
}

describe("useDataExchangeJobsStore tenant+user scoping", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    useDataExchangeJobsStore.setState({ jobs: [], isCollapsed: false });
    useAppStore.setState({ user: { id: "user-1", tenantId: "tenant-a" } as never });
  });

  it("partitions sessionStorage keys by active tenant context and user id", async () => {
    window.sessionStorage.setItem(
      STORAGE_KEYS.tenant_context,
      JSON.stringify({ id: "tenant-drilldown" })
    );
    expect(getDataExchangeJobsScopeKey()).toBe("tenant-drilldown:user-1");

    useDataExchangeJobsStore.getState().trackJob(makeJob("job-a"));
    const keyA = `${DATA_EXCHANGE_JOBS_STORAGE_PREFIX}:tenant-drilldown:user-1`;
    expect(window.sessionStorage.getItem(keyA)).toContain("job-a");

    // Switch tenant and rehydrate store without purge -> Tenant B starts isolated
    window.sessionStorage.setItem(
      STORAGE_KEYS.tenant_context,
      JSON.stringify({ id: "tenant-other" })
    );
    useDataExchangeJobsStore.setState({ jobs: [], isCollapsed: false });
    await useDataExchangeJobsStore.persist.rehydrate();
    expect(useDataExchangeJobsStore.getState().jobs).toHaveLength(0);
    expect(window.sessionStorage.getItem(keyA)).toContain("job-a");

    // Calling reset() scrubs in-memory state and purges persisted job storage
    useDataExchangeJobsStore.getState().reset();
    expect(window.sessionStorage.getItem(keyA)).toBeNull();
  });

  it("purges legacy unscoped and all scoped keys on logout", () => {
    window.sessionStorage.setItem(DATA_EXCHANGE_JOBS_STORAGE_PREFIX, "legacy");
    window.sessionStorage.setItem(`${DATA_EXCHANGE_JOBS_STORAGE_PREFIX}:t1:u1`, "s1");
    window.sessionStorage.setItem(`${DATA_EXCHANGE_JOBS_STORAGE_PREFIX}:t2:u2`, "s2");
    window.sessionStorage.setItem("unrelated_key", "keep-me");

    purgeDataExchangeJobsStorage();

    expect(window.sessionStorage.getItem(DATA_EXCHANGE_JOBS_STORAGE_PREFIX)).toBeNull();
    expect(window.sessionStorage.getItem(`${DATA_EXCHANGE_JOBS_STORAGE_PREFIX}:t1:u1`)).toBeNull();
    expect(window.sessionStorage.getItem(`${DATA_EXCHANGE_JOBS_STORAGE_PREFIX}:t2:u2`)).toBeNull();
    expect(window.sessionStorage.getItem("unrelated_key")).toBe("keep-me");
  });
});
